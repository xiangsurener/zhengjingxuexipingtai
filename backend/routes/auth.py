from flask import Blueprint, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from models import User
from utils.auth import generate_token, require_auth

bp = Blueprint("auth", __name__)


def _normalize_email(value: str) -> str:
    return (value or "").strip().lower()


@bp.post("/register")
def register():
    payload = request.get_json(force=True, silent=True) or {}
    email = _normalize_email(payload.get("email"))
    password = (payload.get("password") or "").strip()
    display_name = (payload.get("displayName") or "").strip()

    if not email or "@" not in email:
        return jsonify({"error": "请提供有效的邮箱"}), 400
    if len(password) < 6:
        return jsonify({"error": "密码长度至少 6 位"}), 400
    if not display_name:
        display_name = email.split("@")[0]

    session = g.db
    existing = session.query(User).filter_by(email=email).first()
    if existing:
        return jsonify({"error": "该邮箱已注册，请直接登录"}), 409

    user = User(
        email=email,
        display_name=display_name,
        password_hash=generate_password_hash(password),
    )
    session.add(user)
    session.flush()

    token = generate_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 201


@bp.post("/login")
def login():
    payload = request.get_json(force=True, silent=True) or {}
    email = _normalize_email(payload.get("email"))
    password = (payload.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "请填写邮箱和密码"}), 400

    session = g.db
    user = session.query(User).filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "邮箱或密码不正确"}), 401

    token = generate_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()})


@bp.get("/me")
@require_auth
def me():
    return jsonify({"user": g.current_user.to_dict()})

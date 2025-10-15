from functools import wraps

from flask import current_app, g, jsonify, request
from itsdangerous import BadSignature, BadTimeSignature, URLSafeTimedSerializer

from db import SessionLocal
from models import User


def _get_serializer():
    secret_key = current_app.config["SECRET_KEY"]
    return URLSafeTimedSerializer(secret_key=secret_key, salt="auth-token")


def generate_token(user_id: int) -> str:
    serializer = _get_serializer()
    return serializer.dumps({"user_id": user_id})


def verify_token(token: str):
    serializer = _get_serializer()
    try:
        payload = serializer.loads(token, max_age=60 * 60 * 24 * 7)  # 7 days
        return payload.get("user_id")
    except (BadSignature, BadTimeSignature):
        return None


def require_auth(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "authorization required"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        user_id = verify_token(token)
        if not user_id:
            return jsonify({"error": "invalid or expired token"}), 401

        session = getattr(g, "db", None)
        if session is None:
            session = SessionLocal()
            g.db = session

        user = session.get(User, user_id)
        if not user:
            return jsonify({"error": "user not found"}), 404

        g.current_user = user
        return view_func(*args, **kwargs)

    return wrapper

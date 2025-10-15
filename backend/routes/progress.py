from flask import Blueprint, g, jsonify, request

from models import LessonProgress
from utils.auth import require_auth

bp = Blueprint("progress", __name__)


@bp.get("/<lesson_id>")
@require_auth
def get_progress(lesson_id):
    session = g.db
    progress = (
        session.query(LessonProgress)
        .filter_by(user_id=g.current_user.id, lesson_id=lesson_id)
        .first()
    )
    current_index = progress.current_index if progress else -1
    return jsonify(
        {
            "lessonId": lesson_id,
            "currentIndex": current_index,
            "updatedAt": progress.updated_at.isoformat() if progress and progress.updated_at else None,
        }
    )


@bp.post("/<lesson_id>")
@require_auth
def save_progress(lesson_id):
    payload = request.get_json(force=True, silent=True) or {}
    index = payload.get("index")
    try:
        index_value = int(index)
    except (TypeError, ValueError):
        return jsonify({"error": "index 必须为整数"}), 400

    if index_value < 0:
        index_value = 0

    session = g.db
    progress = (
        session.query(LessonProgress)
        .filter_by(user_id=g.current_user.id, lesson_id=lesson_id)
        .first()
    )

    if not progress:
        progress = LessonProgress(
            user_id=g.current_user.id,
            lesson_id=lesson_id,
            current_index=index_value,
        )
        session.add(progress)
    else:
        progress.current_index = index_value

    session.flush()

    return jsonify({"ok": True, "progress": progress.to_dict()})

from flask import Blueprint, g, jsonify

from models import LessonProgress
from utils.auth import require_auth

bp = Blueprint("report", __name__)

LESSON_META = {
    "nn": {"title": "神经网络入门", "segments": 15},
    "lr": {"title": "线性回归基础", "segments": 8},
}


@bp.get("/summary")
@require_auth
def summary():
    """
    与前端 /api/report/summary 对齐
    res: { scoresByLesson, totalXp, avgAccuracy }
    """
    session = g.db
    progresses = session.query(LessonProgress).filter_by(user_id=g.current_user.id).all()

    scores = {}
    total_xp = 0
    ratios = []

    for prog in progresses:
        meta = LESSON_META.get(prog.lesson_id, {"title": prog.lesson_id, "segments": 1})
        total_segments = max(1, meta.get("segments", 1))
        completed = min(total_segments, prog.current_index + 1)
        ratio = completed / total_segments
        scores[meta["title"]] = int(ratio * 100)
        total_xp += completed * 10
        ratios.append(ratio)

    avg_accuracy = sum(ratios) / len(ratios) if ratios else 0.0

    return jsonify({
        "scoresByLesson": scores,
        "totalXp": total_xp,
        "avgAccuracy": round(avg_accuracy, 2)
    })

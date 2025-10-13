from flask import Blueprint, jsonify

bp = Blueprint("report", __name__)

@bp.get("/summary")
def summary():
    """
    与前端 /api/report/summary 对齐
    res: { scoresByLesson, totalXp, avgAccuracy }
    """
    return jsonify({
        "scoresByLesson": {"神经网络入门": 92, "线性回归": 88},
        "totalXp": 120,
        "avgAccuracy": 0.90
    })
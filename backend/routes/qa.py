from flask import Blueprint, request, jsonify

bp = Blueprint("qa", __name__)

@bp.post("/grade")
def grade():
    """
    与前端 /api/qa/grade 对齐
    req: { questionId, userAnswer }
    res: { correct, score, feedback }
    """
    body = request.get_json() or {}
    ans = (body.get("userAnswer") or "").lower()
    ok = "梯度" in ans
    resp = {
        "correct": ok,
        "score": 100 if ok else 60,
        "feedback": "回答到位，继续保持！" if ok else "方向不错，可提到“梯度更新参数”会更好。"
    }
    return jsonify(resp)
from flask import Blueprint, request, jsonify

bp = Blueprint("lesson", __name__)

@bp.post("/next")
def next_node():
    """
    与前端 /api/lesson/next 对齐
    req: { lessonId, currentNodeId, userInput }
    res: { node, progress }
    """
    body = request.get_json() or {}
    # 这里直接返回 Mock，后续可接入真实剧本/状态机
    node = {
        "id": "nn-001",
        "type": "narration",               # narration/quiz/choice
        "content": "欢迎来到神经网络第一课！",
        "question": None,
        "choices": None,
        "next": "nn-002"
    }
    progress = {"percent": 10, "xp": 5}
    return jsonify({"node": node, "progress": progress})
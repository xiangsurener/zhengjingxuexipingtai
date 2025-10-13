from flask import Blueprint, request, jsonify

bp = Blueprint("assignment", __name__)

@bp.post("/submit")
def submit():
    """
    与前端 /api/assignment/submit 对齐
    req: { assignmentId, content }
    res: { status, message }
    """
    return jsonify({"status": "ok", "message": "作业已收到，稍后自动批改"})
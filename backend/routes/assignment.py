import json
import os
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename

try:
    from services.assignment_grader import grade_titanic_assignment
except ImportError:  # pragma: no cover - fallback when running as package
    from backend.services.assignment_grader import grade_titanic_assignment

from models import AssignmentScore
from utils.auth import require_auth

bp = Blueprint("assignment", __name__)

UPLOAD_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_ROOT, exist_ok=True)


@bp.post("/submit")
@require_auth
def submit():
    """
    与前端 /api/assignment/submit 对齐
    req: multipart/form-data { assignmentId, content?, file? }
    res: { status, message }
    """
    assignment_id = request.form.get("assignmentId", "").strip()
    content = request.form.get("content", "").strip()
    uploaded = request.files.get("file")

    if not assignment_id:
        return jsonify({"error": "缺少 assignmentId"}), 400

    saved_filename = None
    if uploaded and uploaded.filename:
        safe_name = secure_filename(uploaded.filename)
        if not safe_name:
            return jsonify({"error": "上传文件名无效"}), 400
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        _, ext = os.path.splitext(safe_name)
        final_name = f"{assignment_id}_{timestamp}{ext}"
        save_path = os.path.join(UPLOAD_ROOT, final_name)
        uploaded.save(save_path)
        saved_filename = final_name

    # 这里可以扩展存储数据库逻辑，目前只返回确认信息
    return jsonify({
        "status": "ok",
        "message": "作业已收到，稍后自动批改",
        "assignmentId": assignment_id,
        "savedFile": saved_filename,
        "contentLength": len(content)
    })


@bp.post("/grade")
@require_auth
def grade():
    payload = request.get_json(silent=True) or {}
    assignment_id = (payload.get("assignmentId") or "").strip()
    code = payload.get("code") or ""

    if not assignment_id:
        return jsonify({"error": "缺少 assignmentId"}), 400
    if not code.strip():
        return jsonify({"error": "请粘贴完整的代码内容"}), 400
    if len(code) > 20000:
        return jsonify({"error": "代码过长，请控制在 20000 字符以内"}), 400

    if assignment_id == "nn":
        result = grade_titanic_assignment(code)

        session = g.db
        assignment_score = (
            session.query(AssignmentScore)
            .filter_by(user_id=g.current_user.id, assignment_id=assignment_id)
            .first()
        )
        if not assignment_score:
            assignment_score = AssignmentScore(
                user_id=g.current_user.id,
                assignment_id=assignment_id,
            )
            session.add(assignment_score)

        scores_payload = result.get("scores") or {}
        assignment_score.score_run = int(scores_payload.get("run", 0))
        assignment_score.score_compliance = int(scores_payload.get("compliance", 0))
        assignment_score.score_effect = int(scores_payload.get("effect", 0))
        assignment_score.total_score = int(result.get("totalScore", 0))
        assignment_score.raw_result = json.dumps(result, ensure_ascii=False)
        assignment_score.updated_at = datetime.utcnow()

        session.flush()

        return jsonify(result)

    return jsonify({"error": f"暂不支持的作业：{assignment_id}"}), 400

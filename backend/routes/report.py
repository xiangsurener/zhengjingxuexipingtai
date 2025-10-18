from flask import Blueprint, g, jsonify
from models import LessonProgress, AssignmentScore
from utils.auth import require_auth
bp = Blueprint("report", __name__)
LESSON_META = {
    "nn": {"title": "神经网络入门", "segments": 15, "assignment": "nn"},
    "lr": {"title": "线性回归基础", "segments": 8, "assignment": None},
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
    progress_map = {p.lesson_id: p for p in progresses}

    assignment_scores = (
        session.query(AssignmentScore)
        .filter_by(user_id=g.current_user.id)
        .all()
    )

    assignment_score_map = {score.assignment_id: score for score in assignment_scores}

    scores = {}
    total_xp = 0
    ratios = []
    total_test_points = 0
    total_assignment_points = 0

    tracked_lessons = set()

    for lesson_id, meta in LESSON_META.items():
        title = meta.get("title", lesson_id)
        total_segments = max(1, meta.get("segments", 1))
        progress = progress_map.get(lesson_id)
        if progress:
            completed = min(total_segments, progress.current_index + 1)
            tracked_lessons.add(lesson_id)
        else:
            completed = 0
        ratio = completed / total_segments
        ratios.append(ratio)
        total_xp += completed * 10

        test_score = min(20, round(ratio * 20))

        assignment_id = meta.get("assignment")
        assignment_record = assignment_score_map.get(assignment_id) if assignment_id else None
        assignment_score = min(80, assignment_record.total_score) if assignment_record else 0

        total_score = test_score + assignment_score

        total_test_points += test_score
        total_assignment_points += assignment_score

        scores[title] = {
            "testScore": test_score,
            "assignmentScore": assignment_score,
            "totalScore": total_score,
        }

    # Include any progress记录 that不在 metadata 中
    for prog in progresses:
        if prog.lesson_id in tracked_lessons:
            continue
        total_segments = max(1, prog.current_index + 1)
        ratio = min(1.0, (prog.current_index + 1) / total_segments)
        test_score = min(20, round(ratio * 20))
        assignment_record = assignment_score_map.get(prog.lesson_id)
        assignment_score = min(80, assignment_record.total_score) if assignment_record else 0
        total_score = test_score + assignment_score
        total_test_points += test_score
        total_assignment_points += assignment_score
        total_xp += (prog.current_index + 1) * 10
        ratios.append(ratio)
        scores[prog.lesson_id] = {
            "testScore": test_score,
            "assignmentScore": assignment_score,
            "totalScore": total_score,
        }

    avg_accuracy = sum(ratios) / len(ratios) if ratios else 0.0
    overall_score = total_test_points + total_assignment_points

    return jsonify({
        "scoresByLesson": scores,
        "totalXp": total_xp,
        "avgAccuracy": round(avg_accuracy, 2),
        "overallScore": overall_score,
        "totalTestScore": total_test_points,
        "totalAssignmentScore": total_assignment_points,
    })

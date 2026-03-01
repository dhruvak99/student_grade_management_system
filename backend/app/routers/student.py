from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth.dependencies import student_only
from app.models.marks import StudentMarks
import requests

router = APIRouter(prefix="/student", tags=["Student"])


@router.get("/me")
def get_my_marks(
    db: Session = Depends(get_db),
    user=Depends(student_only)
):
    student_id = user.get("student_id").strip().upper()

    records = (
        db.query(StudentMarks)
        .filter(StudentMarks.student_id == student_id)
        .order_by(StudentMarks.id.desc())
        .all()
    )

    if not records:
        raise HTTPException(status_code=404, detail="No marks found")

    subjects = {}

    for r in records:
        internals = [r.internal1, r.internal2, r.internal3]
        quizzes = [r.quiz1, r.quiz2, r.quiz3]

        best_internals = sorted(internals, reverse=True)[:2]
        best_quizzes = sorted(quizzes, reverse=True)[:2]

        final_score = (sum(best_internals) / 2) + (sum(best_quizzes) / 2)

        subjects[r.subject] = {
            "internals": internals,
            "quizzes": quizzes,
            "best_internals": best_internals,
            "best_quizzes": best_quizzes,
            "final_score": final_score
        }

    return {
        "student_id": student_id,
        "subjects": subjects
    }


@router.get("/rank")
def get_my_rank(
    db: Session = Depends(get_db),
    user=Depends(student_only)
):
    student_id = user.get("student_id").strip().upper()

    records = db.query(StudentMarks).all()

    if not records:
        raise HTTPException(status_code=404, detail="No records found")

    # Group by subject
    subject_scores = {}

    for r in records:
        internals = [r.internal1, r.internal2, r.internal3]
        quizzes = [r.quiz1, r.quiz2, r.quiz3]

        final_score = (
            sum(sorted(internals, reverse=True)[:2]) / 2
            + sum(sorted(quizzes, reverse=True)[:2]) / 2
        )

        subject_scores.setdefault(r.subject, []).append({
            "student_id": r.student_id,
            "final_score": final_score
        })

    ranks = {}

    for subject, scores in subject_scores.items():
        scores.sort(key=lambda x: x["final_score"], reverse=True)

        rank = 0
        prev_score = None

        for idx, s in enumerate(scores):
            if s["final_score"] != prev_score:
                rank = idx + 1
                prev_score = s["final_score"]

            if s["student_id"] == student_id:
                ranks[subject] = {
                    "rank": rank,
                    "final_score": s["final_score"]
                }
                break

    if not ranks:
        raise HTTPException(status_code=404, detail="Rank not found")

    return {
        "student_id": student_id,
        "ranks": ranks
    }

@router.get("/ai-summary")
def get_ai_summary(
    db: Session = Depends(get_db),
    user=Depends(student_only)
):
    student_id = user.get("student_id").strip().upper()

    # 🔹 Fetch ALL subjects for this student
    records = (
        db.query(StudentMarks)
        .filter(StudentMarks.student_id == student_id)
        .all()
    )

    if not records:
        raise HTTPException(status_code=404, detail="No marks found")

    subjects_data = {}

    for r in records:
        internals = [r.internal1, r.internal2, r.internal3]
        quizzes = [r.quiz1, r.quiz2, r.quiz3]

        best_internals = sorted(internals, reverse=True)[:2]
        best_quizzes = sorted(quizzes, reverse=True)[:2]

        final_score = (sum(best_internals) / 2) + (sum(best_quizzes) / 2)

        subjects_data[r.subject] = {
            "internals": internals,
            "quizzes": quizzes,
            "final_score": final_score
        }

    # 🧠 AI PROMPT (SUBJECT-AWARE)
    prompt = f"""
You are an expert academic performance analyst and student mentor.

The student has scores across multiple subjects. Analyze EACH subject independently and then provide an overall assessment.

STUDENT PERFORMANCE DATA:
{subjects_data}

For EACH subject, clearly include:

Subject Name:
1. Performance Summary
   - Briefly describe how the student is performing overall in this subject.
   - Mention consistency and score trends.

2. Strengths
   - Identify specific areas where the student is doing well.
   - Refer to internals or quizzes where relevant.

3. Areas for Improvement
   - Identify weak or inconsistent areas.
   - Be constructive and specific.

4. Subject-Specific Suggestions
   - Give 2 actionable tips to improve performance in this subject.

After analyzing all subjects, provide:

OVERALL PERFORMANCE INSIGHTS:
- Compare performance across subjects.
- Identify the strongest subject and the weakest subject.
- Comment on balance and consistency.

FINAL STUDY STRATEGY:
- 3 clear, practical recommendations the student should follow
- Focus on exam preparation, revision strategy, and time management.

Rules:
- Plain text only
- No markdown symbols, headings symbols, or formatting characters
- No emojis
- No word count mention
- Be professional, detailed, and student-friendly
"""

    fallback = (
        "AI service unavailable. Review subject-wise weak areas, practice consistently, "
        "and focus on balanced preparation across subjects."
    )

    ai_summary = fallback

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen3:4b",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            if "response" in data and data["response"].strip():
                ai_summary = data["response"].strip()

    except requests.exceptions.RequestException:
        pass

    return {
        "student_id": student_id,
        "subjects": subjects_data,
        "ai_summary": ai_summary
    }
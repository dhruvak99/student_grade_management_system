from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth.dependencies import faculty_only
from app.models.student_record import StudentRecord
from app.schemas.student import StudentMarksCreate
from app.services.evaluation import evaluate_student
from app.services.ranking import get_rankings, get_top_k
from app.services.sheets import upload_students_to_sheet
from app.services.ranking import get_rankings
from app.schemas.faculty import MarksEntryRequest
from app.models.marks import StudentMarks
from app.auth.dependencies import faculty_only
from app.models.user import User
from app.auth.password import hash_password

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.post("/student")
def add_or_update_student(
    data: StudentMarksCreate,
    db: Session = Depends(get_db),
    user=Depends(faculty_only)
):
    record = db.query(StudentRecord)\
        .filter(StudentRecord.student_id == data.student_id)\
        .first()

    if record:
        record.i1 = data.i1
        record.i2 = data.i2
        record.i3 = data.i3
        record.q1 = data.q1
        record.q2 = data.q2
        record.q3 = data.q3
    else:
        record = StudentRecord(**data.dict())
        db.add(record)

    db.commit()
    db.refresh(record)

    return evaluate_student(record)

#@router.get("/students")
@router.get("/students")
def get_all_students(
    db: Session = Depends(get_db),
    faculty=Depends(faculty_only)
):
    subject = faculty.get("subject")

    records = (
        db.query(StudentMarks)
        .filter(StudentMarks.subject == subject)
        .order_by(StudentMarks.student_id)
        .all()
    )

    result = []
    for r in records:
        internals = [r.internal1, r.internal2, r.internal3]
        quizzes = [r.quiz1, r.quiz2, r.quiz3]

        best_internals = sorted(internals, reverse=True)[:2]
        best_quizzes = sorted(quizzes, reverse=True)[:2]

        final_score = (sum(best_internals) / 2) + (sum(best_quizzes) / 2)

        result.append({
            "student_id": r.student_id,
            "internals": internals,
            "quizzes": quizzes,
            "best_internals": best_internals,
            "best_quizzes": best_quizzes,
            "final_score": final_score
        })

    return result

#old /ranking
# @router.get("/ranking")
# def get_ranking(
#     db: Session = Depends(get_db),
#     user=Depends(faculty_only)
# ):
#     records = db.query(StudentRecord).all()
#     return get_rankings(records)

@router.get("/ranking")
def get_ranking(
    db: Session = Depends(get_db),
    user=Depends(faculty_only)
):
    subject = user.get("subject")

    records = (
        db.query(StudentMarks)
        .filter(StudentMarks.subject == subject)
        .order_by(StudentMarks.final_score.desc())
        .all()
    )
    # records = (
    #     db.query(StudentMarks)
    #     .order_by(StudentMarks.final_score.desc())
    #     .all()
    # )

    return [
        {
            "student_id": r.student_id,
            "final_score": r.final_score
        }
        for r in records
    ]


#old top-k
# @router.get("/top/{k}")
# def get_top_k_students(
#     k: int,
#     db: Session = Depends(get_db),
#     user=Depends(faculty_only)
# ):
#     records = db.query(StudentRecord).all()
#     return get_top_k(records, k

@router.get("/top/{k}")
def get_top_k_students(
    k: int,
    db: Session = Depends(get_db),
    user=Depends(faculty_only)
):
    subject = user.get("subject")

    records = (
        db.query(StudentMarks)
        .filter(StudentMarks.subject == subject)
        .order_by(StudentMarks.final_score.desc())
        .limit(k)
        .all()
    )

    return [
        {
            "student_id": r.student_id,
            "final_score": r.final_score
        }
        for r in records
    ]



@router.post("/export")
async def export_to_google_sheets(
    db: Session = Depends(get_db),
    user=Depends(faculty_only)
):
    records = db.query(StudentRecord).all()
    students = get_rankings(records)

    SHEET_NAME = "Student Grades Export"

    upload_students_to_sheet(SHEET_NAME, students)

    sheet_link = f"https://docs.google.com/spreadsheets/d/{SHEET_NAME}"

    return {
        "message": "Export successful",
        "sheet_name": SHEET_NAME
    }

@router.post("/marks")
def add_or_update_marks(
    data: MarksEntryRequest,
    db: Session = Depends(get_db),
    faculty=Depends(faculty_only)
):
    student_id = data.student_id.strip().upper()
    faculty_subject = faculty.get("subject")

    # ---------- BASIC VALIDATION ----------
    if len(data.internals) != 3 or len(data.quizzes) != 3:
        raise HTTPException(
            status_code=400,
            detail="Exactly 3 internals and 3 quizzes required"
        )

    # ---------- MAX MARKS VALIDATION ----------
    if any(i < 0 or i > 50 for i in data.internals):
        raise HTTPException(
            status_code=400,
            detail="Internals must be between 0 and 50"
        )

    if any(q < 0 or q > 10 for q in data.quizzes):
        raise HTTPException(
            status_code=400,
            detail="Quizzes must be between 0 and 10"
        )

    # ---------- AUTO-CREATE STUDENT USER ----------
    user = db.query(User).filter(User.username == student_id).first()
    if not user:
        user = User(
            username=student_id,
            password_hash=hash_password(f"{student_id}123"),
            role="student",
            student_id=student_id
        )
        db.add(user)
        db.commit()  # commit user once

    # ---------- CHECK EXISTING MARKS ----------
    record = db.query(StudentMarks)\
        .filter(
            StudentMarks.student_id == student_id,
            StudentMarks.subject == faculty_subject
        )\
        .first()

    # 🚫 Block all-zero ONLY for new student marks
    if record is None:
        if all(v == 0 for v in data.internals) and all(v == 0 for v in data.quizzes):
            raise HTTPException(
                status_code=400,
                detail="New student marks cannot be all zero"
            )

    # ---------- BEST-OF-2 LOGIC ----------
    best_internals = sorted(data.internals, reverse=True)[:2]
    best_quizzes = sorted(data.quizzes, reverse=True)[:2]
    final_score = (sum(best_internals) / 2) + (sum(best_quizzes) / 2)

    # ---------- UPDATE / INSERT ----------
    if record:
        # 🚫 Prevent cross-subject modification
        if record.subject != faculty_subject:
            raise HTTPException(
                status_code=403,
                detail="You cannot modify marks for another subject"
            )

        # UPDATE
        record.internal1 = data.internals[0]
        record.internal2 = data.internals[1]
        record.internal3 = data.internals[2]
        record.quiz1 = data.quizzes[0]
        record.quiz2 = data.quizzes[1]
        record.quiz3 = data.quizzes[2]
        record.final_score = final_score

    else:
        # INSERT (subject auto-set from faculty login)
        record = StudentMarks(
            student_id=student_id,
            subject=faculty_subject,      # CORE LINE
            internal1=data.internals[0],
            internal2=data.internals[1],
            internal3=data.internals[2],
            quiz1=data.quizzes[0],
            quiz2=data.quizzes[1],
            quiz3=data.quizzes[2],
            final_score=final_score
        )
        db.add(record)

    db.commit()

    return {
        "message": "Marks saved successfully",
        "student_id": student_id,
        "final_score": final_score
    }
@router.delete("/marks/{student_id}")
def delete_marks(
    student_id: str,
    db: Session = Depends(get_db),
    faculty=Depends(faculty_only)
):
    student_id = student_id.strip().upper()
    subject = faculty.get("subject")

    record = (
        db.query(StudentMarks)
        .filter(
            StudentMarks.student_id == student_id,
            StudentMarks.subject == subject
        )
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Student not found for this subject")

    db.delete(record)
    db.commit()

    return {
        "message": f"{subject} marks for {student_id} deleted"
    }
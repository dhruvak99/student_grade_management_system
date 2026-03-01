from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth.password import hash_password
from app.auth.dependencies import admin_only
from app.schemas.admin import FacultyCreateRequest
from app.models.subject import Subject

router = APIRouter(prefix="/admin", tags=["Admin"])


# --------------------------------------------------
# GET ALL USERS (ADMIN VIEW)
# --------------------------------------------------
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "subject": u.subject
        }
        for u in users
    ]

@router.post("/faculty")
def create_faculty(
    data: FacultyCreateRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    # ---------- Normalize inputs ----------
    username = data.username.strip()
    subject_code = data.subject_code.strip().upper()
    subject_name = data.subject_name.strip()

    # ---------- Check username uniqueness ----------
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # ---------- Ensure subject exists ----------
    subject = db.query(Subject).filter(Subject.code == subject_code).first()

    if not subject:
        subject = Subject(
            code=subject_code,
            name=subject_name
        )
        db.add(subject)
        db.flush()  # makes subject usable without committing yet

    # ---------- ENFORCE: One faculty per subject ----------
    existing_faculty = (
        db.query(User)
        .filter(
            User.role == "faculty",
            User.subject == subject_code
        )
        .first()
    )

    if existing_faculty:
        raise HTTPException(
            status_code=400,
            detail=f"Faculty already exists for subject {subject_code}"
        )

    # ---------- Create faculty ----------
    faculty = User(
        username=username,
        password_hash=hash_password(data.password),
        role="faculty",
        subject=subject_code
    )

    db.add(faculty)
    db.commit()

    return {
        "message": "Faculty created successfully",
        "username": username,
        "subject_name": subject.name,
        "subject_code": subject.code
    }

@router.delete("/faculty/{faculty_id}")
def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    faculty = (
        db.query(User)
        .filter(User.id == faculty_id, User.role == "faculty")
        .first()
    )

    if not faculty:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found"
        )

    db.delete(faculty)
    db.commit()

    return {
        "message": "Faculty deleted successfully"
    }
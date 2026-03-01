from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.auth.password import verify_password
from app.auth.jwt import create_access_token
from app.schemas.auth import UserCreate
from app.auth.password import hash_password
from app.auth.dependencies import get_current_user
from app.models.subject import Subject

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token_data = {
        "user_id": user.id,
        "role": user.role,
        "student_id": user.student_id,
        "subject":user.subject
    }

    token = create_access_token(token_data)

    return {"access_token": token,
            "token_type":"bearer"}

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    if user.role not in ["faculty", "student"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    if user.role == "student" and not user.student_id:
        raise HTTPException(status_code=400, detail="student_id required for students")

    new_user = User(
        username=user.username,
        password_hash=hash_password(user.password),
        role=user.role,
        student_id=user.student_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "username": new_user.username,
        "role": new_user.role
    }

@router.get("/me")
def read_current_user(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject_code = user.get("subject")
    subject_name = None

    if subject_code:
        subject = db.query(Subject).filter(
            Subject.code == subject_code
        ).first()
        if subject:
            subject_name = subject.name

    return {
        "user_id": user.get("user_id"),
        "role": user.get("role"),
        "student_id": user.get("student_id"),
        "subject_code": subject_code,
        "subject_name": subject_name
    }
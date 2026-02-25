from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.auth.password import hash_password
from app.constants.subjects import Subject

def seed_users():
    db: Session = SessionLocal()

    # ---------- FACULTY: DSA ----------
    if not db.query(User).filter(User.username == "faculty_dsa").first():
        faculty_dsa = User(
            username="faculty_dsa",
            password_hash=hash_password("dsa123"),
            role="faculty",
            subject=Subject.DSA
        )
        db.add(faculty_dsa)

    # ---------- FACULTY: AIML ----------
    if not db.query(User).filter(User.username == "faculty_aiml").first():
        faculty_aiml = User(
            username="faculty_aiml",
            password_hash=hash_password("aiml123"),
            role="faculty",
            subject=Subject.AIML
        )
        db.add(faculty_aiml)

    # ---------- STUDENTS ----------
    for i in range(1, 11):
        sid = f"S{str(i).zfill(3)}"

        if not db.query(User).filter(User.username == sid).first():
            student = User(
                username=sid,
                password_hash=hash_password(f"{sid}123"),
                role="student",
                student_id=sid
            )
            db.add(student)

    db.commit()
    db.close()
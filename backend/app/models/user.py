from sqlalchemy import Column, Integer, String, UniqueConstraint
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # roles: admin | faculty | student
    role = Column(String, nullable=False)

    # only for students
    student_id = Column(String, nullable=True)

    # only for faculty (DSA / AIML etc)
    subject = Column(String, nullable=True)

    __table_args__ = (
        # 🚫 Prevent multiple faculties for same subject
        UniqueConstraint("subject", name="uq_faculty_subject"),
    )
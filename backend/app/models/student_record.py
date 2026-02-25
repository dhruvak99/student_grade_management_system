from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class StudentRecord(Base):
    __tablename__ = "student_records"

    id = Column(Integer, primary_key=True, index=True)

    # 🔒 REQUIRED: no empty IDs, no duplicates
    student_id = Column(String, unique=True, nullable=False, index=True)

    # Internals (out of 50)
    i1 = Column(Integer, nullable=False)
    i2 = Column(Integer, nullable=False)
    i3 = Column(Integer, nullable=False)

    # Quizzes (out of 10)
    q1 = Column(Integer, nullable=False)
    q2 = Column(Integer, nullable=False)
    q3 = Column(Integer, nullable=False)

    # Final score (out of 60)
    final_score = Column(Float, nullable=False)
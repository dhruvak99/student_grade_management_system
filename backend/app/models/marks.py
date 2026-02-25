from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class StudentMarks(Base):
    __tablename__ = "student_marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)

    subject = Column(String, nullable=False)

    internal1 = Column(Integer)
    internal2 = Column(Integer)
    internal3 = Column(Integer)

    quiz1 = Column(Integer)
    quiz2 = Column(Integer)
    quiz3 = Column(Integer)

    final_score = Column(Integer)
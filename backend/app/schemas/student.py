from pydantic import BaseModel

class StudentMarksCreate(BaseModel):
    student_id: str
    i1: int
    i2: int
    i3: int
    q1: int
    q2: int
    q3: int


class StudentMarksResponse(StudentMarksCreate):
    final_score: float
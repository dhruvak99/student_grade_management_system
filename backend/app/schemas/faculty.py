from pydantic import BaseModel
from typing import List

class MarksEntryRequest(BaseModel):
    student_id: str
    internals: List[int]  # 3 values, each out of 50
    quizzes: List[int]    # 3 values, each out of 10
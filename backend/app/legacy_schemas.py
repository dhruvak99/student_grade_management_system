from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # "faculty" or "student"
    student_id: Optional[str] = None
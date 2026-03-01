from pydantic import BaseModel

class FacultyCreateRequest(BaseModel):
    username: str
    password: str
    subject_name: str   # Display name → "Mathematics"
    subject_code: str   # DB code → "MATHS"
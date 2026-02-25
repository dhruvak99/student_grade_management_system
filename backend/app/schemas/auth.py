from pydantic import BaseModel
from typing import Optional

# ---------- LOGIN ----------

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# ---------- REGISTER ----------

class UserCreate(BaseModel):
    username: str
    password: str
    role: str            # "faculty" or "student"
    student_id: Optional[str] = None
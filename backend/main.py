from fastapi import FastAPI
from app.database import engine, Base
from app.models import user, student_record
from app.routers import auth, faculty, student
from app.seed import seed_users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Student Grade Management System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(faculty.router)
app.include_router(student.router)

@app.get("/")
def root():
    return {"status": "Backend running"}

@app.on_event("startup")
def startup():
    seed_users()
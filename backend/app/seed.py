from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.auth.password import hash_password

def seed_users():
    db: Session = SessionLocal()

    # ---------- ADMIN ONLY ----------
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            password_hash=hash_password("admin123"),
            role="admin",
            subject=None
        )
        db.add(admin)
        db.commit()
        print("Admin created successfully")
    else:
        print("Admin already exists")

    db.close()

if __name__ == "__main__":
    seed_users()
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from database import get_db
    from models import User
    from auth import hash_password, verify_password, create_access_token, get_current_user_optional
except ImportError:
    from backend.database import get_db
    from backend.models import User
    from backend.auth import hash_password, verify_password, create_access_token, get_current_user_optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class AuthSchema(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user_data: AuthSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        is_pro=False
    )
    db.add(new_user)
    db.commit()
    token = create_access_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer", "is_pro": False}

@router.post("/login")
def login(user_data: AuthSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "is_pro": user.is_pro}

@router.get("/me")
def get_me(user: User = Depends(get_current_user_optional)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"email": user.email, "is_pro": user.is_pro}

@router.post("/upgrade-pro")
def upgrade_to_pro(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    user.is_pro = True
    db.commit()
    return {"status": "success", "message": "Account upgraded to Evidex Pro."}

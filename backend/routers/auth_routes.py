from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token, get_current_user_optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class AuthSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(user_data: AuthSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        is_pro=False
    )
    db.add(new_user)
    await db.commit()
    token = create_access_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer", "is_pro": False}

@router.post("/login")
async def login(user_data: AuthSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalars().first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "is_pro": user.is_pro}

@router.get("/me")
async def get_me(user: User = Depends(get_current_user_optional)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"email": user.email, "is_pro": user.is_pro}

@router.post("/upgrade-pro")
async def upgrade_to_pro(user: User = Depends(get_current_user_optional), db: AsyncSession = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    user.is_pro = True
    await db.commit()
    return {"status": "success", "message": "Account upgraded to Evidex Pro."}

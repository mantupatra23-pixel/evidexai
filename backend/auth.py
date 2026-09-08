import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import hmac
import hashlib
import base64
import json
import time
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

try:
    from config import JWT_SECRET
    from database import get_db
    from models import User
except ImportError:
    from backend.config import JWT_SECRET
    from backend.database import get_db
    from backend.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, stored_hash = hashed_password.split("$")
        return hashlib.sha256((salt + plain_password).encode()).hexdigest() == stored_hash
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["exp"] = int(time.time()) + (60 * 60 * 24 * 7) # 7 days
    
    b64_header = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b'=').decode()
    b64_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b'=').decode()
    
    sig = hmac.new(JWT_SECRET.encode(), f"{b64_header}.{b64_payload}".encode(), hashlib.sha256).digest()
    b64_sig = base64.urlsafe_b64encode(sig).rstrip(b'=').decode()
    return f"{b64_header}.{b64_payload}.{b64_sig}"

def decode_access_token(token: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        b64_header, b64_payload, b64_sig = parts
        expected = base64.urlsafe_b64encode(
            hmac.new(JWT_SECRET.encode(), f"{b64_header}.{b64_payload}".encode(), hashlib.sha256).digest()
        ).rstrip(b'=').decode()
        if not hmac.compare_digest(b64_sig, expected):
            return None
        pad = len(b64_payload) % 4
        if pad:
            b64_payload += "=" * (4 - pad)
        payload = json.loads(base64.urlsafe_b64decode(b64_payload).decode())
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    email = payload["sub"]
    return db.query(User).filter(User.email == email).first()

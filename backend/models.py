import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
try:
    from database import Base
except ImportError:
    from backend.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_pro = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchLog(Base):
    __tablename__ = "search_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    query = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    total_scanned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

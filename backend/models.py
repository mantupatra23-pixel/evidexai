import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
try:
    from database import Base
except ImportError:
    from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_pro = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    total_scanned = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pmid = Column(String, nullable=False)
    title = Column(String, nullable=False)
    journal = Column(String, nullable=True)
    pubdate = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from database import get_db
    from models import User, SearchLog, Bookmark
    from auth import get_current_user_optional
except ImportError:
    from backend.database import get_db
    from backend.models import User, SearchLog, Bookmark
    from backend.auth import get_current_user_optional

router = APIRouter(prefix="/api/user", tags=["User Data & Library"])

class BookmarkCreate(BaseModel):
    pmid: str
    title: str
    journal: str = None
    pubdate: str = None
    pdf_url: str = None

@router.get("/history")
def get_search_history(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    logs = db.query(SearchLog).filter(SearchLog.user_id == user.id).order_by(SearchLog.created_at.desc()).limit(30).all()
    return logs

@router.delete("/history")
def clear_search_history(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    db.query(SearchLog).filter(SearchLog.user_id == user.id).delete()
    db.commit()
    return {"status": "success", "message": "Search history cleared."}

@router.get("/bookmarks")
def get_bookmarks(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return db.query(Bookmark).filter(Bookmark.user_id == user.id).order_by(Bookmark.created_at.desc()).all()

@router.post("/bookmarks")
def add_bookmark(data: BookmarkCreate, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    existing = db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.pmid == data.pmid).first()
    if existing:
        return {"status": "exists", "message": "Study already in library."}

    bm = Bookmark(
        user_id=user.id,
        pmid=data.pmid,
        title=data.title,
        journal=data.journal,
        pubdate=data.pubdate,
        pdf_url=data.pdf_url
    )
    db.add(bm)
    db.commit()
    return {"status": "success", "message": "Study added to your library."}

@router.delete("/bookmarks/{pmid}")
def remove_bookmark(pmid: str, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.pmid == pmid).delete()
    db.commit()
    return {"status": "success", "message": "Study removed from library."}

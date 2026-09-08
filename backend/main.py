import sys, os
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for p in [current_dir, parent_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from database import engine, Base
    from routers import auth_routes, search_routes, user_routes, suggest_routes
except ImportError:
    from backend.database import engine, Base
    from backend.routers import auth_routes, search_routes, user_routes, suggest_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Evidex.ai Clinical Enterprise Engine",
    version="6.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_routes.router)
app.include_router(search_routes.router)
app.include_router(user_routes.router)
app.include_router(suggest_routes.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Evidex.ai Clinical Engine",
        "version": "6.0.0",
        "features": [
            "Clinical Search & MeSH Expansion",
            "Direct PMC PDF Link Extraction",
            "Quantitative Statistics & Forest Plot Data",
            "Pharma COI Conflict Audit",
            "Head-to-Head Comparison (/api/compare)",
            "Server-Sent Events Streaming (/api/search/stream)",
            "User History & Saved Library Bookmarks",
            "Citations Export (BibTeX, APA, RIS)",
            "Medical Term Autocomplete (/api/suggest)"
        ]
    }

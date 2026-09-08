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
    from routers import auth_routes, search_routes
except ImportError:
    from backend.database import engine, Base
    from backend.routers import auth_routes, search_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Evidex.ai Clinical Engine",
    version="5.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(search_routes.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Evidex.ai Enterprise Backend",
        "modules": ["auth", "search", "compare", "stream", "export"]
    }

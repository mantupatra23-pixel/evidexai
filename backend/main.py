from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import auth_routes, search_routes

app = FastAPI(
    title="Evidex.ai Clinical SaaS Engine",
    version="5.0.0",
    description="Production-grade AI medical literature synthesis engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Mount Routers
app.include_router(auth_routes.router)
app.include_router(search_routes.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Evidex.ai Enterprise Backend",
        "architecture": "Modular Micro-services",
        "modules": ["auth", "search", "compare", "stream", "export"]
    }

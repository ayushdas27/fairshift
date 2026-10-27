import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.core.config import settings
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.services.seed_data import seed_demo_data

from backend.app.api.v1.endpoints import (
    auth, attendance, payroll, grievances, feedback, skills, dashboard, organisations
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed realistic demo data
with SessionLocal() as db:
    seed_demo_data(db)

app = FastAPI(
    title="FairShift API",
    description="Decent Work Platform for Employee-Intensive Organisations (SDG 8)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FairShift Core Engine",
        "sdg_target": "SDG 8: Decent Work & Economic Growth",
        "version": "1.0.0"
    }

# Mount API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(attendance.router, prefix=f"{settings.API_V1_STR}/attendance", tags=["Attendance & Shifts"])
app.include_router(payroll.router, prefix=f"{settings.API_V1_STR}/payroll", tags=["Transparent Payroll"])
app.include_router(grievances.router, prefix=f"{settings.API_V1_STR}/grievances", tags=["Confidential Grievances"])
app.include_router(feedback.router, prefix=f"{settings.API_V1_STR}/feedback", tags=["Anonymous Feedback"])
app.include_router(skills.router, prefix=f"{settings.API_V1_STR}/skills", tags=["Skill Passport"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Employer Operations Console"])
app.include_router(organisations.router, prefix=f"{settings.API_V1_STR}/organisations", tags=["Organisations & Industries"])

# Serve production frontend if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API or docs routes
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json", "health"]:
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": "FairShift",
            "tagline": "Fairer work. Safer workplaces. Greater transparency.",
            "api_docs": "/docs",
            "health": "/health"
        }

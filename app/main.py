"""FastAPI app: property profile API."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import property as property_router

app = FastAPI(
    title="Property Profile API",
    description="Unified property data: geocode, schools, property info.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(property_router.router)


@app.get("/health")
def health():
    """Health check; no external API calls."""
    return {"status": "ok"}

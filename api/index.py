"""Vercel entry point. Vercel discovers the FastAPI app from this module."""
from backend.main import app

__all__ = ["app"]

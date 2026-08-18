from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SoilInput(BaseModel):
    nitrogen: float = Field(ge=0, le=500, description="kg/ha")
    phosphorus: float = Field(ge=0, le=500, description="kg/ha")
    potassium: float = Field(ge=0, le=500, description="kg/ha")
    ph: float = Field(ge=0, le=14)
    moisture: float = Field(ge=0, le=100)
    temperature: float = Field(ge=-30, le=70)
    humidity: float = Field(ge=0, le=100)
    rainfall: float = Field(ge=0, le=10000)
    soil_type: Literal["loamy", "clay", "sandy", "silty"]


class ExplanationFactor(BaseModel):
    label: str
    influence: Literal["low", "medium", "high"]
    contribution: float = Field(ge=-1, le=1)


class ImagePrediction(BaseModel):
    analysis_id: str
    label: str
    confidence: float = Field(ge=0, le=1)
    status: Literal["healthy", "diseased", "pest_detected"]
    severity: float | None = Field(default=None, ge=0, le=100)
    explanation: list[ExplanationFactor]
    model_version: str
    created_at: datetime


class SoilPrediction(BaseModel):
    analysis_id: str
    score: float = Field(ge=0, le=100)
    status: Literal["good", "moderate", "poor"]
    nutrient_status: dict[str, str]
    factors: list[ExplanationFactor]
    suggestions: list[str]
    model_version: str
    created_at: datetime


class CropRecommendation(BaseModel):
    crop: str
    suitability: float = Field(ge=0, le=1)
    explanation: list[str]


class CropPrediction(BaseModel):
    analysis_id: str
    recommendations: list[CropRecommendation]
    factors: list[ExplanationFactor]
    model_version: str
    created_at: datetime

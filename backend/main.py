from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import list_analyses, save_analysis
from backend.models import registry
from backend.models.registry import ModelUnavailableError
from backend.schemas import CropPrediction, ImagePrediction, SoilInput, SoilPrediction

app = FastAPI(title="AgriVision AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_IMAGES = {"image/jpeg", "image/png", "image/webp"}


async def read_image(image: UploadFile) -> tuple[bytes, str]:
    if image.content_type not in ALLOWED_IMAGES:
        raise HTTPException(415, "Use a JPG, PNG, or WEBP image.")
    data = await image.read()
    if not data or len(data) > 10 * 1024 * 1024:
        raise HTTPException(413, "Image must be between 1 byte and 10 MB.")
    return data, image.filename or "upload"


def unavailable(error: ModelUnavailableError):
    raise HTTPException(status_code=503, detail=str(error))


@app.get("/api/health")
def health():
    return {"status": "ok", "models_configured": registry.__class__.__name__ != "UnconfiguredRegistry"}


@app.post("/api/predict/disease", response_model=ImagePrediction)
async def predict_disease(image: UploadFile = File(...)):
    data, filename = await read_image(image)
    try:
        result = registry.disease(data, filename)
    except ModelUnavailableError as error:
        unavailable(error)
    save_analysis("disease", result.label, result.model_dump(mode="json"))
    return result


@app.post("/api/predict/pest", response_model=ImagePrediction)
async def predict_pest(image: UploadFile = File(...)):
    data, filename = await read_image(image)
    try:
        result = registry.pest(data, filename)
    except ModelUnavailableError as error:
        unavailable(error)
    save_analysis("pest", result.label, result.model_dump(mode="json"))
    return result


@app.post("/api/predict/severity", response_model=ImagePrediction)
async def predict_severity(image: UploadFile = File(...)):
    data, filename = await read_image(image)
    try:
        result = registry.severity(data, filename)
    except ModelUnavailableError as error:
        unavailable(error)
    save_analysis("severity", result.label, result.model_dump(mode="json"))
    return result


@app.post("/api/predict/soil", response_model=SoilPrediction)
def predict_soil(values: SoilInput):
    try:
        result = registry.soil(values)
    except ModelUnavailableError as error:
        unavailable(error)
    save_analysis("soil", result.status, result.model_dump(mode="json"))
    return result


@app.post("/api/predict/crop", response_model=CropPrediction)
def predict_crop(values: SoilInput):
    try:
        result = registry.crop(values)
    except ModelUnavailableError as error:
        unavailable(error)
    save_analysis("crop", result.recommendations[0].crop, result.model_dump(mode="json"))
    return result


@app.get("/api/history")
def history(limit: int = 30):
    return list_analyses(max(1, min(limit, 100)))


# Serve the responsive frontend during local development. API routes are defined
# above this catch-all mount, so /api/* remains available to the browser client.
ROOT = Path(__file__).resolve().parents[1]
app.mount("/", StaticFiles(directory=ROOT, html=True), name="frontend")

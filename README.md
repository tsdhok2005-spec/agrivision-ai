# AgriVision AI

AgriVision AI is a smart-agriculture interface with a FastAPI backend contract for plant disease, pest, severity, soil-health, and crop-suitability inference.

## Run locally

1. Install Python 3.11+.
2. Create a virtual environment and install dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Start the backend:

   ```powershell
   uvicorn backend.main:app --reload
   ```

4. Open `http://127.0.0.1:8000/docs` to test the API.

## Add trained models

Implement a registry class in `backend/models/registry.py` and assign it to `registry`. The five endpoint contracts are:

- `POST /api/predict/disease`
- `POST /api/predict/pest`
- `POST /api/predict/severity`
- `POST /api/predict/soil`
- `POST /api/predict/crop`

Endpoints return HTTP `503` until their real trained adapters are registered. This avoids presenting synthetic predictions as model output.

## Production notes

Use PostgreSQL plus object storage for uploaded images and history in production. SQLite is included only for local development. The `api/index.py` entry point allows Vercel to serve the FastAPI API, while the root HTML/CSS/JS files are the frontend.

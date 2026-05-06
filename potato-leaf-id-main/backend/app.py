"""
Potato Leaf Disease Detection — FastAPI Backend
================================================
Serves the trained MobileNetV2 + CBAM model as a REST API for the Agri-Lab frontend.

Endpoints:
  GET  /              -> health check
  GET  /classes       -> list of disease classes
  POST /predict       -> multipart/form-data { image: <file> }
                         returns { disease, confidence, infected_area_percent,
                                   severity, recommendation, latency_ms }

Run:
  pip install -r requirements.txt
  uvicorn app:app --host 0.0.0.0 --port 8000 --reload

Place your trained model file (e.g. mobilenet_cbam_v2_224.h5) in this folder
and update MODEL_PATH below if the filename differs.
"""

import io
import os
import time
from typing import Dict

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

import tensorflow as tf
from tensorflow.keras.models import load_model

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MODEL_PATH = os.environ.get("MODEL_PATH", "mobilenet_cbam_v2_224.h5")
IMG_SIZE = 224

CLASS_NAMES = [
    "Early Blight",
    "Late Blight",
    "Healthy",
    "Fungal Diseases",
    "Plant Pests",
    "Potato Cyst Nematode",
    "Potato Virus",
]

CURES: Dict[str, Dict[str, str]] = {
    "Early Blight": {
        "Mild": "Remove affected leaves and apply Mancozeb fungicide.",
        "Moderate": "Apply Chlorothalonil or Mancozeb every 7–10 days.",
        "Severe": "Use systemic fungicides like Azoxystrobin and remove heavily infected plants.",
    },
    "Late Blight": {
        "Mild": "Remove infected leaves and improve air circulation.",
        "Moderate": "Apply Copper-based fungicides or Metalaxyl.",
        "Severe": "Use Ridomil Gold (Metalaxyl + Mancozeb) and destroy infected plants.",
    },
    "Fungal Diseases": {
        "Mild": "Prune infected areas and reduce moisture exposure.",
        "Moderate": "Apply broad-spectrum fungicides like Carbendazim.",
        "Severe": "Use systemic fungicides and rotate crops.",
    },
    "Plant Pests": {
        "Mild": "Use neem oil spray or manual removal of pests.",
        "Moderate": "Apply insecticides like Imidacloprid.",
        "Severe": "Use systemic insecticides and monitor field regularly.",
    },
    "Potato Cyst Nematode": {
        "Mild": "Use resistant potato varieties and crop rotation.",
        "Moderate": "Apply nematicides and organic soil treatments.",
        "Severe": "Deep soil treatment and long-term crop rotation required.",
    },
    "Potato Virus": {
        "Mild": "Remove infected plants early to prevent spread.",
        "Moderate": "Control aphids using insecticides.",
        "Severe": "Destroy infected crops and use certified virus-free seeds.",
    },
}

# ---------------------------------------------------------------------------
# Load model (custom CBAM layers may need custom_objects; adjust if needed)
# ---------------------------------------------------------------------------
print(f"[startup] Loading model from {MODEL_PATH} ...")
try:
    model = load_model(MODEL_PATH, compile=False)
    print(f"[startup] Model loaded. Input shape: {model.input_shape}")
except Exception as e:
    print(f"[startup] WARNING: failed to load model: {e}")
    model = None

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Potato Leaf Disease Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to your frontend origin in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def preprocess(image_bytes: bytes) -> np.ndarray:
    """Bytes -> (1, 224, 224, 3) float32 in [0,1]."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def estimate_infected_area(image_bytes: bytes) -> float:
    """HSV-based infected leaf area percent (matches severity_estimation.py)."""
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return 0.0
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # leaf area (green)
    leaf_mask = cv2.inRange(hsv, (25, 40, 40), (95, 255, 255))
    # infected area (brown / yellow)
    brown = cv2.inRange(hsv, (8, 50, 20), (28, 255, 200))
    yellow = cv2.inRange(hsv, (20, 80, 80), (35, 255, 255))
    infected_mask = cv2.bitwise_or(brown, yellow)

    leaf_px = int(np.count_nonzero(leaf_mask)) + int(np.count_nonzero(infected_mask))
    if leaf_px == 0:
        return 0.0
    infected_px = int(np.count_nonzero(infected_mask))
    return round((infected_px / leaf_px) * 100.0, 2)


def severity_from_percent(p: float) -> str:
    if p < 10:
        return "Mild"
    if p < 30:
        return "Moderate"
    return "Severe"


def recommend(disease: str, severity: str) -> str:
    if disease == "Healthy":
        return "Leaf is healthy. No treatment required."
    return CURES.get(disease, {}).get(severity, "Consult agricultural expert.")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "classes": CLASS_NAMES,
    }


@app.get("/classes")
def classes():
    return {"classes": CLASS_NAMES}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded on server.")
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload must be an image.")

    start = time.perf_counter()
    image_bytes = await image.read()

    try:
        x = preprocess(image_bytes)
        preds = model.predict(x, verbose=0)[0]
        idx = int(np.argmax(preds))
        disease = CLASS_NAMES[idx]
        confidence = float(preds[idx])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    if disease == "Healthy":
        infected_pct = 0.0
        severity = "None"
    else:
        infected_pct = estimate_infected_area(image_bytes)
        severity = severity_from_percent(infected_pct)

    latency_ms = int((time.perf_counter() - start) * 1000)

    return {
        "disease": disease,
        "confidence": round(confidence, 4),
        "infected_area_percent": infected_pct,
        "severity": severity,
        "recommendation": recommend(disease, severity),
        "latency_ms": latency_ms,
    }

# Potato Leaf Disease Detection — Backend (FastAPI)

Python API that serves the trained **MobileNetV2 + CBAM** model to the Agri-Lab frontend.

## 1. Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## 2. Add your model

Copy your trained model file into this folder:

```
backend/mobilenet_cbam_v2_224.h5
```

If your filename is different, set the env variable before starting:

```bash
# macOS / Linux
export MODEL_PATH=my_model.h5
# Windows (PowerShell)
$env:MODEL_PATH="my_model.h5"
```

> If your model uses **custom CBAM layers** that don't deserialize automatically,
> open `app.py` and pass `custom_objects={...}` to `load_model(...)`.

## 3. Run

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Server runs at: **http://localhost:8000**

Test:
```bash
curl http://localhost:8000/
curl -X POST -F "image=@sample_leaf.jpg" http://localhost:8000/predict
```

## 4. Connect the frontend

In the Agri-Lab website, go to **Diagnostics → API Settings** and paste:

```
http://localhost:8000
```

The frontend will switch from DEMO mode to **LIVE API** automatically.

## 5. Deploying

Recommended free/cheap hosts that support TensorFlow:
- **Render.com** (Web Service, Python env)
- **Railway.app**
- **HuggingFace Spaces** (Docker / FastAPI template)
- **Google Cloud Run** (containerized)

After deploy, paste your public URL (e.g. `https://your-api.onrender.com`)
into the frontend's API Settings.

## Endpoints

| Method | Path        | Description                                    |
|--------|-------------|------------------------------------------------|
| GET    | `/`         | Health check + class list                      |
| GET    | `/classes`  | List of 7 disease classes                      |
| POST   | `/predict`  | multipart `image` -> prediction JSON           |

### `/predict` response
```json
{
  "disease": "Early Blight",
  "confidence": 0.9142,
  "infected_area_percent": 18.74,
  "severity": "Moderate",
  "recommendation": "Apply Chlorothalonil or Mancozeb every 7–10 days.",
  "latency_ms": 312
}
```

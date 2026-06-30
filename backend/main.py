# FastAPI Backend for Continental Predictive Diagnosis
import logging
import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml_service import get_model_info, load_or_train_models, predict, train_models
from schemas import PredictionRequest, PredictionResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Diagnóstico Predictivo UC Backend",
        "model": "RandomForestClassifier (scikit-learn)",
        "explainer": "SHAP TreeExplainer",
        "features": 20,
    }


@router.post("/predict", response_model=PredictionResponse)
def predict_endpoint(request: PredictionRequest):
    return predict(request.answers)


@router.get("/model-info")
def model_info():
    return get_model_info()


@router.post("/retrain")
def retrain_models():
    try:
        train_models()
        return {"status": "success", "message": "Models retrained successfully"}
    except OSError as exc:
        logger.exception("Model retrain failed")
        return {"status": "error", "message": str(exc)}


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_or_train_models()
    logger.info("Random Forest prediction service ready!")
    yield


def _cors_kwargs() -> dict:
    raw = os.getenv("CORS_ORIGINS", "")
    if raw.strip():
        return {"allow_origins": [o.strip() for o in raw.split(",") if o.strip()]}
    if os.getenv("VERCEL"):
        return {"allow_origin_regex": r"https://[\w.-]+\.vercel\.app"}
    return {"allow_origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}


app = FastAPI(
    title="Continental Predictive Diagnosis ML Microservice",
    description="Microservicio ML con Random Forest y explicaciones SHAP.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    **_cors_kwargs(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(router)
app.include_router(router, prefix="/api/backend")

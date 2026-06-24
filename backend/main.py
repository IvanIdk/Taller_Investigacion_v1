# FastAPI Backend for Continental Predictive Diagnosis
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml_service import get_model_info, load_or_train_models, predict, train_models
from schemas import PredictionRequest, PredictionResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Continental Predictive Diagnosis ML Microservice",
    description="Microservicio ML con Random Forest y explicaciones SHAP.",
    version="2.0.0",
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
    load_or_train_models()
    logger.info("Random Forest prediction service ready!")


@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Diagnóstico Predictivo UC Backend",
        "model": "RandomForestClassifier (scikit-learn)",
        "explainer": "SHAP TreeExplainer",
        "features": 20,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_endpoint(request: PredictionRequest):
    return predict(request.answers)


@app.get("/model-info")
def model_info():
    return get_model_info()


@app.post("/retrain")
def retrain_models():
    try:
        train_models()
        return {"status": "success", "message": "Models retrained successfully"}
    except OSError as exc:
        return {"status": "error", "message": str(exc)}

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.schemas import (
    PredictionFeaturesInput,
    RunsPredictionResponse,
    POMPredictionResponse,
    HealthResponse,
)
from app.model import ml_model

app = FastAPI(
    title="Cricket Tracker ML Prediction Service",
    description="Microservice providing expected runs prediction and Player of the Match probability (LO5 MLOps)",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Instrumentation (exposes /metrics)
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        service="cricket-ml-service",
        model_loaded=ml_model.runs_model is not None,
        model_version=ml_model.model_version,
    )

@app.post("/predict/runs", response_model=RunsPredictionResponse)
def predict_runs(payload: PredictionFeaturesInput):
    try:
        features_dict = payload.model_dump()
        predicted_runs, confidence_range = ml_model.predict_runs(features_dict)
        return RunsPredictionResponse(
            player_id=payload.player_id,
            player_name=payload.player_name,
            predicted_runs=predicted_runs,
            confidence_range=confidence_range,
            model_version=ml_model.model_version,
            features_used=features_dict,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/pom", response_model=POMPredictionResponse)
def predict_pom(payload: PredictionFeaturesInput):
    try:
        features_dict = payload.model_dump()
        prob, confidence_level, key_factors = ml_model.predict_pom(features_dict)
        return POMPredictionResponse(
            player_id=payload.player_id,
            player_name=payload.player_name,
            pom_probability=prob,
            confidence_level=confidence_level,
            key_factors=key_factors,
            model_version=ml_model.model_version,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"POM prediction error: {str(e)}")

@app.post("/reload-model")
def reload_model():
    """Triggered by Apache Airflow DAG or admin after model retraining."""
    try:
        ml_model.load_models()
        return {
            "status": "success",
            "message": "Models reloaded successfully",
            "version": ml_model.model_version,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reload failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

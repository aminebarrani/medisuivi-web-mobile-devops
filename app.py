"""
MediSuivi - Gravite prediction API
====================================
Small FastAPI service that wraps the trained Random Forest model and
exposes it over HTTP, so your Spring Boot backend can call it.

Directory layout expected (put the .joblib / .json files next to this
script, or set ARTIFACT_DIR below):

    medisuivi_predict_api/
      app.py                    <- this file
      random_forest_model.joblib
      scaler.joblib
      le_sexe.joblib
      le_disease.joblib
      feature_cols.json

Run locally:
    pip install fastapi uvicorn scikit-learn pandas joblib --break-system-packages
    uvicorn app:app --host 0.0.0.0 --port 8000

Test:
    curl -X POST http://localhost:8000/predict \
      -H "Content-Type: application/json" \
      -d '{
            "age": 54, "sexe": "F", "disease": "diabete",
            "jours_depuis_diagnostic": 120, "valeur_mesure_proche": 180.0,
            "deviation_score": 2.3, "rolling_mean_14j": 165.0,
            "rolling_std_14j": 12.5, "trend_slope_14j": 0.8,
            "nb_symptomes_recents_7j": 3
          }'
"""

import os
import json
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ------------------------------------------------------------------
# Load artifacts once at startup
# ------------------------------------------------------------------
ARTIFACT_DIR = os.path.dirname(os.path.abspath(__file__))

_model = joblib.load(os.path.join(ARTIFACT_DIR, "random_forest_model.joblib"))
_scaler = joblib.load(os.path.join(ARTIFACT_DIR, "scaler.joblib"))
_le_sexe = joblib.load(os.path.join(ARTIFACT_DIR, "le_sexe.joblib"))
_le_disease = joblib.load(os.path.join(ARTIFACT_DIR, "le_disease.joblib"))

with open(os.path.join(ARTIFACT_DIR, "feature_cols.json")) as f:
    _feature_cols = json.load(f)

app = FastAPI(title="MediSuivi Gravite Prediction API")


# ------------------------------------------------------------------
# Request / response schemas
# ------------------------------------------------------------------
class PatientFeatures(BaseModel):
    age: float
    sexe: str
    disease: str
    jours_depuis_diagnostic: float
    valeur_mesure_proche: float
    deviation_score: float
    rolling_mean_14j: float
    rolling_std_14j: float
    trend_slope_14j: float
    nb_symptomes_recents_7j: float


class PredictionResponse(BaseModel):
    gravite: str
    probabilities: dict


# ------------------------------------------------------------------
# Endpoint
# ------------------------------------------------------------------
@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientFeatures):
    # Normalize sexe
    raw_sexe = (patient.sexe or "HOMME").strip().upper()
    if raw_sexe in ["M", "H", "MAN", "MALE"]:
        raw_sexe = "HOMME"
    elif raw_sexe in ["F", "W", "FEMALE", "WOMAN"]:
        raw_sexe = "FEMME"
    
    if raw_sexe not in _le_sexe.classes_:
        raw_sexe = "HOMME"
    sexe_enc = _le_sexe.transform([raw_sexe])[0]

    # Normalize disease
    raw_disease = (patient.disease or "DIABETE").strip().upper()
    if "DIAB" in raw_disease:
        raw_disease = "DIABETE"
    elif "HYPER" in raw_disease or "TENS" in raw_disease:
        raw_disease = "HYPERTENSION"
    elif "ASTH" in raw_disease:
        raw_disease = "ASTHME"
    elif "CARD" in raw_disease or "INSUFF" in raw_disease or "COEUR" in raw_disease:
        raw_disease = "INSUFFISANCE_CARDIAQUE"
    
    if raw_disease not in _le_disease.classes_:
        raw_disease = "DIABETE"
    disease_enc = _le_disease.transform([raw_disease])[0]

    row = {
        "age": patient.age,
        "sexe_enc": sexe_enc,
        "disease_enc": disease_enc,
        "jours_depuis_diagnostic": patient.jours_depuis_diagnostic,
        "valeur_mesure_proche": patient.valeur_mesure_proche,
        "deviation_score": patient.deviation_score,
        "rolling_mean_14j": patient.rolling_mean_14j,
        "rolling_std_14j": patient.rolling_std_14j,
        "trend_slope_14j": patient.trend_slope_14j,
        "nb_symptomes_recents_7j": patient.nb_symptomes_recents_7j,
    }

    X = np.array([[row[c] for c in _feature_cols]])
    X_scaled = _scaler.transform(X)

    pred = _model.predict(X_scaled)[0]
    proba = _model.predict_proba(X_scaled)[0]
    proba_dict = {cls: round(float(p), 4) for cls, p in zip(_model.classes_, proba)}

    return PredictionResponse(gravite=pred, probabilities=proba_dict)


@app.get("/health")
def health():
    return {"status": "ok"}

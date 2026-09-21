"""
Basic tests for the MediSuivi Prediction API.
"""
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_valid_payload():
    payload = {
        "age": 54,
        "sexe": "F",
        "disease": "diabete",
        "jours_depuis_diagnostic": 120,
        "valeur_mesure_proche": 180.0,
        "deviation_score": 2.3,
        "rolling_mean_14j": 165.0,
        "rolling_std_14j": 12.5,
        "trend_slope_14j": 0.8,
        "nb_symptomes_recents_7j": 3,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "gravite" in data
    assert "probabilities" in data


def test_predict_invalid_sexe_defaults():
    payload = {
        "age": 30,
        "sexe": "UNKNOWN",
        "disease": "hypertension",
        "jours_depuis_diagnostic": 60,
        "valeur_mesure_proche": 145.0,
        "deviation_score": 1.2,
        "rolling_mean_14j": 140.0,
        "rolling_std_14j": 8.0,
        "trend_slope_14j": 0.2,
        "nb_symptomes_recents_7j": 1,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def _base_payload(**overrides):
    payload = {
        "age": 45,
        "sexe": "F",
        "disease": "diabete",
        "jours_depuis_diagnostic": 90,
        "valeur_mesure_proche": 150.0,
        "deviation_score": 0.5,
        "rolling_mean_14j": 145.0,
        "rolling_std_14j": 9.0,
        "trend_slope_14j": 0.3,
        "nb_symptomes_recents_7j": 0,
    }
    payload.update(overrides)
    return payload


def test_predict_male_sexe_aliases():
    for sexe in ("M", "H", "MAN", "MALE"):
        response = client.post("/predict", json=_base_payload(sexe=sexe))
        assert response.status_code == 200
        assert response.json()["gravite"] in ("FAIBLE", "MODERE", "GRAVE")


def test_predict_disease_mapping():
    for disease in ("ASTHME", "insuffisance cardiaque", "CARDIAQUE", "coeur"):
        response = client.post("/predict", json=_base_payload(disease=disease))
        assert response.status_code == 200
        assert "probabilities" in response.json()


def test_predict_unknown_disease_falls_back_to_diabete():
    response = client.post("/predict", json=_base_payload(disease="maladie_inconnue"))
    assert response.status_code == 200
    assert response.json()["gravite"] in ("FAIBLE", "MODERE", "GRAVE")

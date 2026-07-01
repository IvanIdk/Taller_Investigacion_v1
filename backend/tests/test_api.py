from fastapi.testclient import TestClient

from main import app


def test_api_health():
    with TestClient(app) as client:
        response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_predict():
    payload = {
        "answers": [
            {"question_id": 1, "category": "ansiedad", "value": 2},
            {"question_id": 11, "category": "depresion", "value": 1},
        ]
    }
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prob_ansiedad" in data
    assert "prob_depresion" in data


def test_api_model_info():
    with TestClient(app) as client:
        response = client.get("/model-info")
    assert response.status_code == 200
    assert response.json()["model_type"] == "RandomForestClassifier"

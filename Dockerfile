# ─── MediSuivi Predict API - Dockerfile ────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source + model artifacts
COPY app.py .
COPY feature_cols.json .
COPY le_disease.joblib .
COPY le_sexe.joblib .
COPY random_forest_model.joblib .
COPY scaler.joblib .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

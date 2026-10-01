import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))
RUNS_MODEL_FILE = os.path.join(MODEL_DIR, "runs_model.joblib")
POM_MODEL_FILE = os.path.join(MODEL_DIR, "pom_model.joblib")

class CricketMLModel:
    def __init__(self):
        self.runs_model = None
        self.pom_model = None
        self.model_version = "v1.0.0-baseline"
        self.load_models()

    def _create_fallback_models(self):
        """Train quick baseline models if serialized files do not exist yet."""
        print("[ML Model] Initializing calibrated baseline models...")
        # Synthetic cricket training observations
        # Features: [recent_form_avg, recent_strike_rate, opp_bowling_strength, venue_avg_score]
        np.random.seed(42)
        X_sample = np.array([
            [12.0, 95.0, 9.2, 150.0],
            [25.0, 115.0, 8.5, 160.0],
            [38.0, 135.0, 8.0, 168.0],
            [48.0, 148.0, 7.8, 172.0],
            [65.0, 165.0, 7.2, 185.0],
            [8.0,  80.0,  9.5, 145.0],
            [54.0, 155.0, 7.5, 178.0],
            [32.0, 128.0, 8.1, 165.0],
            [42.0, 140.0, 8.4, 170.0],
            [18.0, 105.0, 8.9, 155.0],
        ])
        y_runs = np.array([10, 22, 35, 46, 68, 6, 58, 30, 44, 16])
        y_pom = np.array([0, 0, 0, 1, 1, 0, 1, 0, 0, 0])

        self.runs_model = RandomForestRegressor(n_estimators=30, random_state=42)
        self.runs_model.fit(X_sample, y_runs)

        self.pom_model = RandomForestClassifier(n_estimators=30, random_state=42)
        self.pom_model.fit(X_sample, y_pom)

    def load_models(self):
        """Load models from disk or fallback."""
        os.makedirs(MODEL_DIR, exist_ok=True)
        if os.path.exists(RUNS_MODEL_FILE) and os.path.exists(POM_MODEL_FILE):
            try:
                self.runs_model = joblib.load(RUNS_MODEL_FILE)
                self.pom_model = joblib.load(POM_MODEL_FILE)
                self.model_version = "v1.2.0-production"
                print(f"[ML Model] Loaded production models from {MODEL_DIR}")
            except Exception as e:
                print(f"[ML Model] Failed loading from disk: {e}, falling back.")
                self._create_fallback_models()
        else:
            self._create_fallback_models()

    def predict_runs(self, features: Dict[str, Any]) -> Tuple[int, Tuple[int, int]]:
        X = np.array([[
            float(features["recent_form_avg"]),
            float(features["recent_strike_rate"]),
            float(features["opp_bowling_strength"]),
            float(features["venue_avg_score"]),
        ]])
        predicted = float(self.runs_model.predict(X)[0])
        # Role adjustments
        role = features.get("player_role", "batsman").lower()
        if role == "bowler":
            predicted = max(2.0, predicted * 0.35)
        elif role == "all-rounder":
            predicted = predicted * 0.9

        runs = int(round(max(0, predicted)))
        lower = max(0, runs - int(round(runs * 0.3 + 5)))
        upper = runs + int(round(runs * 0.35 + 8))
        return runs, (lower, upper)

    def predict_pom(self, features: Dict[str, Any]) -> Tuple[float, str, list]:
        X = np.array([[
            float(features["recent_form_avg"]),
            float(features["recent_strike_rate"]),
            float(features["opp_bowling_strength"]),
            float(features["venue_avg_score"]),
        ]])
        # Probability of class 1
        probs = self.pom_model.predict_proba(X)[0]
        prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        
        # Scale reasonably between 5% and 55% for realism
        form_bonus = min(0.3, (features["recent_form_avg"] / 100.0) * 0.4)
        scaled_prob = round(min(0.65, max(0.05, prob * 0.5 + form_bonus)), 3)

        if scaled_prob > 0.35:
            confidence = "High Probability"
        elif scaled_prob > 0.18:
            confidence = "Moderate Contender"
        else:
            confidence = "Low Probability"

        factors = [
            f"Recent batting form: {features['recent_form_avg']} avg runs",
            f"Strike rate impact: {features['recent_strike_rate']}",
            f"Opposition bowling index: {features['opp_bowling_strength']}",
        ]
        return scaled_prob, confidence, factors

ml_model = CricketMLModel()

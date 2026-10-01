import os
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, f1_score

try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))
DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))

def generate_cricket_training_data(n_samples=1500) -> pd.DataFrame:
    """Generate realistic cricket player performance dataset modeled after Kaggle T20 data."""
    np.random.seed(42)
    
    # Features
    recent_form_avg = np.random.uniform(5.0, 75.0, n_samples)
    recent_strike_rate = np.random.uniform(85.0, 185.0, n_samples)
    opp_bowling_strength = np.random.uniform(6.5, 10.5, n_samples)
    venue_avg_score = np.random.uniform(140.0, 205.0, n_samples)
    player_role = np.random.choice([0, 1, 2], size=n_samples, p=[0.55, 0.25, 0.20]) # 0: batsman, 1: all-rounder, 2: bowler
    
    # Target 1: Expected Runs (continuous regression target with noise)
    noise = np.random.normal(0, 7.5, n_samples)
    role_factor = np.where(player_role == 0, 1.0, np.where(player_role == 1, 0.65, 0.25))
    expected_runs = (
        (recent_form_avg * 0.7) +
        ((recent_strike_rate - 100) * 0.15) -
        ((opp_bowling_strength - 8.0) * 3.0) +
        ((venue_avg_score - 160) * 0.1)
    ) * role_factor + noise
    expected_runs = np.clip(np.round(expected_runs), 0, 140).astype(int)

    # Target 2: Player of the Match (binary classification target)
    pom_prob = (expected_runs / 85.0) * 0.6 + np.random.uniform(0, 0.2, n_samples)
    is_pom = (pom_prob > 0.65).astype(int)

    df = pd.DataFrame({
        "recent_form_avg": np.round(recent_form_avg, 2),
        "recent_strike_rate": np.round(recent_strike_rate, 2),
        "opp_bowling_strength": np.round(opp_bowling_strength, 2),
        "venue_avg_score": np.round(venue_avg_score, 2),
        "actual_runs": expected_runs,
        "is_pom": is_pom,
    })
    return df

def train_and_evaluate(register_model=False):
    print("=" * 60)
    print(" Starting Cricket Tracker Model Training (LO5 MLOps Pipeline)")
    print("=" * 60)

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    # 1. Dataset Preparation
    data_path = os.path.join(DATA_DIR, "cricket_t20_training.csv")
    df = generate_cricket_training_data(1800)
    df.to_csv(data_path, index=False)
    print(f"[Data] Training dataset saved: {data_path} ({len(df)} samples)")

    feature_cols = ["recent_form_avg", "recent_strike_rate", "opp_bowling_strength", "venue_avg_score"]
    X = df[feature_cols]
    y_runs = df["actual_runs"]
    y_pom = df["is_pom"]

    X_train, X_test, y_runs_train, y_runs_test, y_pom_train, y_pom_test = train_test_split(
        X, y_runs, y_pom, test_size=0.2, random_state=42
    )

    # 2. MLflow Tracking Setup
    mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5001")
    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_tracking_uri(mlflow_uri)
            mlflow.set_experiment("cricket-tournament-prediction")
            print(f"[MLflow] Connected to tracking URI: {mlflow_uri}")
        except Exception as e:
            print(f"[MLflow] Tracking server unavailable at {mlflow_uri} ({e}). Logging locally.")
            mlflow.set_tracking_uri("file:./mlruns")

    # Start MLflow Run
    run_context = mlflow.start_run(run_name="weekly_scheduled_retrain") if MLFLOW_AVAILABLE else None

    # 3. Train Runs Regressor
    n_estimators = 50
    max_depth = 8
    runs_regressor = RandomForestRegressor(
        n_estimators=n_estimators, max_depth=max_depth, random_state=42
    )
    runs_regressor.fit(X_train, y_runs_train)

    # Evaluate Runs Regressor
    runs_preds = runs_regressor.predict(X_test)
    mae = mean_absolute_error(y_runs_test, runs_preds)
    rmse = np.sqrt(mean_squared_error(y_runs_test, runs_preds))

    # Naive baseline comparison (NFR/Success metric in PRD: must beat player average baseline)
    baseline_preds = np.full_like(runs_preds, y_runs_train.mean())
    baseline_mae = mean_absolute_error(y_runs_test, baseline_preds)

    print(f"[Evaluation] Runs Regressor MAE: {mae:.2f} (Baseline MAE: {baseline_mae:.2f})")
    print(f"[Evaluation] Runs Regressor RMSE: {rmse:.2f}")

    # 4. Train Player of the Match (POM) Classifier
    pom_classifier = RandomForestClassifier(
        n_estimators=n_estimators, max_depth=max_depth, random_state=42
    )
    pom_classifier.fit(X_train, y_pom_train)

    pom_preds = pom_classifier.predict(X_test)
    pom_acc = accuracy_score(y_pom_test, pom_preds)
    pom_f1 = f1_score(y_pom_test, pom_preds, zero_division=0)

    print(f"[Evaluation] POM Classifier Accuracy: {pom_acc * 100:.1f}% | F1: {pom_f1:.3f}")

    # 5. Log Parameters & Metrics to MLflow
    if MLFLOW_AVAILABLE and run_context:
        mlflow.log_params({
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "training_samples": len(X_train),
            "features": ",".join(feature_cols),
        })
        mlflow.log_metrics({
            "runs_mae": mae,
            "runs_rmse": rmse,
            "baseline_mae": baseline_mae,
            "pom_accuracy": pom_acc,
            "pom_f1": pom_f1,
        })
        # Log artifacts
        mlflow.sklearn.log_model(runs_regressor, "runs_model")
        mlflow.sklearn.log_model(pom_classifier, "pom_model")
        mlflow.end_run()
        print("[MLflow] Successfully logged params, metrics, and models to MLflow")

    # 6. Save Model Artifacts for FastAPI Microservice
    runs_path = os.path.join(MODEL_DIR, "runs_model.joblib")
    pom_path = os.path.join(MODEL_DIR, "pom_model.joblib")
    joblib.dump(runs_regressor, runs_path)
    joblib.dump(pom_classifier, pom_path)
    print(f"[Artifacts] Exported models to {MODEL_DIR}")
    print("=" * 60)
    print(" Model Training Completed Successfully! ")
    print("=" * 60)

    return mae, pom_acc

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--register", action="store_true", help="Register model in MLflow registry")
    args = parser.parse_args()
    train_and_evaluate(register_model=args.register)

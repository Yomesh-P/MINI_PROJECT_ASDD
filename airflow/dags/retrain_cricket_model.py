"""
Apache Airflow Scheduled Model Retraining DAG (LO5 MLOps Pipeline)
Course: Agile Software Development and DevOps Lab
Schedule: Weekly retrain (every Sunday at 02:00 AM)
"""
from datetime import datetime, timedelta
import os
import requests
from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.bash import BashOperator

default_args = {
    "owner": "devops_mlops_team",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

def extract_match_features(**context):
    """Task 1: Query completed matches and player stats from MongoDB."""
    print("[Airflow Task 1] Querying newly completed matches from MongoDB...")
    # Simulate / execute ETL export
    return {"status": "success", "new_matches_extracted": 14}

def train_and_evaluate_candidate(**context):
    """Task 2: Train candidate RandomForest models and compute validation MAE."""
    print("[Airflow Task 2] Training candidate models on updated dataset...")
    # Simulates training step or calls ml-service train script
    candidate_mae = 11.45
    production_mae = 12.80
    context["ti"].xcom_push(key="candidate_mae", value=candidate_mae)
    context["ti"].xcom_push(key="production_mae", value=production_mae)
    print(f"Candidate MAE: {candidate_mae} | Production Champion MAE: {production_mae}")

def evaluate_promotion(**context):
    """Task 3: Branching condition - check if candidate outperforms champion."""
    ti = context["ti"]
    candidate_mae = ti.xcom_pull(key="candidate_mae", task_ids="train_candidate")
    prod_mae = ti.xcom_pull(key="production_mae", task_ids="train_candidate")

    if candidate_mae is not None and prod_mae is not None and candidate_mae < prod_mae:
        print(f"[Airflow Evaluation] Candidate model is superior ({candidate_mae} < {prod_mae}). Promoting.")
        return "promote_and_register_model"
    else:
        print("[Airflow Evaluation] Candidate model did not beat baseline. Retaining champion.")
        return "skip_promotion"

def notify_fastapi_reload(**context):
    """Task 5: Trigger zero-downtime model reload on FastAPI microservice."""
    ml_url = os.getenv("ML_SERVICE_URL", "http://ml-api:8000")
    try:
        res = requests.post(f"{ml_url}/reload-model", timeout=5)
        print(f"[Airflow Reload] Triggered reload on {ml_url}: status={res.status_code}")
    except Exception as e:
        print(f"[Airflow Reload Warning] Could not notify {ml_url}: {e}")

with DAG(
    dag_id="retrain_cricket_model_weekly",
    default_args=default_args,
    description="Automated weekly model retraining and MLflow promotion DAG (LO5)",
    schedule_interval="0 2 * * 0",  # Every Sunday at 2:00 AM
    start_date=datetime(2025, 1, 1),
    catchup=False,
    tags=["mlops", "cricket-tracker", "te-aids", "lo5"],
) as dag:

    t1_extract = PythonOperator(
        task_id="extract_mongo_data",
        python_callable=extract_match_features,
    )

    t2_train = PythonOperator(
        task_id="train_candidate",
        python_callable=train_and_evaluate_candidate,
    )

    t3_branch = BranchPythonOperator(
        task_id="evaluate_promotion",
        python_callable=evaluate_promotion,
    )

    t4_promote = BashOperator(
        task_id="promote_and_register_model",
        bash_command='echo "Promoting new model to Production in MLflow Model Registry..."',
    )

    t4_skip = BashOperator(
        task_id="skip_promotion",
        bash_command='echo "Candidate model did not meet promotion threshold. Skipping deployment."',
    )

    t5_reload = PythonOperator(
        task_id="trigger_fastapi_reload",
        python_callable=notify_fastapi_reload,
        trigger_rule="all_done",
    )

    # DAG Dependency Topology
    t1_extract >> t2_train >> t3_branch
    t3_branch >> t4_promote >> t5_reload
    t3_branch >> t4_skip

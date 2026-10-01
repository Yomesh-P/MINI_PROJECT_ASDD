# 🏏 Smart Cricket Tournament Tracker

**Course:** Agile Software Development and DevOps Lab (TE AI & DS, Semester V)  
**Institution:** Thadomal Shahani Engineering College  
**Architecture Version:** 1.0  

---

## 📌 1. Project Overview

A complete end-to-end MERN + FastAPI MLOps sports analytics platform designed to solve local and club-level cricket management chaos. Replaces ad-hoc WhatsApp groups and spreadsheets with:
- **Real-Time Live Scoring Console:** Ball-by-ball updates, live runs, wickets, overs, current striker & bowler statistics.
- **Dynamic Standings & Net Run Rate (NRR) Engine:** Automatically aggregates completed matches into an official points table.
- **Machine Learning Performance Predictions (LO5):** Scikit-learn Random Forest model predicting expected player runs and Player of the Match probability.
- **Full DevOps & MLOps Lifecycle (LO1–LO6):** Jira Scrum board, Git branching, Multi-stage Dockerfiles, Docker Compose, K3s Kubernetes orchestration with HPA, dual CI/CD (Jenkins + GitHub Actions), Ansible EC2 provisioning, MLflow tracking, Apache Airflow retraining DAG, and Prometheus + Grafana observability.

---

## 🏗️ 2. Architecture & Tech Stack

```
React (Recharts) SPA --> Node/Express REST API --> MongoDB
                                 |
                                 +--> FastAPI ML Service --> MLflow (Tracking & Registry)
                                                                 ^
                                                           Apache Airflow (Weekly DAG)

Git PR --> Jenkins / GitHub Actions CI --> Docker Multi-stage Builds --> Registry
       --> CD Rollout --> K3s Kubernetes Cluster on AWS EC2
Prometheus scrapes /metrics --> Grafana Live Dashboards
```

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Recharts, Axios, Vanilla CSS Glassmorphism Design System |
| **Backend** | Node.js, Express, Mongoose, JWT, bcryptjs, prom-client |
| **Database** | MongoDB 7.0 (with compound indexes & NRR aggregation pipeline) |
| **Machine Learning** | Python 3.12, FastAPI, Scikit-learn, Pandas, NumPy, Joblib |
| **MLOps (LO5)** | MLflow (tracking + model registry), Apache Airflow (scheduled retraining DAG) |
| **Containerization (LO4)**| Docker (multi-stage builds), Docker Compose |
| **Orchestration (LO4)** | Kubernetes (K3s single-node cluster on AWS EC2) |
| **CI/CD (LO3)** | Jenkins Declarative Pipeline + GitHub Actions |
| **Configuration / IaC** | Ansible (idempotent EC2 provisioning playbook) |
| **Monitoring (LO5)** | Prometheus (15s scrape interval), Grafana preconfigured dashboards |

---

## 🚀 3. Quickstart Guide

### Option A: Running with Docker Compose (Recommended)
Clone the repository and launch the full multi-service stack with a single command:
```bash
# 1. Start all 6 microservices
docker compose up --build
```
| Service | URL | Description |
|---------|-----|-------------|
| **React Web App** | [http://localhost:3000](http://localhost:3000) | Live Scorecards, Standings, Player Charts |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express REST endpoints |
| **Backend Metrics** | [http://localhost:5000/metrics](http://localhost:5000/metrics) | Prometheus metrics endpoint |
| **FastAPI ML Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger / OpenAPI interface |
| **MLflow UI** | [http://localhost:5001](http://localhost:5001) | Model registry & experiment tracking |
| **Airflow Web UI** | [http://localhost:8080](http://localhost:8080) | Retraining DAG scheduler |

---

### Option B: Running Locally (Development Mode)

#### 1. Backend:
```bash
cd backend
npm install
npm test            # Run unit tests (Jest + Supertest)
npm run seed        # Seed rich cricket tournament & match data
npm start           # Starts on port 5000
```

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev         # Starts on port 3000
```

#### 3. ML Service:
```bash
cd ml-service
pip install -r requirements.txt
python training/train.py   # Train baseline models
python -m uvicorn app.main:app --port 8000 --reload
```

---

## 🧪 4. Lab Syllabus Traceability Matrix (LO1–LO6)

| Expt | Syllabus Experiment Title | LO | Implementation Details |
|------|---------------------------|----|------------------------|
| **1** | Version Control using Git | LO2 | Branching strategy (`feature/*`, `develop`, `main`), conventional commits (`feat(auth): [CRIC-12]`), PR reviews |
| **2** | Containerize applications with Docker | LO3 | Multi-stage Dockerfiles for `frontend/` (Nginx), `backend/` (Node alpine), and `ml-service/` (Python slim non-root) |
| **3** | Multi-service apps with Docker Compose | LO3 | `docker-compose.yml` linking frontend, backend, ml-api, mongo, mlflow, and airflow on `cricket-net` bridge network |
| **4** | Orchestration using Kubernetes | LO4 | K3s manifests (`k8s/`): Deployments, ClusterIP Services, ConfigMaps, Secrets, PVC, and HPA |
| **5** | Continuous Integration (CI) | LO3 | PR triggers in `Jenkinsfile` and `.github/workflows/ci.yml` running lint, Jest tests, and Docker builds |
| **6** | Configuration Management using Ansible | LO4 | `ansible/playbook.yml` automated provisioning of Docker, Jenkins, and K3s on AWS EC2 `t3.medium` |
| **7** | Continuous Delivery / Automated Deployment | LO3 | Automated CD pipeline on merge to `main`, container registry push, and `kubectl rollout status` |
| **8** | Application Monitoring | LO5 | Prometheus scraping `/metrics` every 15s + Grafana dashboard plotting requests/min, p95 latency, pod CPU/RAM |
| **9** | Agile lifecycle using Jira with DevOps integration | LO1 | Jira Scrum board, 2-week sprints, user stories (`CRIC-1` to `CRIC-19`), Fibonacci story points, GitHub linking |
| **10**| End-to-end DevOps mini project | LO6 | Complete live demonstration: Jira ticket $\rightarrow$ Git branch $\rightarrow$ Automated CI $\rightarrow$ CD $\rightarrow$ K3s $\rightarrow$ Grafana |
| **11-12**| Theory Assignments 1 & 2 | - | Comprehensive design documentation (`PRD.md`, `ARCHITECTURE.md`, `WORKFLOW.md`, `SCHEMAS.md`, `JIRA_BACKLOG.md`) |

---

## 📊 5. Database Schema & ML Feature Bridging

The database schema connects real-time scoring to ML feature engineering:
- **`User`**: Admin JWT authentication and role-based access.
- **`Tournament`**: Format (T20/ODI), venues, schedule dates, points rules.
- **`Team`**: Tournament link, short name, captain, squad roster.
- **`Player`**: Role, batting/bowling style, career statistics.
- **`Match`**: Real-time scoring state (`scoreA`, `scoreB`, `liveState` balls array, current striker/bowler).
- **`PlayerMatchStat`**: Atomic per-match performance records indexed by `{ playerId: 1, matchDate: -1 }`. Serves both Recharts UI and rolling ML feature extraction (`recent_form_avg`, `recent_strike_rate`, `opp_bowling_strength`, `venue_avg_score`).

---

## 🎯 6. Final Demo Workflow (Experiment 10)

1. **Jira:** Pick ticket `CRIC-99` ("Add bowler economy chart"). Move to *In Progress*.
2. **Git:** Create branch `feature/CRIC-99-economy-chart`, commit changes, push to GitHub.
3. **CI Pipeline:** Open PR to `develop`. Show automated CI pipeline (ESLint, Jest tests, Docker test build) passing with green check.
4. **CD & Rollout:** Merge PR to `main`. Show automated CD deploying updated image to K3s cluster (`kubectl rollout status`).
5. **Live Verification:** Open live web app on EC2 IP, showcase the newly deployed chart and live scorecard updates.
6. **Autoscaling & Monitoring:** Execute load test (`hey -n 10000 -c 50`), observe Grafana dashboard spikes in request rate, and watch Kubernetes HPA scale backend pods from 2 to 5.
7. **MLOps Validation:** Open MLflow dashboard showing logged experiment metrics, and open Airflow UI showing successful scheduled retraining DAG run.
8. **Jira:** Close `CRIC-99` moving it to *Done*.

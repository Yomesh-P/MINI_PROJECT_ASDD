# ARCHITECTURE: Smart Cricket Tournament Tracker

**Course:** Agile Software Development and DevOps Lab (TE AI & DS, Sem V)
**Institution:** Thadomal Shahani Engineering College
**Version:** 1.0

---

## 1. Architecture Overview

The system is organized into four core layers:

1. **Application Layer:** MERN app (React with Recharts, Node.js/Express REST API, MongoDB)
2. **Machine Learning & MLOps Layer (LO5):** Python FastAPI prediction microservice, Scikit-learn models, MLflow (tracking + model registry), Apache Airflow (scheduled retraining DAG)
3. **Platform & Orchestration Layer (LO4):** Docker (multi-stage builds), Docker Compose (local development stack), Kubernetes (K3s lightweight cluster on AWS EC2)
4. **DevOps & Observability Layer (LO1, LO2, LO3, LO5):** Git & GitHub, Jira Scrum board, CI/CD with Jenkins and GitHub Actions, Ansible for IaC & configuration management, Prometheus & Grafana for metrics and dashboards

---

## 2. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Clients & Users"]
        Pub["Public Viewer<br/>(Scorecards, Standings, Predictions)"]
        Admin["Tournament Admin<br/>(JWT Protected CRUD & Live Scores)"]
    end

    subgraph AppLayer["Application Layer"]
        FE["React Frontend SPA<br/>(Vite / React + Recharts + Axios)"]
        BE["Node.js / Express REST API<br/>(Auth, Tournaments, Live Matches, Metrics)"]
        DB[("MongoDB Database<br/>(Tournaments, Teams, Players, Matches, Stats)")]
    end

    subgraph MLLayer["ML & MLOps Layer (LO5)"]
        ML["FastAPI ML Service<br/>(POST /predict/runs, POST /predict/pom)"]
        MLF["MLflow Server<br/>(Experiment Tracking & Model Registry)"]
        AF["Apache Airflow<br/>(DAG: Ingest -> Preprocess -> Train -> Evaluate -> Register)"]
    end

    subgraph DevOpsLayer["DevOps & CI/CD Layer (LO2, LO3, LO4)"]
        GIT["Git / GitHub Repository<br/>(feature/*, develop, main)"]
        CICD["CI/CD: GitHub Actions / Jenkins<br/>(Lint -> Jest Tests -> Multi-stage Docker Build -> Push -> Deploy)"]
        K8S["Kubernetes (K3s on AWS EC2)<br/>(Ingress, Deployments, Services, HPA, PVC)"]
        ANS["Ansible Playbooks<br/>(EC2 Provisioning: Docker, K3s, Jenkins)"]
    end

    subgraph MonitoringLayer["Monitoring & Observability (LO5)"]
        PROM["Prometheus<br/>(Scrapes /metrics every 15s)"]
        GRAF["Grafana Dashboards<br/>(Req/min, Latency p95, Error Rate, Pod CPU/RAM)"]
    end

    Pub -->|Browse| FE
    Admin -->|JWT Authenticated Ops| FE
    FE -->|REST API Calls| BE
    BE -->|Read / Write| DB
    BE -->|HTTP Proxy / Internal REST| ML
    ML -->|Load Active Production Model| MLF
    AF -->|Pull Match Data| DB
    AF -->|Log Params, Metrics & Register Artifacts| MLF
    
    GIT -->|Triggers on PR & Push| CICD
    CICD -->|Deploy Manifests| K8S
    ANS -->|Configures Node| K8S

    BE -.->|Exposes /metrics| PROM
    ML -.->|Exposes /metrics| PROM
    K8S -.->|Node & Pod Metrics| PROM
    PROM -->|Data Source| GRAF
```

---

## 3. Component Details

### 3.1 Frontend (React SPA)
- **Role:** Interactive public views and administrative scoring console.
- **Key Views:**
  - `Login / Register`: Admin JWT authentication.
  - `Tournament Explorer`: Tournament lists, format, dates, venues.
  - `Live Match Center`: Auto-refreshing scorecard (polling/WebSocket), overs, run rate, required run rate.
  - `Standings Table`: Real-time computed points table with Net Run Rate (NRR).
  - `Player Profile & Form`: Career stats with Recharts interactive line/bar visualization showing last $N$ matches form and ML expected runs.
  - `Admin Control Panel`: CRUD for Tournaments, Teams, Players, Matches, and Live Ball/Over scoring.
- **Production Delivery:** Multi-stage Docker build served via Nginx with reverse proxy configs and caching headers.

### 3.2 Backend (Node.js + Express API)
- **Architecture:** Layered pattern: `Routes` $\rightarrow$ `Controllers` $\rightarrow$ `Services` $\rightarrow$ `Mongoose Models`.
- **Middleware:**
  - `authMiddleware`: JWT verification, claims decoding (`admin` vs `public`).
  - `validateRequest`: Joi/express-validator schemas.
  - `errorHandler`: Centralized error handling with structured JSON responses.
  - `requestLogger`: Winston/Morgan HTTP request logging.
  - `metricsMiddleware`: Prometheus `prom-client` collecting response latencies, HTTP status codes, and throughput.
- **ML Integration:** Internal HTTP client (Axios) querying the FastAPI microservice at `http://ml-api:8000`.
- **Testing:** Jest + Supertest covering unit and integration testing (>70% target coverage).

### 3.3 Database (MongoDB)
- Schema Collections: `users`, `tournaments`, `teams`, `players`, `matches`, `playerMatchStats`.
- Relational mapping via MongoDB `ObjectId` references and indexed queries for fast lookups.
- Aggregation pipelines to compute Net Run Rate (NRR) and player historical form metrics on-the-fly.

```mermaid
erDiagram
    USER {
        ObjectId _id
        string email
        string passwordHash
        string role
    }
    TOURNAMENT {
        ObjectId _id
        string name
        string format
        date startDate
        date endDate
        string venue
        string status
    }
    TEAM {
        ObjectId _id
        string name
        ObjectId tournamentId
        string captain
        string logoUrl
    }
    PLAYER {
        ObjectId _id
        string name
        ObjectId teamId
        string role
        string battingStyle
        string bowlingStyle
        object careerStats
    }
    MATCH {
        ObjectId _id
        ObjectId tournamentId
        ObjectId teamA
        ObjectId teamB
        date date
        string venue
        string status
        object scoreA
        object scoreB
        ObjectId winner
        ObjectId playerOfMatch
    }
    PLAYER_MATCH_STAT {
        ObjectId _id
        ObjectId playerId
        ObjectId matchId
        int runs
        int ballsFaced
        int wickets
        float oversBowled
        ObjectId oppositionTeamId
    }

    TOURNAMENT ||--o{ TEAM : contains
    TOURNAMENT ||--o{ MATCH : schedules
    TEAM ||--o{ PLAYER : registers
    TEAM ||--o{ MATCH : plays_as_A
    TEAM ||--o{ MATCH : plays_as_B
    MATCH ||--o{ PLAYER_MATCH_STAT : details
    PLAYER ||--o{ PLAYER_MATCH_STAT : records
```

### 3.4 ML Service (Python + FastAPI)
- **Role:** High-performance, low-latency microservice for cricket performance and outcome predictions.
- **Endpoints:**
  - `POST /predict/runs`: Predicts expected runs for a player in a specific upcoming match.
  - `POST /predict/pom`: Predicts Player of the Match probability.
  - `GET /health`: Liveness and readiness probe.
  - `GET /metrics`: Prometheus metric endpoint.
- **Feature Engineering:**
  - Recent form ($5$-match rolling average, strike rate).
  - Opposition strength (composite bowling average against player's batting style).
  - Venue batting index (venue historical runs per over).
  - Player role and batting position.
- **Models:** Scikit-learn Random Forest Regressor & Gradient Boosting Classifier.

### 3.5 MLOps Layer (LO5: MLflow + Apache Airflow)
- **MLflow:**
  - Experiment Tracking: logs hyperparameter combinations, training durations, MAE, RMSE, ROC-AUC, and feature importances.
  - Model Registry: Versioned model artifacts (`runs:/<run_id>/model`) tagged with stages (`Staging`, `Production`).
- **Apache Airflow:**
  - Scheduled DAG `cricket_model_retrain_dag` running on a weekly cron schedule (`0 2 * * 0`).
  - Tasks:
    1. `extract_mongo_data`: Export recent completed matches & player stats from MongoDB.
    2. `merge_kaggle_dataset`: Concatenate Kaggle T20 baseline with new live tournament data.
    3. `feature_engineering`: Compute rolling features and target variables.
    4. `train_evaluate_mlflow`: Train candidates, record run in MLflow.
    5. `conditional_promotion`: Compare candidate model MAE against current production model. If MAE is lower, transition new model to `Production`.
    6. `reload_fastapi_model`: Trigger zero-downtime model reload endpoint on FastAPI.

---

## 4. Container Architecture (Docker Compose Local Stack)

```mermaid
flowchart TB
    subgraph cricket-net["Docker Bridge Network: cricket-net"]
        FE["frontend :3000<br/>(React + Nginx)"]
        BE["backend :5000<br/>(Node/Express API)"]
        ML["ml-api :8000<br/>(FastAPI Microservice)"]
        DB[("mongo :27017<br/>(MongoDB Persistent Volume)")]
        MF["mlflow :5001<br/>(MLflow UI & Artifacts)"]
        AF["airflow-standalone :8080<br/>(Airflow Webserver + Scheduler)"]
    end

    FE -->|HTTP| BE
    BE -->|Mongo Wire Protocol| DB
    BE -->|Internal REST| ML
    ML -->|MLflow Artifact API| MF
    AF -->|MongoDB Ingestion| DB
    AF -->|Log Model| MF
```

- **Multi-Stage Dockerfiles:**
  - Stage 1: Build dependencies and transpile / bundle assets.
  - Stage 2: Minimal runtime image (Alpine/Slim base) running as non-root user (`USER node` or `USER appuser`).
- **Volumes:** Named volumes for MongoDB data (`mongo_data`) and MLflow models (`mlflow_artifacts`).

---

## 5. Kubernetes Architecture (K3s on AWS EC2)

```mermaid
flowchart TB
    subgraph K3s_Cluster["K3s Cluster (AWS EC2)"]
        subgraph IngressLayer["Ingress & Routing"]
            ING["Traefik / Nginx Ingress Controller"]
        end

        subgraph CricketNamespace["Namespace: cricket"]
            FES["frontend Service (ClusterIP)"]
            FED["frontend Deployment (2 Pods)"]
            
            BES["backend Service (ClusterIP)"]
            BED["backend Deployment<br/>(HPA: 2 to 5 Pods)"]
            HPA["HorizontalPodAutoscaler<br/>Target: 70% CPU"]
            
            MLS["ml-api Service (ClusterIP)"]
            MLD["ml-api Deployment (1-2 Pods)"]
            
            MGS["mongo Service (Headless)"]
            MGSS[("mongo StatefulSet<br/>+ PersistentVolumeClaim")]
        end

        subgraph MonitoringNamespace["Namespace: monitoring"]
            PROM["Prometheus Server"]
            GRAF["Grafana Server"]
        end
    end

    ING -->|/ or /ui| FES --> FED
    ING -->|/api| BES --> BED
    BED --> HPA
    BED --> MLS --> MLD
    BED --> MGS --> MGSS
    
    PROM -.->|Scrapes /metrics| BED
    PROM -.->|Scrapes /metrics| MLD
    PROM -.->|cAdvisor / Kubelet metrics| K3s_Cluster
    GRAF -->|PromQL queries| PROM
```

---

## 6. Infrastructure Provisioning (Ansible & AWS EC2)

- **Target Instance:** AWS EC2 `t3.medium` running Ubuntu 22.04 LTS.
- **Ansible Playbook Structure (`ansible/`):**
  - `playbook.yml`: Main orchestrator.
  - `inventory.ini`: EC2 Public IP and SSH private key path.
  - `roles/common`: System updates, security baselines, firewall (UFW).
  - `roles/docker`: Docker engine, containerd, and Docker Compose v2.
  - `roles/jenkins`: OpenJDK 17, Jenkins LTS, initial credentials.
  - `roles/k3s`: Lightweight single-node K3s installation, kubeconfig export.
  - `roles/monitoring`: Helm install of Prometheus & Grafana stack.

---

## 7. CI/CD Architecture (Jenkins & GitHub Actions)

Dual-engine CI/CD design supporting both Jenkins (Experiment 5/7) and GitHub Actions:

```mermaid
flowchart LR
    Dev[Developer] -->|git push branch| GH[GitHub Repository]
    GH -->|Webhook / Actions Trigger| CI{CI Runner:<br/>GitHub Actions / Jenkins}
    
    subgraph CI_Pipeline["CI Pipeline (Pull Request)"]
        C1[1. Checkout Code]
        C2[2. Lint: ESLint & Flake8]
        C3[3. Unit Tests: Jest & Pytest]
        C4[4. Security Audit: npm audit / trivy]
        C5[5. Docker Multi-stage Build Test]
    end

    CI --> C1 --> C2 --> C3 --> C4 --> C5
    C5 -->|Pass / Fail Report| PR[GitHub PR Status Check]

    PR -->|Merge to main| CD{CD Pipeline}

    subgraph CD_Pipeline["CD Pipeline (Merge to Main)"]
        D1[1. Docker Build & Tag commit-SHA]
        D2[2. Push to Docker Hub / GHCR]
        D3[3. Deploy: kubectl apply -f k8s/]
        D4[4. Rollout Verification & Healthcheck]
    end

    CD --> D1 --> D2 --> D3 --> D4 --> LIVE[Live System on AWS EC2]
```

---

## 8. Monitoring & Observability Architecture

- **Instrumentation:**
  - Node.js backend uses `prom-client` exposing `/metrics`.
  - FastAPI ML microservice uses `prometheus-fastapi-instrumentator`.
- **Metrics Collected:**
  - Throughput: `rate(http_requests_total[1m])`
  - Latency: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`
  - Failure Rate: `sum(rate(http_requests_total{status=~"5.."}[1m])) / sum(rate(http_requests_total[1m]))`
  - Pod Resources: `container_cpu_usage_seconds_total`, `container_memory_working_set_bytes`
  - ML Model Latency & Prediction counters.

---

## 9. Technology to Lab Experiment Traceability Matrix

| Lab Experiment | Title & Focus | Architecture Realization |
|----------------|---------------|--------------------------|
| **Exp 1** | Version control using Git | Git branching model (`main`, `develop`, `feature/*`), PR workflows, Conventional Commits |
| **Exp 2** | Containerize applications with Docker | Multi-stage Dockerfiles (`frontend/Dockerfile`, `backend/Dockerfile`, `ml-service/Dockerfile`) |
| **Exp 3** | Multi-service apps with Docker Compose | `docker-compose.yml` linking React, Express, MongoDB, FastAPI, MLflow, and Airflow |
| **Exp 4** | Container orchestration using Kubernetes | K3s manifests (`k8s/`): Deployments, Services, ConfigMaps, Secrets, PVC, and HPA |
| **Exp 5** | Continuous Integration (Jenkins / GitHub Actions) | PR build pipelines executing linters, automated unit tests, and image building |
| **Exp 6** | Provisioning and configuration with Ansible | `ansible/playbook.yml` automated provisioning of AWS EC2 with Docker, K3s, and dependencies |
| **Exp 7** | Continuous Delivery / Automated Deployment | Automated deployment triggers on merge to `main`, container registry push, and `kubectl rollout` |
| **Exp 8** | Application & Infrastructure Monitoring | Prometheus scraping `/metrics` + preconfigured Grafana dashboards for cluster & app health |
| **Exp 9** | Agile lifecycle using Jira with DevOps integration | Jira Scrum board, Sprint planning, user stories, ticket keys (`CRIC-XX`) tied to Git branches & commits |
| **Exp 10**| End-to-end DevOps mini-project execution | Complete lifecycle demonstration: Jira issue $\rightarrow$ Feature branch $\rightarrow$ Automated CI $\rightarrow$ CD $\rightarrow$ Live cluster $\rightarrow$ Grafana |
| **Exp 11-12**| Theory Assignments 1 & 2 | Comprehensive documentation (`PRD.md`, `ARCHITECTURE.md`, `WORKFLOW.md`, and report writeups) |

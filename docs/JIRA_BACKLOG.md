# JIRA BACKLOG & SPRINT PLAN: Smart Cricket Tournament Tracker

**Course:** Agile Software Development and DevOps Lab (TE AI & DS, Sem V)  
**Board Type:** Scrum Board  
**Project Key:** `CRIC`  
**Version:** 1.0  

---

## 1. Epics Overview

| Epic Key | Epic Name | Description |
|----------|-----------|-------------|
| `CRIC-EPIC-1` | Authentication & User Management | Admin registration, login, JWT issuance, route guards |
| `CRIC-EPIC-2` | Tournament & Match Management | CRUD for tournaments, teams, players, and match scheduling |
| `CRIC-EPIC-3` | Live Scoring & Tournament Standings | Real-time score updates, live scorecard UI, automatic NRR computation |
| `CRIC-EPIC-4` | Player Statistics & Data Visualization | Player profiles, career stats, Recharts form visualization |
| `CRIC-EPIC-5` | Machine Learning & MLOps Service | FastAPI prediction service, MLflow tracking, Airflow retraining DAG |
| `CRIC-EPIC-6` | Containerization & Orchestration | Dockerfiles, Docker Compose local stack, Kubernetes (K3s) deployment |
| `CRIC-EPIC-7` | CI/CD Pipeline Automation | Jenkins & GitHub Actions PR validation and automated CD to K3s |
| `CRIC-EPIC-8` | Monitoring & Observability | Prometheus metric scraping and Grafana dashboard visualization |

---

## 2. Sprint Backlogs & Detailed User Stories

### Sprint 0 (Week 1): Foundation & Architecture Setup
**Sprint Goal:** Initialize the repository, configure the Jira Scrum board with GitHub integration, and finalize database schemas and project scaffolding.

#### Story `CRIC-1`: Project Scaffolding & Git Branching Rules
- **Epic:** `CRIC-EPIC-7`
- **Story Points:** 2
- **Description:** As a DevOps engineer, I want to initialize the Git repository with standard directory structure, `.gitignore`, and branch protection rules so that team members can collaborate cleanly.
- **Acceptance Criteria:**
  - Given the GitHub repository `cricket-tracker`,
  - When branches `main` and `develop` are pushed,
  - Then branch protection rules require pull request reviews and status checks before merging.

#### Story `CRIC-2`: Database Schema Definition & Mongoose Connection
- **Epic:** `CRIC-EPIC-2`
- **Story Points:** 3
- **Description:** As a backend developer, I want to define Mongoose schemas for User, Tournament, Team, Player, Match, and PlayerMatchStat so that data models are strictly typed and indexed.
- **Acceptance Criteria:**
  - Given MongoDB running locally or in Docker,
  - When the backend boots,
  - Then Mongoose connects successfully and creates all specified indexes.

---

### Sprint 1 (Weeks 2-3): Backend API & Authentication
**Sprint Goal:** Implement JWT authentication and complete REST CRUD APIs for tournaments, teams, players, and matches with >70% unit test coverage.

#### Story `CRIC-3`: Admin JWT Authentication & Password Hashing
- **Epic:** `CRIC-EPIC-1`
- **Story Points:** 5
- **Description:** As a tournament administrator, I want to register and log in using an email and password so that I receive a signed JWT to access protected endpoints.
- **Acceptance Criteria:**
  - Given valid admin credentials,
  - When `POST /api/auth/login` is called,
  - Then a JWT token valid for 24 hours is returned; invalid credentials return HTTP 401.

#### Story `CRIC-4`: Tournament & Team CRUD REST Endpoints
- **Epic:** `CRIC-EPIC-2`
- **Story Points:** 5
- **Description:** As an administrator, I want to create, read, update, and delete tournaments and teams so that I can configure local tournaments.
- **Acceptance Criteria:**
  - Given a valid JWT token,
  - When `POST /api/tournaments` and `POST /api/teams` are called with valid bodies,
  - Then documents are persisted in MongoDB and HTTP 201 is returned.

#### Story `CRIC-5`: Match Scheduling & Automated Route Unit Tests
- **Epic:** `CRIC-EPIC-2`
- **Story Points:** 5
- **Description:** As an admin, I want to schedule matches between two registered teams and verify all routes using Jest and Supertest.
- **Acceptance Criteria:**
  - Given two registered teams in a tournament,
  - When `POST /api/matches` is executed,
  - Then match status is set to `upcoming` and Jest test suite achieves $\ge 70\%$ code coverage.

---

### Sprint 2 (Weeks 4-5): Frontend Development & Live Scoring
**Sprint Goal:** Build the React frontend with tournament views, real-time live scorecard polling, automatic standings table with NRR, and Recharts player form charts.

#### Story `CRIC-6`: Live Match Scorecard with Auto-Refresh
- **Epic:** `CRIC-EPIC-3`
- **Story Points:** 8
- **Description:** As a public viewer, I want to view an auto-refreshing live match scorecard so that I can track runs, wickets, overs, and ball-by-ball updates.
- **Acceptance Criteria:**
  - Given a match with status `live`,
  - When the user views `/matches/:id/live`,
  - Then scores auto-refresh every 5 seconds without full page reload.

#### Story `CRIC-7`: Standings Table & Automatic NRR Calculation
- **Epic:** `CRIC-EPIC-3`
- **Story Points:** 5
- **Description:** As a viewer, I want to view a points table for the tournament showing matches played, won, lost, points, and Net Run Rate (NRR).
- **Acceptance Criteria:**
  - Given completed tournament matches,
  - When `GET /api/standings/:tournamentId` is invoked,
  - Then teams are ordered by highest points and highest NRR.

#### Story `CRIC-8`: Player Profile & Recharts Visualization
- **Epic:** `CRIC-EPIC-4`
- **Story Points:** 5
- **Description:** As a viewer, I want to view a player's profile with career stats and an interactive line chart displaying scores in their last 5 matches.
- **Acceptance Criteria:**
  - Given a player profile page,
  - When the page loads,
  - Then Recharts renders an interactive form chart plotting match dates against runs scored.

---

### Sprint 3 (Weeks 6-7): Machine Learning Service & MLOps Integration
**Sprint Goal:** Train expected runs and Player of the Match models using Kaggle T20 data, serve predictions via FastAPI, and log runs in MLflow.

#### Story `CRIC-9`: Kaggle T20 Preprocessing & Feature Engineering
- **Epic:** `CRIC-EPIC-5`
- **Story Points:** 5
- **Description:** As an ML engineer, I want to clean Kaggle T20 data and extract rolling 5-match averages, strike rates, and venue metrics so that models can be trained.
- **Acceptance Criteria:**
  - Given raw Kaggle T20 CSV files,
  - When `load_kaggle.py` runs,
  - Then cleaned feature datasets with no nulls are generated.

#### Story `CRIC-10`: FastAPI Microservice & Model Training with MLflow
- **Epic:** `CRIC-EPIC-5`
- **Story Points:** 8
- **Description:** As an ML engineer, I want to train regression and classification models, log them to MLflow, and expose `POST /predict/runs` and `POST /predict/pom` via FastAPI.
- **Acceptance Criteria:**
  - Given feature input payload,
  - When `POST /predict/runs` is invoked,
  - Then FastAPI returns predicted runs with $< 200\text{ ms}$ inference latency and MLflow records the active model version.

#### Story `CRIC-11`: Node.js Backend to FastAPI Proxy Integration
- **Epic:** `CRIC-EPIC-5`
- **Story Points:** 3
- **Description:** As a backend developer, I want Node.js to forward player prediction requests to the FastAPI microservice and attach predictions to the player API response.
- **Acceptance Criteria:**
  - Given a request to `GET /api/predict/:playerId`,
  - When Node calls `http://ml-api:8000/predict/runs`,
  - Then the response merges player stats with ML predictions.

---

### Sprint 4 (Weeks 8-9): Containerization, Ansible & CI Pipeline
**Sprint Goal:** Containerize all services with multi-stage Dockerfiles, create Docker Compose local stack, provision AWS EC2 using Ansible, and set up PR validation CI in Jenkins/GitHub Actions.

#### Story `CRIC-12`: Multi-Stage Dockerfiles & Docker Compose Stack
- **Epic:** `CRIC-EPIC-6`
- **Story Points:** 5
- **Description:** As a DevOps engineer, I want multi-stage Dockerfiles for React, Node, and FastAPI and a `docker-compose.yml` file so that the full stack runs locally with one command.
- **Acceptance Criteria:**
  - Given Docker installed,
  - When `docker compose up --build` is run,
  - Then frontend, backend, ml-api, mongo, and mlflow containers start and communicate over `cricket-net`.

#### Story `CRIC-13`: Ansible Provisioning Playbook for AWS EC2
- **Epic:** `CRIC-EPIC-6`
- **Story Points:** 5
- **Description:** As a DevOps engineer, I want an idempotent Ansible playbook that installs Docker, Jenkins, and K3s on a fresh Ubuntu EC2 instance.
- **Acceptance Criteria:**
  - Given an AWS EC2 instance IP in `inventory.ini`,
  - When `ansible-playbook -i inventory.ini playbook.yml` executes,
  - Then Docker, K3s, and Jenkins services are active and reachable.

#### Story `CRIC-14`: Continuous Integration Pipeline (Jenkins / GitHub Actions)
- **Epic:** `CRIC-EPIC-7`
- **Story Points:** 5
- **Description:** As a developer, I want a CI pipeline triggered on every PR that runs linting, unit tests, and Docker builds to prevent regressions.
- **Acceptance Criteria:**
  - Given a PR opened against `develop`,
  - When the CI pipeline triggers,
  - Then tests pass, images build, and a green status is posted back to GitHub.

---

### Sprint 5 (Weeks 10-11): Kubernetes Orchestration, CD, Monitoring & Airflow
**Sprint Goal:** Deploy on K3s Kubernetes with HPA, automate CD on merge to main, configure Prometheus/Grafana monitoring, and schedule the Airflow retraining DAG.

#### Story `CRIC-15`: Kubernetes Manifests & Horizontal Pod Autoscaler (HPA)
- **Epic:** `CRIC-EPIC-6`
- **Story Points:** 5
- **Description:** As a DevOps engineer, I want Kubernetes manifests (Deployments, Services, Ingress, HPA) so that the application runs reliably on K3s and autoscales under load.
- **Acceptance Criteria:**
  - Given K3s running on EC2,
  - When `kubectl apply -f k8s/` is executed,
  - Then all pods become `Running`, and load simulation scales backend pods from 2 to 5.

#### Story `CRIC-16`: Automated Continuous Deployment (CD) Pipeline
- **Epic:** `CRIC-EPIC-7`
- **Story Points:** 5
- **Description:** As a DevOps engineer, I want an automated CD pipeline triggered on merge to `main` that tags images, pushes to Docker Hub, and rolls out updates to K3s.
- **Acceptance Criteria:**
  - Given a merge to `main`,
  - When the CD pipeline runs,
  - Then `kubectl rollout status` confirms successful zero-downtime deployment.

#### Story `CRIC-17`: Prometheus & Grafana Observability Dashboards
- **Epic:** `CRIC-EPIC-8`
- **Story Points:** 5
- **Description:** As an SRE, I want Prometheus scraping `/metrics` and Grafana displaying real-time request rates, p95 latency, error rates, and pod resource consumption.
- **Acceptance Criteria:**
  - Given traffic hitting the backend,
  - When Grafana dashboard is viewed,
  - Then graphs dynamically plot requests per second and latency percentiles.

#### Story `CRIC-18`: Apache Airflow Model Retraining DAG
- **Epic:** `CRIC-EPIC-5`
- **Story Points:** 5
- **Description:** As an MLOps engineer, I want an Airflow DAG that runs weekly to query completed match stats from MongoDB, retrain the model, evaluate MAE against production, and register the winner.
- **Acceptance Criteria:**
  - Given the Airflow webserver running,
  - When DAG `retrain_cricket_model` executes,
  - Then tasks run sequentially, log runs in MLflow, and update the production model alias if metrics improve.

---

### Sprint 6 (Week 12): End-to-End Integration, Final Demo & Lab Reports
**Sprint Goal:** Conduct final end-to-end demo (Experiment 10), verify all 10 experiments against the syllabus, and prepare final documentation (Experiments 11 & 12).

#### Story `CRIC-19`: End-to-End Experiment 10 Live Demonstration
- **Epic:** `CRIC-EPIC-7`
- **Story Points:** 3
- **Description:** As a team, we want to perform a live demonstration creating a Jira ticket `CRIC-99`, branching, submitting a PR, observing CI/CD, and inspecting live Grafana metrics and Airflow DAG.
- **Acceptance Criteria:**
  - All 10 syllabus experiments demonstrated seamlessly end-to-end within 15 minutes.

# PRD: Smart Cricket Tournament Tracker

**Course:** Agile Software Development and DevOps Lab (TE AI & DS, Sem V)
**Institution:** Thadomal Shahani Engineering College
**Version:** 1.0

---

## 1. Overview

### 1.1 Problem Statement
Local and club-level cricket tournaments (such as those run under city
associations) are often managed through spreadsheets and WhatsApp groups.
There is no single place for live scores, standings, player statistics or
data-driven predictions.

### 1.2 Product Vision
A web portal where admins create and run tournaments and update live
scores, and the public views scorecards, standings and player profiles.
An ML service predicts player performance and Player of the Match
probability. The whole system is delivered through an automated DevOps
pipeline.

### 1.3 Goals
- Deliver a functional MERN application with an integrated ML service.
- Demonstrate a complete DevOps lifecycle from code commit to deployment
  and monitoring (LO1-LO6).
- Follow Agile practices with Jira sprints.

### 1.4 Non-Goals
- Real-money betting or fantasy features.
- Native mobile apps.
- Ball-by-ball video or streaming.

---

## 2. Users and Roles

| Role | Capabilities |
|------|--------------|
| Admin | Log in (JWT), create tournaments, add teams and players, schedule matches, update live scores |
| Public viewer | View tournaments, live scorecards, standings, player profiles, ML predictions |

---

## 3. Functional Requirements

### 3.1 Authentication (Backend)
- FR-1: Admin registration/login using JWT.
- FR-2: Protected routes for all create/update/delete operations.
- FR-3: Password hashing with bcrypt.

### 3.2 Tournament Management
- FR-4: CRUD for Tournaments (name, format, dates, venue).
- FR-5: CRUD for Teams linked to a tournament.
- FR-6: CRUD for Players linked to a team (role, batting/bowling style).
- FR-7: CRUD for Matches (teams, date, venue, status, scores, result).

### 3.3 Live Scoring and Standings
- FR-8: Admin updates runs, wickets and overs for a match.
- FR-9: The Live Match screen auto-refreshes (polling or WebSocket).
- FR-10: The standings table is computed automatically (played, won, lost,
  points, NRR).

### 3.4 Player Statistics
- FR-11: The Player Profile page shows career and recent stats.
- FR-12: A Recharts line/bar chart visualises the player's last N matches.

### 3.5 Machine Learning Service
- FR-13: The model predicts a player's expected runs in the next match.
- FR-14: The model predicts Player of the Match probability.
- FR-15: Features: recent form, strike rate, opposition strength, venue.
- FR-16: The ML API is exposed via FastAPI. The Node backend calls it
  (`POST /predict/runs`, `POST /predict/pom`).
- FR-17: Training runs are tracked in MLflow (parameters, metrics, model).
- FR-18: An Airflow DAG retrains the model on a schedule.

### 3.5 Non-Functional Requirements
- NFR-1: API response time under 500 ms for standard reads.
- NFR-2: The backend scales horizontally on Kubernetes.
- NFR-3: Containers are built as multi-stage images for small size.
- NFR-4: Secrets are stored in env vars / Kubernetes Secrets, never in Git.
- NFR-5: At least 70% unit-test coverage on Node routes.

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Recharts, Axios |
| Backend | Node.js, Express, JWT, Mongoose |
| Database | MongoDB |
| ML Service | Python, Scikit-learn, Pandas, FastAPI |
| ML Lifecycle (LO5) | MLflow, Apache Airflow |
| Version Control (LO2) | Git, GitHub |
| Agile (LO1) | Jira (Scrum board) |
| Containerization (LO4) | Docker (multi-stage), Docker Compose |
| Orchestration (LO4) | Kubernetes (K3s) |
| CI/CD (LO3) | Jenkins and/or GitHub Actions |
| Config Management / IaC | Ansible |
| Cloud | AWS EC2 |
| Monitoring (LO5) | Prometheus, Grafana (Nagios optional) |
| AI Assistance | GitHub Copilot |
| Dataset | Kaggle T20 dataset |

---

## 5. Data Model (MongoDB)

**Tournament**: _id, name, format (T20/ODI), startDate, endDate, venue, status
**Team**: _id, name, tournamentId (ref), captain, logoUrl
**Player**: _id, name, teamId (ref), role, battingStyle, bowlingStyle, stats{matches, runs, wickets, avg, strikeRate}
**Match**: _id, tournamentId (ref), teamA (ref), teamB (ref), date, venue, status (upcoming/live/completed), scoreA{runs,wickets,overs}, scoreB{runs,wickets,overs}, winner (ref), playerOfMatch (ref)
**PlayerMatchStat**: _id, playerId (ref), matchId (ref), runs, ballsFaced, wickets, oversBowled, opposition
**User (Admin)**: _id, email, passwordHash, role

---

## 6. System Architecture

```
React UI --> Node/Express API --> MongoDB
                  |
                  +--> FastAPI ML Service --> MLflow (tracking/registry)
                                                 ^
                                           Airflow DAG (scheduled retrain)

Git push --> Jenkins/GitHub Actions --> Docker build --> Registry
         --> kubectl apply --> K3s on AWS EC2
Prometheus + Grafana monitor the cluster and API metrics.
```

### 6.1 API Endpoints (summary)
- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/tournaments`
- `GET/POST/PUT/DELETE /api/teams`
- `GET/POST/PUT/DELETE /api/players`
- `GET/POST/PUT/DELETE /api/matches`
- `GET /api/standings/:tournamentId`
- `GET /api/players/:id/form`
- `GET /api/predict/:playerId` (proxies to the FastAPI ML service)
- `GET /metrics` (Prometheus metrics)

---

## 7. DevOps Pipeline (mapped to the lab syllabus)

| Expt | Syllabus Title | LO | Implementation in This Project |
|------|----------------|----|-------------------------------|
| 1 | Version control using Git | LO2 | Branching strategy: main, develop, feature/auth, feature/ml-api, feature/dashboard, bugfix/ui. PRs with reviews |
| 2 | Containerize applications using Docker | LO3 | Multi-stage Dockerfiles for React, Node API and FastAPI ML service |
| 3 | Multi-service apps using Docker Compose | LO3 | docker-compose.yml with frontend, backend, ml-api and mongo, plus volumes and networks |
| 4 | Deploy and manage containers using Kubernetes | LO4 | Deployment, Service, ConfigMap, Secret and HPA manifests on K3s |
| 5 | Continuous Integration pipeline (Jenkins/GitHub Actions) | LO3 | Pipeline triggered on PR: install, lint, run Jest tests, build image |
| 6 | Provisioning and configuration using Ansible | LO4 | Playbook installs Docker, Jenkins and K3s on an AWS EC2 instance |
| 7 | Automate deployment (GitHub/Jenkins) | LO3 | On merge to main: build, push images to a registry, `kubectl apply` to the cluster |
| 8 | Monitoring (Prometheus/Grafana/Nagios) | LO5 | Prometheus scrapes /metrics. Grafana dashboards: requests/min, latency, pod CPU/memory |
| 9 | Agile lifecycle using Jira with DevOps integration | LO1 | Scrum board, 2-week sprints, epics/stories, Jira-GitHub integration, branch names carry ticket IDs |
| 10 | End-to-end DevOps mini project | LO6 | Full demo: Jira ticket, commit, CI, CD, live deployment, monitoring |
| 11-12 | Theory Assignments 1 and 2 | - | Documentation (Agile/DevOps concepts) |

### 7.1 MLOps (LO5)
- MLflow logs hyperparameters, RMSE/MAE, feature importance and model artifacts.
- The best model is registered and loaded by FastAPI.
- An Airflow DAG (ingest data, preprocess, train, evaluate, register) runs weekly.

---

## 8. Agile Plan (Jira)

| Sprint | Duration | Focus |
|--------|----------|-------|
| Sprint 0 | Week 1 | Setup: repo, Jira board, schemas, wireframes |
| Sprint 1 | Weeks 2-3 | Backend: JWT auth, CRUD APIs, Mongo models |
| Sprint 2 | Weeks 4-5 | Frontend: dashboard, Live Match, Standings, Player Profile |
| Sprint 3 | Weeks 6-7 | ML: dataset, model, FastAPI, MLflow, integration with Node |
| Sprint 4 | Weeks 8-9 | Docker, Compose, Ansible, Jenkins CI |
| Sprint 5 | Weeks 10-11 | Kubernetes, CD, Prometheus/Grafana, Airflow |
| Sprint 6 | Week 12 | Testing, bug fixes, documentation, final demo |

Definition of Done: code reviewed, tests passing, CI green, deployed to
the cluster, Jira ticket closed.

---

## 9. Success Metrics
- All 10 experiments demonstrably implemented and mapped to the syllabus.
- CI pipeline passes on every PR. Merge to main auto-deploys in under 10 min.
- ML model beats a naive baseline (player average) on MAE.
- Grafana shows live request rate and latency.
- Backend autoscales under a simple load test.

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Kaggle data is messy or too large | Filter to a subset of seasons; use Pandas preprocessing |
| AWS free-tier or budget limits | Use a single t3.medium EC2; stop it when idle |
| Too many tools for the timeline | Prioritise the core pipeline; Nagios and WebSockets are optional |
| ML accuracy is low | Focus on a clear pipeline and tracking, not perfect accuracy |

---

## 11. Final Demo Flow (Experiment 10)
1. Create a Jira ticket for a new feature (e.g. "Add bowler economy chart").
2. Create a feature branch named after the ticket and push the React change.
3. Open a PR. Jenkins/GitHub Actions runs tests automatically.
4. Merge to main. The CD pipeline builds, pushes and deploys to Kubernetes.
5. Show the live site updated and the Grafana dashboard reflecting traffic.
6. Show the MLflow UI and the Airflow DAG run.

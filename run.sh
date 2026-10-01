#!/usr/bin/env bash
# ==============================================================================
# SMART CRICKET TOURNAMENT TRACKER - SINGLE ATTEMPT RUNNER
# Course: Agile Software Development and DevOps Lab (TE AI & DS, Sem V)
# Author: Yomesh-P (yomeshpatil99@gmail.com)
#
# Usage:
#   chmod +x run.sh
#   ./run.sh              # Start all 8 microservices & dashboards via Docker
#   ./run.sh --seed       # Re-seed the MongoDB database with 2026 data
#   ./run.sh --down       # Stop all running microservices
#   ./run.sh --logs       # Follow live logs from all containers
#   ./run.sh --status     # Check status of all containers & health endpoints
# ==============================================================================

set -e

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "=========================================================================="
  echo "       🏏 SMART CRICKET TOURNAMENT TRACKER (2026 CLAYMORPHISM)           "
  echo "       Agile Software Development & DevOps + MLOps Lab (TE AI & DS)       "
  echo "=========================================================================="
  echo -e "${NC}"
}

print_dashboards() {
  echo -e "\n${GREEN}${BOLD}🎉 ALL SERVICES OPERATIONAL! ACCESS YOUR DASHBOARDS BELOW:${NC}\n"
  echo -e "${BOLD}+--------------------------------+----------------------------+-----------------------------+${NC}"
  echo -e "${BOLD}| DASHBOARD / INTERFACE          | URL / PORT                 | ACCESS & CREDENTIALS        |${NC}"
  echo -e "${BOLD}+--------------------------------+----------------------------+-----------------------------+${NC}"
  echo -e "| 1. React Web App (White Clay)  | ${CYAN}http://localhost:3000${NC}      | Public / User Dashboard     |"
  echo -e "|    - Admin Scorer Console      | ${CYAN}http://localhost:3000 (Tab)${NC} | admin@cricket.org / admin123|"
  echo -e "| 2. Express REST API Gateway    | ${CYAN}http://localhost:5000${NC}      | Auto-redirects to Port 3000 |"
  echo -e "|    - Live Matches Endpoint     | ${CYAN}http://localhost:5000/api/matches/live${NC}                 |"
  echo -e "|    - Health Check Probe        | ${CYAN}http://localhost:5000/health${NC}                          |"
  echo -e "| 3. FastAPI ML Microservice     | ${CYAN}http://localhost:8000/docs${NC} | Interactive Swagger OpenAPI |"
  echo -e "|    - Alternative Docs (ReDoc)  | ${CYAN}http://localhost:8000/redoc${NC}                            |"
  echo -e "| 4. MLflow Model Registry (LO5) | ${CYAN}http://localhost:5001${NC}      | Model Lineage & Metrics     |"
  echo -e "| 5. Apache Airflow UI (LO5)     | ${CYAN}http://localhost:8080${NC}      | Retraining DAG Scheduler    |"
  echo -e "| 6. Grafana Analytics (Exp 8)   | ${CYAN}http://localhost:3001${NC}      | User: admin | Pass: admin   |"
  echo -e "| 7. Prometheus Metrics (Exp 8)  | ${CYAN}http://localhost:9090${NC}      | PromQL & Target Health      |"
  echo -e "| 8. MongoDB Database Engine     | ${CYAN}localhost:27017${NC}            | Database: cricket_tracker   |"
  echo -e "${BOLD}+--------------------------------+----------------------------+-----------------------------+${NC}\n"
  echo -e "${YELLOW}💡 Tip: To view live container logs, run: ./run.sh --logs${NC}"
  echo -e "${YELLOW}🛑 To stop all containers, run:          ./run.sh --down${NC}\n"
}

# ------------------------------------------------------------------------------
# Flag Handlers
# ------------------------------------------------------------------------------
if [ "$1" == "--down" ]; then
  print_banner
  echo -e "${YELLOW}Stopping all Docker containers...${NC}"
  docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true
  echo -e "${GREEN}All services successfully stopped.${NC}"
  exit 0
fi

if [ "$1" == "--logs" ]; then
  print_banner
  echo -e "${CYAN}Streaming live container logs (Ctrl+C to exit)...${NC}"
  docker compose logs -f 2>/dev/null || docker-compose logs -f 2>/dev/null || echo "Docker not active."
  exit 0
fi

if [ "$1" == "--status" ]; then
  print_banner
  echo -e "${CYAN}Docker Container Health Status:${NC}"
  docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo "Docker not running."
  exit 0
fi

if [ "$1" == "--seed" ]; then
  print_banner
  echo -e "${CYAN}Re-seeding MongoDB database with 2026 tournament data...${NC}"
  if docker ps 2>/dev/null | grep -q cricket-backend; then
    docker exec -t cricket-backend node seed.js
  elif [ -f backend/seed.js ]; then
    (cd backend && node seed.js)
  else
    echo -e "${RED}Error: Cannot find seed script or running backend container.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Database successfully re-seeded!${NC}"
  exit 0
fi

# ------------------------------------------------------------------------------
# Main Execution (Single Attempt Startup)
# ------------------------------------------------------------------------------
print_banner

echo -e "${CYAN}[1/4] Checking system dependencies...${NC}"

HAS_DOCKER=false
if command -v docker &>/dev/null && docker info &>/dev/null; then
  HAS_DOCKER=true
  echo -e "  ✓ Docker Engine is running"
fi

if [ "$HAS_DOCKER" = true ]; then
  echo -e "${CYAN}[2/4] Launching all 8 microservices via Docker Compose...${NC}"
  echo -e "  Building & spinning up: Mongo, Backend, ML-API, Frontend, MLflow, Airflow, Prometheus, Grafana..."
  
  if docker compose version &>/dev/null; then
    docker compose up -d --build
  else
    docker-compose up -d --build
  fi

  echo -e "${CYAN}[3/4] Waiting for services to become healthy...${NC}"
  
  # Wait for MongoDB
  echo -n "  Waiting for MongoDB on port 27017..."
  for i in {1..30}; do
    if docker exec cricket-mongo mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
      echo -e " ${GREEN}Ready!${NC}"
      break
    fi
    sleep 2
    echo -n "."
  done

  # Wait for Backend
  echo -n "  Waiting for Express API on port 5000..."
  for i in {1..30}; do
    if curl -s http://localhost:5000/health &>/dev/null; then
      echo -e " ${GREEN}Ready!${NC}"
      break
    fi
    sleep 2
    echo -n "."
  done

  echo -e "${CYAN}[4/4] Seeding 2026 tournament, teams, players, and match records...${NC}"
  docker exec -t cricket-backend node seed.js || true

  print_dashboards

else
  echo -e "${YELLOW}Notice: Docker is not running or not installed.${NC}"
  echo -e "${CYAN}Falling back to Bare-Metal Local Development Mode...${NC}\n"

  # Check Node
  if ! command -v node &>/dev/null; then
    echo -e "${RED}Error: Neither Docker nor Node.js is installed. Please install Docker Desktop or Node.js to continue.${NC}"
    exit 1
  fi

  echo -e "${CYAN}[2/4] Installing Backend dependencies & seeding database...${NC}"
  (cd backend && npm install --silent && node seed.js)

  echo -e "${CYAN}[3/4] Installing Frontend dependencies...${NC}"
  (cd frontend && npm install --silent)

  echo -e "${CYAN}[4/4] Starting Backend (Port 5000) and Frontend (Port 3000)...${NC}"
  (cd backend && node server.js) &
  BACKEND_PID=$!
  (cd frontend && npm run dev -- --port 3000 --host 0.0.0.0) &
  FRONTEND_PID=$!

  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

  echo -e "\n${GREEN}Local servers running in background (PIDs: $BACKEND_PID, $FRONTEND_PID).${NC}"
  print_dashboards

  # Keep script running to maintain background processes
  wait
fi

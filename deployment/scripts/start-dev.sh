#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "Starting PostgreSQL..."
docker compose -f "$ROOT/deployment/docker/docker-compose.yml" up -d

echo "Run migrations:"
echo "  cd database && alembic upgrade head"
echo ""
echo "Start backend:"
echo "  cd backend && uvicorn main:app --reload --port 8000"
echo ""
echo "Start frontend:"
echo "  cd frontend && npm run dev"

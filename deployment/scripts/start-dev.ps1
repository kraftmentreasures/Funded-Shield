$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host "Starting PostgreSQL..."
docker compose -f "$Root\deployment\docker\docker-compose.yml" up -d

Write-Host ""
Write-Host "Run migrations:"
Write-Host "  cd database; alembic upgrade head"
Write-Host ""
Write-Host "Start backend:"
Write-Host "  cd backend; uvicorn main:app --reload --port 8000"
Write-Host ""
Write-Host "Start frontend:"
Write-Host "  cd frontend; npm run dev"

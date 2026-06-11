# Funded-Shield

SaaS platform to protect prop traders from violating prop firm rules.

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | PostgreSQL |
| Auth | JWT |

## Project structure

```
Funded-Shield/
├── frontend/          # Next.js App Router
├── backend/           # FastAPI application
├── database/          # Alembic migrations & seeds
└── deployment/        # Docker & infrastructure
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop (for PostgreSQL)

## Local development

### 1. Start PostgreSQL

```bash
docker compose -f deployment/docker/docker-compose.yml up -d
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Copy environment variables:

```bash
# From project root
copy .env.example .env        # Windows
cp .env.example .env          # macOS / Linux
```

Run database migrations:

```bash
cd database
alembic upgrade head
```

Start the API server:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health check: http://localhost:8000/api/v1/health

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### Option B — Docker (full stack)

Requires Docker Desktop only:

```bash
docker compose -f deployment/docker/docker-compose.dev.yml up --build
```

Then run migrations in a separate terminal:

```bash
docker compose -f deployment/docker/docker-compose.dev.yml run --rm migrate
```

App: http://localhost:3000  
API: http://localhost:8000/docs

### Helper scripts

```bash
# Windows
.\deployment\scripts\start-dev.ps1

# macOS / Linux
./deployment/scripts/start-dev.sh
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard |
| `/settings` | Settings |

## API endpoints (skeleton)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check + DB status |
| POST | `/api/v1/auth/register` | Register (name, email, password) |
| POST | `/api/v1/auth/login` | Login — returns JWT |
| GET | `/api/v1/auth/me` | Current user (requires JWT) |

## License

Proprietary

# Building and Testing the OctoCAT Supply Chain Application

This guide provides instructions for building, running, and testing the OctoCAT Supply Chain Management application, which consists of a **Python FastAPI** backend and a **React + Vite** frontend.

## Prerequisites

- **Python 3.11+** and `pip`
- **Node.js 18+** and `npm`
- Docker / Podman (optional, for containerized deployment)

## Installation

### Backend (Python API)

```bash
cd src/api-py
pip install -r requirements.txt
```

### Frontend

```bash
cd src/frontend
npm install
```

## Running the Application

### Backend — dev mode (hot reload)

```bash
cd src/api-py
uvicorn main:app --reload --port 3000
```

The API will be available at `http://localhost:3000`.  
OpenAPI docs: `http://localhost:3000/docs`

### Frontend — dev mode

```bash
cd src/frontend
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Database Management

The API runs migrations and seeds automatically on startup. To trigger manually:

```bash
# From src/api-py/
python -c "from utils.db import init_db; init_db()"
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | API listening port |
| `DB_FILE` | `./data/app.db` | Path to SQLite database file |
| `API_CORS_ORIGINS` | _(unset)_ | Comma-separated CORS origin override |
| `DB_MIGRATIONS_DIR` | `../database/migrations` | Override migrations directory |

## Building for Production

### API (Docker)

```bash
docker build -t octocat-api -f src/api-py/Dockerfile src/api-py
```

### Frontend (Docker)

```bash
docker build -t octocat-frontend -f src/frontend/Dockerfile src/frontend
```

### Running with Docker Compose

```bash
docker-compose up --build
```

## Testing

### Backend unit & integration tests

```bash
cd src/api-py
pytest
```

Tests use an in-memory SQLite database (`:memory:`), so no file cleanup is needed.

### Frontend tests

```bash
cd src/frontend
npm run test
```

### End-to-end (Playwright)

```bash
cd src/frontend
npm run test:e2e
```

### Linting

```bash
# Frontend
cd src/frontend && npm run lint

# Python (if configured)
cd src/api-py && ruff check .
```

## Port Configuration

| Service | Default port |
|---|---|
| Python API | `3000` |
| Frontend (dev) | `5173` |
| Frontend (Docker) | `80` → mapped to `3001` in compose |

When running in **GitHub Codespaces**, set the API port visibility to `public` to avoid CORS errors from the frontend.

## VS Code Tasks

VS Code tasks are preconfigured for common operations:

1. Open the Command Palette (`Ctrl+Shift+P`) → **Tasks: Run Task**
2. Choose from:
   - `Start API` — starts the FastAPI backend with hot reload
   - `Start Frontend` — starts the Vite dev server
   - `Start All` — starts both concurrently
3. Or press `Ctrl+Shift+B` to run the default build task.

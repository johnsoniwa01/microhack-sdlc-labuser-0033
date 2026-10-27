# OctoCAT Supply Chain Management Application – General Copilot Instructions

These are repository-wide guidelines. Path‑scoped files in `.github/instructions/*.instructions.md` provide focused guidance for specific areas (frontend, API, database).

## High-Level Architecture
Monorepo under `src/` implementing the OctoCAT Supply Chain app with a Python FastAPI backend and a shared React frontend:
- `src/api-py` — FastAPI REST API in Python (the **only** backend implementation)
- `src/frontend` — React + Vite + Tailwind UI
- `src/database` — SQLite schema: `src/database/migrations/` and `src/database/seed/`

Refer to `src/docs/architecture.md` and `src/docs/sqlite-integration.md` for deeper details. Avoid restating them in reviews and link instead.

## General Review Guidance
When generating suggestions:
1. Prefer incremental, minimal diffs; preserve existing style and naming.
2. Surface security, correctness, and data integrity issues before micro-optimizations.
3. Encourage type safety — use Pydantic models for all request/response shapes; avoid untyped `dict` returns where a schema can be defined.
4. Reduce duplication: when the same logic appears in multiple places, suggest extracting it into a shared utility or repository method.
5. Ensure error handling uses existing custom error types where appropriate (e.g., NotFound, Validation, Conflict) and propagates consistent HTTP status codes via FastAPI's `HTTPException` or exception handlers.
6. Encourage tests: request unit tests for new repository logic (using an in-memory SQLite DB) and `TestClient` integration tests for new routes.
7. For performance concerns, highlight N+1 query patterns, unnecessary data loading, or missing indexes.
8. Prefer environment variable driven configuration; avoid hard‑coded paths/secrets.

## Workflow
- Install dependencies: `pip install -r requirements.txt` from `src/api-py/`.
- Run API in dev mode: `uvicorn main:app --reload --port 3000` from `src/api-py/`.
- Run frontend: `npm run dev` from `src/frontend/`.
- Keep PRs scoped: code + tests + docs (architecture or build notes) when behavior changes.
- Update related instruction files if new folders or architectural slices are introduced.

## Do Not Repeat
Do not inline full API route or component files in review feedback unless absolutely necessary: quote only the lines requiring change. Summarize low‑impact nits.

## Escalation Order for Suggestions
1. Security / data integrity
2. Logical / functional correctness
3. Performance / scalability
4. Maintainability / duplication
5. Readability / consistency
6. Style / minor formatting

## Tone & Feedback Style
Be concise, actionable, and cite a rationale ("because" clause) for non-trivial recommendations. Offer one preferred solution; optionally a lightweight alternative.

---
If new subsystems are added (e.g., `mobile/`, `worker/`), create a new `*.instructions.md` with `applyTo` globs instead of bloating this file.
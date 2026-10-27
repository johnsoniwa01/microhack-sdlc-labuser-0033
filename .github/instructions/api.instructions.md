---
description: "Guidance for editing and reviewing API code changes in the Python FastAPI backend."
applyTo: "src/api-py/**, src/database/migrations/**, src/database/seed/**"
---
# API Review Guidance
Focus on correctness, security, data integrity, and consistency in the Python FastAPI backend and the SQLite repository layer.

## API Principles

- Keep routers (routes) thin: validation + orchestration only; move business logic to repositories/services.
- Use parameterized SQL always (via `?` placeholders with `sqlite3`); never build raw query strings with user input.
- Return proper HTTP status codes via `HTTPException` or custom exception handlers (404 NotFound, 400 Validation, 409 Conflict).
- Preserve consistent naming: `snake_case` everywhere in Python code and SQL columns; Pydantic aliases for any JSON key differences.
- Keep the API surface documented via FastAPI's auto-generated OpenAPI. Update Pydantic schemas when adding/modifying endpoints — the docs update automatically.

## Review Checklist
1. **Input validation**: Pydantic `BaseModel` schemas cover all request bodies; reject ambiguous/partial updates at the schema level.
2. **Error propagation**: repository raises domain errors → route handler catches → returns correct `HTTPException` status.
3. **Transactions**: group multi-table writes that must succeed or fail together using a single connection/cursor.
4. **Performance**: watch for N+1 loops over rows triggering per-row SELECT; prefer JOIN queries.
5. **Migrations**: every schema change accompanied by a new sequential SQL file; no edits to prior migrations.
6. **Seed adjustments** when adding required NOT NULL columns or reference data.
7. **OpenAPI updated**: new routes and Pydantic response models ensure Swagger at `/docs` reflects all changes.

## Data Integrity
- Enforce foreign keys (`PRAGMA foreign_keys = ON` must be set on every connection) and add indexes for new FK columns.
- Use CHECK constraints or Pydantic validators for domain rules (e.g., `quantity >= 0`).

## Testing Guidance
- Add unit tests for new repository methods (happy path + error cases) using an in-memory SQLite DB (`:memory:`).
- For route additions, write integration tests using FastAPI's `TestClient`, verifying status code + response shape.

## Security Considerations
- Sanitize/constrain pagination (max limits) to avoid full table scans.
- Do not leak internal error stacks or tracebacks in production responses (`debug=False`).
- CORS: restrict origins if the deployment is production-hardened.

## Example Feedback Style
"`products_repo.find_with_details()` issues one SELECT per order detail (N+1). Consider a single JOIN query returning flattened rows, then post-process into nested models."
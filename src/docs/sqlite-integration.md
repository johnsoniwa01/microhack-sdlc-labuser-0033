# SQLite Database Integration

This document explains how the SQLite database is integrated in the **OctoCAT Supply Chain Python/FastAPI API**.

## Overview

The API uses SQLite as its persistence layer, accessed directly via Python's built-in `sqlite3` module through a lightweight repository pattern. This provides:

- **Data persistence** — data survives server restarts
- **ACID transactions** — reliable data consistency
- **Proper relationships** — foreign key constraints between entities
- **Performance** — indexed queries and WAL mode for concurrency
- **Testing** — in-memory database for fast, isolated unit tests

## Database Structure

| Table | Description |
|---|---|
| `suppliers` | Supplier information |
| `headquarters` | Company headquarters data |
| `branches` | Branch locations (linked to headquarters) |
| `products` | Product catalog (linked to suppliers) |
| `orders` | Customer orders (linked to branches) |
| `order_details` | Order line items (linked to orders and products) |
| `deliveries` | Delivery tracking (linked to suppliers) |
| `order_detail_deliveries` | Junction table for order-delivery relationships |
| `migrations` | Schema version tracking |

## Getting Started

### 1. Automatic Initialization

When you start the API, migrations and seeds are applied automatically:

```bash
cd src/api-py
uvicorn main:app --reload --port 3000
```

This will:
- Create the SQLite database file at `api-py/data/app.db`
- Run all pending migrations (tracked in the `migrations` table)
- Seed the database with sample data if the tables are empty

### 2. Database Location

| Environment | Path |
|---|---|
| Development | `api-py/data/app.db` |
| Testing | `:memory:` (in-memory, per test) |

Override with the `DB_FILE` environment variable:

```bash
export DB_FILE=/path/to/your/database.db
```

## Repository Pattern

The API uses a Repository pattern to isolate database access from route handlers.

### Example — Suppliers Repository

```python
from repositories.suppliers_repo import SuppliersRepository

repo = SuppliersRepository(db_connection)

# Get all suppliers
suppliers = repo.find_all()

# Get by ID (raises NotFoundError if missing)
supplier = repo.find_by_id(1)

# Create
new_supplier = repo.create({
    "name": "New Supplier",
    "description": "Description",
    "contact_person": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-1234"
})

# Update
updated = repo.update(1, {"name": "Updated Name"})

# Delete
repo.delete(1)

# Search by name
results = repo.find_by_name("Tech")
```

### Repository Features

- **Type safety** — Pydantic models for all inputs and outputs
- **Error handling** — domain error types (`NotFoundError`, `ValidationError`, `ConflictError`)
- **SQL injection protection** — parameterized queries via `sqlite3` placeholders (`?`)
- **Consistent naming** — `snake_case` in Python maps directly to `snake_case` SQL columns

## Database Schema Management

### Migrations

Schema changes are managed through sequential SQL files:

1. Create a new file: `src/database/migrations/00N_description.sql`
2. Write idempotent SQL (use `IF NOT EXISTS` or equivalent where possible)
3. Restart the API — migrations run automatically on startup

Migration files are executed in lexicographic order and recorded in the `migrations` table; already-applied migrations are skipped.

### Seed Data

Sample data lives in `src/database/seed/`:

| File | Contents |
|---|---|
| `001_suppliers.sql` | Supplier records |
| `002_headquarters.sql` | Headquarters records |
| `003_branches.sql` | Branch records |
| `004_products.sql` | Product catalog |

Seeds are applied once when the target tables are empty.

## Testing Strategy

### Unit Tests (Repository Layer)

Use an in-memory database to test repository methods in isolation:

```python
import sqlite3
import pytest
from repositories.suppliers_repo import SuppliersRepository
from utils.db import run_migrations

@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    run_migrations(conn)
    yield conn
    conn.close()

def test_find_all_empty(db):
    repo = SuppliersRepository(db)
    assert repo.find_all() == []
```

### Integration Tests (Route Layer)

Use FastAPI's `TestClient` to test routes end-to-end against an in-memory DB:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_suppliers():
    response = client.get("/suppliers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

## Configuration

Database configuration is read from environment variables in `src/api-py/utils/db.py`:

| Variable | Default | Description |
|---|---|---|
| `DB_FILE` | `./data/app.db` | Path to SQLite database file |
| `DB_MIGRATIONS_DIR` | `../database/migrations` | Path to migration SQL files |
| `DB_FOREIGN_KEYS` | `true` | Enforce foreign key constraints (`PRAGMA foreign_keys`) |

## Error Handling

The repository layer raises typed domain errors that route handlers catch and convert to HTTP responses:

| Error | HTTP Status |
|---|---|
| `NotFoundError` | 404 |
| `ValidationError` | 400 |
| `ConflictError` | 409 |
| `DatabaseError` | 500 |

## Performance Considerations

- **Indexes** — defined in migrations on all FK columns and frequently filtered columns
- **WAL Mode** — enabled via `PRAGMA journal_mode=WAL` for better read/write concurrency
- **Parameterized queries** — prevent SQL injection and allow the SQLite query planner to cache plans
- **Connection reuse** — a single connection is opened per request (or shared at app startup for simple deployments)

## Backup and Recovery

SQLite stores all data in a single file — backup is straightforward:

```bash
# Backup
cp src/api-py/data/app.db src/api-py/data/app-backup-$(date +%Y%m%d).db

# Restore
cp src/api-py/data/app-backup-20240101.db src/api-py/data/app.db
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `database is locked` | Long-running transaction or unclosed connection | Ensure all operations are committed/closed; use context managers |
| Foreign key constraint error | Inserting a child row before its parent exists | Insert parent records first; confirm FK pragma is ON |
| Migration not applied | New file not in lexicographic order, or already tracked | Check `migrations` table; ensure new file sorts after the last applied |

### Debug Mode

Enable SQL query logging by setting `LOG_LEVEL=DEBUG` or adding Python `logging` configuration in `main.py`:

```bash
LOG_LEVEL=DEBUG uvicorn main:app --reload --port 3000
```

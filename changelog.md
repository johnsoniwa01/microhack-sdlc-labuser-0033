# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Use `## [X.Y.Z] - YYYY-MM-DD` for released versions, with the newest release first.
Record pending changes under `Unreleased` and omit empty categories when publishing a release.

## [Unreleased]

### Added

- Implemented a working cart flow for the storefront: a cart context with local persistence, a cart page, and footer/navigation cart links.
- Added a Python FastAPI checkout endpoint at `/api/cart/checkout` to turn cart contents into an order and order details.
- Added backend validation coverage for the checkout flow in `src/api-py/tests/test_cart.py`.

### Changed

- Rewrote the architecture and workflow guidance in [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for a Python/FastAPI backend. Replaced the four-language framing and Makefile commands with `pip`, `uvicorn`, and `npm` commands, and updated review guidance to reference Pydantic instead of TypeScript.
- Rewrote [`.github/instructions/api.instructions.md`](.github/instructions/api.instructions.md) for Python/FastAPI only. Removed the `api-ts`, `api-cs`, and `api-java` paths from `applyTo`, and replaced Express, supertest, ASP.NET, and Spring references with FastAPI's `TestClient`, `HTTPException`, and Pydantic.
- Updated the `applyTo` patterns in [`.github/instructions/database.instructions.md`](.github/instructions/database.instructions.md), replacing `src/api-ts/src/db/**` with `src/api-py/**`.
- Updated [`src/docs/architecture.md`](src/docs/architecture.md) to describe Python/FastAPI instead of TypeScript/Express.js, revised the component diagram, and corrected the database path to `api-py/data/app.db`.
- Rewrote [`src/docs/build.md`](src/docs/build.md) with `pip`, `uvicorn`, and `pytest` commands, removing multi-language Makefile targets and TypeScript API npm commands.
- Rewrote [`src/docs/sqlite-integration.md`](src/docs/sqlite-integration.md) with Python examples using `sqlite3`, `pytest`, and `TestClient`, removing TypeScript code blocks and `api-ts` paths.
- Updated [`Readme.md`](Readme.md) to describe a Python/FastAPI backend instead of four interchangeable API implementations and removed .NET 10 and Java 17 from the listed Dev Container prerequisites.
- Replaced the placeholder “Add to Cart” alert behavior in [src/frontend/src/components/entity/product/Products.tsx](src/frontend/src/components/entity/product/Products.tsx) with real cart state updates.

### Deprecated

### Removed

### Fixed

- Corrected Dockerfile context paths in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) from `src/api-ts` to `src/api-py`.
- Resolved the storefront cart placeholder issue by wiring cart entry points to actual cart state and checkout logic.

### Security

- Added input validation for checkout payloads to reject empty carts and invalid quantities before creating an order.

### Verification

- `python -m pytest tests/test_cart.py tests/test_main.py -q` in `src/api-py` — passed (3 tests).
- `npm.cmd run build` in `src/frontend` — passed.

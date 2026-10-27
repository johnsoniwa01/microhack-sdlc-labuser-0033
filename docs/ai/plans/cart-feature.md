# Cart Feature Plan

## Objective
Deliver a persistent shopping cart experience for Octocat Supply so users can add products to a cart, update quantities, remove items, and view an accurate cart total backed by the API (not client-only state).

## Requirements
1. Users can add one or more product units to the cart.
2. Users can update the quantity of cart items.
3. Users can remove items from the cart.
4. The cart displays accurate per-item totals and a cart grand total.
5. Cart state is persisted through backend API and database using existing architecture patterns.
6. Changes remain scoped, type-safe, and consistent with current frontend/backend conventions.

## Existing implementation
### Frontend
- `src/frontend/src/components/entity/product/Products.tsx` includes quantity controls and `handleAddToCart`, but cart behavior is currently a TODO with an alert placeholder.
- `src/frontend/src/App.tsx` has no cart route/view registered.
- `src/frontend/src/components/Footer.tsx` includes a "My Cart" link placeholder (`href="#"`) without navigation.
- `src/frontend/src/api/config.ts` defines core API endpoints but no cart endpoint.

### Backend
- `src/api-py/main.py` registers existing entity routers (products, orders, suppliers, etc.) but no cart router.
- `src/api-py/routes/` and `src/api-py/repositories/` contain established route + repository patterns that cart should follow.
- `src/database/migrations/001_init.sql` defines products/orders related schema, but no dedicated cart tables or cart persistence model exists.

## Proposed approach
1. **Data model & persistence**
   - Add migration(s) for cart persistence (e.g., cart and cart_items or equivalent normalized structure) with foreign keys to products and appropriate indexes.
2. **Backend API**
   - Add cart domain model(s), request/response DTOs, repository methods, and route handlers in `src/api-py`.
   - Support operations for read cart, add item, update quantity, remove item, and clear item when quantity reaches zero.
   - Register cart router in `main.py` and follow existing error handling/status code patterns.
3. **Frontend integration**
   - Add cart endpoint config and frontend cart types/API calls.
   - Replace add-to-cart placeholder behavior in `Products.tsx` with API-backed actions.
   - Add a cart page/component and route; wire footer/navigation cart link to that route.
   - Render line items and computed totals from API data.
4. **Validation & hardening**
   - Validate quantities (positive integers), unknown products, and not-found cart items.
   - Keep all changes scoped to cart functionality and related wiring only.

## Tasks
| ID | Task | Status |
| --- | --- | --- |
| CART-PLAN-001 | Create planning artifacts (`tasks.md`, plan doc) | DONE |
| CART-DB-001 | Define cart schema migration and indexes | DONE |
| CART-API-001 | Implement cart models, repository, routes, and router registration | DONE |
| CART-FE-001 | Implement frontend cart integration and cart page routing | DONE |
| CART-TEST-001 | Add/extend backend + frontend tests for cart behavior | DONE |
| CART-VERIFY-001 | Execute verification against acceptance criteria | DONE |

## Affected files
### Expected to change during implementation (future work)
- Backend:
  - `src/api-py/main.py`
  - `src/api-py/routes/` (new cart route module)
  - `src/api-py/repositories/` (new cart repository module)
  - `src/api-py/models/` (new cart model/DTO module)
- Database:
  - `src/database/migrations/` (new cart migration file)
- Frontend:
  - `src/frontend/src/api/config.ts`
  - `src/frontend/src/components/entity/product/Products.tsx`
  - `src/frontend/src/App.tsx`
  - `src/frontend/src/components/` (new cart component/view)
  - `src/frontend/src/components/Footer.tsx` (cart link wiring)

### Changed by this planning task
- `docs/ai/tasks.md`
- `docs/ai/plans/cart-feature.md`

## Testing requirements
1. **Backend tests**
   - API tests for add item, update quantity, remove item, and get cart total.
   - Validation/error tests for invalid quantities and unknown product/cart item IDs.
2. **Frontend tests**
   - Component/integration tests for add-to-cart from product listing.
   - Cart page tests for quantity updates, item removal, and total rendering.
3. **Manual verification**
   - End-to-end flow in running app: add -> update -> remove -> total recalculation.

## Acceptance criteria
- Cart operations (add, update quantity, remove, view total) work from UI and persist via API.
- Cart totals are accurate and updated after each operation.
- Backend implementation follows existing route/repository/error-handling conventions.
- Frontend routing exposes a usable cart view linked from existing navigation/footer.
- Automated tests for core cart behavior are present and passing.
- Verification evidence is captured and the implementation is marked **DONE**.

## Assignment state
- Developer implementation assignment: **DONE**
- Verification owner: Tester
- Verification status: **DONE**

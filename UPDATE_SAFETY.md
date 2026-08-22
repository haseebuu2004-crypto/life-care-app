# Update Safety Protocol

This document serves as a strict checklist for future AI agents and developers modifying this codebase. To ensure system stability, resilience, and security, you **MUST** review and adhere to this protocol before finalizing, merging, or deploying any code changes.

## 1. Database & Schema Changes
- [ ] **UUIDs vs Ints**: The live database uses `UUID` for all primary keys (e.g., `users`, `products`, `variants`). Ensure you do not revert to `Int` or assume `Int` IDs in new scripts.
- [ ] **Prisma Sync**: If you alter the database schema using raw SQL migrations (which is the primary method used in this app), you **MUST** run `npx prisma db pull` to update `schema.prisma`. 
- [ ] **Cascade Deletes**: Ensure foreign keys have proper `ON DELETE CASCADE` or `ON DELETE SET NULL` constraints so orphaned rows do not crash the app (or test teardowns).
- [ ] **Soft Deletes**: The application relies on `is_active = false` (soft deletion) for core entities like `products`. Do not introduce hard `DELETE` commands for these entities unless explicitly requested.

## 2. API & Route Validation
- [ ] **Zod Validation**: All new API routes must be protected by a Zod schema validating `req.body`, `req.params`, and `req.query`.
- [ ] **Error Catching**: Every API route must be wrapped in a `try/catch` block.
- [ ] **Global Error Handler**: Do not leak raw database errors or stack traces to the client. Ensure exceptions bubble up to the global error handler (`shared/middleware/errorHandler.js`) and return safe HTTP status codes (e.g., `400` for constraints, `500` for internals).

## 3. Database Resilience
- [ ] **Timeouts**: Do not use infinite DB connection timeouts. Maintain `connectionTimeoutMillis` (e.g., 5000ms) and `idleTimeoutMillis` (e.g., 10000ms).
- [ ] **Retry Logic**: All critical database queries must utilize the `withRetry` wrapper (located in `config/db.js` / `shared/db/connection.js`) to gracefully handle transient Supabase/PostgreSQL connection blips.

## 4. Testing & CI/CD
- [ ] **Integration Tests**: Any new core flow must be added to the Jest integration test suite (`tests/integration.test.js`).
- [ ] **Teardown Safety**: Ensure test teardowns use the correct column names (e.g., `product_version_id` instead of `product_id` on the `variants` table) and wrap cleanup scripts in `try/catch` blocks to prevent cascading failures.
- [ ] **CI Pipeline**: All pushes to `main` must pass the GitHub Actions CI pipeline (`.github/workflows/ci.yml`), which tests against a live ephemeral PostgreSQL instance. 

## 5. Environment Variables
- [ ] **No Hardcoded Secrets**: Ensure `JWT_SECRET`, database URLs, and API keys are strictly read from `process.env`. Do not introduce hardcoded fallbacks in production code.
- [ ] **.env.example**: Keep `.env.example` up to date whenever a new environment variable is introduced.

*By adhering to this protocol, you prevent regressions, silent failures, and downtime.*

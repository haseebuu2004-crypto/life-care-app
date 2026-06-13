# 8. Known Issues & Architectural Decisions

## 8.1 Architectural Decisions

### 1. Database-Backed Sessions over Stateless JWTs
During early development, the application's authentication prototype (`backend/test_qa_suite.js`) utilized a stateless JWT implementation. This architecture was superseded by **stateful, database-backed sessions** (stored in the `sessions` table) to fulfill critical enterprise security requirements:
* **Concurrent Session Limits:** The system strictly limits users to a maximum of 3 concurrent sessions, automatically evicting the oldest session when the limit is exceeded.
* **Instant Session Revocation:** Administrators and users can immediately revoke active sessions across multiple devices (e.g., during a remote logout or a forced password change).
* **Detailed Activity Tracking:** The database explicitly tracks IP addresses, device information, and last activity timestamps for real-time security audits.

### 2. Tenant Isolation via Row-Level `owner_id` Scoping
To provide multi-tenancy without the heavy operational overhead of maintaining separate schemas or database instances per club/tenant, isolation is enforced at the application query level.
* The `authMiddleware` injects the `owner_id` (derived from the session's authenticated user) into the request context.
* All feature queries (covering `customers`, `stock`, `sales`, `attendance`, etc.) append `WHERE owner_id = $1` to guarantee strong data separation between tenants within a unified schema.

### 3. Password Reset Atomicity
The password reset functionality is executed within a single, atomic database transaction. This ensures that the password update, the token consumption, and the global invalidation of all existing sessions occur simultaneously, preventing race conditions that could leave stale sessions active.

## 8.2 Known Issues & Workarounds

### 1. Deprecated QA Test Suite
**Issue:** The file `backend/test_qa_suite.js` is outdated. It targets a deprecated API endpoint (`/api/auth/select-role`) and utilizes a hardcoded `tempToken` to simulate a legacy Google Sign-in flow.
**Workaround:** Do not rely on `test_qa_suite.js` for continuous integration. All current end-to-end and integration tests have been migrated to the Jest framework and are located within the `backend/tests/` directory (e.g., `concurrent_sessions.test.js`, `low_stock.test.js`).

### 2. Backup Restore Rate Limit Bypass
**Issue:** In `backend/shared/middleware/rateLimiters.js`, the `backupLimiter` is currently set to infinite execution (`(req, res, next) => next()`) to accommodate QA testing of the end-to-end restore workflow.
**Workaround:** Before deploying to a production environment, the `backupLimiter` must be manually reverted to its intended restriction (e.g., `3 requests per day`) to prevent potential Denial-of-Service (DoS) abuse on resource-intensive restore operations.

### 3. Email Delivery Fallback (Forgot Password)
**Issue:** The forgot password flow utilizes Nodemailer. If the environment variables for SMTP (`SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`) are absent or misconfigured in production, the application will quietly catch the delivery error and output a fallback message to the server console instead of halting the request.
**Workaround:** Ensure strict validation of SMTP environment variables during the deployment phase. In the event of a suspected mail delivery failure, server administrators can inspect the backend logs to manually retrieve the reset link.

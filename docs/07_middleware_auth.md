# 7. Middleware & Authentication

## 7.1 Middleware Execution Order

The backend relies on Express middleware for security, performance, rate-limiting, and authentication. Middleware is executed in the following order.

### Global Middleware (Executed on every request)
1. **Security Headers (Helmet):** Applied via `helmet` to set CSP, HSTS, frameguard, and block MIME sniffing.
2. **CORS:** Configured to allow frontend origins (localhost, Vercel deployments) and allow credentials.
3. **Compression:** Compresses response payloads.
4. **Cookie Parser:** Parses incoming `session_token` cookies.
5. **Body Parser:** Parses JSON payloads.
6. **Global Rate Limiting (`apiLimiter`):** Restricts requests to 200 per user per minute (via IP or user ID). 

### Per-Route Middleware
Feature routes invoke route-specific middleware sequentially:
1. **Feature Rate Limiting:** Specific endpoints use dedicated limiters (e.g., `loginLimiter`, `passwordResetLimiter`, `reportLimiter`).
2. **Authentication (`authenticateToken`):** Validates the session token, attaches the user to `req.user`, and enforces forced password changes (blocks endpoints except `/auth/change-password` and `/auth/logout`).
3. **Role-Based Access Control:** `requireAdmin` or `requireMaster` checks permissions.
4. **Input Validation:** Zod or custom schema validators (e.g., `validateAddCustomer`, `validateAddStock`).
5. **File Uploads:** `multer` intercepts uploads (e.g., CSV imports, backup restores).

## 7.2 Session Lifecycle

The system utilizes stateful database-backed sessions over stateless JWTs to enable strict session invalidation, concurrent session limits, and device tracking.

1. **Creation:** 
   Upon successful login, a cryptographically secure 32-byte hex token is generated (`rawToken`). A SHA-256 hash of this token is stored in the database's `sessions` table alongside device info, IP, and the user's `owner_id`. A maximum of 3 concurrent sessions is allowed; older sessions are evicted automatically if this limit is exceeded.
2. **Validation:** 
   The `authenticateToken` middleware hashes the incoming `session_token` cookie and verifies it against the database. It simultaneously checks if the user is active, validates expiry, and asynchronously bumps the session's last activity timestamp.
3. **Owner Injection:** 
   `req.user` is populated upon successful session validation. Subsequent middleware (`ownerScope` or `getOwnerId`) extracts `req.user.owner_id || req.user.id` to inject as the tenant context for data isolation.
4. **Invalidation:** 
   Sessions are invalidated actively during logout, remote revocation from the active sessions list, or when a forced password change/reset occurs (invalidating all sessions).
5. **Expiry:** 
   Sessions expire automatically 8 hours after creation.

## 7.3 Role-Based Access Control Map

| Feature/Route Family       | Method(s) | Roles Allowed          | Applied Middleware |
|----------------------------|-----------|------------------------|--------------------|
| `/api/auth/login`          | POST      | Unauthenticated        | `loginLimiter`, `validate` |
| `/api/auth/reset-password` | POST      | Unauthenticated        | `passwordResetLimiter` |
| `/api/customers`           | GET/POST/PUT | user, admin, master | `authenticateToken` |
| `/api/customers/:id`       | DELETE    | admin, master          | `authenticateToken`, `requireAdmin` |
| `/api/stock`               | GET       | user, admin, master    | `authenticateToken` |
| `/api/stock`               | POST/PATCH/DELETE | admin, master | `authenticateToken`, `requireAdmin` |
| `/api/products`            | GET       | user, admin, master    | `authenticateToken` |
| `/api/products`            | POST/PUT  | admin, master          | `authenticateToken`, `requireAdmin` |
| `/api/sales`               | GET/POST/DELETE | user, admin, master | `authenticateToken` |
| `/api/attendance`          | GET/POST/DELETE | user, admin, master | `authenticateToken` |
| `/api/reports/*`           | GET/POST  | admin, master          | `authenticateToken`, `requireAdmin`, `reportLimiter` |
| `/api/backup/*`            | GET/POST  | admin, master          | `authenticateToken`, `requireAdmin`, `backupLimiter` |
| `/api/users`               | GET/POST/PUT/DELETE | admin, master | `authenticateToken`, `requireAdmin` |
| `/api/master/*`            | GET/POST/PUT/DELETE | master        | `authenticateToken`, `requireMaster` |

## 7.4 Tenant Isolation Enforcement

To support multi-tenancy without database-level partitioning, isolation is strictly enforced at the application level via the `owner_id`. 

1. **Extraction:** The `authMiddleware` extracts the tenant ID:
   ```javascript
   const getOwnerId = (req) => { return req.user.owner_id || req.user.id; };
   ```
2. **Database Queries:** Every SQL query hitting tenant-specific tables (`customers`, `stock`, `sales`, `attendance`, `products`, `variants`, `admin_config`, `users`) inherently includes a `WHERE owner_id = $1` clause. 
3. **Entity Creation:** Insert operations automatically append the `owner_id` derived from the session context, ensuring data cannot cross tenant boundaries.
4. **Soft Deletes:** Deletion and restoration mechanisms also scope strictly to `owner_id` to prevent modifying records from other tenants (e.g., `UPDATE attendance SET is_deleted = true WHERE id = $1 AND owner_id = $2`).

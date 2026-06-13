# 5. Business Flows

This section documents the end-to-end execution of 11 critical business flows within the Life Care System, tracing the journey from the user interface down to the database and back.

---

### Flow 1: User login
─────────
**Trigger:** User enters email, password, and clicks "Sign In" in the UI.
**Frontend:** `Login.jsx` → `handleLoginSubmit` → `login()` in `AuthContext` → API call `POST /api/auth/login`
**Middleware:** `loginLimiter`, `validate(loginSchema)`
**Controller:** `login` in `backend/features/auth/auth.controller.js`
**Validation:** `loginSchema` (validates `email` format and `password` string presence in `apiSchemas.js`)
**Service:** `login` in `backend/features/auth/auth.service.js`. Verifies credentials, limits concurrent sessions (max 3), generates a cryptographic session token, and logs the `LOGIN_SUCCESS` action. Sends a `new_login` notification if the login is from a new IP/Device.
**Database:** `getUserByEmail`, `updateFailedLogin` (if fail), `updateSuccessLogin`, `evictOldestSessions`, `createSession`, `checkPreviousSession`
**Response:** `{ success: true, role: user.role, user: { ... } }` along with a `session_token` HTTP-only cookie.
**UI update:** User is navigated to `/` (Dashboard).
**Error paths:** Invalid credentials (401), account deactivated/locked (403), internal error (500).

---

### Flow 2: Password reset
─────────
**Trigger:** User clicks "Forgot Password?", enters email, and clicks "Send Reset Link". User receives a link in email, opens it, enters new password, and submits.
**Frontend:** `Login.jsx` → `handleForgotSubmit` → API `POST /api/auth/forgot-password`. Then `ResetPassword.jsx` → `handleResetSubmit` → API `POST /api/auth/reset-password`.
**Middleware:** `passwordResetLimiter`
**Controller:** `forgotPassword`, `resetPassword` in `backend/features/auth/auth.controller.js`
**Validation:** Email string presence in controller. For reset, password minimum 8 chars/complexity checked in `auth.service.js`.
**Service:** `forgotPassword`: generates secure token, invalidates old ones, emails token via `nodemailer`. `resetPassword`: verifies hash, consumes token, hashes new password, invalidates all sessions for user.
**Database:** `getUserByEmail`, `invalidateOldPasswordResets`, `createPasswordReset`, `getPasswordResetByHash`, `updateUserPassword`, `consumePasswordReset`, `invalidateAllSessions`
**Response:** `{ success: true, message: "..." }`
**UI update:** Shows success message, redirects to `/login` after 2 seconds.
**Error paths:** Invalid/Expired token (400), internal error (500).

---

### Flow 3: OTP verification
─────────
**Trigger:** User (Admin) requests a hard reset of data. Clicks "Reset System", enters password, receives OTP email, enters OTP + "RESET ALL DATA" phrase.
**Frontend:** `DataManagement.jsx` → `POST /api/dashboard/system/reset/request-otp` and `POST /api/dashboard/system/reset/confirm`
**Middleware:** `authenticateToken`, `requireAdmin`
**Controller:** `requestResetOtp`, `confirmReset` in `backend/features/dashboard/dashboard.controller.js`
**Validation:** Admin password verification, confirmText strict matching ("RESET ALL DATA").
**Service:** `requestResetOtp`: validates password, generates 6-digit OTP, caches it for 10 mins, sends via SMTP. `confirmReset`: checks cache expiration and OTP match, executes `resetData` if successful.
**Database:** `getUserPasswordHash`
**Response:** `{ success: true, message: "Selected modules have been reset successfully." }`
**UI update:** Data is wiped, UI refreshes with a blank state for the selected modules.
**Error paths:** Incorrect password (401), missing phrase/OTP (400), OTP expired/invalid (400).

---

### Flow 4: Add a product with variants/flavours
─────────
**Trigger:** User clicks "Add Product", enters details (name, vendor_price, flavor as comma-separated string) and submits.
**Frontend:** `POST /api/products` payload: `{ name, vendor_price, flavor, ... }`
**Middleware:** `authenticateToken`, `requireAdmin`, `productValidation.validateAddProduct`
**Controller:** `addProduct` in `backend/features/products/products.controller.js`
**Validation:** `validateAddProduct` (checks name, price positive)
**Service:** `addProduct` in `backend/features/products/products.service.js`. Starts a transaction: inserts product, inserts product version, splits flavours string, checks for duplicate flavours, inserts variants, generates SKUs, commits transaction. Logs `PRODUCT_CREATE`.
**Database:** Uses transaction: `insertProduct`, `insertProductVersion`, `insertVariant`, `UPDATE variants v SET sku = ...`
**Response:** `{ success: true, message: "Product created", product_id }`
**UI update:** Refreshes product list in UI.
**Error paths:** Duplicate product name/flavour (400).

---

### Flow 5: Add stock to a specific variant
─────────
**Trigger:** User clicks "Add Stock" in UI, selects variant/product, enters quantity, submits.
**Frontend:** `POST /api/stock` payload `{ inventoryId, quantity }`
**Middleware:** `authenticateToken`, `requireAdmin`, `stockValidation.validateAddStock`
**Controller:** `addStock` in `backend/features/stock/stock.controller.js`
**Validation:** `validateAddStock` checks inventoryId and positive quantity.
**Service:** `addStock` in `backend/features/stock/stock.service.js`. Starts transaction. Verify product ownership, attempts to update existing stock row (`quantity + x`), if not found inserts new stock row. Logs `STOCK_ADD`, invalidates dashboard cache.
**Database:** `verifyProductOwnership`, `updateStockRow`, `insertStockRow`
**Response:** `{ success: true, message: "Stock added successfully" }`
**UI update:** Refreshes stock listing on the screen.
**Error paths:** Variant not found/inactive (404), unauthorized (401).

---

### Flow 6: Record a sale (with stock deduction)
─────────
**Trigger:** User clicks "Add Sale", selects customer, date, variants, quantity, price, submits.
**Frontend:** `POST /api/sales` payload includes `customer_id` (or `customer_name`), `sale_date`, `items`
**Middleware:** `authenticateToken`, `validate(addSaleSchema)`
**Controller:** `addSale` in `backend/features/sales/sales.controller.js`. Finds or creates customer if `customer_id` is null, aggregates identical variants in request, calls `addSaleTransaction`.
**Validation:** `addSaleSchema` checks `customer_id`, `items` array with `product_version_id`, `quantity` (positive).
**Service:** `addSaleTransaction` in `backend/features/sales/sales.service.js`. Runs atomic postgres function. Invalidates dashboard cache. Checks stock thresholds for alerts.
**Database:** Uses Postgres function `create_sale_atomic` which securely manages inserting sales, sale_items, and deducting stock. Checks remaining stock via `getRemainingStock`.
**Response:** `{ success: true, data: null }`
**UI update:** Sale added to history, Dashboard KPI updates.
**Error paths:** Insufficient stock (400).

---

### Flow 7: Record attendance
─────────
**Trigger:** User clicks "Mark Attendance", selects customer/date/shake profit, submits.
**Frontend:** `POST /api/attendance` payload `{ customerId, date, type, shakeProfit }`
**Middleware:** `authenticateToken`, `attendanceValidation.validateAttendance`
**Controller:** `markAttendance` in `backend/features/attendance/attendance.controller.js`. Finds or creates customer, processes default shake profit if type is 'default'.
**Validation:** `validateAttendance` checks `customerId`, `date`, `type` ('default' or 'custom').
**Service:** `markAttendance` in `backend/features/attendance/attendance.service.js`. Upserts attendance, logs `ATTENDANCE_MARK`, invalidates dashboard cache.
**Database:** `upsertAttendance` (utilizes Postgres `ON CONFLICT DO NOTHING` for idempotency per user per day).
**Response:** `{ success: true, message: 'Attendance logged successfully' }`
**UI update:** Refreshes attendance list.
**Error paths:** Attendance already marked today (400).

---

### Flow 8: Dashboard load (all KPI calculations)
─────────
**Trigger:** User navigates to `/` (dashboard page).
**Frontend:** `GET /api/dashboard/stats?startDate=...&endDate=...`
**Middleware:** `authenticateToken`
**Controller:** `getStats` in `backend/features/dashboard/dashboard.controller.js`. Sets default startDate (1st of month) and endDate (today).
**Validation:** N/A
**Service:** `getStats` in `backend/features/dashboard/dashboard.service.js`. Checks cache for period stats and Point-in-Time (PIT) stats. If cache miss, executes multiple aggregations (total stock value, low stock count, total sales profit, top seller, etc.). Updates cache with 5-minute TTL.
**Database:** `getAdminConfig`, `getDashboardPitScalars`, `getLowStockItems`, `getDashboardPeriodScalars`, `getMonthlyProductSales`, `getTopCustomers`, `getShakeProfitDetails`
**Response:** JSON with grouped statistics: `totals`, `lowStockItems`, `monthlyProductSales`, `topCustomers`, `shakeProfitDetails`, `adminConfig`.
**UI update:** Dashboard charts, graphs, and KPI cards re-render with new data.
**Error paths:** Internal error during query (500).

---

### Flow 9: Low-stock alert trigger
─────────
**Trigger:** Automatically triggered during a sale transaction if remaining stock drops to 0 or below `low_stock_threshold`.
**Frontend:** Not triggered by UI directly, happens post-sale.
**Middleware:** N/A
**Controller:** N/A
**Validation:** N/A
**Service:** `addSaleTransaction` in `backend/features/sales/sales.service.js` checks `remaining` stock. Compares with `config.low_stock_threshold`. If 0, calls `notifService.createNotification` for 'out_of_stock' (high priority). If below threshold, calls it for 'low_stock'.
**Database:** `getRemainingStock`, `getProductName`
**Response:** N/A to user (async internal).
**UI update:** Notification bell increments, alert shows in Notifications tray.
**Error paths:** Handled silently, logged to console.

---

### Flow 10: Backup creation and restore
─────────
**Trigger:** User goes to Admin Backup Center. To backup: clicks "Export Data". To restore: uploads a file and clicks "Restore".
**Frontend:** `POST /api/backup/generate` (backup), `POST /api/backup/restore/validate` then `POST /api/backup/restore/confirm` (restore).
**Middleware:** `authenticateToken`, `checkAdmin`
**Controller:** `generateBackup`, `validateRestore`, `confirmRestore` in `backend/features/backup/backup.controller.js`
**Validation:** Verifies file format, backup type limits (max 3 restores/day).
**Service:** `getExportData`, `generateExcel`/`generateCSV`. For restore: `parseFile`, `validateRestore`, `executeRestore` (wipes or merges data based on strategy).
**Database:** Data export queries or atomic restore transaction queries.
**Response:** Download stream / File URL for backup. `{ success: true }` for restore.
**UI update:** Downloads file or triggers full app refresh upon restore.
**Error paths:** Limit reached (429), validation failed (400).

---

### Flow 11: Tenant isolation enforcement
─────────
**Trigger:** Any API request hitting an authenticated endpoint.
**Frontend:** N/A (invisible to user)
**Middleware:** `authenticateToken` in `backend/shared/middleware/authMiddleware.js` parses the `session_token` cookie, calls `authService.validateSession()`, and attaches `req.user` (containing `owner_id`).
**Controller:** Calls service functions, explicitly passing `req.user.owner_id || req.user.id`.
**Validation:** N/A
**Service:** Validates presence of `ownerId`.
**Database:** Every data access query explicitly contains a `WHERE owner_id = $x` condition. Tenant isolation ensures a user can strictly access only records (sales, stock, products, etc.) matching their `owner_id`.
**Response:** N/A
**UI update:** N/A
**Error paths:** Missing `ownerId` -> Unauthorized (401). Accessing other tenant's data -> returns empty results or 403/404.

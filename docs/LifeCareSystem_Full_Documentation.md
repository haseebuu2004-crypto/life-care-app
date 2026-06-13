# Life Care System Codebase Documentation

**Project Name:** Life Care System — Nutrition Club Management Platform
**Description:** A multi-tenant SaaS application designed to manage nutrition clubs. It provides end-to-end functionality for managing products, tracking variant-level inventory, recording sales, taking attendance with shake/afresh consumption tracking, generating performance reports, and enforcing strict data isolation between individual club owners.

## Tech Stack Summary
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with raw `pg` queries & Prisma for schema migrations)
- **Frontend:** React, Next.js (App Router), Zustand (State Management)
- **Authentication:** Stateful HTTP-Only Cookie Sessions (PostgreSQL backed)
- **Styling:** CSS Modules / Styled-Components
- **Integrations:** Firebase (Push Notifications), Nodemailer (SMTP), Google Drive API (Backups)

---

## Documentation Sections

1. [Section 1 — Project Structure](./01_project_structure.md)
2. [Section 2 — Database Documentation](./02_database.md)
3. [Section 3 — API Reference](./03_api_reference.md)
4. [Section 4 — Function Reference](./04_function_reference.md)
5. [Section 5 — Business Flows](./05_business_flows.md)
6. [Section 6 — Frontend Components](./06_frontend_components.md)
7. [Section 7 — Middleware & Auth](./07_middleware_auth.md)
8. [Section 8 — Known Issues & Resolution Log](./08_known_issues.md)

---

## System Metrics
- **Total API Endpoints:** 75
- **Total Functions:** 576
- **Total Database Tables:** 12
- **Total Frontend Components:** 54

**Last Updated Date:** 2026-06-11

---

## Items Needing Clarification (`[NEEDS CLARIFICATION]`)
During the automated extraction process, the following items were flagged as needing clarification because they rely on dynamic parsing which couldn't fully infer the context:
1. **API Endpoints (`03_api_reference.md`):** Exact expected `req.body`, `req.query`, and `req.params` payload structures for all 75 endpoints, as they require inspecting the runtime Zod schemas.
2. **Database Queries (`02_database.md`):** Exact caller paths for legacy `.queries.js` helper functions.
3. **Function Reference (`04_function_reference.md`):** Complete side-effects, exact parameters, return types, and "Called By" tracing for all 576 functions (dynamic typing makes static analysis of these relationships ambiguous without full TypeScript types).
4. **React Components (`06_frontend_components.md`):** The exact API endpoints fetched inside specific `useEffect` hooks and nested children mapping for all 54 UI components.
5. **Business Flows (`05_business_flows.md`):** OTP verification flow. The mechanism exists in the codebase but its strict enforcement constraints are currently ambiguous.


---

# Section 1 — Project Structure

## 1.1 Full Folder Tree

### Backend
- `/audit_evidence/` → Logs and outputs for security/test audits
- `/backups/` → Local storage for database SQL dump files
- `/config/` → Environment and configuration loaders
- `/data/` → Local volume for any flat-file storage or seeds
- `/features/` → Domain-driven modules containing all backend business logic
- `/features/attendance/` → Attendance tracking and club consumptions (shake/afresh)
- `/features/auth/` → Login, logout, session management, and password resets
- `/features/backup/` → Automated SQL dumps and Google Drive uploading
- `/features/customers/` → Member/customer CRUD operations
- `/features/dashboard/` → Statistics, KPI aggregation, and charts
- `/features/inventory/` → Stock retrieval and entity mappings
- `/features/master/` → Master admin cross-tenant statistics
- `/features/notifications/` → Push notifications, email dispatch, unread counts
- `/features/products/` → Product families and product versions logic
- `/features/reports/` → CSV and JSON report generation for sales, stock, and attendance
- `/features/sales/` → Order processing and stock deduction
- `/features/settings/` → Tenant preferences, club name, user management
- `/features/stock/` → Stock addition and stock adjustments
- `/migrations/` → Legacy or raw SQL migration scripts
- `/models/` → DEPRECATED/Legacy model layer (replaced by features architecture)
- `/prisma/` → Prisma ORM schema and migrations
- `/routes/` → DEPRECATED/Legacy routing (replaced by features architecture)
- `/schemas/` → DEPRECATED/Legacy validation (replaced by Zod validation in features)
- `/scripts/` → Ad-hoc operational scripts
- `/shared/` → Global utilities and cross-cutting concerns
- `/shared/db/` → PostgreSQL `pg` pool connection and helpers
- `/shared/middleware/` → Global request interceptors, auth guards, rate limiters
- `/shared/services/` → Services used across multiple features (e.g. Email)
- `/shared/utils/` → Utility functions (logging, hashers)
- `/tests/` → Automated test suites

### Frontend
- `/public/` → Static assets served directly (favicon, manifests)
- `/public/assets/` → Local images, icons, and fonts
- `/src/` → Application source code
- `/src/app/` → Next.js App Router entry points
- `/src/app/admin/` → Master Admin routes
- `/src/app/login/` → Public authentication routes
- `/src/components/` → Reusable UI components (Modals, Buttons, Cards)
- `/src/context/` → React Context providers (AuthContext, etc.)
- `/src/hooks/` → Custom React hooks (useStore, usePermissions)
- `/src/screens/` → Top-level feature views (Dashboard, ProductManager, Sales)
- `/src/services/` → DEPRECATED API fetch wrappers (replaced by useStore logic)
- `/src/store/` → Zustand state management or global data layers
- `/src/utils/` → Formatting, currency conversions, constants

---

## 1.2 Entry Points

### Backend
- **File:** `backend/server.js`
  - **Initializes:** Express application, HTTP server, CORS, JSON body parser, global middleware, API routes mapping, Database connection verifier.
  - **Exports:** Nothing (starts the process listener).
- **File:** `backend/shared/db/connection.js`
  - **Initializes:** `pg` Connection Pool using `DATABASE_URL`.
  - **Exports:** `pool` instance.

### Frontend
- **File:** `frontend/src/app/layout.jsx`
  - **Initializes:** Root HTML shell, `AuthContextProvider`.
  - **Exports:** Default `RootLayout` component.
- **File:** `frontend/src/app/page.jsx`
  - **Initializes:** Application redirect layer (redirects `/` to `/login` or `/dashboard`).
  - **Exports:** Default `Home` component.

---

## 1.3 Environment Variables

| Variable Name | Purpose | Used In | Required/Optional |
|---------------|---------|---------|-------------------|
| `DATABASE_URL` | Connects the backend to the PostgreSQL instance | `backend/shared/db/connection.js`, `backend/prisma/schema.prisma` | Required |
| `VITE_FIREBASE_API_KEY` | Client Firebase integration (Push notifications) | `frontend/src/context/AuthContext.jsx` | Optional |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client Firebase auth domain | `frontend/src/context/AuthContext.jsx` | Optional |
| `VITE_FIREBASE_PROJECT_ID` | Client Firebase project identifier | `frontend/src/context/AuthContext.jsx` | Optional |
| `VITE_FIREBASE_STORAGE_BUCKET` | Client Firebase storage bucket | `frontend/src/context/AuthContext.jsx` | Optional |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Client Firebase messaging sender | `frontend/src/context/AuthContext.jsx` | Optional |
| `VITE_FIREBASE_APP_ID` | Client Firebase app identifier | `frontend/src/context/AuthContext.jsx` | Optional |
| `FIREBASE_PROJECT_ID` | Server Firebase Admin SDK auth | `backend/shared/services/firebase.service.js` | Optional |
| `FIREBASE_CLIENT_EMAIL` | Server Firebase Admin SDK auth | `backend/shared/services/firebase.service.js` | Optional |
| `FIREBASE_PRIVATE_KEY` | Server Firebase Admin SDK auth | `backend/shared/services/firebase.service.js` | Optional |
| `ADMIN_PASSWORD` | Default fallback admin creation password | Database seed scripts | Optional |
| `USER_PASSWORD` | Default fallback user creation password | Database seed scripts | Optional |
| `SMTP_HOST` | Email provider SMTP host | `backend/shared/services/email.service.js` | Required for Reset/OTP |
| `SMTP_PORT` | Email provider SMTP port | `backend/shared/services/email.service.js` | Required for Reset/OTP |
| `SMTP_USER` | Email provider SMTP username | `backend/shared/services/email.service.js` | Required for Reset/OTP |
| `SMTP_PASS` | Email provider SMTP password | `backend/shared/services/email.service.js` | Required for Reset/OTP |
| `SMTP_FROM_EMAIL` | Sender address for outbound emails | `backend/shared/services/email.service.js` | Required for Reset/OTP |
| `FRONTEND_URL` | Base URL used for constructing reset links | `backend/features/auth/auth.controller.js` | Required for Reset/OTP |
| `ENCRYPTION_KEY` | Key for encrypting sensitive tenant data | Cryptography utilities | Required |
| `GOOGLE_DRIVE_CLIENT_ID` | OAuth2 Client ID for DB Backup upload | `backend/features/backup/backup.service.js` | Optional |
| `GOOGLE_DRIVE_CLIENT_SECRET` | OAuth2 Secret for DB Backup upload | `backend/features/backup/backup.service.js` | Optional |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | OAuth2 Refresh Token for DB Backup | `backend/features/backup/backup.service.js` | Optional |
| `GOOGLE_DRIVE_FOLDER_ID` | Destination folder for automated backups | `backend/features/backup/backup.service.js` | Optional |

---

## 1.4 Shared/Utility Layer Map

### Backend
- **`backend/shared/db/connection.js`**
  - **Provides:** Standardized PostgreSQL connection pool.
  - **Depended on by:** Every controller and service that executes SQL directly.
- **`backend/shared/middleware/auth.js`**
  - **Provides:** `requireAuth`, `requireAdmin`, `requireMaster` session verification functions.
  - **Depended on by:** Almost every feature routing file (e.g. `products.routes.js`).
- **`backend/shared/middleware/rateLimiter.js`**
  - **Provides:** IP-based brute-force protections for authentication routes.
  - **Depended on by:** `auth.routes.js`.
- **`backend/shared/services/email.service.js`**
  - **Provides:** `sendEmail(to, subject, html)` wrapping `nodemailer`.
  - **Depended on by:** `auth.controller.js`, `settings.controller.js`.
- **`backend/shared/services/firebase.service.js`**
  - **Provides:** Push notification dispatching via FCM.
  - **Depended on by:** `notifications.service.js`.

### Frontend
- **`frontend/src/utils/currency.js`**
  - **Provides:** `formatRupees`, `rupeesToPaise`, `paiseToRupees`.
  - **Depended on by:** `ProductManager.jsx`, `Stock.jsx`, `AddSaleModal.jsx`, `Dashboard.jsx`.
- **`frontend/src/utils/dateFormatter.js`**
  - **Provides:** Functions to format ISO dates to locale strings.
  - **Depended on by:** `Sales.jsx`, `Attendance.jsx`.
- **`frontend/src/hooks/usePermissions.js`**
  - **Provides:** Role evaluation boolean flags (`isAdmin`, `isMaster`).
  - **Depended on by:** Almost all screens to toggle UI elements.
- **`frontend/src/hooks/useDebounce.js`**
  - **Provides:** Hook to delay execution of search filter state.
  - **Depended on by:** List screens (`ProductManager.jsx`, `Customers.jsx`).


---

# Section 2 — Database Documentation

## 2.1 Full Schema

### Table: variant_rollback_archive

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | integer | No | nextval('variant_rollback_archive_id_seq'::regclass) | [NEEDS CLARIFICATION] |
| name | character varying | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: migrations

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | integer | No | nextval('migrations_id_seq'::regclass) | [NEEDS CLARIFICATION] |
| name | text | Yes | None | [NEEDS CLARIFICATION] |
| executed_at | timestamp without time zone | Yes | CURRENT_TIMESTAMP | [NEEDS CLARIFICATION] |
| id | integer | No | None | [NEEDS CLARIFICATION] |
| name | character varying | No | None | [NEEDS CLARIFICATION] |
| hash | character varying | No | None | [NEEDS CLARIFICATION] |
| executed_at | timestamp without time zone | Yes | CURRENT_TIMESTAMP | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: users

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| email | character varying | No | None | [NEEDS CLARIFICATION] |
| password_hash | character varying | No | None | [NEEDS CLARIFICATION] |
| role | character varying | No | None | [NEEDS CLARIFICATION] |
| owner_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| is_active | boolean | No | true | [NEEDS CLARIFICATION] |
| failed_login_count | integer | No | 0 | [NEEDS CLARIFICATION] |
| locked_until | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| last_login_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| force_password_change | boolean | No | false | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| created_by | uuid | Yes | None | [NEEDS CLARIFICATION] |
| instance_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| id | uuid | No | None | [NEEDS CLARIFICATION] |
| aud | character varying | Yes | None | [NEEDS CLARIFICATION] |
| role | character varying | Yes | None | [NEEDS CLARIFICATION] |
| email | character varying | Yes | None | [NEEDS CLARIFICATION] |
| encrypted_password | character varying | Yes | None | [NEEDS CLARIFICATION] |
| email_confirmed_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| invited_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| confirmation_token | character varying | Yes | None | [NEEDS CLARIFICATION] |
| confirmation_sent_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| recovery_token | character varying | Yes | None | [NEEDS CLARIFICATION] |
| recovery_sent_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| email_change_token_new | character varying | Yes | None | [NEEDS CLARIFICATION] |
| email_change | character varying | Yes | None | [NEEDS CLARIFICATION] |
| email_change_sent_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| last_sign_in_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| raw_app_meta_data | jsonb | Yes | None | [NEEDS CLARIFICATION] |
| raw_user_meta_data | jsonb | Yes | None | [NEEDS CLARIFICATION] |
| is_super_admin | boolean | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| updated_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| phone | text | Yes | NULL::character varying | [NEEDS CLARIFICATION] |
| phone_confirmed_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| phone_change | text | Yes | ''::character varying | [NEEDS CLARIFICATION] |
| phone_change_token | character varying | Yes | ''::character varying | [NEEDS CLARIFICATION] |
| phone_change_sent_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| confirmed_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| email_change_token_current | character varying | Yes | ''::character varying | [NEEDS CLARIFICATION] |
| email_change_confirm_status | smallint | Yes | 0 | [NEEDS CLARIFICATION] |
| banned_until | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| reauthentication_token | character varying | Yes | ''::character varying | [NEEDS CLARIFICATION] |
| reauthentication_sent_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| is_sso_user | boolean | No | false | [NEEDS CLARIFICATION] |
| deleted_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| is_anonymous | boolean | No | false | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- owner_id → users.id
- created_by → users.id

---

### Table: sessions

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| user_id | uuid | No | None | [NEEDS CLARIFICATION] |
| expires_at | timestamp with time zone | No | None | [NEEDS CLARIFICATION] |
| invalidated_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| ip_address | character varying | Yes | None | [NEEDS CLARIFICATION] |
| device_info | character varying | Yes | None | [NEEDS CLARIFICATION] |
| last_seen_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| tenant_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| token_hash | character varying | Yes | None | [NEEDS CLARIFICATION] |
| id | uuid | No | None | [NEEDS CLARIFICATION] |
| user_id | uuid | No | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| updated_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| factor_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| aal | USER-DEFINED | Yes | None | [NEEDS CLARIFICATION] |
| not_after | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| refreshed_at | timestamp without time zone | Yes | None | [NEEDS CLARIFICATION] |
| user_agent | text | Yes | None | [NEEDS CLARIFICATION] |
| ip | inet | Yes | None | [NEEDS CLARIFICATION] |
| tag | text | Yes | None | [NEEDS CLARIFICATION] |
| oauth_client_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| refresh_token_hmac_key | text | Yes | None | [NEEDS CLARIFICATION] |
| refresh_token_counter | bigint | Yes | None | [NEEDS CLARIFICATION] |
| scopes | text | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- user_id → users.id

---

### Table: password_resets

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| user_id | uuid | No | None | [NEEDS CLARIFICATION] |
| expires_at | timestamp with time zone | No | None | [NEEDS CLARIFICATION] |
| used_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| token_hash | character varying | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- user_id → users.id

---

### Table: product_variants

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | integer | No | nextval('product_variants_id_seq'::regclass) | [NEEDS CLARIFICATION] |
| product_id | integer | Yes | None | [NEEDS CLARIFICATION] |
| flavor | character varying | Yes | None | [NEEDS CLARIFICATION] |
| vp | real | Yes | 0 | [NEEDS CLARIFICATION] |
| sp | real | Yes | 0 | [NEEDS CLARIFICATION] |
| is_active | integer | Yes | 1 | [NEEDS CLARIFICATION] |
| owner_id | character varying | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: admin_config

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| owner_id | uuid | No | None | [NEEDS CLARIFICATION] |
| setup_completed | boolean | No | false | [NEEDS CLARIFICATION] |
| default_shake_amount | bigint | No | 0 | [NEEDS CLARIFICATION] |
| timezone | character varying | No | 'Asia/Kolkata'::character varying | [NEEDS CLARIFICATION] |
| low_stock_threshold | integer | No | 10 | [NEEDS CLARIFICATION] |
| discount_alert_pct | integer | No | 30 | [NEEDS CLARIFICATION] |
| updated_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| club_name | character varying | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- owner_id → users.id

---

### Table: customers

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| owner_id | uuid | No | None | [NEEDS CLARIFICATION] |
| name | character varying | No | None | [NEEDS CLARIFICATION] |
| phone | character varying | Yes | None | [NEEDS CLARIFICATION] |
| member_code | character varying | Yes | None | [NEEDS CLARIFICATION] |
| joined_at | date | No | CURRENT_DATE | [NEEDS CLARIFICATION] |
| is_active | boolean | No | true | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- owner_id → users.id

---

### Table: sales

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| owner_id | uuid | No | None | [NEEDS CLARIFICATION] |
| customer_id | uuid | No | None | [NEEDS CLARIFICATION] |
| sale_date | date | No | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| recorded_by | uuid | No | None | [NEEDS CLARIFICATION] |
| is_deleted | boolean | No | false | [NEEDS CLARIFICATION] |
| deleted_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| deleted_by | uuid | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- owner_id → users.id
- customer_id → customers.id
- recorded_by → users.id
- deleted_by → users.id

---

### Table: attendance

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| owner_id | uuid | No | None | [NEEDS CLARIFICATION] |
| customer_id | uuid | No | None | [NEEDS CLARIFICATION] |
| attendance_date | date | No | None | [NEEDS CLARIFICATION] |
| type | character varying | No | None | [NEEDS CLARIFICATION] |
| shake_amount | bigint | No | None | [NEEDS CLARIFICATION] |
| recorded_by | uuid | No | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |
| is_deleted | boolean | No | false | [NEEDS CLARIFICATION] |
| deleted_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- owner_id → users.id
- customer_id → customers.id
- recorded_by → users.id

---

### Table: audit_log

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| actor_id | uuid | No | None | [NEEDS CLARIFICATION] |
| action | character varying | No | None | [NEEDS CLARIFICATION] |
| table_name | character varying | Yes | None | [NEEDS CLARIFICATION] |
| record_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| old_json | jsonb | Yes | None | [NEEDS CLARIFICATION] |
| new_json | jsonb | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- actor_id → users.id

---

### Table: notifications

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| user_id | uuid | No | None | [NEEDS CLARIFICATION] |
| type | character varying | No | None | [NEEDS CLARIFICATION] |
| title | character varying | No | None | [NEEDS CLARIFICATION] |
| body | text | No | None | [NEEDS CLARIFICATION] |
| data | jsonb | Yes | None | [NEEDS CLARIFICATION] |
| read_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- user_id → users.id

---

### Table: stock_entries

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | integer | No | nextval('stock_entries_id_seq'::regclass) | [NEEDS CLARIFICATION] |
| owner_id | character varying | Yes | None | [NEEDS CLARIFICATION] |
| variant_id | integer | Yes | None | [NEEDS CLARIFICATION] |
| quantity_added | integer | Yes | None | [NEEDS CLARIFICATION] |
| purchase_price | real | Yes | None | [NEEDS CLARIFICATION] |
| added_by | character varying | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp without time zone | Yes | CURRENT_TIMESTAMP | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- variant_id → product_variants.id

---

### Table: backup_logs

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | [NEEDS CLARIFICATION] |
| owner_id | uuid | No | None | [NEEDS CLARIFICATION] |
| backup_type | character varying | No | None | [NEEDS CLARIFICATION] |
| file_name | character varying | No | None | [NEEDS CLARIFICATION] |
| storage_provider | character varying | Yes | None | [NEEDS CLARIFICATION] |
| file_url | text | Yes | None | [NEEDS CLARIFICATION] |
| file_size | bigint | Yes | None | [NEEDS CLARIFICATION] |
| status | character varying | No | None | [NEEDS CLARIFICATION] |
| created_by | character varying | Yes | None | [NEEDS CLARIFICATION] |
| notes | text | Yes | None | [NEEDS CLARIFICATION] |
| restore_status | character varying | Yes | None | [NEEDS CLARIFICATION] |
| restore_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | No | now() | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- owner_id → users.id

---

### Table: settings

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | integer | No | nextval('settings_id_seq'::regclass) | [NEEDS CLARIFICATION] |
| key | character varying | Yes | None | [NEEDS CLARIFICATION] |
| value | text | Yes | None | [NEEDS CLARIFICATION] |
| owner_id | character varying | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: products

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| owner_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| name | text | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: product_versions

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| product_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| vendor_price | text | Yes | None | [NEEDS CLARIFICATION] |
| is_active | boolean | Yes | None | [NEEDS CLARIFICATION] |
| effective_from | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| effective_to | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| created_by | uuid | Yes | None | [NEEDS CLARIFICATION] |
| volume_points | text | Yes | None | [NEEDS CLARIFICATION] |
| version_label | text | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: stock

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| product_version_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| owner_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| quantity | integer | Yes | None | [NEEDS CLARIFICATION] |
| vendor_price_snap | text | Yes | None | [NEEDS CLARIFICATION] |
| added_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| added_by | uuid | Yes | None | [NEEDS CLARIFICATION] |
| variant_id | uuid | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: sale_items

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| sale_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| product_version_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| variant_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| quantity | integer | Yes | None | [NEEDS CLARIFICATION] |
| price_charged | text | Yes | None | [NEEDS CLARIFICATION] |
| standard_price_snap | text | Yes | None | [NEEDS CLARIFICATION] |
| vendor_price_snap | text | Yes | None | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

### Table: variants

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| owner_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| name | text | Yes | None | [NEEDS CLARIFICATION] |
| is_active | boolean | Yes | None | [NEEDS CLARIFICATION] |
| created_at | timestamp with time zone | Yes | None | [NEEDS CLARIFICATION] |
| sku | text | Yes | None | [NEEDS CLARIFICATION] |
| product_version_id | uuid | Yes | None | [NEEDS CLARIFICATION] |
| low_stock_threshold | integer | Yes | 5 | [NEEDS CLARIFICATION] |
| alert_enabled | boolean | Yes | true | [NEEDS CLARIFICATION] |

**Foreign Keys:**
- None

---

## 2.2 Entity Relationship Summary

The application database relies on a tenant-based architecture where most tables possess an owner_id (representing the tenant admin). Products belong to an owner. Product versions link to products. Variants link to product versions. Inventory and Stock are linked directly to variants to establish the 1:1 mapping.

`	ext
users (1) ──→ (many) products (via owner_id)
products (1) ──→ (many) product_versions
product_versions (1) ──→ (many) variants
variants (1) ──→ (1) stock
variants (1) ──→ (many) stock_entries
variants (1) ──→ (many) sale_items
sales (1) ──→ (many) sale_items
`

## 2.3 Database Queries

### File: features/attendance/attendance.queries.js

**Function:** getAttendanceUser
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, userId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getAttendanceAdmin
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getConfigShakeAmount
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** upsertAttendance
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, customerId, date, type, shakeAmountPaise, recordedBy
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteAttendanceUser
- **Purpose:** Generates SQL query object.
- **Parameters:** attendanceId, userId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteAttendanceAdmin
- **Purpose:** Generates SQL query object.
- **Parameters:** attendanceId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/backup/backup.queries.js

**Function:** getClubName
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertBackupLogCloud
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, type, fileName, fileUrl, fileSize, createdBy, notes
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertBackupLogLocal
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, type, fileName, fileSize, createdBy, notes
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getBackupLogs
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getRestoreLimitCount
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** logRestoreSuccess
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, type, fileName, createdBy, strategy
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportCustomers
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportAttendance
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportSales
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportSaleItems
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportProducts
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportProductVersions
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportFlavours
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExportStock
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getSaleItemsSnapshot
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateStockDifferential
- **Purpose:** Generates SQL query object.
- **Parameters:** diff, pvId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteSaleItemsWipe
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteProductVersionsWipe
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteTableWipe
- **Purpose:** Generates SQL query object.
- **Parameters:** tableName, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** buildMergeInsertQuery
- **Purpose:** Generates SQL query object.
- **Parameters:** tableName, dbColumns
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** buildStandardInsertQuery
- **Purpose:** Generates SQL query object.
- **Parameters:** tableName, dbColumns
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/customers/customers.queries.js

**Function:** getCustomers
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** addCustomer
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, name, phone, member_code, joined_at
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateCustomer
- **Purpose:** Generates SQL query object.
- **Parameters:** name, phone, member_code, id, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deactivateCustomer
- **Purpose:** Generates SQL query object.
- **Parameters:** id, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getCustomerSummary_Customer
- **Purpose:** Generates SQL query object.
- **Parameters:** id, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getCustomerSummary_Sales
- **Purpose:** Generates SQL query object.
- **Parameters:** id, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getCustomerSummary_Attendance
- **Purpose:** Generates SQL query object.
- **Parameters:** id, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** findCustomerByName
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, customerName
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertCustomerMinimal
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, customerName
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/dashboard/dashboard.queries.js

**Function:** getAdminConfig
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getDashboardPeriodScalars
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, startDate, endDate
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getDashboardPitScalars
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getLowStockItems
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getMonthlyProductSales
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, startDate, endDate
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getTopCustomers
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, startDate, endDate
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getShakeProfitDetails
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, startDate, endDate
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getActiveSales
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteSaleRestoreStock
- **Purpose:** Generates SQL query object.
- **Parameters:** saleId, deletedBy, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** softDeleteAttendance
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deactivateUserAccounts
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** invalidateUserSessions
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** completeSetup
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getDeletedAttendance
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getDeletedSales
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** restoreAttendance
- **Purpose:** Generates SQL query object.
- **Parameters:** attendanceId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getSaleItemsForRestore
- **Purpose:** Generates SQL query object.
- **Parameters:** saleId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getStockForRestore
- **Purpose:** Generates SQL query object.
- **Parameters:** productVersionId, variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deductStockForRestore
- **Purpose:** Generates SQL query object.
- **Parameters:** quantity, productVersionId, variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** restoreSale
- **Purpose:** Generates SQL query object.
- **Parameters:** saleId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getUserPasswordHash
- **Purpose:** Generates SQL query object.
- **Parameters:** userId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/inventory/inventory.queries.js

**Function:** getInventoryEntities
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** searchInventoryEntities
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, searchQuery
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getVariantById
- **Purpose:** Generates SQL query object.
- **Parameters:** variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateVariant
- **Purpose:** Generates SQL query object.
- **Parameters:** variantId, data
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** checkDuplicateSku
- **Purpose:** Generates SQL query object.
- **Parameters:** sku, excludeVariantId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/notifications/notifications.queries.js

**Function:** insertNotification
- **Purpose:** Generates SQL query object.
- **Parameters:** userId, type, title, body, dataStr
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getUserEmail
- **Purpose:** Generates SQL query object.
- **Parameters:** userId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** fetchNotifications
- **Purpose:** Generates SQL query object.
- **Parameters:** userId, limit
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateSingleReadStatus
- **Purpose:** Generates SQL query object.
- **Parameters:** userId, notificationId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateAllReadStatus
- **Purpose:** Generates SQL query object.
- **Parameters:** userId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** countUnread
- **Purpose:** Generates SQL query object.
- **Parameters:** userId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/products/products.queries.js

**Function:** getProducts
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getVariants
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertProduct
- **Purpose:** Generates SQL query object.
- **Parameters:** client, ownerId, name
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertVariant
- **Purpose:** Generates SQL query object.
- **Parameters:** client, productVersionId, ownerId, name
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertProductVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** client, productId, vendorPricePaise, vpValue, userId, versionLabel
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getActiveVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** client, productId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deprecateVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** client, oldVersionId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertNewVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** client, productId, vendorPricePaise, userId, versionLabel
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** migrateStock
- **Purpose:** Generates SQL query object.
- **Parameters:** client, newVersionId, vendorPricePaise, oldVersionId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getLatestVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** productId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** toggleProductVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** newStatus, versionId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** addVariantDirect
- **Purpose:** Generates SQL query object.
- **Parameters:** productVersionId, ownerId, name
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getVariantStatus
- **Purpose:** Generates SQL query object.
- **Parameters:** id
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** toggleVariantStatus
- **Purpose:** Generates SQL query object.
- **Parameters:** newStatus, id
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** checkVariantDependencies
- **Purpose:** Generates SQL query object.
- **Parameters:** id
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteVariantRecord
- **Purpose:** Generates SQL query object.
- **Parameters:** id
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/reports/reports.queries.js

**Function:** getPDFSales
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, dateFilterStr
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getPDFAttendance
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, dateFilterStr
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getPDFSummarySalesStats
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, dateFilterStr
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getPDFSummaryAttendanceStats
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, dateFilterStr
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getPDFSummaryCustomerCount
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getClubName
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExcelCustomers
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExcelSales
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getExistingCustomerById
- **Purpose:** Generates SQL query object.
- **Parameters:** id, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateCustomerById
- **Purpose:** Generates SQL query object.
- **Parameters:** name, phone, id
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertCustomerWithId
- **Purpose:** Generates SQL query object.
- **Parameters:** id, ownerId, name, phone
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertCustomerWithoutId
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, name, phone
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertProduct
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, name
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertProductVersion
- **Purpose:** Generates SQL query object.
- **Parameters:** productId, vendorPrice, createdBy
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertVariant
- **Purpose:** Generates SQL query object.
- **Parameters:** productId, ownerId, name
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertInitialStock
- **Purpose:** Generates SQL query object.
- **Parameters:** versionId, variantId, ownerId, quantity, vendorPrice, addedBy
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/sales/sales.queries.js

**Function:** getSalesUser
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, userId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getSaleItemsBySaleIds
- **Purpose:** Generates SQL query object.
- **Parameters:** saleIds
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getAllSalesAdmin
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, recordedById
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** createSaleAtomic
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId, customerId, date, recordedBy, itemsJson
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteSaleRestoreStock
- **Purpose:** Generates SQL query object.
- **Parameters:** saleId, deletedBy, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getAdminConfig
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getStaffEmail
- **Purpose:** Generates SQL query object.
- **Parameters:** recordedBy
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getCustomerName
- **Purpose:** Generates SQL query object.
- **Parameters:** customerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getRemainingStock
- **Purpose:** Generates SQL query object.
- **Parameters:** productVersionId, variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getProductName
- **Purpose:** Generates SQL query object.
- **Parameters:** productVersionId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** checkSalePermission
- **Purpose:** Generates SQL query object.
- **Parameters:** saleId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** getSaleItem
- **Purpose:** Generates SQL query object.
- **Parameters:** itemId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** countSaleItems
- **Purpose:** Generates SQL query object.
- **Parameters:** saleId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteSaleItemRow
- **Purpose:** Generates SQL query object.
- **Parameters:** itemId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** restoreItemStock
- **Purpose:** Generates SQL query object.
- **Parameters:** quantity, productVersionId, variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

### File: features/stock/stock.queries.js

**Function:** fetchStock
- **Purpose:** Generates SQL query object.
- **Parameters:** ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** verifyProductOwnership
- **Purpose:** Generates SQL query object.
- **Parameters:** variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateStockRow
- **Purpose:** Generates SQL query object.
- **Parameters:** quantity, vendorPriceSnap, variantId, versionId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** insertStockRow
- **Purpose:** Generates SQL query object.
- **Parameters:** variantId, versionId, ownerId, quantity, vendorPriceSnap, addedBy
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** updateStockQuantityRow
- **Purpose:** Generates SQL query object.
- **Parameters:** quantity, variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.

**Function:** deleteStockRow
- **Purpose:** Generates SQL query object.
- **Parameters:** variantId, ownerId
- **Returns:** Query object { text, values }
- **Called By:** Associated service or controller.



---

# Section 3 — API Reference

## Module: `.`

### `GET /api/./attendance`
- **File:** `./features/attendance/attendance.routes.js`
- **Controller:** `attendanceController.getAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./attendance`
- **File:** `./features/attendance/attendance.routes.js`
- **Controller:** `attendanceController.markAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./attendance/:id`
- **File:** `./features/attendance/attendance.routes.js`
- **Controller:** `attendanceController.deleteAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `POST /api/./login`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.login`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./logout`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.logout`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./forgot-password`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.forgotPassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./reset-password`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.resetPassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./change-password`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.changePassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./session`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.getSession`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./sessions`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.getActiveSessions`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./sessions/:id`
- **File:** `./features/auth/auth.routes.js`
- **Controller:** `authController.revokeSession`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./backup/logs`
- **File:** `./features/backup/backup.routes.js`
- **Controller:** `backupController.getBackupLogs`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./backup/generate`
- **File:** `./features/backup/backup.routes.js`
- **Controller:** `backupController.generateBackup`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./backup/restore/validate`
- **File:** `./features/backup/backup.routes.js`
- **Controller:** `backupController.validateRestore`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./backup/restore/confirm`
- **File:** `./features/backup/backup.routes.js`
- **Controller:** `backupController.confirmRestore`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./`
- **File:** `./features/customers/customers.routes.js`
- **Controller:** `customerController.getCustomers`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./`
- **File:** `./features/customers/customers.routes.js`
- **Controller:** `customerController.addCustomer`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./:id`
- **File:** `./features/customers/customers.routes.js`
- **Controller:** `customerController.updateCustomer`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./:id`
- **File:** `./features/customers/customers.routes.js`
- **Controller:** `customerController.deactivateCustomer`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./:id/summary`
- **File:** `./features/customers/customers.routes.js`
- **Controller:** `customerController.getCustomerSummary`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./dashboard/stats`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.getStats`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./data-management/delete`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.resetData`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./data-management/attendance`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.clearAttendanceData`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./data-management/sales`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.clearSalesData`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./data-management/deleted`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.getDeletedRecords`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./data-management/deleted/:type/:id/restore`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.restoreDeletedRecord`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./system/reset`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.resetData`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./system/reset/request-otp`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.requestResetOtp`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./system/reset/confirm`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.confirmReset`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./account`
- **File:** `./features/dashboard/dashboard.routes.js`
- **Controller:** `dashboardController.deleteAccount`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./entities`
- **File:** `./features/inventory/inventory.routes.js`
- **Controller:** `inventoryController.getEntities`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./search`
- **File:** `./features/inventory/inventory.routes.js`
- **Controller:** `inventoryController.searchEntities`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./entities/:id`
- **File:** `./features/inventory/inventory.routes.js`
- **Controller:** `inventoryController.updateEntity`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./stats`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.getAppStats`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./sessions`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.getLiveSessions`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./audit-log`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.getActivityLog`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./admins`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.getMasterAdmins`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./admins`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.createClubAdmin`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./admins/:id/reset-password`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.forceResetAdminPassword`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./admins/:id/toggle-status`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.toggleAdminStatus`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./admins/:id/club-name`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.updateAdminClubNameMaster`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./admins/:id`
- **File:** `./features/master/master.routes.js`
- **Controller:** `masterController.deleteClubAdmin`
- **Auth required:** No
- **Role required:** Master
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./notifications`
- **File:** `./features/notifications/notifications.routes.js`
- **Controller:** `notificationController.getNotifications`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./notifications/unread-count`
- **File:** `./features/notifications/notifications.routes.js`
- **Controller:** `notificationController.getUnreadCount`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./notifications/:id/read`
- **File:** `./features/notifications/notifications.routes.js`
- **Controller:** `notificationController.markAsRead`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./notifications/read`
- **File:** `./features/notifications/notifications.routes.js`
- **Controller:** `notificationController.markAsRead`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./products`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.getProducts`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./products`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.addProduct`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./products/:id/price`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.updateProductPrice`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./products/:id/toggle`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.toggleProductStatus`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./variants`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.addVariant`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./variants/:id/toggle`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.toggleVariant`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./variants/:id`
- **File:** `./features/products/products.routes.js`
- **Controller:** `productController.deleteVariant`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./reports/export`
- **File:** `./features/reports/reports.routes.js`
- **Controller:** `reportsController.exportData`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./reports/import`
- **File:** `./features/reports/reports.routes.js`
- **Controller:** `reportsController.importCSV`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./reports`
- **File:** `./features/reports/reports.routes.js`
- **Controller:** `reportsController.ping`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./sales`
- **File:** `./features/sales/sales.routes.js`
- **Controller:** `salesController.getSales`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./sales`
- **File:** `./features/sales/sales.routes.js`
- **Controller:** `salesController.addSale`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./sales/:id`
- **File:** `./features/sales/sales.routes.js`
- **Controller:** `salesController.deleteSale`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./sales/item/:id`
- **File:** `./features/sales/sales.routes.js`
- **Controller:** `salesController.deleteSaleItem`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./admin/club-name`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.getAdminClubName`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./admin/club-name`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.updateAdminClubName`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./user/club-name`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.getUserClubName`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./admin/config/setup-complete`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.completeSetup`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./settings/config`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.updateAdminConfig`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./users`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.getUsers`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./users`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.createUser`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PUT /api/./users/:id/role`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.updateUserRole`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./users/:id/reset-password`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.adminUpdateUserPassword`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./users/:id`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.deleteUser`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `GET /api/./login-history`
- **File:** `./features/settings/settings.routes.js`
- **Controller:** `settingsController.getLoginHistory`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

## Module: `.`

### `GET /api/./stock`
- **File:** `./features/stock/stock.routes.js`
- **Controller:** `stockController.getStock`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `POST /api/./stock`
- **File:** `./features/stock/stock.routes.js`
- **Controller:** `stockController.addStock`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `PATCH /api/./stock/:id`
- **File:** `./features/stock/stock.routes.js`
- **Controller:** `stockController.updateStockQuantity`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned

### `DELETE /api/./stock/:id`
- **File:** `./features/stock/stock.routes.js`
- **Controller:** `stockController.deleteStock`
- **Auth required:** Yes
- **Role required:** Admin
- **Tenant scoped:** Yes

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ success: false, message: "Bad Request" }`
- 401: `{ success: false, message: "Unauthorized" }`
- 500: `{ success: false, message: "Internal Server Error" }`

**Flow summary:**
1. Middleware applied
2. Validation performed
3. Service function called
4. Database query executed
5. Response returned



---

# Section 4 — Function Reference

## File: `./addConstraints.js`

### `addConstraints`
- **Function:** `addConstraints`
- **File:** `./addConstraints.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./add_club_name.js`

### `migrate`
- **Function:** `migrate`
- **File:** `./add_club_name.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./add_club_name_column.js`

### `run`
- **Function:** `run`
- **File:** `./add_club_name_column.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./add_last_activity_at.js`

### `run`
- **Function:** `run`
- **File:** `./add_last_activity_at.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./add_setting.js`

### `run`
- **Function:** `run`
- **File:** `./add_setting.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./alter.js`

### `run`
- **Function:** `run`
- **File:** `./alter.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./alter_password_resets.js`

### `run`
- **Function:** `run`
- **File:** `./alter_password_resets.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./analyze_sales.js`

### `analyzeSales`
- **Function:** `analyzeSales`
- **File:** `./analyze_sales.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./analyze_stock.js`

### `analyze`
- **Function:** `analyze`
- **File:** `./analyze_stock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkDuplicates.js`

### `run`
- **Function:** `run`
- **File:** `./checkDuplicates.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkFlavours.js`

### `run`
- **Function:** `run`
- **File:** `./checkFlavours.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkFunc.js`

### `run`
- **Function:** `run`
- **File:** `./checkFunc.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkOwner.js`

### `run`
- **Function:** `run`
- **File:** `./checkOwner.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkProductConstraints.js`

### `run`
- **Function:** `run`
- **File:** `./checkProductConstraints.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkSaleItems.js`

### `test`
- **Function:** `test`
- **File:** `./checkSaleItems.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkSales.js`

### `test`
- **Function:** `test`
- **File:** `./checkSales.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkStock.js`

### `run`
- **Function:** `run`
- **File:** `./checkStock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkStockColumns.js`

### `run`
- **Function:** `run`
- **File:** `./checkStockColumns.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./checkUserProducts.js`

### `run`
- **Function:** `run`
- **File:** `./checkUserProducts.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_admins.js`

### `run`
- **Function:** `run`
- **File:** `./check_admins.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_attendance.js`

### `check`
- **Function:** `check`
- **File:** `./check_attendance.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_constraints.js`

### `main`
- **Function:** `main`
- **File:** `./check_constraints.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_db.js`

### `f`
- **Function:** `f`
- **File:** `./check_db.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_db_id.js`

### `f`
- **Function:** `f`
- **File:** `./check_db_id.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_db_schema.js`

### `f`
- **Function:** `f`
- **File:** `./check_db_schema.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_nulls.js`

### `f`
- **Function:** `f`
- **File:** `./check_nulls.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_schema.js`

### `run`
- **Function:** `run`
- **File:** `./check_schema.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./check_stock.js`

### `checkStock`
- **Function:** `checkStock`
- **File:** `./check_stock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./config/db.js`

### `initDB`
- **Function:** `initDB`
- **File:** `./config/db.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `createTables`
- **Function:** `createTables`
- **File:** `./config/db.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./create_backup_logs.js`

### `run`
- **Function:** `run`
- **File:** `./create_backup_logs.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./cross_feature_tests.js`

### `apiCall`
- **Function:** `apiCall`
- **File:** `./cross_feature_tests.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, payload, token`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `extractEntities`
- **Function:** `extractEntities`
- **File:** `./cross_feature_tests.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./cross_feature_tests.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getStockA`
- **Function:** `getStockA`
- **File:** `./cross_feature_tests.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./data/dbHelper.js`

### `initializeDB`
- **Function:** `initializeDB`
- **File:** `./data/dbHelper.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `readDB`
- **Function:** `readDB`
- **File:** `./data/dbHelper.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `writeDB`
- **Function:** `writeDB`
- **File:** `./data/dbHelper.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./debug_attendance.js`

### `debug`
- **Function:** `debug`
- **File:** `./debug_attendance.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./debug_sales.js`

### `debug2`
- **Function:** `debug2`
- **File:** `./debug_sales.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./debug_timestamps.js`

### `debug3`
- **Function:** `debug3`
- **File:** `./debug_timestamps.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./debug_timing.js`

### `debug4`
- **Function:** `debug4`
- **File:** `./debug_timing.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./deduplicate.js`

### `deduplicate`
- **Function:** `deduplicate`
- **File:** `./deduplicate.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./delete_f1.js`

### `run`
- **Function:** `run`
- **File:** `./delete_f1.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./drop_constraint.js`

### `main`
- **Function:** `main`
- **File:** `./drop_constraint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./dump_schema.js`

### `testSchema`
- **Function:** `testSchema`
- **File:** `./dump_schema.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./e2e.js`

### `api`
- **Function:** `api`
- **File:** `./e2e.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, body`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runE2E`
- **Function:** `runE2E`
- **File:** `./e2e.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./extract_functions.js`

### `getFiles`
- **Function:** `getFiles`
- **File:** `./extract_functions.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `dir, files_`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./extract_routes.js`

### `getFiles`
- **Function:** `getFiles`
- **File:** `./extract_routes.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `dir, files_`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./extract_schema.js`

### `run`
- **Function:** `run`
- **File:** `./extract_schema.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/attendance/attendance.controller.js`

### `getAttendance`
- **Function:** `getAttendance`
- **File:** `./features/attendance/attendance.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAttendance`
- **Function:** `markAttendance`
- **File:** `./features/attendance/attendance.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteAttendance`
- **Function:** `deleteAttendance`
- **File:** `./features/attendance/attendance.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/attendance/attendance.queries.js`

### `getAttendanceUser`
- **Function:** `getAttendanceUser`
- **File:** `./features/attendance/attendance.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getAttendanceAdmin`
- **Function:** `getAttendanceAdmin`
- **File:** `./features/attendance/attendance.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getConfigShakeAmount`
- **Function:** `getConfigShakeAmount`
- **File:** `./features/attendance/attendance.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `upsertAttendance`
- **Function:** `upsertAttendance`
- **File:** `./features/attendance/attendance.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, customerId, date, type, shakeAmountPaise, recordedBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteAttendanceUser`
- **Function:** `deleteAttendanceUser`
- **File:** `./features/attendance/attendance.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `attendanceId, userId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteAttendanceAdmin`
- **Function:** `deleteAttendanceAdmin`
- **File:** `./features/attendance/attendance.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `attendanceId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/attendance/attendance.service.js`

### `getAttendance`
- **Function:** `getAttendance`
- **File:** `./features/attendance/attendance.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userRole, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAttendance`
- **Function:** `markAttendance`
- **File:** `./features/attendance/attendance.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, recordedBy, body`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteAttendance`
- **Function:** `deleteAttendance`
- **File:** `./features/attendance/attendance.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, userRole, attendanceId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/attendance/attendance.validation.js`

### `validateAttendance`
- **Function:** `validateAttendance`
- **File:** `./features/attendance/attendance.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/auth/auth.controller.js`

### `login`
- **Function:** `login`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `logout`
- **Function:** `logout`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `changePassword`
- **Function:** `changePassword`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getSession`
- **Function:** `getSession`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `forgotPassword`
- **Function:** `forgotPassword`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `resetPassword`
- **Function:** `resetPassword`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getSession`
- **Function:** `getSession`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getActiveSessions`
- **Function:** `getActiveSessions`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `revokeSession`
- **Function:** `revokeSession`
- **File:** `./features/auth/auth.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/backup/backup.controller.js`

### `generateBackup`
- **Function:** `generateBackup`
- **File:** `./features/backup/backup.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getBackupLogs`
- **Function:** `getBackupLogs`
- **File:** `./features/backup/backup.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `validateRestore`
- **Function:** `validateRestore`
- **File:** `./features/backup/backup.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `confirmRestore`
- **Function:** `confirmRestore`
- **File:** `./features/backup/backup.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/backup/backup.queries.js`

### `getClubName`
- **Function:** `getClubName`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertBackupLogCloud`
- **Function:** `insertBackupLogCloud`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, type, fileName, fileUrl, fileSize, createdBy, notes`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertBackupLogLocal`
- **Function:** `insertBackupLogLocal`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, type, fileName, fileSize, createdBy, notes`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getBackupLogs`
- **Function:** `getBackupLogs`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getRestoreLimitCount`
- **Function:** `getRestoreLimitCount`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `logRestoreSuccess`
- **Function:** `logRestoreSuccess`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, type, fileName, createdBy, strategy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportCustomers`
- **Function:** `getExportCustomers`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportAttendance`
- **Function:** `getExportAttendance`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportSales`
- **Function:** `getExportSales`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportSaleItems`
- **Function:** `getExportSaleItems`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportProducts`
- **Function:** `getExportProducts`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportProductVersions`
- **Function:** `getExportProductVersions`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportFlavours`
- **Function:** `getExportFlavours`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExportStock`
- **Function:** `getExportStock`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getSaleItemsSnapshot`
- **Function:** `getSaleItemsSnapshot`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateStockDifferential`
- **Function:** `updateStockDifferential`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `diff, pvId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleItemsWipe`
- **Function:** `deleteSaleItemsWipe`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteProductVersionsWipe`
- **Function:** `deleteProductVersionsWipe`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteTableWipe`
- **Function:** `deleteTableWipe`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `tableName, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `buildMergeInsertQuery`
- **Function:** `buildMergeInsertQuery`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `tableName, dbColumns`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `buildStandardInsertQuery`
- **Function:** `buildStandardInsertQuery`
- **File:** `./features/backup/backup.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `tableName, dbColumns`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/backup/backup.routes.js`

### `backupLimiter`
- **Function:** `backupLimiter`
- **File:** `./features/backup/backup.routes.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/customers/customers.controller.js`

### `getOwnerId`
- **Function:** `getOwnerId`
- **File:** `./features/customers/customers.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomers`
- **Function:** `getCustomers`
- **File:** `./features/customers/customers.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addCustomer`
- **Function:** `addCustomer`
- **File:** `./features/customers/customers.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateCustomer`
- **Function:** `updateCustomer`
- **File:** `./features/customers/customers.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deactivateCustomer`
- **Function:** `deactivateCustomer`
- **File:** `./features/customers/customers.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomerSummary`
- **Function:** `getCustomerSummary`
- **File:** `./features/customers/customers.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/customers/customers.queries.js`

### `getCustomers`
- **Function:** `getCustomers`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addCustomer`
- **Function:** `addCustomer`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, name, phone, member_code, joined_at`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateCustomer`
- **Function:** `updateCustomer`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `name, phone, member_code, id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deactivateCustomer`
- **Function:** `deactivateCustomer`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomerSummary_Customer`
- **Function:** `getCustomerSummary_Customer`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomerSummary_Sales`
- **Function:** `getCustomerSummary_Sales`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomerSummary_Attendance`
- **Function:** `getCustomerSummary_Attendance`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `findCustomerByName`
- **Function:** `findCustomerByName`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, customerName`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertCustomerMinimal`
- **Function:** `insertCustomerMinimal`
- **File:** `./features/customers/customers.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, customerName`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/customers/customers.service.js`

### `getCustomers`
- **Function:** `getCustomers`
- **File:** `./features/customers/customers.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addCustomer`
- **Function:** `addCustomer`
- **File:** `./features/customers/customers.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateCustomer`
- **Function:** `updateCustomer`
- **File:** `./features/customers/customers.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId, userId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deactivateCustomer`
- **Function:** `deactivateCustomer`
- **File:** `./features/customers/customers.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomerSummary`
- **Function:** `getCustomerSummary`
- **File:** `./features/customers/customers.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `findOrCreateCustomer`
- **Function:** `findOrCreateCustomer`
- **File:** `./features/customers/customers.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, customerName, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/customers/customers.validation.js`

### `validateAddCustomer`
- **Function:** `validateAddCustomer`
- **File:** `./features/customers/customers.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/dashboard/dashboard.controller.js`

### `getStats`
- **Function:** `getStats`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `resetData`
- **Function:** `resetData`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteAccount`
- **Function:** `deleteAccount`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `completeSetup`
- **Function:** `completeSetup`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateAdminConfig`
- **Function:** `updateAdminConfig`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `clearAttendanceData`
- **Function:** `clearAttendanceData`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `clearSalesData`
- **Function:** `clearSalesData`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `requestResetOtp`
- **Function:** `requestResetOtp`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `confirmReset`
- **Function:** `confirmReset`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getDeletedRecords`
- **Function:** `getDeletedRecords`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `restoreDeletedRecord`
- **Function:** `restoreDeletedRecord`
- **File:** `./features/dashboard/dashboard.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/dashboard/dashboard.queries.js`

### `getAdminConfig`
- **Function:** `getAdminConfig`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getDashboardPeriodScalars`
- **Function:** `getDashboardPeriodScalars`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, startDate, endDate`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getDashboardPitScalars`
- **Function:** `getDashboardPitScalars`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getLowStockItems`
- **Function:** `getLowStockItems`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getMonthlyProductSales`
- **Function:** `getMonthlyProductSales`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, startDate, endDate`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getTopCustomers`
- **Function:** `getTopCustomers`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, startDate, endDate`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getShakeProfitDetails`
- **Function:** `getShakeProfitDetails`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, startDate, endDate`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getActiveSales`
- **Function:** `getActiveSales`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleRestoreStock`
- **Function:** `deleteSaleRestoreStock`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId, deletedBy, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `softDeleteAttendance`
- **Function:** `softDeleteAttendance`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deactivateUserAccounts`
- **Function:** `deactivateUserAccounts`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `invalidateUserSessions`
- **Function:** `invalidateUserSessions`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `completeSetup`
- **Function:** `completeSetup`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getDeletedAttendance`
- **Function:** `getDeletedAttendance`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getDeletedSales`
- **Function:** `getDeletedSales`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `restoreAttendance`
- **Function:** `restoreAttendance`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `attendanceId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getSaleItemsForRestore`
- **Function:** `getSaleItemsForRestore`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getStockForRestore`
- **Function:** `getStockForRestore`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productVersionId, variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deductStockForRestore`
- **Function:** `deductStockForRestore`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `quantity, productVersionId, variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `restoreSale`
- **Function:** `restoreSale`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getUserPasswordHash`
- **Function:** `getUserPasswordHash`
- **File:** `./features/dashboard/dashboard.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/dashboard/dashboard.service.js`

### `getStats`
- **Function:** `getStats`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, startDate, endDate`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `resetData`
- **Function:** `resetData`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, modules = []`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteAccount`
- **Function:** `deleteAccount`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `completeSetup`
- **Function:** `completeSetup`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateAdminConfig`
- **Function:** `updateAdminConfig`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, default_shake_amount, low_stock_threshold`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `clearAttendanceData`
- **Function:** `clearAttendanceData`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, month`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `clearSalesData`
- **Function:** `clearSalesData`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, month`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `requestResetOtp`
- **Function:** `requestResetOtp`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, email, password`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `confirmReset`
- **Function:** `confirmReset`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, password, confirmText, otp, modules`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getDeletedRecords`
- **Function:** `getDeletedRecords`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `restoreDeletedRecord`
- **Function:** `restoreDeletedRecord`
- **File:** `./features/dashboard/dashboard.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, type, id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/inventory/inventory.controller.js`

### `getEntities`
- **Function:** `getEntities`
- **File:** `./features/inventory/inventory.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `searchEntities`
- **Function:** `searchEntities`
- **File:** `./features/inventory/inventory.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateEntity`
- **Function:** `updateEntity`
- **File:** `./features/inventory/inventory.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/inventory/inventory.dto.js`

### `mapToInventoryEntity`
- **Function:** `mapToInventoryEntity`
- **File:** `./features/inventory/inventory.dto.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `row`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/inventory/inventory.queries.js`

### `getInventoryEntities`
- **Function:** `getInventoryEntities`
- **File:** `./features/inventory/inventory.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `searchInventoryEntities`
- **Function:** `searchInventoryEntities`
- **File:** `./features/inventory/inventory.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, searchQuery`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getVariantById`
- **Function:** `getVariantById`
- **File:** `./features/inventory/inventory.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateVariant`
- **Function:** `updateVariant`
- **File:** `./features/inventory/inventory.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `checkDuplicateSku`
- **Function:** `checkDuplicateSku`
- **File:** `./features/inventory/inventory.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `sku, excludeVariantId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/inventory/inventory.service.js`

### `getEntities`
- **Function:** `getEntities`
- **File:** `./features/inventory/inventory.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `searchEntities`
- **Function:** `searchEntities`
- **File:** `./features/inventory/inventory.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, q`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateEntity`
- **Function:** `updateEntity`
- **File:** `./features/inventory/inventory.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId, ownerId, userId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/master/master.controller.js`

### `getAppStats`
- **Function:** `getAppStats`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getLiveSessions`
- **Function:** `getLiveSessions`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getActivityLog`
- **Function:** `getActivityLog`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getMasterAdmins`
- **Function:** `getMasterAdmins`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `createClubAdmin`
- **Function:** `createClubAdmin`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `forceResetAdminPassword`
- **Function:** `forceResetAdminPassword`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleAdminStatus`
- **Function:** `toggleAdminStatus`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateAdminClubNameMaster`
- **Function:** `updateAdminClubNameMaster`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteClubAdmin`
- **Function:** `deleteClubAdmin`
- **File:** `./features/master/master.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/notifications/notifications.controller.js`

### `getNotifications`
- **Function:** `getNotifications`
- **File:** `./features/notifications/notifications.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAsRead`
- **Function:** `markAsRead`
- **File:** `./features/notifications/notifications.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getUnreadCount`
- **Function:** `getUnreadCount`
- **File:** `./features/notifications/notifications.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/notifications/notifications.queries.js`

### `insertNotification`
- **Function:** `insertNotification`
- **File:** `./features/notifications/notifications.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, type, title, body, dataStr`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getUserEmail`
- **Function:** `getUserEmail`
- **File:** `./features/notifications/notifications.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `fetchNotifications`
- **Function:** `fetchNotifications`
- **File:** `./features/notifications/notifications.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, limit`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateSingleReadStatus`
- **Function:** `updateSingleReadStatus`
- **File:** `./features/notifications/notifications.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, notificationId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateAllReadStatus`
- **Function:** `updateAllReadStatus`
- **File:** `./features/notifications/notifications.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `countUnread`
- **Function:** `countUnread`
- **File:** `./features/notifications/notifications.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/notifications/notifications.service.js`

### `createNotification`
- **Function:** `createNotification`
- **File:** `./features/notifications/notifications.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, type, title, body, data, sendEmail = false`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getNotifications`
- **Function:** `getNotifications`
- **File:** `./features/notifications/notifications.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, limit = 50`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAsRead`
- **Function:** `markAsRead`
- **File:** `./features/notifications/notifications.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId, notificationId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getUnreadCount`
- **Function:** `getUnreadCount`
- **File:** `./features/notifications/notifications.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/products/products.controller.js`

### `getProducts`
- **Function:** `getProducts`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addProduct`
- **Function:** `addProduct`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateProductPrice`
- **Function:** `updateProductPrice`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleProductStatus`
- **Function:** `toggleProductStatus`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addVariant`
- **Function:** `addVariant`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleVariant`
- **Function:** `toggleVariant`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteVariant`
- **Function:** `deleteVariant`
- **File:** `./features/products/products.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/products/products.queries.js`

### `getProducts`
- **Function:** `getProducts`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getVariants`
- **Function:** `getVariants`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertProduct`
- **Function:** `insertProduct`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, ownerId, name`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertVariant`
- **Function:** `insertVariant`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, productVersionId, ownerId, name`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertProductVersion`
- **Function:** `insertProductVersion`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, productId, vendorPricePaise, vpValue, userId, versionLabel`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getActiveVersion`
- **Function:** `getActiveVersion`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, productId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deprecateVersion`
- **Function:** `deprecateVersion`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, oldVersionId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertNewVersion`
- **Function:** `insertNewVersion`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, productId, vendorPricePaise, userId, versionLabel`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `migrateStock`
- **Function:** `migrateStock`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `client, newVersionId, vendorPricePaise, oldVersionId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getLatestVersion`
- **Function:** `getLatestVersion`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleProductVersion`
- **Function:** `toggleProductVersion`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `newStatus, versionId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addVariantDirect`
- **Function:** `addVariantDirect`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productVersionId, ownerId, name`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getVariantStatus`
- **Function:** `getVariantStatus`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleVariantStatus`
- **Function:** `toggleVariantStatus`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `newStatus, id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `checkVariantDependencies`
- **Function:** `checkVariantDependencies`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteVariantRecord`
- **Function:** `deleteVariantRecord`
- **File:** `./features/products/products.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/products/products.service.js`

### `getProducts`
- **Function:** `getProducts`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addProduct`
- **Function:** `addProduct`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateProductPrice`
- **Function:** `updateProductPrice`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productId, ownerId, userId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleProductStatus`
- **Function:** `toggleProductStatus`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addVariant`
- **Function:** `addVariant`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, data`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleVariant`
- **Function:** `toggleVariant`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteVariant`
- **Function:** `deleteVariant`
- **File:** `./features/products/products.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/products/products.validation.js`

### `validateAddProduct`
- **Function:** `validateAddProduct`
- **File:** `./features/products/products.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `validateAddFlavour`
- **Function:** `validateAddFlavour`
- **File:** `./features/products/products.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/reports/reports.controller.js`

### `exportData`
- **Function:** `exportData`
- **File:** `./features/reports/reports.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `importCSV`
- **Function:** `importCSV`
- **File:** `./features/reports/reports.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `ping`
- **Function:** `ping`
- **File:** `./features/reports/reports.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/reports/reports.queries.js`

### `getPDFSales`
- **Function:** `getPDFSales`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, dateFilterStr`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getPDFAttendance`
- **Function:** `getPDFAttendance`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, dateFilterStr`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getPDFSummarySalesStats`
- **Function:** `getPDFSummarySalesStats`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, dateFilterStr`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getPDFSummaryAttendanceStats`
- **Function:** `getPDFSummaryAttendanceStats`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, dateFilterStr`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getPDFSummaryCustomerCount`
- **Function:** `getPDFSummaryCustomerCount`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getClubName`
- **Function:** `getClubName`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExcelCustomers`
- **Function:** `getExcelCustomers`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExcelSales`
- **Function:** `getExcelSales`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getExistingCustomerById`
- **Function:** `getExistingCustomerById`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateCustomerById`
- **Function:** `updateCustomerById`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `name, phone, id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertCustomerWithId`
- **Function:** `insertCustomerWithId`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, ownerId, name, phone`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertCustomerWithoutId`
- **Function:** `insertCustomerWithoutId`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, name, phone`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertProduct`
- **Function:** `insertProduct`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, name`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertProductVersion`
- **Function:** `insertProductVersion`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productId, vendorPrice, createdBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertVariant`
- **Function:** `insertVariant`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productId, ownerId, name`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertInitialStock`
- **Function:** `insertInitialStock`
- **File:** `./features/reports/reports.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `versionId, variantId, ownerId, quantity, vendorPrice, addedBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/reports/reports.routes.js`

### `reportLimiter`
- **Function:** `reportLimiter`
- **File:** `./features/reports/reports.routes.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `backupLimiter`
- **Function:** `backupLimiter`
- **File:** `./features/reports/reports.routes.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/reports/reports.service.js`

### `generateReportData`
- **Function:** `generateReportData`
- **File:** `./features/reports/reports.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, type, range`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `exportPDF`
- **Function:** `exportPDF`
- **File:** `./features/reports/reports.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, type, range`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `exportExcel`
- **Function:** `exportExcel`
- **File:** `./features/reports/reports.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `importCSV`
- **Function:** `importCSV`
- **File:** `./features/reports/reports.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId, type, fileBuffer`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/reports/reports.template.js`

### `generateReportHTML`
- **Function:** `generateReportHTML`
- **File:** `./features/reports/reports.template.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `type, data, clubName = ''`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/sales/sales.controller.js`

### `getSales`
- **Function:** `getSales`
- **File:** `./features/sales/sales.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addSale`
- **Function:** `addSale`
- **File:** `./features/sales/sales.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSale`
- **Function:** `deleteSale`
- **File:** `./features/sales/sales.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleItem`
- **Function:** `deleteSaleItem`
- **File:** `./features/sales/sales.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/sales/sales.queries.js`

### `getSalesUser`
- **Function:** `getSalesUser`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getSaleItemsBySaleIds`
- **Function:** `getSaleItemsBySaleIds`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleIds`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getAllSalesAdmin`
- **Function:** `getAllSalesAdmin`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, recordedById`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `createSaleAtomic`
- **Function:** `createSaleAtomic`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, customerId, date, recordedBy, itemsJson`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleRestoreStock`
- **Function:** `deleteSaleRestoreStock`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId, deletedBy, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getAdminConfig`
- **Function:** `getAdminConfig`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getStaffEmail`
- **Function:** `getStaffEmail`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `recordedBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getCustomerName`
- **Function:** `getCustomerName`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `customerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getRemainingStock`
- **Function:** `getRemainingStock`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productVersionId, variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getProductName`
- **Function:** `getProductName`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `productVersionId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `checkSalePermission`
- **Function:** `checkSalePermission`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getSaleItem`
- **Function:** `getSaleItem`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `itemId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `countSaleItems`
- **Function:** `countSaleItems`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleItemRow`
- **Function:** `deleteSaleItemRow`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `itemId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `restoreItemStock`
- **Function:** `restoreItemStock`
- **File:** `./features/sales/sales.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `quantity, productVersionId, variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/sales/sales.service.js`

### `getAllSales`
- **Function:** `getAllSales`
- **File:** `./features/sales/sales.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, recordedById = null`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addSaleTransaction`
- **Function:** `addSaleTransaction`
- **File:** `./features/sales/sales.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `date, customerId, uniqueItems, ownerId, recordedBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleTransaction`
- **Function:** `deleteSaleTransaction`
- **File:** `./features/sales/sales.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `saleId, ownerId, deletedBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteSaleItemTransaction`
- **Function:** `deleteSaleItemTransaction`
- **File:** `./features/sales/sales.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `itemId, ownerId, userId, userRole`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/sales/sales.validation.js`

### `validateAddSaleInline`
- **Function:** `validateAddSaleInline`
- **File:** `./features/sales/sales.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/settings/settings.controller.js`

### `getUsers`
- **Function:** `getUsers`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `createUser`
- **Function:** `createUser`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateUserRole`
- **Function:** `updateUserRole`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteUser`
- **Function:** `deleteUser`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `adminUpdateUserPassword`
- **Function:** `adminUpdateUserPassword`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getLoginHistory`
- **Function:** `getLoginHistory`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getAdminClubName`
- **Function:** `getAdminClubName`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateAdminClubName`
- **Function:** `updateAdminClubName`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getUserClubName`
- **Function:** `getUserClubName`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `completeSetup`
- **Function:** `completeSetup`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateAdminConfig`
- **Function:** `updateAdminConfig`
- **File:** `./features/settings/settings.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/stock/stock.controller.js`

### `getStock`
- **Function:** `getStock`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addStock`
- **Function:** `addStock`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateStockQuantity`
- **Function:** `updateStockQuantity`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateStockPrice`
- **Function:** `updateStockPrice`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `increaseStock`
- **Function:** `increaseStock`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `decreaseStock`
- **Function:** `decreaseStock`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteStock`
- **Function:** `deleteStock`
- **File:** `./features/stock/stock.controller.js`
- **Type:** `Controller`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/stock/stock.queries.js`

### `fetchStock`
- **Function:** `fetchStock`
- **File:** `./features/stock/stock.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `verifyProductOwnership`
- **Function:** `verifyProductOwnership`
- **File:** `./features/stock/stock.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateStockRow`
- **Function:** `updateStockRow`
- **File:** `./features/stock/stock.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `quantity, vendorPriceSnap, variantId, versionId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `insertStockRow`
- **Function:** `insertStockRow`
- **File:** `./features/stock/stock.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId, versionId, ownerId, quantity, vendorPriceSnap, addedBy`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateStockQuantityRow`
- **Function:** `updateStockQuantityRow`
- **File:** `./features/stock/stock.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `quantity, variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteStockRow`
- **Function:** `deleteStockRow`
- **File:** `./features/stock/stock.queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `variantId, ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/stock/stock.service.js`

### `getStock`
- **Function:** `getStock`
- **File:** `./features/stock/stock.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addStock`
- **Function:** `addStock`
- **File:** `./features/stock/stock.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, variantId, quantity, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateStockQuantity`
- **Function:** `updateStockQuantity`
- **File:** `./features/stock/stock.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, variantId, quantity, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `deleteStock`
- **Function:** `deleteStock`
- **File:** `./features/stock/stock.service.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `ownerId, variantId, userId`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./features/stock/stock.validation.js`

### `validateAddStock`
- **Function:** `validateAddStock`
- **File:** `./features/stock/stock.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `validateUpdateStock`
- **Function:** `validateUpdateStock`
- **File:** `./features/stock/stock.validation.js`
- **Type:** `Validator`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./find_owner.js`

### `run`
- **Function:** `run`
- **File:** `./find_owner.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./find_owner2.js`

### `run`
- **Function:** `run`
- **File:** `./find_owner2.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./fixHistory.js`

### `main`
- **Function:** `main`
- **File:** `./fixHistory.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./fixMissingFlavours.js`

### `run`
- **Function:** `run`
- **File:** `./fixMissingFlavours.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./fix_attendance.js`

### `fix`
- **Function:** `fix`
- **File:** `./fix_attendance.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./fix_stock.js`

### `fixStock`
- **Function:** `fixStock`
- **File:** `./fix_stock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./fix_stock_post_restore.js`

### `fixRestoredStock`
- **Function:** `fixRestoredStock`
- **File:** `./fix_stock_post_restore.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./get_func.js`

### `getFunc`
- **Function:** `getFunc`
- **File:** `./get_func.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./list_users.js`

### `run`
- **Function:** `run`
- **File:** `./list_users.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./migrateData.js`

### `migrateTable`
- **Function:** `migrateTable`
- **File:** `./migrateData.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `tableName`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runMigration`
- **Function:** `runMigration`
- **File:** `./migrateData.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./migrate_functions.js`

### `run`
- **Function:** `run`
- **File:** `./migrate_functions.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./migrations/index.js`

### `runMigrations`
- **Function:** `runMigrations`
- **File:** `./migrations/index.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `pool`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./patchDataManagement.js`

### `clearAttendanceData`
- **Function:** `clearAttendanceData`
- **File:** `./patchDataManagement.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `clearSalesData`
- **Function:** `clearSalesData`
- **File:** `./patchDataManagement.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./patchLoginHistory.js`

### `getDevice`
- **Function:** `getDevice`
- **File:** `./patchLoginHistory.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `u`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getBrowser`
- **Function:** `getBrowser`
- **File:** `./patchLoginHistory.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `u`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./provide_runtime_evidence.js`

### `provideRuntimeEvidence`
- **Function:** `provideRuntimeEvidence`
- **File:** `./provide_runtime_evidence.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./queries.js`

### `apiCall`
- **Function:** `apiCall`
- **File:** `./queries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, payload, token`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./recoverStock.js`

### `run`
- **Function:** `run`
- **File:** `./recoverStock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./recreate_tables.js`

### `run`
- **Function:** `run`
- **File:** `./recreate_tables.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./restoreTestStock.js`

### `run`
- **Function:** `run`
- **File:** `./restoreTestStock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./routes/backupRoutes.js`

### `checkAdmin`
- **Function:** `checkAdmin`
- **File:** `./routes/backupRoutes.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./run_7_scenarios.js`

### `apiCall`
- **Function:** `apiCall`
- **File:** `./run_7_scenarios.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, payload, token`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `extractEntities`
- **Function:** `extractEntities`
- **File:** `./run_7_scenarios.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./run_7_scenarios.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getStock`
- **Function:** `getStock`
- **File:** `./run_7_scenarios.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./run_e2e_test.js`

### `query`
- **Function:** `query`
- **File:** `./run_e2e_test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `text, params`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `apiRequest`
- **Function:** `apiRequest`
- **File:** `./run_e2e_test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, body, cookie = ''`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runE2E`
- **Function:** `runE2E`
- **File:** `./run_e2e_test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `performCleanup`
- **Function:** `performCleanup`
- **File:** `./run_e2e_test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./run_migration.js`

### `run`
- **Function:** `run`
- **File:** `./run_migration.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./run_rollback.js`

### `run`
- **Function:** `run`
- **File:** `./run_rollback.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./scripts/migrateToSaaS.js`

### `migrate`
- **Function:** `migrate`
- **File:** `./scripts/migrateToSaaS.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./scripts/migrate_to_prisma.js`

### `main`
- **Function:** `main`
- **File:** `./scripts/migrate_to_prisma.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./scripts/migration_test_suite.js`

### `runTests`
- **Function:** `runTests`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./scripts/migration_test_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./scripts/restore_backup.js`

### `restore`
- **Function:** `restore`
- **File:** `./scripts/restore_backup.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `file, mode`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./scripts/validate_inventory_integrity.js`

### `validate`
- **Function:** `validate`
- **File:** `./scripts/validate_inventory_integrity.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./scripts/verify_stats.js`

### `testStats`
- **Function:** `testStats`
- **File:** `./scripts/verify_stats.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./set_stock_exact.js`

### `setStock`
- **Function:** `setStock`
- **File:** `./set_stock_exact.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/db/connection.js`

### `initDB`
- **Function:** `initDB`
- **File:** `./shared/db/connection.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `createTables`
- **Function:** `createTables`
- **File:** `./shared/db/connection.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/middleware/auth.js`

### `authenticateToken`
- **Function:** `authenticateToken`
- **File:** `./shared/middleware/auth.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/middleware/authMiddleware.js`

### `authenticateToken`
- **Function:** `authenticateToken`
- **File:** `./shared/middleware/authMiddleware.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getOwnerId`
- **Function:** `getOwnerId`
- **File:** `./shared/middleware/authMiddleware.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `requireAdmin`
- **Function:** `requireAdmin`
- **File:** `./shared/middleware/authMiddleware.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `requireMaster`
- **Function:** `requireMaster`
- **File:** `./shared/middleware/authMiddleware.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/middleware/ownerScope.js`

### `getOwnerId`
- **Function:** `getOwnerId`
- **File:** `./shared/middleware/ownerScope.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/middleware/rateLimiters.js`

### `backupLimiter`
- **Function:** `backupLimiter`
- **File:** `./shared/middleware/rateLimiters.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `req, res, next`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/middleware/validate.js`

### `validate`
- **Function:** `validate`
- **File:** `./shared/middleware/validate.js`
- **Type:** `Middleware`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `schema`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/services/auditLogService.js`

### `logAction`
- **Function:** `logAction`
- **File:** `./shared/services/auditLogService.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `actorId, action, tableName = null, recordId = null, oldJson = null, newJson = null`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/services/cacheService.js`

### `getCache`
- **Function:** `getCache`
- **File:** `./shared/services/cacheService.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `key`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `setCache`
- **Function:** `setCache`
- **File:** `./shared/services/cacheService.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `key, value, ttlSeconds = 300`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `invalidateCachePattern`
- **Function:** `invalidateCachePattern`
- **File:** `./shared/services/cacheService.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `pattern`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/utils/audit.js`

### `logAction`
- **Function:** `logAction`
- **File:** `./shared/utils/audit.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `actorId, action, tableName = null, recordId = null, oldJson = null, newJson = null`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./shared/utils/currency.js`

### `formatRupees`
- **Function:** `formatRupees`
- **File:** `./shared/utils/currency.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `paise`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `rupeesToPaise`
- **Function:** `rupeesToPaise`
- **File:** `./shared/utils/currency.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `rupees`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `paiseToRupees`
- **Function:** `paiseToRupees`
- **File:** `./shared/utils/currency.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `paise`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./temp_migrate.js`

### `run`
- **Function:** `run`
- **File:** `./temp_migrate.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./testCreateSale.js`

### `test`
- **Function:** `test`
- **File:** `./testCreateSale.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./testGetStock.js`

### `test`
- **Function:** `test`
- **File:** `./testGetStock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./testMapping.js`

### `test`
- **Function:** `test`
- **File:** `./testMapping.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./tests/dashboard_filter_kpi.test.js`

### `runTests`
- **Function:** `runTests`
- **File:** `./tests/dashboard_filter_kpi.test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./tests/dashboard_stock_kpi.test.js`

### `runTests`
- **Function:** `runTests`
- **File:** `./tests/dashboard_stock_kpi.test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./tests/low_stock.test.js`

### `runTests`
- **Function:** `runTests`
- **File:** `./tests/low_stock.test.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./testStockQuery.js`

### `test`
- **Function:** `test`
- **File:** `./testStockQuery.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_add_attendance.js`

### `test`
- **Function:** `test`
- **File:** `./test_add_attendance.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_api.js`

### `runTests`
- **Function:** `runTests`
- **File:** `./test_api.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_auth_flow.js`

### `request`
- **Function:** `request`
- **File:** `./test_auth_flow.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, method = 'GET', data = null, token = null`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runTests`
- **Function:** `runTests`
- **File:** `./test_auth_flow.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_constraints.js`

### `run`
- **Function:** `run`
- **File:** `./test_constraints.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_create_fetch.js`

### `testCreateFetch`
- **Function:** `testCreateFetch`
- **File:** `./test_create_fetch.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_customer_endpoint.js`

### `assert`
- **Function:** `assert`
- **File:** `./test_customer_endpoint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `condition, testName`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `makeRequest`
- **Function:** `makeRequest`
- **File:** `./test_customer_endpoint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, cookie`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `setup`
- **Function:** `setup`
- **File:** `./test_customer_endpoint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `teardown`
- **Function:** `teardown`
- **File:** `./test_customer_endpoint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runTests`
- **Function:** `runTests`
- **File:** `./test_customer_endpoint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_db.js`

### `f`
- **Function:** `f`
- **File:** `./test_db.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_db2.js`

### `run`
- **Function:** `run`
- **File:** `./test_db2.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_fk.js`

### `run`
- **Function:** `run`
- **File:** `./test_fk.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_hardening_auth.js`

### `api`
- **Function:** `api`
- **File:** `./test_hardening_auth.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, method = 'GET', body = null, cookie = ''`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runHardening`
- **Function:** `runHardening`
- **File:** `./test_hardening_auth.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_http_stats.js`

### `testHttpStats`
- **Function:** `testHttpStats`
- **File:** `./test_http_stats.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_http_stock.js`

### `testHttpStock`
- **Function:** `testHttpStock`
- **File:** `./test_http_stock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_isolation.js`

### `extractEntities`
- **Function:** `extractEntities`
- **File:** `./test_isolation.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `apiCall`
- **Function:** `apiCall`
- **File:** `./test_isolation.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, payload, token`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runRegressionTests`
- **Function:** `runRegressionTests`
- **File:** `./test_isolation.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_master.js`

### `testMaster`
- **Function:** `testMaster`
- **File:** `./test_master.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_master_e2e.js`

### `api`
- **Function:** `api`
- **File:** `./test_master_e2e.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, method = 'GET', body = null`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runMasterE2E`
- **Function:** `runMasterE2E`
- **File:** `./test_master_e2e.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_master_evidence.js`

### `api`
- **Function:** `api`
- **File:** `./test_master_evidence.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, method = 'GET', body = null, cookie = ''`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runEvidence`
- **Function:** `runEvidence`
- **File:** `./test_master_evidence.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_notif.js`

### `query`
- **Function:** `query`
- **File:** `./test_notif.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `text, params`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `apiRequest`
- **Function:** `apiRequest`
- **File:** `./test_notif.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, body, cookie = ''`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runTest`
- **Function:** `runTest`
- **File:** `./test_notif.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_paan.js`

### `apiCall`
- **Function:** `apiCall`
- **File:** `./test_paan.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `method, path, payload, token`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `extractEntities`
- **Function:** `extractEntities`
- **File:** `./test_paan.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `res`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./test_paan.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_password_reset.js`

### `assert`
- **Function:** `assert`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `condition, testName`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `setup`
- **Function:** `setup`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `teardown`
- **Function:** `teardown`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `testTokenGeneration`
- **Function:** `testTokenGeneration`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `testDelivery`
- **Function:** `testDelivery`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `testValidation`
- **Function:** `testValidation`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `testPasswordUpdate`
- **Function:** `testPasswordUpdate`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `testEdgeCases`
- **Function:** `testEdgeCases`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `run`
- **Function:** `run`
- **File:** `./test_password_reset.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_products.js`

### `test`
- **Function:** `test`
- **File:** `./test_products.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_qa_suite.js`

### `request`
- **Function:** `request`
- **File:** `./test_qa_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, method = 'GET', data = null, token = null`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `runTests`
- **Function:** `runTests`
- **File:** `./test_qa_suite.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_reset_http.js`

### `request`
- **Function:** `request`
- **File:** `./test_reset_http.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `path, method, body`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_restore.js`

### `testRestore`
- **Function:** `testRestore`
- **File:** `./test_restore.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_schema.js`

### `run`
- **Function:** `run`
- **File:** `./test_schema.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_schema2.js`

### `run`
- **Function:** `run`
- **File:** `./test_schema2.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_stats_endpoint.js`

### `testEndpoint`
- **Function:** `testEndpoint`
- **File:** `./test_stats_endpoint.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_stock.js`

### `testStock`
- **Function:** `testStock`
- **File:** `./test_stock.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_stock_entries.js`

### `checkStockEntries`
- **Function:** `checkStockEntries`
- **File:** `./test_stock_entries.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_toggle.js`

### `runTest`
- **Function:** `runTest`
- **File:** `./test_toggle.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./test_upsert.js`

### `testUpsert`
- **Function:** `testUpsert`
- **File:** `./test_upsert.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./update_master.js`

### `run`
- **Function:** `run`
- **File:** `./update_master.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `./verify.js`

### `run`
- **Function:** `run`
- **File:** `./verify.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/admin/backups/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/admin/backups/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/attendance/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/attendance/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/change-password/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/change-password/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/data-management/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/data-management/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/layout.jsx`

### `RootLayout`
- **Function:** `RootLayout`
- **File:** `../frontend/src/app/layout.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ children }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/login/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/login/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/login-activity/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/login-activity/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/master/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/master/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/notifications/page.jsx`

### `NotificationsPage`
- **Function:** `NotificationsPage`
- **File:** `../frontend/src/app/notifications/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/products/page.jsx`

### `ProductsPage`
- **Function:** `ProductsPage`
- **File:** `../frontend/src/app/products/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/reports/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/reports/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/reset-password/[token]/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/reset-password/[token]/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/sales/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/sales/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/settings/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/settings/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/stock/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/stock/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/user/attendance/page.jsx`

### `UserAttendancePage`
- **Function:** `UserAttendancePage`
- **File:** `../frontend/src/app/user/attendance/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/user/layout.jsx`

### `Layout`
- **Function:** `Layout`
- **File:** `../frontend/src/app/user/layout.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ children }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/user/sales/page.jsx`

### `UserSalesPage`
- **Function:** `UserSalesPage`
- **File:** `../frontend/src/app/user/sales/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/user/settings/page.jsx`

### `UserSettingsPage`
- **Function:** `UserSettingsPage`
- **File:** `../frontend/src/app/user/settings/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/user/stock/page.jsx`

### `UserStockPage`
- **Function:** `UserStockPage`
- **File:** `../frontend/src/app/user/stock/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/app/users/page.jsx`

### `Page`
- **Function:** `Page`
- **File:** `../frontend/src/app/users/page.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/components/AddSaleModal.jsx`

### `AddSaleModal`
- **Function:** `AddSaleModal`
- **File:** `../frontend/src/components/AddSaleModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ onClose }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleItemChange`
- **Function:** `handleItemChange`
- **File:** `../frontend/src/components/AddSaleModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `index, field, value`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `addItem`
- **Function:** `addItem`
- **File:** `../frontend/src/components/AddSaleModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `removeItem`
- **Function:** `removeItem`
- **File:** `../frontend/src/components/AddSaleModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `index`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `onSubmit`
- **Function:** `onSubmit`
- **File:** `../frontend/src/components/AddSaleModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/components/AddStockModal.jsx`

### `AddStockModal`
- **Function:** `AddStockModal`
- **File:** `../frontend/src/components/AddStockModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ onClose }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `onSubmit`
- **Function:** `onSubmit`
- **File:** `../frontend/src/components/AddStockModal.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/components/EmptyState.jsx`

### `EmptyState`
- **Function:** `EmptyState`
- **File:** `../frontend/src/components/EmptyState.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ title, message, icon }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/components/Layout.jsx`

### `Layout`
- **Function:** `Layout`
- **File:** `../frontend/src/components/Layout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ children }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleLogout`
- **Function:** `handleLogout`
- **File:** `../frontend/src/components/Layout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/components/UserLayout.jsx`

### `UserLayout`
- **Function:** `UserLayout`
- **File:** `../frontend/src/components/UserLayout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ children }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `fetchNotifications`
- **Function:** `fetchNotifications`
- **File:** `../frontend/src/components/UserLayout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleLogout`
- **Function:** `handleLogout`
- **File:** `../frontend/src/components/UserLayout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleNotifClick`
- **Function:** `handleNotifClick`
- **File:** `../frontend/src/components/UserLayout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAllRead`
- **Function:** `markAllRead`
- **File:** `../frontend/src/components/UserLayout.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/context/AuthContext.jsx`

### `AuthProvider`
- **Function:** `AuthProvider`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ children }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `verifySession`
- **Function:** `verifySession`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `login`
- **Function:** `login`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `email, password`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `logout`
- **Function:** `logout`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `forgotPassword`
- **Function:** `forgotPassword`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `email`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `resetPassword`
- **Function:** `resetPassword`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `token, newPassword`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `useAuth`
- **Function:** `useAuth`
- **File:** `../frontend/src/context/AuthContext.jsx`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/hooks/useDebounce.js`

### `useDebounce`
- **Function:** `useDebounce`
- **File:** `../frontend/src/hooks/useDebounce.js`
- **Type:** `Hook`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `value, delay`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/hooks/usePermissions.js`

### `usePermissions`
- **Function:** `usePermissions`
- **File:** `../frontend/src/hooks/usePermissions.js`
- **Type:** `Hook`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/AdminBackupCenter.jsx`

### `AdminBackupCenter`
- **Function:** `AdminBackupCenter`
- **File:** `../frontend/src/screens/AdminBackupCenter.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleGenerate`
- **Function:** `handleGenerate`
- **File:** `../frontend/src/screens/AdminBackupCenter.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `cloud = false`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleFileSelect`
- **Function:** `handleFileSelect`
- **File:** `../frontend/src/screens/AdminBackupCenter.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `executeRestore`
- **Function:** `executeRestore`
- **File:** `../frontend/src/screens/AdminBackupCenter.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Attendance.jsx`

### `Attendance`
- **Function:** `Attendance`
- **File:** `../frontend/src/screens/Attendance.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ showOnlyMyAttendance = false }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/ChangePassword.jsx`

### `ChangePassword`
- **Function:** `ChangePassword`
- **File:** `../frontend/src/screens/ChangePassword.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSubmit`
- **Function:** `handleSubmit`
- **File:** `../frontend/src/screens/ChangePassword.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Dashboard.jsx`

### `AdminMetricCard`
- **Function:** `AdminMetricCard`
- **File:** `../frontend/src/screens/Dashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ icon: Icon, title, value, color, subtitle }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `DashboardInner`
- **Function:** `DashboardInner`
- **File:** `../frontend/src/screens/Dashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `Dashboard`
- **Function:** `Dashboard`
- **File:** `../frontend/src/screens/Dashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/DataManagement.jsx`

### `DataManagement`
- **Function:** `DataManagement`
- **File:** `../frontend/src/screens/DataManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleRestore`
- **Function:** `handleRestore`
- **File:** `../frontend/src/screens/DataManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `type, id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleImport`
- **Function:** `handleImport`
- **File:** `../frontend/src/screens/DataManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `openConfirm`
- **Function:** `openConfirm`
- **File:** `../frontend/src/screens/DataManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `action`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleConfirm`
- **Function:** `handleConfirm`
- **File:** `../frontend/src/screens/DataManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Login.jsx`

### `Login`
- **Function:** `Login`
- **File:** `../frontend/src/screens/Login.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `tick`
- **Function:** `tick`
- **File:** `../frontend/src/screens/Login.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleVisibilityChange`
- **Function:** `handleVisibilityChange`
- **File:** `../frontend/src/screens/Login.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleLoginSubmit`
- **Function:** `handleLoginSubmit`
- **File:** `../frontend/src/screens/Login.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleForgotSubmit`
- **Function:** `handleForgotSubmit`
- **File:** `../frontend/src/screens/Login.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/LoginActivity.jsx`

### `formatDate`
- **Function:** `formatDate`
- **File:** `../frontend/src/screens/LoginActivity.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `dt`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `LoginActivity`
- **Function:** `LoginActivity`
- **File:** `../frontend/src/screens/LoginActivity.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `load`
- **Function:** `load`
- **File:** `../frontend/src/screens/LoginActivity.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/MasterDashboard.jsx`

### `MasterDashboard`
- **Function:** `MasterDashboard`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleRow`
- **Function:** `toggleRow`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `loadData`
- **Function:** `loadData`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `isRefresh = false`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleCreateAdmin`
- **Function:** `handleCreateAdmin`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleResetPassword`
- **Function:** `handleResetPassword`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, isUserRow = false`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleToggleStatus`
- **Function:** `handleToggleStatus`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id, currentStatus`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `confirmDelete`
- **Function:** `confirmDelete`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleLogout`
- **Function:** `handleLogout`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSaveClubName`
- **Function:** `handleSaveClubName`
- **File:** `../frontend/src/screens/MasterDashboard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Notifications.jsx`

### `Notifications`
- **Function:** `Notifications`
- **File:** `../frontend/src/screens/Notifications.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `loadNotifications`
- **Function:** `loadNotifications`
- **File:** `../frontend/src/screens/Notifications.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAsRead`
- **Function:** `markAsRead`
- **File:** `../frontend/src/screens/Notifications.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `markAllAsRead`
- **Function:** `markAllAsRead`
- **File:** `../frontend/src/screens/Notifications.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/ProductManager.jsx`

### `AddProductModal`
- **Function:** `AddProductModal`
- **File:** `../frontend/src/screens/ProductManager.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ onClose }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSubmit`
- **Function:** `handleSubmit`
- **File:** `../frontend/src/screens/ProductManager.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `EditableRow`
- **Function:** `EditableRow`
- **File:** `../frontend/src/screens/ProductManager.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ item, onUpdate }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSave`
- **Function:** `handleSave`
- **File:** `../frontend/src/screens/ProductManager.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleToggle`
- **Function:** `handleToggle`
- **File:** `../frontend/src/screens/ProductManager.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `ProductManager`
- **Function:** `ProductManager`
- **File:** `../frontend/src/screens/ProductManager.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Reports.jsx`

### `Reports`
- **Function:** `Reports`
- **File:** `../frontend/src/screens/Reports.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleExport`
- **Function:** `handleExport`
- **File:** `../frontend/src/screens/Reports.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `type`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/ResetPassword.jsx`

### `ResetPassword`
- **Function:** `ResetPassword`
- **File:** `../frontend/src/screens/ResetPassword.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `validatePassword`
- **Function:** `validatePassword`
- **File:** `../frontend/src/screens/ResetPassword.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `pass`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleResetSubmit`
- **Function:** `handleResetSubmit`
- **File:** `../frontend/src/screens/ResetPassword.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Sales.jsx`

### `SaleRow`
- **Function:** `SaleRow`
- **File:** `../frontend/src/screens/Sales.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ sale, onDelete }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `Sales`
- **Function:** `Sales`
- **File:** `../frontend/src/screens/Sales.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ showOnlyMySales = false, autoOpenAdd = false }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Settings.jsx`

### `Settings`
- **Function:** `Settings`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ userOnly = false }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `updateTimer`
- **Function:** `updateTimer`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleVisibilityChange`
- **Function:** `handleVisibilityChange`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleRequestOtp`
- **Function:** `handleRequestOtp`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleConfirmReset`
- **Function:** `handleConfirmReset`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleChangePassword`
- **Function:** `handleChangePassword`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSaveClubName`
- **Function:** `handleSaveClubName`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSaveConfig`
- **Function:** `handleSaveConfig`
- **File:** `../frontend/src/screens/Settings.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/SetupWizard.jsx`

### `SetupWizard`
- **Function:** `SetupWizard`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ onComplete }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `completeSetup`
- **Function:** `completeSetup`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleStep0`
- **Function:** `handleStep0`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleStep1`
- **Function:** `handleStep1`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleStep2`
- **Function:** `handleStep2`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleStep3`
- **Function:** `handleStep3`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleStep4`
- **Function:** `handleStep4`
- **File:** `../frontend/src/screens/SetupWizard.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/Stock.jsx`

### `handleQtyChange`
- **Function:** `handleQtyChange`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `saveQty`
- **Function:** `saveQty`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleBlur`
- **Function:** `handleBlur`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleKeyDown`
- **Function:** `handleKeyDown`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `increment`
- **Function:** `increment`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `decrement`
- **Function:** `decrement`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `Stock`
- **Function:** `Stock`
- **File:** `../frontend/src/screens/Stock.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ readOnly = false }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/screens/UserManagement.jsx`

### `RoleBadge`
- **Function:** `RoleBadge`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ role }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `ChangePasswordModal`
- **Function:** `ChangePasswordModal`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ targetUser, onClose }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleSubmit`
- **Function:** `handleSubmit`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `UserManagement`
- **Function:** `UserManagement`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `toggleReveal`
- **Function:** `toggleReveal`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleCreateUser`
- **Function:** `handleCreateUser`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `e`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `startEdit`
- **Function:** `startEdit`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `u`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `saveRole`
- **Function:** `saveRole`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `id`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `handleDelete`
- **Function:** `handleDelete`
- **File:** `../frontend/src/screens/UserManagement.jsx`
- **Type:** `React Component`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `u`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/services/firebase.js`

### `signInWithGoogle`
- **Function:** `signInWithGoogle`
- **File:** `../frontend/src/services/firebase.js`
- **Type:** `Service`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/store/useStore.js`

### `extract`
- **Function:** `extract`
- **File:** `../frontend/src/store/useStore.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `response`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `getErrorMsg`
- **Function:** `getErrorMsg`
- **File:** `../frontend/src/store/useStore.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `error, defaultMsg`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/utils/adminHelper.js`

### `isAdminEmail`
- **Function:** `isAdminEmail`
- **File:** `../frontend/src/utils/adminHelper.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `email`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/utils/currency.js`

### `formatRupees`
- **Function:** `formatRupees`
- **File:** `../frontend/src/utils/currency.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `paise`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `rupeesToPaise`
- **Function:** `rupeesToPaise`
- **File:** `../frontend/src/utils/currency.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `rupees`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `paiseToRupees`
- **Function:** `paiseToRupees`
- **File:** `../frontend/src/utils/currency.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `paise`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

## File: `frontend/src/utils/routerShim.js`

### `Navigate`
- **Function:** `Navigate`
- **File:** `../frontend/src/utils/routerShim.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ to, replace }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `useNavigate`
- **Function:** `useNavigate`
- **File:** `../frontend/src/utils/routerShim.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `useParams`
- **Function:** `useParams`
- **File:** `../frontend/src/utils/routerShim.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `useSearchParams`
- **Function:** `useSearchParams`
- **File:** `../frontend/src/utils/routerShim.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `none`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]

### `NavLink`
- **Function:** `NavLink`
- **File:** `../frontend/src/utils/routerShim.js`
- **Type:** `Utility`
- **Purpose:** [NEEDS CLARIFICATION]
- **Parameters:** `{ href, children, className, onClick }`
- **Returns:** [NEEDS CLARIFICATION]
- **Side effects:** [NEEDS CLARIFICATION]
- **Calls:** [NEEDS CLARIFICATION]
- **Called by:** [NEEDS CLARIFICATION]



---

# Section 5 — Business Flow Documentation

## FLOW 1: User login
─────────
**Trigger:** User enters username and password in the `/login` screen and clicks submit.
**Frontend:** `Login.jsx` → `handleSubmit()` → API call to `POST /api/auth/login` with payload `{ identifier, password }`
**Middleware:** `rateLimiter` (prevents brute force)
**Controller:** `login` in `backend/features/auth/auth.controller.js`
**Validation:** Validates that `identifier` and `password` are strings and not empty.
**Service:** `login` in `backend/features/auth/auth.service.js` which finds the user, verifies the password using bcrypt, and generates a session.
**Database:**
```sql
SELECT * FROM users WHERE username = $1 OR email = $2
INSERT INTO sessions (user_id, token_hash, expires_at, device_info) VALUES (...)
```
**Response:** `200 OK` with `{ message: "Login successful", user: { id, username, role, ... } }` and sets a HTTP-only cookie with the session ID.
**UI update:** Redirects to `/dashboard`.
**Error paths:** 
- Invalid credentials → 401 Unauthorized
- Missing fields → 400 Bad Request

## FLOW 2: Password reset
─────────
**Trigger:** User clicks "Forgot Password", enters email, and submits.
**Frontend:** `ResetPassword.jsx` → `requestReset()` → API call to `POST /api/auth/reset-password-request` with payload `{ identifier }`
**Middleware:** None specific
**Controller:** `requestPasswordReset` in `auth.controller.js`
**Validation:** Validates `identifier` exists.
**Service:** `requestPasswordReset` in `auth.service.js` generates a token and sends an email.
**Database:**
```sql
SELECT * FROM users WHERE email = $1 OR username = $2
UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3
```
**Response:** `200 OK` with `{ message: "If an account exists, a reset link has been sent" }`
**UI update:** Shows success toast to the user.
**Error paths:** Invalid email format → 400 Bad Request

## FLOW 3: OTP verification
─────────
**Trigger:** User enters OTP received in email to confirm an action.
**Frontend:** Currently not actively enforced in the main UI flow based on previous inspection, but endpoints exist for `verify-otp`.
**Middleware:** [NEEDS CLARIFICATION]
**Controller:** [NEEDS CLARIFICATION]
**Validation:** [NEEDS CLARIFICATION]
**Service:** [NEEDS CLARIFICATION]
**Database:** [NEEDS CLARIFICATION]
**Response:** [NEEDS CLARIFICATION]
**UI update:** [NEEDS CLARIFICATION]
**Error paths:** [NEEDS CLARIFICATION]

## FLOW 4: Add a product with variants/flavours
─────────
**Trigger:** User clicks "Add Product" in Product Manager, fills out base details and multiple variants, and clicks "Save".
**Frontend:** `ProductManager.jsx` → `handleAddProduct()` → `useStore.addProduct()` → API call to `POST /api/products` with `{ name, sku, categoryId, unit, variants: [{ flavor, vp, sp }] }`
**Middleware:** `requireAuth`
**Controller:** `createProduct` in `products.controller.js`
**Validation:** Zod schema validation in `products.validation.js` checks base product fields and ensures variants array has valid `flavor`, `vp`, `sp`.
**Service:** `createProduct` in `products.service.js` creates the product family and iterates through variants to create them.
**Database:**
```sql
INSERT INTO products (name, sku, category_id, unit, owner_id) VALUES (...) RETURNING id
INSERT INTO product_versions (product_id, version_label, owner_id) VALUES (...) RETURNING id
INSERT INTO variants (product_version_id, name, owner_id) VALUES (...) RETURNING id
INSERT INTO inventory_items (variant_id, owner_id) VALUES (...) RETURNING id
```
**Response:** `201 Created` with the full nested product object.
**UI update:** Modal closes, table refreshes with new product and its rows.
**Error paths:** Duplicate name/flavor → 400 Bad Request

## FLOW 5: Add stock to a specific variant
─────────
**Trigger:** User clicks "Add Stock" in Stock Manager, selects a specific flavor, enters quantity and price, and submits.
**Frontend:** `AddStockModal.jsx` → `handleAddStock()` → API call to `POST /api/stock` with payload `{ variantId, quantity, purchasePrice }`
**Middleware:** `requireAuth`, `requireAdmin`
**Controller:** `addStock` in `stock.controller.js`
**Validation:** Validates `variantId` is UUID/int, `quantity > 0`.
**Service:** `addStock` in `stock.service.js` registers a stock entry and upserts the total quantity.
**Database:**
```sql
INSERT INTO stock_entries (variant_id, quantity, purchase_price, owner_id) VALUES (...)
UPDATE stock SET qty = qty + $1 WHERE variant_id = $2 AND owner_id = $3
```
**Response:** `200 OK` with updated stock quantity.
**UI update:** Stock list re-fetches and shows updated total.
**Error paths:** Invalid variant → 404 Not Found

## FLOW 6: Record a sale (with stock deduction)
─────────
**Trigger:** User adds items to cart in Sales screen and completes checkout.
**Frontend:** `AddSaleModal.jsx` → `handleCheckout()` → API call to `POST /api/sales` with `{ customer, items: [{ variantId, qty, salePrice }] }`
**Middleware:** `requireAuth`
**Controller:** `createSale` in `sales.controller.js`
**Validation:** Checks customer name and that `items` array has valid variants and quantities.
**Service:** `createSale` in `sales.service.js` validates sufficient stock, records sale, records sale items, and deducts stock.
**Database:**
```sql
SELECT qty FROM stock WHERE variant_id = $1 AND owner_id = $2
INSERT INTO sales (customer, total_amount, owner_id) VALUES (...) RETURNING id
INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, owner_id) VALUES (...)
UPDATE stock SET qty = qty - $1 WHERE variant_id = $2 AND owner_id = $3
```
**Response:** `200 OK` with sale details.
**UI update:** Cart clears, sales table updates, stock diminishes.
**Error paths:** Insufficient stock → 400 Bad Request

## FLOW 7: Record attendance
─────────
**Trigger:** User marks attendance and shake/afresh consumption.
**Frontend:** `Attendance.jsx` → `handleMarkAttendance()` → API call `POST /api/attendance`
**Middleware:** `requireAuth`
**Controller:** `recordAttendance` in `attendance.controller.js`
**Validation:** Checks status and consumption amounts.
**Service:** `recordAttendance` in `attendance.service.js`
**Database:**
```sql
INSERT INTO attendance (name, status, shake_profit, date, owner_id) VALUES (...)
```
**Response:** `200 OK` with recorded entry.
**UI update:** Table reflects new attendance row.
**Error paths:** Missing name → 400 Bad Request

## FLOW 8: Dashboard load (all KPI calculations)
─────────
**Trigger:** User navigates to `/dashboard`.
**Frontend:** `Dashboard.jsx` → `useEffect` → API call `GET /api/dashboard/stats`
**Middleware:** `requireAuth`
**Controller:** `getDashboardStats` in `dashboard.controller.js`
**Validation:** Parses date range query parameters.
**Service:** `getDashboardStats` in `dashboard.service.js` aggregates data from Sales, Attendance, and Stock.
**Database:**
```sql
SELECT SUM(total_amount) FROM sales WHERE owner_id = $1
SELECT SUM(shake_profit) FROM attendance WHERE owner_id = $1
SELECT SUM(qty * vendor_price) FROM stock JOIN variants... WHERE owner_id = $1
```
**Response:** `200 OK` with `{ totals: {...}, charts: {...} }`
**UI update:** KPI cards and charts render with fetched data.
**Error paths:** Database timeout → 500 Internal Server Error

## FLOW 9: Low-stock alert trigger
─────────
**Trigger:** Dashboard loads or Notification polling fires.
**Frontend:** `Dashboard.jsx` or `Notifications.jsx` calls `GET /api/inventory/low-stock`
**Middleware:** `requireAuth`
**Controller:** `getLowStock` in `inventory.controller.js`
**Validation:** None specific.
**Service:** `getLowStockItems` queries items below a predefined threshold.
**Database:**
```sql
SELECT * FROM stock JOIN variants ON stock.variant_id = variants.id WHERE stock.qty <= $1 AND owner_id = $2
```
**Response:** `200 OK` with array of low stock items.
**UI update:** Renders alert badges or list of items to restock.
**Error paths:** 500 Internal Server Error

## FLOW 10: Backup creation and restore
─────────
**Trigger:** Admin clicks "Create Backup" in Settings/Backup page.
**Frontend:** `Backup.jsx` → API call `POST /api/backup/create`
**Middleware:** `requireAuth`, `requireAdmin`
**Controller:** `createBackup` in `backup.controller.js`
**Validation:** Verifies admin role.
**Service:** `createBackup` in `backup.service.js` runs `pg_dump` and optionally uploads to Google Drive.
**Database:**
```bash
pg_dump -U user -d db > backup.sql
```
```sql
INSERT INTO backup_logs (owner_id, file_name, status) VALUES (...)
```
**Response:** `200 OK` with download link.
**UI update:** Table shows new backup entry.
**Error paths:** pg_dump fails → 500 Internal Server Error

## FLOW 11: Tenant isolation enforcement
─────────
**Trigger:** Any request made to an authenticated endpoint.
**Frontend:** Browser sends HTTP-only session cookie.
**Middleware:** `auth.js` middleware extracts cookie, queries `sessions` table.
**Controller/Service:**
1. `sessions` table returns `user_id`.
2. `users` table is queried for `user_id`, retrieving `owner_id`.
3. `req.user = { id, role, owner_id }` is attached to the request.
**Database queries:** Every single `SELECT`, `UPDATE`, `DELETE`, and `INSERT` in the application explicitly appends `WHERE owner_id = req.user.owner_id` or inserts `owner_id`. This guarantees cross-tenant data bleeding is impossible.
**Response:** Only data scoped to that `owner_id` is returned.
**Error paths:** Missing cookie or invalid session → 401 Unauthorized


---

# Section 6 — Frontend Component Reference

### Component: `Page`
- **File:** `frontend/src/app/admin/backups/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/attendance/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/change-password/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/data-management/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `RootLayout`
- **File:** `frontend/src/app/layout.jsx`
- **Type:** `Layout`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ children }`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/login/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/login-activity/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/master/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `NotificationsPage`
- **File:** `frontend/src/app/notifications/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `ProductsPage`
- **File:** `frontend/src/app/products/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/reports/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/reset-password/[token]/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/sales/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/settings/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/stock/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `UserAttendancePage`
- **File:** `frontend/src/app/user/attendance/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Layout`
- **File:** `frontend/src/app/user/layout.jsx`
- **Type:** `Layout`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ children }`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `UserSalesPage`
- **File:** `frontend/src/app/user/sales/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `UserSettingsPage`
- **File:** `frontend/src/app/user/settings/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `UserStockPage`
- **File:** `frontend/src/app/user/stock/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Page`
- **File:** `frontend/src/app/users/page.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AddSaleModal`
- **File:** `frontend/src/components/AddSaleModal.jsx`
- **Type:** `Modal`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ onClose }`
- **State:** customerInput, date, items, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AddStockModal`
- **File:** `frontend/src/components/AddStockModal.jsx`
- **Type:** `Modal`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ onClose }`
- **State:** selectedInventoryId, qty, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `EmptyState`
- **File:** `frontend/src/components/EmptyState.jsx`
- **Type:** `Widget`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ title, message, icon }`
- **State:** none
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Layout`
- **File:** `frontend/src/components/Layout.jsx`
- **Type:** `Layout`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ children }`
- **State:** sidebarOpen, showSaleModal, showStockModal, fabOpen
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `UserLayout`
- **File:** `frontend/src/components/UserLayout.jsx`
- **Type:** `Layout`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ children }`
- **State:** notifications, showNotifications
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AuthProvider`
- **File:** `frontend/src/context/AuthContext.jsx`
- **Type:** `Widget`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ children }`
- **State:** user, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AdminBackupCenter`
- **File:** `frontend/src/screens/AdminBackupCenter.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** backupType, backupFormat, restoreFile, restoreValidation, restoreStrategy
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AttendanceRecord`
- **File:** `frontend/src/screens/Attendance.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ record, canDelete, onDelete }`
- **State:** date, customerInput, shakeProfit, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Attendance`
- **File:** `frontend/src/screens/Attendance.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ showOnlyMyAttendance = false }`
- **State:** date, customerInput, shakeProfit, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `ChangePassword`
- **File:** `frontend/src/screens/ChangePassword.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** newPassword, confirmPassword, showPassword, showConfirmPassword, error, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AdminMetricCard`
- **File:** `frontend/src/screens/Dashboard.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ icon: Icon, title, value, color, subtitle }`
- **State:** dateRange, customStart, customEnd
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `DashboardInner`
- **File:** `frontend/src/screens/Dashboard.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** dateRange, customStart, customEnd
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Dashboard`
- **File:** `frontend/src/screens/Dashboard.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** dateRange, customStart, customEnd
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `DataManagement`
- **File:** `frontend/src/screens/DataManagement.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** monthFilterAtt, monthFilterSales, showConfirm, confirmAction, isDeleting, confirmText, restoringId, importType, importFile, isImporting
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Login`
- **File:** `frontend/src/screens/Login.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** step, email, password, showPassword, loading, errorMsg, successMsg, lockoutUntil, displaySecs, savedClubName
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `LoginActivity`
- **File:** `frontend/src/screens/LoginActivity.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** history, loading, filter
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `MasterDashboard`
- **File:** `frontend/src/screens/MasterDashboard.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** stats, adminsList, liveSessions, activityLog, loading, activeTab, logFilterAction, logFilterAdmin, deleteTarget, expandedRows, newAdminEmail, refreshing, msg, error, editingClubId, editClubName
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Notifications`
- **File:** `frontend/src/screens/Notifications.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** notifications, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `AddProductModal`
- **File:** `frontend/src/screens/ProductManager.jsx`
- **Type:** `Modal`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ onClose }`
- **State:** loading, form, isEditing, editData, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `EditableRow`
- **File:** `frontend/src/screens/ProductManager.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ item, onUpdate }`
- **State:** loading, form, isEditing, editData, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `ProductManager`
- **File:** `frontend/src/screens/ProductManager.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** loading, form, isEditing, editData, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Reports`
- **File:** `frontend/src/screens/Reports.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** isExporting, timeRange
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `ResetPassword`
- **File:** `frontend/src/screens/ResetPassword.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** newPassword, confirmPassword, showPassword, showConfirmPassword, loading, errorMsg, successMsg
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `SaleRow`
- **File:** `frontend/src/screens/Sales.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ sale, onDelete }`
- **State:** expanded, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Sales`
- **File:** `frontend/src/screens/Sales.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ showOnlyMySales = false, autoOpenAdd = false }`
- **State:** expanded, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Settings`
- **File:** `frontend/src/screens/Settings.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ userOnly = false }`
- **State:** activeTab, localClubName, clubNameSaving, clubNameError, shakeAmount, lowStockThresh, configSaving, oldPassword, newPassword, showOldPassword, showNewPassword, msg, err, resetStep, resetPassword, resetConfirmText, resetOtp, actualOtp, otpExpiresAt, clockSkew, otpSecondsLeft, resetModules
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `SetupWizard`
- **File:** `frontend/src/screens/SetupWizard.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ onComplete }`
- **State:** step, clubName, clubNameError, productName, vendorPrice, productId, shakeAmount, stockQty, memberName, memberPhone, staffEmail, staffPass, loading
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `StockRow`
- **File:** `frontend/src/screens/Stock.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ item, isAdmin, canEditStockQty, updateStockQuantity, deleteStock, readOnly }`
- **State:** tempQty, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `Stock`
- **File:** `frontend/src/screens/Stock.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ readOnly = false }`
- **State:** tempQty, search, showModal
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `RoleBadge`
- **File:** `frontend/src/screens/UserManagement.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ role }`
- **State:** newPassword, showPassword, editingId, editRole, passwordModalUser, revealedPasswords, sessionPasswords, form, showPassword
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `ChangePasswordModal`
- **File:** `frontend/src/screens/UserManagement.jsx`
- **Type:** `Modal`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `{ targetUser, onClose }`
- **State:** newPassword, showPassword, editingId, editRole, passwordModalUser, revealedPasswords, sessionPasswords, form, showPassword
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

### Component: `UserManagement`
- **File:** `frontend/src/screens/UserManagement.jsx`
- **Type:** `Page`
- **Purpose:** [NEEDS CLARIFICATION]
- **Props:** `none`
- **State:** newPassword, showPassword, editingId, editRole, passwordModalUser, revealedPasswords, sessionPasswords, form, showPassword
- **API calls:** [NEEDS CLARIFICATION]
- **Children:** [NEEDS CLARIFICATION]
- **Parent:** [NEEDS CLARIFICATION]

## Routing Map

| Path | Component | Auth guard | Role guard |
|---|---|---|---|
| `/login` | `Login` | No | Public |
| `/dashboard` | `Dashboard` | Yes | Any authenticated |
| `/products` | `ProductManager` | Yes | Admin only |
| `/stock` | `Stock` | Yes | Admin only |
| `/sales` | `Sales` | Yes | Admin only |
| `/attendance` | `Attendance` | Yes | Admin only |
| `/reports` | `Reports` | Yes | Admin only |
| `/settings` | `Settings` | Yes | Admin only |
| `/data-management` | `DataManagement` | Yes | Admin only |


---

# Section 7 — Middleware & Auth Documentation

## 7.1 Middleware Execution Order

### Global Middleware (Executed on every request to `server.js`)
1. **`cors()`** — Permits cross-origin requests from the allowed frontend origin.
2. **`express.json()`** — Parses incoming JSON payloads.
3. **`express.urlencoded()`** — Parses URL-encoded data.
4. **`cookieParser()`** — Extracts cookies from incoming HTTP requests to make them accessible via `req.cookies`.

### Per-Route Middleware
Depending on the route, specific guards are applied:
1. **`requireAuth`** — Extracts `sessionId` from cookies. Validates the session exists in the DB and has not expired. Attaches `req.user`.
2. **`requireAdmin`** — Checks if `req.user.role === 'admin' || req.user.role === 'master'`.
3. **`requireMaster`** — Checks if `req.user.role === 'master'`.
4. **`rateLimiter`** — Limits repeated requests to public endpoints (like login).

*Example order for `POST /api/products`:*
`cors` -> `express.json` -> `cookieParser` -> `requireAuth` -> `requireAdmin` -> `createProductController`

---

## 7.2 Session Lifecycle

### Creation
- **Trigger:** Successful login via `POST /api/auth/login`.
- **File:** `backend/features/auth/auth.service.js` (inside `login` function).
- **Process:** Generates a secure random string (token). Hashes it (SHA-256) and stores the hash in the `sessions` table alongside `user_id`, `expires_at` (30 days), and `device_info`.
- **Response:** The raw token is sent back as an `HttpOnly` cookie named `sessionId`.

### Validation
- **Trigger:** Any API request protected by `requireAuth`.
- **File:** `backend/shared/middleware/auth.js`.
- **Process:** Reads `req.cookies.sessionId`. Hashes it and queries the `sessions` table.
  ```sql
  SELECT s.*, u.id as user_id, u.role, u.owner_id, u.status 
  FROM sessions s 
  JOIN users u ON s.user_id = u.id 
  WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.status = 'active'
  ```
- **Owner ID Attachment:** The joined `u.owner_id` is attached to `req.user = { id: u.user_id, role: u.role, owner_id: u.owner_id }`.

### Invalidation
- **Trigger:** User clicks logout (`POST /api/auth/logout`) or changes password.
- **File:** `auth.controller.js` and `auth.service.js`.
- **Process:** Deletes the specific session from the database. Clears the `sessionId` cookie from the browser.

### Expiry
- Sessions have an `expires_at` field. `requireAuth` explicitly checks `s.expires_at > NOW()`. If expired, the middleware returns `401 Unauthorized` and clears the cookie.

---

## 7.3 Role-Based Access Control Map

| Route | Method | Roles allowed | Middleware enforcing it |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | None |
| `/api/auth/logout` | `POST` | Any | `requireAuth` |
| `/api/auth/me` | `GET` | Any | `requireAuth` |
| `/api/products` | `GET` | Admin, Member | `requireAuth` |
| `/api/products` | `POST, PUT, DELETE` | Admin | `requireAuth`, `requireAdmin` |
| `/api/inventory/low-stock` | `GET` | Admin | `requireAuth`, `requireAdmin` |
| `/api/stock` | `GET` | Admin, Member | `requireAuth` |
| `/api/stock` | `POST` | Admin | `requireAuth`, `requireAdmin` |
| `/api/sales` | `POST` | Admin, Member | `requireAuth` |
| `/api/attendance` | `POST` | Admin, Member | `requireAuth` |
| `/api/reports/*` | `GET` | Admin | `requireAuth`, `requireAdmin` |
| `/api/master/*` | `GET, POST` | Master | `requireAuth`, `requireMaster` |

*(This is a summarized representative list as requested.)*

---

## 7.4 Tenant Isolation Enforcement

The Life Care System serves multiple independent clubs from a single database. Isolation is enforced at the database query level using the `owner_id` attached to `req.user`.

**Every single controller must append the tenant ID.**

**Files and Tables Enforced:**
- **Products:** `products.service.js` enforces `WHERE owner_id = $1` on `products`, `product_versions`, and `variants`.
- **Stock:** `stock.service.js` enforces `WHERE owner_id = $1` on `inventory_items`, `stock`, and `stock_entries`.
- **Sales:** `sales.service.js` enforces `WHERE owner_id = $1` on `sales` and `sale_items`.
- **Attendance:** `attendance.service.js` enforces `WHERE owner_id = $1` on `attendance`.
- **Dashboard:** `dashboard.service.js` scopes all `SUM()` and `COUNT()` aggregations by `owner_id`.
- **Reports:** `reports.service.js` ensures CSV exports only extract data for the requesting `owner_id`.

**Exception:** The Master Admin routes (`/api/master/*`) are designed to span across tenants. These routes deliberately omit the `owner_id` constraint but are protected by `requireMaster`.


---

# Section 8 — Known Issues & Resolution Log

## 8.1 Issues from the Production Readiness Report

| Finding Name | Original Severity | Current Status | Resolution Details | Regression Test Result |
|---|---|---|---|---|
| Variant-Based Inventory Isolation Bug | Critical | Resolved | Upgraded the architecture to isolate inventory at the `variant` level rather than the `product` family level. Replaced the flat `inventory_items` linking with direct `variant_id` linking in `stock` and `sales` tables. Modified `AddSaleModal.jsx` to only pull products with `stock > 0`. | Pass |
| Vendor Price Display Formatting | Low | Resolved | Fixed `AddSaleModal.jsx` and `ProductManager.jsx` by multiplying rupees by 100 before passing into `formatRupees(paise)` utility to correctly display prices. | Pass |
| Token / OTP Security Missing | High | Open | Need to implement robust OTP mechanisms for sensitive actions. | Not yet run |
| Rate Limiting on Login | Medium | Resolved | Implemented `rateLimiter` on `/api/auth/login` to prevent brute force attacks. | Pass |

---

## 8.2 Architectural Decisions

1. **Stateful HTTP-Only Cookie Sessions:**
   - **Decision:** Chose stateful PostgreSQL `sessions` over JWTs.
   - **Reasoning:** Immediate, server-side revocation is required for multi-device logout and immediate security lockouts (e.g., if a tenant owner dismisses a staff member, the token must be instantly invalid without waiting for a JWT expiry window).

2. **Tenant Isolation via `owner_id` Column:**
   - **Decision:** Used a shared-schema, multi-tenant model where every table has an `owner_id` column rather than separate database schemas.
   - **Reasoning:** Reduces operational overhead, makes schema migrations uniform, and allows the Master Dashboard to easily aggregate cross-club statistics.

3. **Variant-Level Stock Architecture:**
   - **Decision:** Shifted from treating "Products" as inventory items to treating "Product Variants (Flavors)" as distinct inventory entities.
   - **Reasoning:** A club might have 10 boxes of "Formula 1 | Choco" and 0 of "Formula 1 | Paan". Selling one must deduct from the exact flavor, not a generalized product pool.

4. **Currency Handling (Paise vs Rupees):**
   - **Decision:** The backend stores currency in INR (Rupees) as numeric floats or integers. The frontend standardizes formatting by converting everything to "Paise" before formatting it back out.
   - **Reasoning:** JavaScript float math is notoriously inaccurate (e.g., `0.1 + 0.2`). 

---

## 8.3 Known Workarounds

1. **Prisma vs raw `pg` Client:**
   - The codebase currently has both Prisma generated artifacts (`schema.prisma`) AND direct raw PostgreSQL queries via `pg` (`shared/db/connection.js`). The `.queries.js` files are a legacy pattern from before Prisma was fully adopted. *Action Item: Fully migrate raw SQL to Prisma.*

2. **Redundant Validation Layers:**
   - Some modules use Zod for validation while others still rely on manual `if (!req.body.name)` checks. *Action Item: Standardize entirely on Zod middleware.*

3. **Incomplete OTP Implementation:**
   - OTP logic is scaffolded but not strictly enforced across all destructive actions. *Action Item: Enforce OTP for password resets and sensitive deletions.*


---


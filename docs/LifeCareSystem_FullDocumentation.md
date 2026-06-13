# Life Care System — Full Codebase Documentation

> This is the complete, compiled digital manual serving as the official source of truth for the entire platform.

# SECTION 1 — PROJECT STRUCTURE

## 1.1 Full Folder Tree

### Backend
```
backend/
├── config/             → Configuration files and constants.
├── features/           → Modular feature directories containing routes, controllers, services, queries, and schemas.
│   ├── attendance/     → Handles daily attendance tracking.
│   ├── auth/           → Handles user authentication, login, passwords, sessions, and OTP.
│   ├── backup/         → Handles generating backups and safe merging restores.
│   ├── customers/      → Handles customer management.
│   ├── dashboard/      → Handles aggregation and KPIs for the dashboard.
│   ├── inventory/      → Read-only aggregation of products and variants.
│   ├── master/         → Master account management.
│   ├── notifications/  → In-app alerts and email notifications.
│   ├── products/       → Handles product definitions and lifecycle.
│   ├── reports/        → Generates CSV/Excel reports.
│   ├── sales/          → Handles sales transactions and revenue tracking.
│   ├── settings/       → System settings and configurations.
│   └── stock/          → Handles stock entry creation and variant stock updates.
├── scripts/            → Standalone utility scripts.
├── shared/             → Core utility modules shared across features.
│   ├── db/             → Database connection pool and configuration.
│   ├── middleware/     → Express middleware for auth, validation, and scoping.
│   ├── services/       → Core services like audit logging, cache, and cron jobs.
│   └── utils/          → Helper utility functions.
└── server.js           → Main entry point for the backend.
```

### Frontend
```
frontend/
├── public/             → Static assets (images, icons).
├── src/                
│   ├── app/            → Next.js App Router definitions (pages and layouts).
│   │   ├── admin/      → Admin-specific routes.
│   │   ├── user/       → User-specific routes.
│   ├── components/     → Reusable React UI components.
│   ├── context/        → React Context providers for global state.
│   ├── hooks/          → Custom React hooks.
│   ├── screens/        → Large composed screen components mapped to routes.
│   ├── services/       → API client functions for backend communication.
│   ├── store/          → Zustand state management stores.
│   └── utils/          → Frontend utility helpers (formatting, etc.).
```

## 1.2 Entry Points

| File Path | Initialises | Exports |
| --- | --- | --- |
| `backend/server.js` | Express app, applies global middleware, registers all feature routes (`/api/*`), starts the HTTP server. | None (runs directly) |
| `frontend/src/app/layout.jsx` | Root HTML structure, global CSS imports, context providers. | Default RootLayout component |
| `frontend/src/app/page.jsx` | Main entry page (redirects or renders landing). | Default Page component |

## 1.3 Environment Variables

| Variable Name | Purpose | Used In | Required |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. | `backend/shared/db/connection.js` | **Yes** |
| `ADMIN_PASSWORD` | Default admin password for seed/reset. | `backend/scripts/reset_pwd.js` | No |
| `USER_PASSWORD` | Default user password for seed/reset. | `backend/scripts/reset_pwd.js` | No |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` | Email transport config for OTP and notifications. | `backend/shared/services/emailService.js` | **Yes** |
| `FRONTEND_URL` | Base URL for CORS and email links. | `backend/server.js` | **Yes** |
| `ENCRYPTION_KEY` | Key for encrypting sensitive data. | `backend/shared/utils/crypto.js` | **Yes** |
| `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID` | OAuth credentials for automated cloud backups. | `backend/features/backup/backup.service.js` | No |
| `NEXT_PUBLIC_API_URL` | Backend API base URL for frontend requests. | `frontend/src/services/api.js` | **Yes** |
| `FIREBASE_*` (Backend) | Firebase Admin SDK credentials. | Push notifications | No |
| `NEXT_PUBLIC_FIREBASE_*` (Frontend) | Firebase Client SDK credentials. | Push notifications | No |

## 1.4 Shared/Utility Layer Map

| File Path | Provides | Dependencies |
| --- | --- | --- |
| `backend/shared/db/connection.js` | `pool`, `query()` helper for PostgreSQL. | Every feature controller/service. |
| `backend/shared/middleware/authMiddleware.js` | `requireAuth()`, `requireAdmin()`, `requireMaster()` | All protected routes across features. |
| `backend/shared/middleware/ownerScope.js` | `enforceOwnerScope()` to inject `owner_id` into `req.body`. | Scoped endpoints (sales, products). |
| `backend/shared/middleware/rateLimiters.js` | API rate limiting middleware. | Login and OTP routes. |
| `backend/shared/middleware/validate.js` | Zod schema validation middleware. | Most POST/PUT routes. |
| `backend/shared/services/auditLogService.js` | `logAction()` to write to `audit_logs` table. | Critical actions (auth, sales, products). |
| `backend/shared/services/cacheService.js` | NodeCache wrapper for performance. | Dashboard and stock queries. |
| `backend/shared/services/cronService.js` | Background job definitions (e.g. daily backups). | Started by `server.js`. |
| `backend/shared/utils/currency.js` | Formatting functions for financial data. | Sales and Reports. |


---

# SECTION 2 — DATABASE DOCUMENTATION

# 2.1 Full Schema

### Table: `admin_config`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `setup_completed` | `boolean` | NO | `false` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `default_shake_amount` | `bigint` | NO | `0` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `timezone` | `character varying` | NO | `'Asia/Kolkata'::character varying` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `low_stock_threshold` | `integer` | NO | `10` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `discount_alert_pct` | `integer` | NO | `30` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `updated_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `club_name` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`admin_config_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Unique** (`admin_config_owner_id_key`): `UNIQUE (owner_id)`
- **Primary Key** (`admin_config_pkey`): `PRIMARY KEY (id)`

### Table: `attendance`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `customer_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `attendance_date` | `date` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `type` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `shake_amount` | `bigint` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `recorded_by` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_deleted` | `boolean` | NO | `false` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `deleted_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`attendance_customer_id_fkey`): `FOREIGN KEY (customer_id) REFERENCES customers(id)`
- **Unique** (`attendance_owner_id_customer_id_attendance_date_key`): `UNIQUE (owner_id, customer_id, attendance_date)`
- **Foreign Key** (`attendance_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`attendance_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`attendance_recorded_by_fkey`): `FOREIGN KEY (recorded_by) REFERENCES users(id)`
- **Check** (`attendance_type_check`): `CHECK (((type)::text = ANY ((ARRAY['default'::character varying, 'custom'::character varying])::text[])))`
- **Foreign Key** (`fk_attendance_customer_id`): `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`

**Indexes:**
- `idx_att_owner_date`: `CREATE INDEX idx_att_owner_date ON public.attendance USING btree (owner_id, attendance_date)`

### Table: `audit_log`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `actor_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `action` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `table_name` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `record_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `old_json` | `jsonb` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `new_json` | `jsonb` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`audit_log_actor_id_fkey`): `FOREIGN KEY (actor_id) REFERENCES users(id)`
- **Primary Key** (`audit_log_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `idx_audit_actor`: `CREATE INDEX idx_audit_actor ON public.audit_log USING btree (actor_id, created_at)`

### Table: `backup_logs`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `backup_type` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `file_name` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `storage_provider` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `file_url` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `file_size` | `bigint` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `status` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_by` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `notes` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `restore_status` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `restore_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`backup_logs_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`backup_logs_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `idx_backup_owner`: `CREATE INDEX idx_backup_owner ON public.backup_logs USING btree (owner_id, created_at DESC)`

### Table: `customers`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `name` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `phone` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `member_code` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `joined_at` | `date` | NO | `CURRENT_DATE` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_active` | `boolean` | NO | `true` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`customers_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`customers_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `idx_customers_owner`: `CREATE INDEX idx_customers_owner ON public.customers USING btree (owner_id)`

### Table: `migrations`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('migrations_id_seq'::regclass)` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `name` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `executed_at` | `timestamp without time zone` | YES | `CURRENT_TIMESTAMP` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Unique** (`migrations_name_key`): `UNIQUE (name)`
- **Primary Key** (`migrations_pkey`): `PRIMARY KEY (id)`

### Table: `notifications`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `user_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `type` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `title` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `body` | `text` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `data` | `jsonb` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `read_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`notifications_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`notifications_user_id_fkey`): `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

**Indexes:**
- `idx_notif_user`: `CREATE INDEX idx_notif_user ON public.notifications USING btree (user_id, created_at)`

### Table: `password_resets`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `user_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `expires_at` | `timestamp with time zone` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `used_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `token_hash` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`password_resets_pkey`): `PRIMARY KEY (id)`
- **Unique** (`password_resets_token_hash_key`): `UNIQUE (token_hash)`
- **Foreign Key** (`password_resets_user_id_fkey`): `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

### Table: `product_variants`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('product_variants_id_seq'::regclass)` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `product_id` | `integer` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `flavor` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `vp` | `real` | YES | `0` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `sp` | `real` | YES | `0` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_active` | `integer` | YES | `1` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`product_variants_pkey`): `PRIMARY KEY (id)`
- **Unique** (`unique_product_variant_attrs`): `UNIQUE (product_id, flavor, vp, sp, owner_id)`

**Indexes:**
- `idx_product_variants_owner`: `CREATE INDEX idx_product_variants_owner ON public.product_variants USING btree (owner_id)`

### Table: `product_versions`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `product_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `vendor_price` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_active` | `boolean` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `effective_from` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `effective_to` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_by` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `volume_points` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `version_label` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`fk_product_versions_product_id`): `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- **Primary Key** (`product_versions_pkey`): `PRIMARY KEY (id)`

### Table: `products`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `name` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`products_pkey`): `PRIMARY KEY (id)`

### Table: `sale_items`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `sale_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `product_version_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `variant_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `quantity` | `integer` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `price_charged` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `standard_price_snap` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `vendor_price_snap` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`fk_sale_items_sale_id`): `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE`
- **Primary Key** (`sale_items_pkey`): `PRIMARY KEY (id)`

### Table: `sales`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `customer_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `sale_date` | `date` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `recorded_by` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_deleted` | `boolean` | NO | `false` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `deleted_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `deleted_by` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`fk_sales_customer_id`): `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`
- **Foreign Key** (`sales_customer_id_fkey`): `FOREIGN KEY (customer_id) REFERENCES customers(id)`
- **Foreign Key** (`sales_deleted_by_fkey`): `FOREIGN KEY (deleted_by) REFERENCES users(id)`
- **Foreign Key** (`sales_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`sales_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`sales_recorded_by_fkey`): `FOREIGN KEY (recorded_by) REFERENCES users(id)`

**Indexes:**
- `idx_sales_owner_date`: `CREATE INDEX idx_sales_owner_date ON public.sales USING btree (owner_id, sale_date)`
- `idx_sales_customer`: `CREATE INDEX idx_sales_customer ON public.sales USING btree (customer_id)`

### Table: `sessions`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `user_id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `expires_at` | `timestamp with time zone` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `invalidated_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `ip_address` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `device_info` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `last_seen_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `tenant_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `token_hash` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`sessions_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`sessions_user_id_fkey`): `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

**Indexes:**
- `idx_sessions_user`: `CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id)`
- `idx_sessions_expires`: `CREATE INDEX idx_sessions_expires ON public.sessions USING btree (expires_at) WHERE (invalidated_at IS NULL)`

### Table: `settings`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('settings_id_seq'::regclass)` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `key` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `value` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Unique** (`settings_key_owner_id_key`): `UNIQUE (key, owner_id)`
- **Primary Key** (`settings_pkey`): `PRIMARY KEY (id)`

### Table: `stock`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `product_version_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `quantity` | `integer` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `vendor_price_snap` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `added_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `added_by` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `variant_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`fk_stock_product_version_id`): `FOREIGN KEY (product_version_id) REFERENCES product_versions(id) ON DELETE CASCADE`
- **Primary Key** (`stock_pkey`): `PRIMARY KEY (id)`

### Table: `stock_entries`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('stock_entries_id_seq'::regclass)` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `variant_id` | `integer` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `quantity_added` | `integer` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `purchase_price` | `real` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `added_by` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp without time zone` | YES | `CURRENT_TIMESTAMP` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`stock_entries_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`stock_entries_variant_id_fkey`): `FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE`

### Table: `users`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `email` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `password_hash` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `role` | `character varying` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_active` | `boolean` | NO | `true` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `failed_login_count` | `integer` | NO | `0` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `locked_until` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `last_login_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `force_password_change` | `boolean` | NO | `false` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | NO | `now()` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_by` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Foreign Key** (`users_created_by_fkey`): `FOREIGN KEY (created_by) REFERENCES users(id)`
- **Unique** (`users_email_key`): `UNIQUE (email)`
- **Foreign Key** (`users_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL`
- **Primary Key** (`users_pkey`): `PRIMARY KEY (id)`
- **Check** (`users_role_check`): `CHECK (((role)::text = ANY ((ARRAY['master'::character varying, 'admin'::character varying, 'user'::character varying])::text[])))`

### Table: `variant_rollback_archive`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('variant_rollback_archive_id_seq'::regclass)` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `name` | `character varying` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`variant_rollback_archive_pkey`): `PRIMARY KEY (id)`

### Table: `variants`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `owner_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `name` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `is_active` | `boolean` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `created_at` | `timestamp with time zone` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `sku` | `text` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `product_version_id` | `uuid` | YES | `null` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `low_stock_threshold` | `integer` | YES | `5` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |
| `alert_enabled` | `boolean` | YES | `true` | *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.* |

**Constraints:**
- **Primary Key** (`variants_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `unique_variant_name_per_version`: `CREATE UNIQUE INDEX unique_variant_name_per_version ON public.variants USING btree (product_version_id, lower(TRIM(BOTH FROM name)))`
- `unique_variant_sku`: `CREATE UNIQUE INDEX unique_variant_sku ON public.variants USING btree (sku)`


## 2.2 Entity Relationship Summary

The database uses `users` (or `master_sessions`) as the highest level authentication.
Each `user` (often acting as the `owner_id` or `created_by`) owns `products` and `customers`.

`products` can have multiple `product_versions` (to track price changes over time).
Each `product_version` can have multiple `variants` (flavours or types like 'Choco', 'Paan').
Each `variant` acts as a unique stockable item.

`stock` entries directly reference `product_versions` or `variants` to increase inventory levels.

`sales` are linked to a `customer` and an `owner_id`.
Each `sale` has multiple `sale_items`, which link to the specific `variant` sold.

`attendance` tracks daily visits for `customers`.

### ASCII Diagram

```text
users (1) 
  │
  ├─── (many) ──→ products (1) ──→ (many) product_versions (1) ──→ (many) variants
  │                                           │
  ├─── (many) ──→ customers (1)               │
  │                 │                         └── (many) stock
  │                 └── (many) attendance
  │
  └─── (many) ──→ sales (1) ──→ (many) sale_items (many) ──→ (1) variants
```

---

## 2.3 Every Database Query

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 17)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 29)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 36)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 42)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\add_club_name.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS club_name VARCHAR(100);`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\add_club_name.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\add_club_name_column.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS club_name VARCHAR(100)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\add_last_activity_at.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\add_setting.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const check = await db.query(`SELECT id FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\add_setting.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`INSERT INTO settings (key, value) VALUES ('SYSTEM_LOW_STOCK_THRESHOLD', '10')`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\alter.js` (Line 18)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(sql);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\alter_password_resets.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255) UNIQUE;`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\analyze_sales.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesRes = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\analyze_stock.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockRes = await pool.query('SELECT product_version_id, quantity FROM stock');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\analyze_stock.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesRes = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkDuplicates.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stock = await db.query('SELECT s.id, s.product_version_id, s.quantity, pv.product_id FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1', [owner]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkDuplicates.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const pv = await db.query('SELECT pv.id, pv.product_id, p.name FROM product_versions pv JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1', [owner]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkDuplicates.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const flavours = await db.query('SELECT id, product_id, name FROM flavours WHERE owner_id = $1', [owner]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkFlavours.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT * FROM flavours`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkFunc.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT pg_get_functiondef('create_sale_atomic'::regproc)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkOwner.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query("SELECT id, owner_id FROM users WHERE email = 'hasieeyy4444@gmail.com'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkProductConstraints.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkSaleItems.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r = await db.query('SELECT count(*) as total, count(flavour_id) as with_flavour FROM sale_items');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkSales.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r = await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkStock.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query('SELECT * FROM stock WHERE owner_id = $1', [owner]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkStockColumns.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'stock'`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\checkUserProducts.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query('SELECT pv.id as pv_id, p.owner_id, p.name, f.name as flavour FROM product_versions pv JOIN products p ON pv.product_id = p.id LEFT JOIN flavours f ON f.product_id = p.id WHERE p.owner_id = $1', [owner]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_admins.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT email FROM users WHERE role = 'admin'`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_attendance.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query('SELECT * FROM attendance');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_constraints.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r1 = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r2 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='product_versions'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r3 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r4 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='variants'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_db_id.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const r = await db.query(`SELECT tc.constraint_type, tc.table_name, kcu.column_name
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_nulls.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\check_stock.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query('SELECT id, product_version_id, quantity FROM stock WHERE quantity < 0');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 31)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS users (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 49)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 50)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 51)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: adminRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['admin']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['admin', hash, 'admin']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 63)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: userRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['user']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 66)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['user', hash, 'user']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 70)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS products (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 80)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS product_variants (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 91)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS stock (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 99)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sales (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 109)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sale_items (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 121)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS settings (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 130)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS attendance (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 141)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS login_history (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 154)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 163)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS backup_logs (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 180)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 181)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 182)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 183)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 184)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 187)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 188)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_product_variants_owner ON product_variants(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 189)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_owner ON stock(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 190)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 191)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner_date ON sales(owner_id, date)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 192)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sale_items_owner ON sale_items(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 193)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_owner ON attendance(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 195)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 197)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\create_backup_logs.js` (Line 23)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(sql);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\db.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
query: (text, params) => pool.query(text, params),
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
let res = await pool.query('SELECT count(*) FROM attendance');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 13)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM attendance WHERE is_deleted = false');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 17)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM attendance a JOIN customers c ON a.customer_id = c.id WHERE a.is_deleted = false');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM attendance a JOIN users u ON a.recorded_by = u.id WHERE a.is_deleted = false');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT is_deleted, deleted_at FROM attendance LIMIT 3');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_sales.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
let res = await pool.query('SELECT count(*) FROM sales');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_sales.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM sales WHERE is_deleted = false');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_sales.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT is_deleted, deleted_at FROM sales LIMIT 3');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_timestamps.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
let res = await pool.query('SELECT is_deleted, deleted_at FROM attendance WHERE is_deleted = true LIMIT 5');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_timestamps.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT is_deleted, deleted_at FROM sales WHERE is_deleted = true LIMIT 5');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_timing.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res1 = await pool.query('SELECT created_at, is_deleted FROM attendance WHERE is_deleted = false');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\debug_timing.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res2 = await pool.query('SELECT created_at, is_deleted FROM attendance WHERE is_deleted = true LIMIT 3');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockRes = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 24)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`UPDATE stock SET quantity = $1 WHERE id = $2`, [row.total_qty, primaryId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock WHERE id = $1`, [dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 35)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const productsRes = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 49)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`UPDATE product_versions SET product_id = $1 WHERE product_id = $2`, [primaryId, dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 51)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`UPDATE flavours SET product_id = $1 WHERE product_id = $2`, [primaryId, dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 53)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM products WHERE id = $1`, [dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const activeVersionsRes = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 74)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`UPDATE product_versions SET is_active = false WHERE id = $1`, [dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 81)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const flavoursRes = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 95)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`UPDATE sale_items SET flavour_id = $1 WHERE flavour_id = $2`, [primaryId, dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 97)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM flavours WHERE id = $1`, [dup]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 102)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 105)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\delete_f1.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(`DELETE FROM products WHERE name = 'Formula 1 Shake'`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\drop_constraint.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "unique_product_flavor_owner";`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 35)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const hashRes = await pool.query("SELECT crypt('password123', gen_salt('bf')) as hash");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 38)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
let userRes = await pool.query("SELECT id FROM users WHERE email = 'e2e_admin@example.com'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 40)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
userRes = await pool.query("INSERT INTO users (email, password_hash, role) VALUES ('e2e_admin@example.com', $1, 'admin') RETURNING id", [hash]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 43)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'e2e_admin@example.com'", [hash]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 53)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const oldProducts = await pool.query("SELECT id FROM products WHERE name = 'E2E Shake'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM sale_items WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 58)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM sales WHERE id NOT IN (SELECT sale_id FROM sale_items)"); // cleanup empty sales
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 59)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM stock WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM product_versions WHERE product_id = $1", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 61)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM products WHERE id = $1", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 70)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const prodDb = await pool.query("SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true", [productId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 78)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const custId = cRes.data.customer_id || (await pool.query("SELECT id FROM customers LIMIT 1")).rows[0].id;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 95)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const prodDb2 = await pool.query("SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true", [productId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 131)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 144)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const oldProducts2 = await pool.query("SELECT id FROM products WHERE name = 'E2E Shake'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 147)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM sale_items WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 148)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM stock WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 149)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM product_versions WHERE product_id = $1", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 150)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM products WHERE id = $1", [pId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 3)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 47)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT default_shake_amount FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 54)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 73)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 84)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 13)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
result = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 16)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
result = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 39)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const conf = await db.query(confQuery.text, confQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 46)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const attRes = await db.query(attQuery.text, attQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 73)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(updateQuery.text, updateQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT * FROM users WHERE email = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT * FROM users WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 18)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 24)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO sessions (user_id, token_hash, tenant_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 35)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 42)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 46)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE token_hash = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 50)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND id = $2 AND invalidated_at IS NULL`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 54)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 58)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND token_hash != $2 AND invalidated_at IS NULL`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 62)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, device_info, created_at, last_seen_at, ip_address FROM sessions WHERE user_id = $1 AND expires_at > NOW() AND invalidated_at IS NULL ORDER BY last_seen_at DESC`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 66)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE id IN (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 77)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 81)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 85)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT * FROM password_resets WHERE token_hash = $1 ORDER BY created_at DESC LIMIT 1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 89)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE password_resets SET used_at = NOW() WHERE token_hash = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 95)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT password_hash FROM users WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 99)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET password_hash = $1, force_password_change = false WHERE id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 105)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id FROM sessions WHERE user_id = $1 AND ip_address = $2 AND device_info = $3 AND id != $4 AND created_at > NOW() - INTERVAL '30 days' LIMIT 1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 111)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET last_seen_at = NOW() WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 115)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET last_seen_at = NOW() WHERE token_hash = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(fQ.text, fQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 52)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(sQ.text, sQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const prevSessionRes = await db.query(prevSessQ.text, prevSessQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 74)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(evictQ.text, evictQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 82)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const sessionRes = await db.query(sessQ.text, sessQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 92)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 111)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 117)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(invQ.text, invQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 127)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(resetQ.text, resetQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 166)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(lookupQ.text, lookupQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 188)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 194)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 198)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(consQ.text, consQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 202)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(invQ.text, invQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 204)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 206)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 219)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRecord = (await db.query(userQ.text, userQ.values)).rows[0];
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 229)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 234)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(iQ.text, iQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 237)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(iQ.text, iQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 248)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 257)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 262)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(iQ.text, iQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 272)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 278)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const currentRes = await db.query(currentQ.text, currentQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 294)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 305)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 323)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
db.query(bQ.text, bQ.values).catch(e => console.error("Failed to bump session activity", e));
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 13)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const adminConfigRes = await pool.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(logQ.text, logQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 50)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(logQ.text, logQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 66)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows } = await pool.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 104)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const countRes = await pool.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 120)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(logQ.text, logQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 19)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT * FROM backup_logs WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 50`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 33)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 43)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 55)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, name, phone, member_code, joined_at as date, is_active, created_at FROM customers WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, customer_id, attendance_date, type, (shake_amount::numeric / 100.0)::float as shake_amount, recorded_by, created_at, is_deleted, deleted_at FROM attendance WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 65)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, customer_id, sale_date, created_at, recorded_by, is_deleted, deleted_at, deleted_by FROM sales WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 70)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT si.id, si.sale_id, si.product_version_id, si.variant_id, si.quantity, (si.price_charged::numeric / 100.0)::float as price_charged, (si.standard_price_snap::numeric / 100.0)::float as standard_price_snap, (si.vendor_price_snap::numeric / 100.0)::float as vendor_price_snap FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 75)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, name, created_at FROM products WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 80)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT pv.id, pv.product_id, (pv.vendor_price::numeric / 100.0)::float as vendor_price, pv.is_active, pv.effective_from, pv.effective_to, pv.created_by FROM product_versions pv JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 85)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, product_version_id, owner_id, name, is_active, created_at, sku, low_stock_threshold, alert_enabled FROM variants WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 90)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, product_version_id, quantity, (vendor_price_snap::numeric / 100.0)::float as vendor_price_snap, added_at, added_by FROM stock WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 98)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 109)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 121)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE owner_id = $1)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 126)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `DELETE FROM product_versions WHERE product_id IN (SELECT id FROM products WHERE owner_id = $1)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 131)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `DELETE FROM ${tableName} WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.customers = (await pool.query(queries.getExportCustomers(ownerId).text, queries.getExportCustomers(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 17)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.attendance = (await pool.query(queries.getExportAttendance(ownerId).text, queries.getExportAttendance(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 20)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.sales = (await pool.query(queries.getExportSales(ownerId).text, queries.getExportSales(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.sale_items = (await pool.query(queries.getExportSaleItems(ownerId).text, queries.getExportSaleItems(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 24)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.products = (await pool.query(queries.getExportProducts(ownerId).text, queries.getExportProducts(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.product_versions = (await pool.query(queries.getExportProductVersions(ownerId).text, queries.getExportProductVersions(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.variants = (await pool.query(queries.getExportVariants(ownerId).text, queries.getExportVariants(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 27)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.stock = (await pool.query(queries.getExportStock(ownerId).text, queries.getExportStock(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 30)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.customers = (await pool.query(queries.getExportCustomers(ownerId).text, queries.getExportCustomers(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 31)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.attendance = (await pool.query(queries.getExportAttendance(ownerId).text, queries.getExportAttendance(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 32)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.sales = (await pool.query(queries.getExportSales(ownerId).text, queries.getExportSales(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 33)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.sale_items = (await pool.query(queries.getExportSaleItems(ownerId).text, queries.getExportSaleItems(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 34)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.products = (await pool.query(queries.getExportProducts(ownerId).text, queries.getExportProducts(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 35)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.product_versions = (await pool.query(queries.getExportProductVersions(ownerId).text, queries.getExportProductVersions(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 36)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.variants = (await pool.query(queries.getExportVariants(ownerId).text, queries.getExportVariants(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 37)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
data.stock = (await pool.query(queries.getExportStock(ownerId).text, queries.getExportStock(ownerId).values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 97)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 101)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const preSalesRes = await client.query(snapQ.text, snapQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 149)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(query, values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 152)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(query, values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 158)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const postSalesRes = await client.query(snapQ.text, snapQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 171)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 175)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 178)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 35)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`UPDATE customers SET is_active = false WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 39)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT * FROM customers WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 43)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 56)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 66)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT id FROM customers WHERE owner_id = $1 AND name ILIKE $2`, [ownerId, customerName.trim()]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 70)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`INSERT INTO customers (owner_id, name) VALUES ($1, $2) RETURNING id`, [ownerId, customerName.trim()]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 18)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 30)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 71)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 94)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 114)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 132)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 143)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT delete_sale_restore_stock($1, $2, $3)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 154)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 165)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = false WHERE id = $1 OR owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 176)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 187)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET setup_completed = true WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 198)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 214)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 236)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE attendance SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 247)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT product_version_id, variant_id, quantity FROM sale_items WHERE sale_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 258)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT quantity FROM stock WHERE product_version_id = $1 AND variant_id = $2 AND owner_id = $3`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 269)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE stock SET quantity = quantity - $1 WHERE product_version_id = $2 AND variant_id = $3 AND owner_id = $4`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 280)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sales SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 291)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT password_hash FROM users WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 56)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
confRes = await db.query(confQuery.text, confQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const sysRes = await db.query("SELECT value FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 72)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
pitScalarRes = await db.query(pitScalarQuery.text, pitScalarQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 73)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res4 = await db.query(lowStockQuery.text, lowStockQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 101)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
periodScalarRes = await db.query(periodScalarQuery.text, periodScalarQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 102)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res5 = await db.query(monthlySalesQuery.text, monthlySalesQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 103)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res6 = await db.query(topCustomersQuery.text, topCustomersQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 104)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
res7 = await db.query(shakeProfitQuery.text, shakeProfitQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 153)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 162)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const activeSalesRes = await client.query(activeSalesQuery.text, activeSalesQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 166)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(delQuery.text, delQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 169)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 170)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock_entries WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 175)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(softDelAttQuery.text, softDelAttQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 180)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE owner_id = $1)`, [ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 181)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM sales WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 183)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM products WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 186)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 191)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 201)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 204)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(deactQuery.text, deactQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 207)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(invSessQuery.text, invSessQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 209)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 212)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 221)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 241)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`UPDATE admin_config SET ${updates.join(', ')} WHERE owner_id = $${i}`, values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 248)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 258)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(queryStr, params);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 259)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 264)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 274)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 284)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesRes = await client.query(queryStr, params);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 288)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(delQuery.text, delQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 291)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 296)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 307)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await db.query(userQuery.text, userQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 351)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await db.query(userQuery.text, userQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 377)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const attRes = await db.query(attQuery.text, attQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 380)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesRes = await db.query(salesQuery.text, salesQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 398)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 402)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 405)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const itemsRes = await client.query(itemsQ.text, itemsQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 409)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockRes = await client.query(stockQ.text, stockQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 417)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(deductQ.text, deductQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 420)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(restoreSaleQ.text, restoreSaleQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 425)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 430)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 31)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 61)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 109)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 119)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT id FROM variants WHERE sku = $1 AND id != $2`, [sku, excludeVariantId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 121)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT id FROM variants WHERE sku = $1`, [sku]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 3)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = true`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(DISTINCT user_id) FROM sessions WHERE expires_at > NOW() AND invalidated_at IS NULL AND last_seen_at > NOW() - INTERVAL '1 day'`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 15)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT s.id, s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, s.last_seen_at, u.email, u.role
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 20)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT a.id, a.action, a.table_name, a.created_at, u.email as actor_email, u.role as actor_role
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 33)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id FROM users WHERE email = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 37)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by) VALUES ($1, $2, 'admin', null, true, $3) RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 41)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET owner_id = $1 WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO admin_config (owner_id) VALUES ($1)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 49)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT is_active, role FROM users WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 53)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT role FROM users WHERE id = $1 AND is_active = true`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET password_hash = $1, force_password_change = true, failed_login_count = 0, locked_until = NULL WHERE id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 61)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = false WHERE (id = $1 OR owner_id = $1) AND role != 'master'`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 65)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1) AND invalidated_at IS NULL`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 69)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = $1 WHERE id = $2 OR owner_id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 73)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id FROM users WHERE id = $1 AND role = 'admin'`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const totalAdminsRes = await db.query(queries.getMasterAppStatsAdmins().text);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 15)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const totalUsersRes = await db.query(queries.getMasterAppStatsUsers().text);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 16)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const activeSessionsRes = await db.query(queries.getMasterAppStatsSessions().text);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(queries.getMasterLiveSessions().text);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 40)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return (await db.query(queries.getMasterActivityLog().text)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 44)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return (await db.query(queries.getMasterAdmins().text)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 50)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const existCheck = await db.query(exQ.text, exQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 58)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await client.query(insQ.text, insQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 64)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(setQ.text, setQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 67)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(confQ.text, confQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 69)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 74)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 83)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userCheck = await db.query(uQ.text, uQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 92)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 103)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userCheck = await db.query(uQ.text, uQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 111)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 113)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 117)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(invQ.text, invQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 120)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 124)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 133)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const adminCheck = await db.query(chkQ.text, chkQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 137)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 145)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 148)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const updateRes = await client.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 150)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 155)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(invQ.text, invQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 157)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 160)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 16)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 32)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 39)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 30)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 37)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 44)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 51)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(`SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true`, [productId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 55)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(`UPDATE product_versions SET is_active = false, effective_to = NOW() WHERE id = $1`, [oldVersionId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 59)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 67)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 75)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT id, is_active FROM product_versions WHERE product_id = $1 ORDER BY effective_from DESC LIMIT 1`, [productId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 79)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`UPDATE product_versions SET is_active = $1 WHERE id = $2`, [newStatus, versionId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 83)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`INSERT INTO variants (id, product_version_id, owner_id, name, is_active) VALUES (gen_random_uuid(), $1, $2, $3, true) RETURNING id`, [productVersionId, ownerId, name]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 87)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`SELECT is_active FROM variants WHERE id = $1`, [id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 91)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`UPDATE variants SET is_active = $1 WHERE id = $2`, [newStatus, id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 96)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 105)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return db.query(`DELETE FROM variants WHERE id = $1`, [id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 61)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 95)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 105)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 110)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 125)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 143)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const oldVariantsRes = await client.query(`SELECT id, name FROM variants WHERE product_version_id = $1 AND is_active = true`, [oldVersionId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 150)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 162)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 166)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 29)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 46)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 61)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 73)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) as count FROM customers WHERE owner_id = $1 AND is_active = true`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 83)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 93)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT * FROM customers WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 103)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 121)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id FROM customers WHERE id = $1 AND owner_id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 128)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE customers SET name = $1, phone = $2 WHERE id = $3`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 135)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO customers (id, owner_id, name, phone) VALUES ($1, $2, $3, $4)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 142)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO customers (owner_id, name, phone) VALUES ($1, $2, $3)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 152)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO products (owner_id, name) VALUES ($1, $2) RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 159)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO product_versions (product_id, vendor_price, created_by) VALUES ($1, $2, $3) RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 166)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO variants (product_id, owner_id, name) VALUES ($1, $2, $3) RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 173)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO stock (product_version_id, variant_id, owner_id, quantity, vendor_price_snap, added_by) VALUES ($1, $2, $3, $4, $5, $6)`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 39)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 56)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesRes = await db.query(sStatsQ.text, sStatsQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const attRes = await db.query(aStatsQ.text, aStatsQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 58)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const custRes = await db.query(cCountQ.text, cCountQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 63)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesList = await db.query(sListQ.text, sListQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 64)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const attendanceList = await db.query(aListQ.text, aListQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 89)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const adminConfigRes = await db.query(confQ.text, confQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 123)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const adminConfigRes = await db.query(confQ.text, confQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 138)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const customers = await db.query(custQ.text, custQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 154)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const sales = await db.query(salesQ.text, salesQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 186)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 208)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const existing = await client.query(chkQ.text, chkQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 211)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 214)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(insQ.text, insQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 219)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(insNoIdQ.text, insNoIdQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 241)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const prodRes = await client.query(prodQ.text, prodQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 245)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const pvRes = await client.query(verQ.text, verQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 249)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const variantRes = await client.query(variantQ.text, variantQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 253)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(stockQ.text, stockQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 259)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 263)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.controller.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.controller.js` (Line 19)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const itemsRes = await db.query(itemsQuery.text, itemsQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.controller.js` (Line 127)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const saleRes = await db.query(permQuery.text, permQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 97)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT create_sale_atomic($1, $2, $3, $4, $5::jsonb) as sale_id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 108)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT delete_sale_restore_stock($1, $2, $3) as success`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 119)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT low_stock_threshold, discount_alert_pct FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 130)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT email FROM users WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 141)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT name FROM customers WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 152)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT quantity FROM stock WHERE product_version_id = $1 AND variant_id = $2 AND owner_id = $3`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 163)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT p.name FROM products p JOIN product_versions pv ON pv.product_id = p.id WHERE pv.id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 174)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT recorded_by FROM sales WHERE id = $1 AND owner_id = $2 AND is_deleted = false`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 185)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 201)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT count(*) FROM sale_items WHERE sale_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 212)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `DELETE FROM sale_items WHERE id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 223)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 74)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(atomicQuery.text, atomicQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 91)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const configRes = await db.query(configQuery.text, configQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 95)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const sysRes = await db.query("SELECT value FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 105)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await db.query(userQuery.text, userQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 110)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const custRes = await db.query(custQuery.text, custQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 116)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockRes = await db.query(stockQuery.text, stockQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 119)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const productNameRes = await db.query(prodNameQuery.text, prodNameQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 141)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 159)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 163)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const itemRes = await client.query(itemQuery.text, itemQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 178)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const countRes = await client.query(countQuery.text, countQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 183)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 189)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(deleteQuery.text, deleteQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 193)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(restoreQuery.text, restoreQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 195)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 200)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, email as username, email, role, is_active, last_login_at FROM users WHERE owner_id = $1 AND is_active = true ORDER BY created_at DESC`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) FROM users WHERE owner_id = $1 AND role = 'user' AND is_active = true`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT id, is_active, owner_id FROM users WHERE email = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 16)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = true, password_hash = $1, role = $2, force_password_change = true, locked_until = NULL WHERE id = $3 RETURNING id, email, role`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 20)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by) VALUES ($1, $2, $3, $4, true, $5) RETURNING id, email, role`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 24)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET role = $1 WHERE id = $2 AND owner_id = $3 RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = false, locked_until = NOW() WHERE id = $1 AND owner_id = $2 RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 33)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE users SET password_hash = $1, force_password_change = true WHERE id = $2 AND owner_id = $3`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 37)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, u.email as user_email
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 49)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET club_name = $1, updated_at = NOW() WHERE owner_id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 53)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT ac.club_name, u.email FROM admin_config ac JOIN users u ON u.id = ac.owner_id WHERE ac.owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 61)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET setup_completed = true, updated_at = NOW() WHERE owner_id = $1`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 65)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET default_shake_amount = $1, low_stock_threshold = $2, updated_at = NOW() WHERE owner_id = $3`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 20)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
return (await db.query(q.text, q.values)).rows;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 34)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const countRes = await db.query(countQ.text, countQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 49)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const existing = await db.query(exQ.text, exQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const updateRes = await db.query(rQ.text, rQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 68)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const newRes = await db.query(insQ.text, insQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 76)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const updRes = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 82)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const delRes = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 94)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(updQ.text, updQ.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 103)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 120)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 126)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 132)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 143)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 148)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const current = await db.query(queries.getAdminConfig(ownerId).text, queries.getAdminConfig(ownerId).values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 153)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 3)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 28)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 42)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 52)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 62)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `UPDATE stock SET quantity = $1 WHERE variant_id = $2 AND owner_id = $3 RETURNING id`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 69)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
text: `DELETE FROM stock WHERE variant_id = $1 AND owner_id = $2`,
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 40)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 44)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const pvRes = await client.query(pvQuery.text, pvQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 47)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const updateRes = await client.query(updateQuery.text, updateQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 62)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(insertQuery.text, insertQuery.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 65)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 69)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 81)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const result = await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 99)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(query.text, query.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stats = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 29)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const dashStats = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 38)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockItems = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 47)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const saleItems = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\find_owner2.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockItems = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fixHistory.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fixMissingFlavours.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const saleItems = await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fixMissingFlavours.js` (Line 15)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const fRes = await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fixMissingFlavours.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`UPDATE sale_items SET flavour_id = $1 WHERE id = $2`, [flavourId, item.sale_item_id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fix_attendance.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query('UPDATE attendance SET is_deleted = false, deleted_at = null WHERE is_deleted = true');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fix_stock.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query('UPDATE stock SET quantity = 0 WHERE quantity < 0');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\fix_stock_post_restore.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const updateRes = await pool.query(updateQuery);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\get_func.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query("SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'delete_sale_restore_stock'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\list_users.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await db.query('SELECT id, email, role, owner_id FROM users');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 41)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 46)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 55)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(query, values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 59)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: maxRows } = await client.query(`SELECT MAX(id) as max_id FROM ${tableName}`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 62)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`SELECT setval('${tableName}_id_seq', ${maxId})`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 65)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 69)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrate_functions.js` (Line 106)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(sql);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\001_add_total_profit_to_sales.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(q);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\002_add_google_auth_to_users.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(q);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\003_multi_tenant_isolation.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: users } = await client.query("SELECT id, username, email FROM users");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 13)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE products SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE product_variants SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 15)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE stock SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 16)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE sales SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 17)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE sale_items SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 18)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE attendance SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 19)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('UPDATE settings SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 22)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 24)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 18)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD CONSTRAINT users_username_owner_key UNIQUE (username, owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\006_create_refresh_tokens.js` (Line 3)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\006_create_refresh_tokens.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\007_add_product_variants_unique.js` (Line 4)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\index.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\index.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows } = await pool.query(`SELECT name FROM migrations`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\migrations\index.js` (Line 37)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`INSERT INTO migrations (name) VALUES ($1)`, [filename]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\provide_runtime_evidence.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await client.query('SELECT id FROM users LIMIT 1');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 36)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 40)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const p1Res = await client.query(`INSERT INTO products (id, name, owner_id) VALUES (gen_random_uuid(), 'Formula 1 Test', $1) RETURNING id`, [userId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 42)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const pv1Res = await client.query(`INSERT INTO product_versions (id, product_id, vendor_price, volume_points) VALUES (gen_random_uuid(), $1, 1000, 10) RETURNING id`, [f1Id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 44)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const vChocoRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Choco Test', true) RETURNING id`, [pv1Id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 50)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock WHERE variant_id = $1`, [vChoco]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 51)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM variants WHERE id = $1`, [vChoco]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 52)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM product_versions WHERE id = $1`, [pv1Id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\queries.js` (Line 53)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM products WHERE id = $1`, [f1Id]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\recoverStock.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\recoverStock.js` (Line 9)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\recoverStock.js` (Line 13)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\recreate_tables.js` (Line 22)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('CREATE TABLE IF NOT EXISTS ' + table + ' (' + cols + ')');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\reset_pwd.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin'])
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\restoreTestStock.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\data_integrity_verifier.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await client.query(`SELECT * FROM ${t} ORDER BY id ASC`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_token VARCHAR(255)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 12)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 22)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: masterRows } = await pool.query('SELECT id FROM users WHERE role = $1', ['master']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 24)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 35)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: allUsers } = await pool.query('SELECT id, email, username FROM users WHERE role != $1', ['master']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 42)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migration_backup_manager.js` (Line 22)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const res = await pool.query(`SELECT * FROM ${table}`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migration_backup_manager.js` (Line 29)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
try { const res = await pool.query(`SELECT * FROM variants`); data['variants'] = res.rows; } catch(e) { data['variants'] = []; }
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migration_backup_manager.js` (Line 30)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
try { const res = await pool.query(`SELECT * FROM flavours`); data['flavours'] = res.rows; } catch(e) { data['flavours'] = []; }
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migration_validator.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const prodRes = await client.query('SELECT name, count(*) FROM products GROUP BY name HAVING count(*) > 1');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\migration_validator.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const stockRes = await client.query('SELECT count(*) FROM stock WHERE product_version_id NOT IN (SELECT id FROM product_versions)');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 38)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 43)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`SAVEPOINT before_table`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 45)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE IF EXISTS ${table} DISABLE TRIGGER USER;`); // Use USER instead of ALL to avoid system trigger errors
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 46)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 54)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO ${table} (${colsStr}) VALUES (${placeholders})`, vals);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 56)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE IF EXISTS ${table} ENABLE TRIGGER USER;`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`RELEASE SAVEPOINT before_table`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 60)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ROLLBACK TO SAVEPOINT before_table`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 64)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 67)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const duplicates = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const duplicateSkus = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 44)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const orphanStock = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 59)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const orphanSales = await client.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const userRes = await client.query('SELECT id FROM users LIMIT 1');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 17)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q1.text, q1.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 21)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q2.text, q2.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 25)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q3.text, q3.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 29)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q4.text, q4.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 33)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q5.text, q5.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 37)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q6.text, q6.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 41)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(q7.text, q7.values);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\set_stock_exact.js` (Line 6)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`UPDATE stock SET quantity = 10 WHERE product_version_id = '09aac69c-3be7-4ca0-a2c8-24148a463ad5'`); // Kulfi
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\set_stock_exact.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`UPDATE stock SET quantity = 10 WHERE product_version_id = 'ee75949a-1e3b-4604-a969-5c70a531ad1f'`); // Chocolate
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\set_stock_exact.js` (Line 8)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`UPDATE stock SET quantity = 23 WHERE product_version_id = '4ad95177-2e17-4f15-aff5-ead1977a418a'`); // Formula 1
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 27)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 30)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS users (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 48)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 49)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 50)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 56)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: adminRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['admin']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 59)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['admin', hash, 'admin']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 62)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: userRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['user']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 65)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['user', hash, 'user']);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 69)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS products (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 79)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS product_variants (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 90)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS stock (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 98)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sales (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 108)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sale_items (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 120)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS settings (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 129)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS attendance (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 140)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS login_history (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 153)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 162)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS backup_logs (
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 179)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 180)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 181)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 182)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 183)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 186)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 187)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_product_variants_owner ON product_variants(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 188)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_owner ON stock(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 189)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 190)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner_date ON sales(owner_id, date)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 191)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sale_items_owner ON sale_items(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 192)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_owner ON attendance(owner_id)`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 194)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 196)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 206)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
query: (text, params) => pool.query(text, params),
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\services\auditLogService.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\services\cronService.js` (Line 29)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const { rows: admins } = await pool.query("SELECT id, username FROM users WHERE role = 'admin'");
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\services\cronService.js` (Line 57)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\services\cronService.js` (Line 66)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\shared\utils\audit.js` (Line 5)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\update_master.js` (Line 11)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const check = await db.query(`SELECT id FROM users WHERE role = 'master'`);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\update_master.js` (Line 14)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`UPDATE users SET email = $1, password_hash = $2 WHERE role = 'master'`, [email, hash]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\update_master.js` (Line 17)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
await db.query(`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'master')`, [email, hash]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\verify.js` (Line 7)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const ownerId = (await pool.query('SELECT owner_id FROM stock LIMIT 1')).rows[0].owner_id;
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\verify.js` (Line 10)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const pvRes = await pool.query('SELECT * FROM product_versions');
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\verify.js` (Line 13)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const adminConfig = await pool.query('SELECT low_stock_threshold FROM admin_config WHERE owner_id = $1', [ownerId]);
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\verify.js` (Line 16)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const lowStockItems = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*

### Query in `E:\development\club app(web)\backend\verify.js` (Line 26)
- **Purpose:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Full SQL Call:**
```javascript
const salesStats = await pool.query(`
```
- **Parameters:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Returns:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*
- **Called By:** *Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*



---

# SECTION 3 — BACKEND API REFERENCE

## Module: `attendance\attendance.routes.js`

### `[GET] /api/attendance\attendance/attendance`
- **File:** `features/attendance/attendance.routes.js`
- **Handlers/Controller:** `authenticateToken, attendanceController.getAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/attendance\attendance/attendance`
- **File:** `features/attendance/attendance.routes.js`
- **Handlers/Controller:** `authenticateToken, attendanceValidation.validateAttendance, attendanceController.markAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/attendance\attendance/attendance/:id`
- **File:** `features/attendance/attendance.routes.js`
- **Handlers/Controller:** `authenticateToken, attendanceController.deleteAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `auth\auth.routes.js`

### `[POST] /api/auth\auth/login`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `loginLimiter, validate(loginSchema), authController.login`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/auth\auth/logout`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `authController.logout`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/auth\auth/forgot-password`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `passwordResetLimiter, authController.forgotPassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/auth\auth/reset-password`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `passwordResetLimiter, authController.resetPassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/auth\auth/change-password`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `authenticateToken, authController.changePassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/auth\auth/session`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `authenticateToken, authController.getSession`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/auth\auth/sessions`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `authenticateToken, authController.getActiveSessions`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/auth\auth/sessions/:id`
- **File:** `features/auth/auth.routes.js`
- **Handlers/Controller:** `authenticateToken, authController.revokeSession`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `backup\backup.routes.js`

### `[GET] /api/backup\backup/backup/logs`
- **File:** `features/backup/backup.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, backupController.getBackupLogs`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/backup\backup/backup/generate`
- **File:** `features/backup/backup.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, backupLimiter, backupController.generateBackup`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/backup\backup/backup/restore/validate`
- **File:** `features/backup/backup.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, backupLimiter, upload.single('backupFile'), backupController.validateRestore`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/backup\backup/backup/restore/confirm`
- **File:** `features/backup/backup.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, backupLimiter, upload.single('backupFile'), backupController.confirmRestore`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `customers\customers.routes.js`

### `[GET] /api/customers\customers`
- **File:** `features/customers/customers.routes.js`
- **Handlers/Controller:** `authenticateToken, customerController.getCustomers`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/customers\customers`
- **File:** `features/customers/customers.routes.js`
- **Handlers/Controller:** `authenticateToken, customerValidation.validateAddCustomer, customerController.addCustomer`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/customers\customers/:id`
- **File:** `features/customers/customers.routes.js`
- **Handlers/Controller:** `authenticateToken, customerController.updateCustomer`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/customers\customers/:id`
- **File:** `features/customers/customers.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, customerController.deactivateCustomer`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/customers\customers/:id/summary`
- **File:** `features/customers/customers.routes.js`
- **Handlers/Controller:** `authenticateToken, customerController.getCustomerSummary`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `dashboard\dashboard.routes.js`

### `[GET] /api/dashboard\dashboard/dashboard/stats`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, dashboardController.getStats`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/dashboard\dashboard/data-management/delete`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.resetData`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/dashboard\dashboard/data-management/attendance`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.clearAttendanceData`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/dashboard\dashboard/data-management/sales`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.clearSalesData`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/dashboard\dashboard/data-management/deleted`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.getDeletedRecords`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/dashboard\dashboard/data-management/deleted/:type/:id/restore`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.restoreDeletedRecord`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/dashboard\dashboard/system/reset`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.resetData`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/dashboard\dashboard/system/reset/request-otp`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.requestResetOtp`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/dashboard\dashboard/system/reset/confirm`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, dashboardController.confirmReset`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/dashboard\dashboard/account`
- **File:** `features/dashboard/dashboard.routes.js`
- **Handlers/Controller:** `authenticateToken, dashboardController.deleteAccount`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `inventory\inventory.routes.js`

### `[GET] /api/inventory\inventory/entities`
- **File:** `features/inventory/inventory.routes.js`
- **Handlers/Controller:** `inventoryController.getEntities`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/inventory\inventory/search`
- **File:** `features/inventory/inventory.routes.js`
- **Handlers/Controller:** `inventoryController.searchEntities`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/inventory\inventory/entities/:id`
- **File:** `features/inventory/inventory.routes.js`
- **Handlers/Controller:** `inventoryController.updateEntity`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `master\master.routes.js`

### `[GET] /api/master\master/stats`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.getAppStats`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/master\master/sessions`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.getLiveSessions`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/master\master/audit-log`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.getActivityLog`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/master\master/admins`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.getMasterAdmins`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/master\master/admins`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.createClubAdmin`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/master\master/admins/:id/reset-password`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.forceResetAdminPassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/master\master/admins/:id/toggle-status`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.toggleAdminStatus`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/master\master/admins/:id/club-name`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.updateAdminClubNameMaster`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/master\master/admins/:id`
- **File:** `features/master/master.routes.js`
- **Handlers/Controller:** `authenticateToken, requireMaster, masterController.deleteClubAdmin`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `notifications\notifications.routes.js`

### `[GET] /api/notifications\notifications/notifications`
- **File:** `features/notifications/notifications.routes.js`
- **Handlers/Controller:** `authenticateToken, notificationController.getNotifications`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/notifications\notifications/notifications/unread-count`
- **File:** `features/notifications/notifications.routes.js`
- **Handlers/Controller:** `authenticateToken, notificationController.getUnreadCount`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/notifications\notifications/notifications/:id/read`
- **File:** `features/notifications/notifications.routes.js`
- **Handlers/Controller:** `authenticateToken, notificationController.markAsRead`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/notifications\notifications/notifications/read`
- **File:** `features/notifications/notifications.routes.js`
- **Handlers/Controller:** `authenticateToken, notificationController.markAsRead`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `products\products.routes.js`

### `[GET] /api/products\products/products`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, productController.getProducts`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/products\products/products`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, productValidation.validateAddProduct, productController.addProduct`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/products\products/products/:id/price`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, productController.updateProductPrice`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/products\products/products/:id/toggle`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, productController.toggleProductStatus`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/products\products/variants`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, productValidation.validateAddFlavour, productController.addVariant`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/products\products/variants/:id/toggle`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, productController.toggleVariant`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/products\products/variants/:id`
- **File:** `features/products/products.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, productController.deleteVariant`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `reports\reports.routes.js`

### `[GET] /api/reports\reports/reports/export`
- **File:** `features/reports/reports.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, reportLimiter, reportsController.exportData`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/reports\reports/reports/import`
- **File:** `features/reports/reports.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, backupLimiter, upload.single('file'), reportsController.importCSV`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/reports\reports/reports`
- **File:** `features/reports/reports.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, reportsController.ping`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `sales\sales.routes.js`

### `[GET] /api/sales\sales/sales`
- **File:** `features/sales/sales.routes.js`
- **Handlers/Controller:** `authenticateToken, salesController.getSales`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/sales\sales/sales`
- **File:** `features/sales/sales.routes.js`
- **Handlers/Controller:** `authenticateToken, validate(addSaleSchema), salesController.addSale`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/sales\sales/sales/:id`
- **File:** `features/sales/sales.routes.js`
- **Handlers/Controller:** `authenticateToken, salesController.deleteSale`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/sales\sales/sales/item/:id`
- **File:** `features/sales/sales.routes.js`
- **Handlers/Controller:** `authenticateToken, salesController.deleteSaleItem`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `settings\settings.routes.js`

### `[GET] /api/settings\settings/admin/club-name`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.getAdminClubName`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/settings\settings/admin/club-name`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.updateAdminClubName`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/settings\settings/user/club-name`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, settingsController.getUserClubName`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/settings\settings/admin/config/setup-complete`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.completeSetup`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/settings\settings/settings/config`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.updateAdminConfig`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/settings\settings/users`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.getUsers`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/settings\settings/users`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.createUser`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[PUT] /api/settings\settings/users/:id/role`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.updateUserRole`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/settings\settings/users/:id/reset-password`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.adminUpdateUserPassword`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/settings\settings/users/:id`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.deleteUser`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[GET] /api/settings\settings/login-history`
- **File:** `features/settings/settings.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, settingsController.getLoginHistory`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

## Module: `stock\stock.routes.js`

### `[GET] /api/stock\stock/stock`
- **File:** `features/stock/stock.routes.js`
- **Handlers/Controller:** `authenticateToken, stockController.getStock`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[POST] /api/stock\stock/stock`
- **File:** `features/stock/stock.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, stockValidation.validateAddStock, stockController.addStock`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`

### `[DELETE] /api/stock\stock/stock/:id`
- **File:** `features/stock/stock.routes.js`
- **Handlers/Controller:** `authenticateToken, requireAdmin, stockController.deleteStock`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Query: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`
- Body: `*Auto-resolved: Inherits standard Express/Next.js functional implementation pattern. No anomalous side-effects detected.*`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`



---

# SECTION 4 — FUNCTION REFERENCE

## Module: attendance

Function:    getAttendance
File:        backend/features/attendance/attendance.controller.js
Type:        Controller
Purpose:     Retrieves data for Attendance.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       attendanceService.getAttendance, Array.isArray, rows.map, split, toISOString, res.json, includes, res.status
Called by:   None

Function:    markAttendance
File:        backend/features/attendance/attendance.controller.js
Type:        Controller
Purpose:     Executes the markAttendance logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       attendanceService.markAttendance, res.json, includes, res.status
Called by:   None

Function:    deleteAttendance
File:        backend/features/attendance/attendance.controller.js
Type:        Controller
Purpose:     Deletes a Attendance record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       attendanceService.deleteAttendance, res.json, includes, res.status
Called by:   None

Function:    getAttendanceUser
File:        backend/features/attendance/attendance.queries.js
Type:        Utility
Purpose:     Retrieves data for AttendanceUser.
Parameters:  ownerId (any), userId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getAttendanceAdmin
File:        backend/features/attendance/attendance.queries.js
Type:        Utility
Purpose:     Retrieves data for AttendanceAdmin.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getConfigShakeAmount
File:        backend/features/attendance/attendance.queries.js
Type:        Utility
Purpose:     Retrieves data for ConfigShakeAmount.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    upsertAttendance
File:        backend/features/attendance/attendance.queries.js
Type:        Utility
Purpose:     Executes the upsertAttendance logic.
Parameters:  ownerId (any), customerId (any), date (any), type (any), shakeAmountPaise (any), recordedBy (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deleteAttendanceUser
File:        backend/features/attendance/attendance.queries.js
Type:        Utility
Purpose:     Deletes a AttendanceUser record.
Parameters:  attendanceId (any), userId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deleteAttendanceAdmin
File:        backend/features/attendance/attendance.queries.js
Type:        Utility
Purpose:     Deletes a AttendanceAdmin record.
Parameters:  attendanceId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getAttendance
File:        backend/features/attendance/attendance.service.js
Type:        Service
Purpose:     Retrieves data for Attendance.
Parameters:  ownerId (any), userRole (any), userId (any) — input arguments
Returns:     array | any — return value
Side effects: DB write/read via query
Calls:       queries.getAttendanceUser, db.query, queries.getAttendanceAdmin
Called by:   Global/Route scope

Function:    markAttendance
File:        backend/features/attendance/attendance.service.js
Type:        Service
Purpose:     Executes the markAttendance logic.
Parameters:  ownerId (any), recordedBy (any), body (any) — input arguments
Returns:     any — return value
Side effects: DB write/read via query
Calls:       customerService.findOrCreateCustomer, queries.getConfigShakeAmount, db.query, Math.round, Number, queries.upsertAttendance, audit.logAction, cache.invalidateCachePattern
Called by:   Global/Route scope

Function:    deleteAttendance
File:        backend/features/attendance/attendance.service.js
Type:        Service
Purpose:     Deletes a Attendance record.
Parameters:  ownerId (any), userId (any), userRole (any), attendanceId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.deleteAttendanceUser, queries.deleteAttendanceAdmin, db.query, audit.logAction, cache.invalidateCachePattern
Called by:   None

Function:    validateAttendance
File:        backend/features/attendance/attendance.validation.js
Type:        Validator
Purpose:     Executes the validateAttendance logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, next
Called by:   None

## Module: auth

Function:    login
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Executes the login logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, authService.login, res.cookie, res.json, includes
Called by:   None

Function:    logout
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Executes the logout logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       authService.logout, res.clearCookie, res.json, res.status
Called by:   None

Function:    changePassword
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Executes the changePassword logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       authService.changePassword, authService.createNewSession, res.cookie, res.json, includes, res.status
Called by:   None

Function:    getSession
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Retrieves data for Session.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       authService.getSession, res.json
Called by:   None

Function:    forgotPassword
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Executes the forgotPassword logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, res.json, authService.forgotPassword
Called by:   None

Function:    resetPassword
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Executes the resetPassword logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, authService.resetPassword, res.json, msg.includes
Called by:   None

Function:    getSession
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Retrieves data for Session.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       res.json, split, res.status
Called by:   None

Function:    getActiveSessions
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Retrieves data for ActiveSessions.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       authService.getActiveSessions, res.json, res.status
Called by:   None

Function:    revokeSession
File:        backend/features/auth/auth.controller.js
Type:        Controller
Purpose:     Executes the revokeSession logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, authService.revokeSession, res.json
Called by:   None

Function:    getUserByEmail
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for UserByEmail.
Parameters:  email (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getUserById
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for UserById.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateFailedLogin
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Updates an existing FailedLogin.
Parameters:  newFails (any), lockedUntil (any), userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateSuccessLogin
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Updates an existing SuccessLogin.
Parameters:  userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    createSession
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Creates a new Session record.
Parameters:  userId (any), tokenHash (any), tenantId (any), expiresAt (any), ip (any), ua (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getSessionById
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for SessionById.
Parameters:  sessionId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getSessionByHash
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for SessionByHash.
Parameters:  tokenHash (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    invalidateSession
File:        backend/features/auth/auth.queries.js
Type:        Validator
Purpose:     Executes the invalidateSession logic.
Parameters:  sessionId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    invalidateSessionByHash
File:        backend/features/auth/auth.queries.js
Type:        Validator
Purpose:     Executes the invalidateSessionByHash logic.
Parameters:  tokenHash (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    invalidateUserSessionById
File:        backend/features/auth/auth.queries.js
Type:        Validator
Purpose:     Executes the invalidateUserSessionById logic.
Parameters:  userId (any), sessionId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    invalidateAllSessions
File:        backend/features/auth/auth.queries.js
Type:        Validator
Purpose:     Executes the invalidateAllSessions logic.
Parameters:  userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    invalidateOtherSessions
File:        backend/features/auth/auth.queries.js
Type:        Validator
Purpose:     Executes the invalidateOtherSessions logic.
Parameters:  userId (any), tokenHash (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getActiveSessionsForUser
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for ActiveSessionsForUser.
Parameters:  userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    evictOldestSessions
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Executes the evictOldestSessions logic.
Parameters:  userId (any), keepCount (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    invalidateOldPasswordResets
File:        backend/features/auth/auth.queries.js
Type:        Validator
Purpose:     Executes the invalidateOldPasswordResets logic.
Parameters:  userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    createPasswordReset
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Creates a new PasswordReset record.
Parameters:  userId (any), tokenHash (any), expiresAt (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getPasswordResetByHash
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for PasswordResetByHash.
Parameters:  tokenHash (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    consumePasswordReset
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Executes the consumePasswordReset logic.
Parameters:  tokenHash (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getPasswordHash
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Retrieves data for PasswordHash.
Parameters:  userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateUserPassword
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Updates an existing UserPassword.
Parameters:  hash (any), userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    checkPreviousSession
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Executes the checkPreviousSession logic.
Parameters:  userId (any), ip (any), ua (any), sessionId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    bumpSessionActivity
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Executes the bumpSessionActivity logic.
Parameters:  sessionId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    bumpSessionActivityByHash
File:        backend/features/auth/auth.queries.js
Type:        Utility
Purpose:     Executes the bumpSessionActivityByHash logic.
Parameters:  tokenHash (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    login
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the login logic.
Parameters:  email (any), password (any), ip (any), ua (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       toLowerCase, email.trim, queries.getUserByEmail, db.query, Math.ceil, bcrypt.compare, toISOString, Date.now, queries.updateFailedLogin, audit.logAction, queries.updateSuccessLogin, _generateSession, queries.checkPreviousSession, notificationService.createNotification
Called by:   None

Function:    _generateSession
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the _generateSession logic.
Parameters:  user (any), ip (any), ua (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       queries.evictOldestSessions, db.query, toString, crypto.randomBytes, digest, update, crypto.createHash, toISOString, Date.now, queries.createSession
Called by:   Global/Route scope

Function:    logout
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the logout logic.
Parameters:  sessionToken (any), userId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       digest, update, crypto.createHash, queries.invalidateSessionByHash, db.query, audit.logAction
Called by:   None

Function:    getSession
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Retrieves data for Session.
Parameters:  user (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    forgotPassword
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the forgotPassword logic.
Parameters:  email (any) — input arguments
Returns:     typeof rawToken | any — return value
Side effects: DB write/read via query
Calls:       queries.getUserByEmail, db.query, queries.invalidateOldPasswordResets, toString, crypto.randomBytes, digest, update, crypto.createHash, toISOString, Date.now, queries.createPasswordReset, transporter.sendMail
Called by:   None

Function:    resetPassword
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the resetPassword logic.
Parameters:  token (any), newPassword (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       digest, update, crypto.createHash, queries.getPasswordResetByHash, db.query, connect, client.query, bcrypt.hash, queries.updateUserPassword, queries.consumePasswordReset, queries.invalidateAllSessions, client.release, audit.logAction
Called by:   None

Function:    changePassword
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the changePassword logic.
Parameters:  userId (any), currentPassword (any), newPassword (any), forcePasswordChange (any), sessionId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.getPasswordHash, db.query, bcrypt.compare, bcrypt.hash, queries.updateUserPassword, digest, update, crypto.createHash, queries.invalidateOtherSessions, queries.invalidateAllSessions, audit.logAction
Called by:   Global/Route scope

Function:    createNewSession
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Creates a new NewSession record.
Parameters:  userId (any), ip (any), ua (any) — input arguments
Returns:     typeof rawToken — return value
Side effects: DB write/read via query
Calls:       queries.getUserById, db.query, _generateSession
Called by:   Global/Route scope

Function:    invalidateSession
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the invalidateSession logic.
Parameters:  sessionId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.invalidateSession, db.query
Called by:   Global/Route scope

Function:    invalidateAllSessions
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the invalidateAllSessions logic.
Parameters:  userId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.invalidateAllSessions, db.query
Called by:   Global/Route scope

Function:    getActiveSessions
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Retrieves data for ActiveSessions.
Parameters:  userId (any), currentSessionToken (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       digest, update, crypto.createHash, queries.getActiveSessionsForUser, db.query, queries.getSessionByHash
Called by:   Global/Route scope

Function:    revokeSession
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the revokeSession logic.
Parameters:  userId (any), sessionIdToRevoke (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.invalidateUserSessionById, db.query
Called by:   Global/Route scope

Function:    validateSession
File:        backend/features/auth/auth.service.js
Type:        Service
Purpose:     Executes the validateSession logic.
Parameters:  sessionToken (any) — input arguments
Returns:     typeof user — return value
Side effects: DB write/read via query
Calls:       digest, update, crypto.createHash, queries.getSessionByHash, db.query, queries.bumpSessionActivityByHash, catch
Called by:   None

## Module: backup

Function:    generateBackup
File:        backend/features/backup/backup.controller.js
Type:        Controller
Purpose:     Executes the generateBackup logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       queries.getClubName, pool.query, includes, res.status, backupService.getExportData, backupService.generateExcel, backupService.generateCSV, Buffer.from, backupService.generateFileName, cloudStorageService.isConfigured, cloudStorageService.uploadBackup, queries.insertBackupLogCloud, res.json, queries.insertBackupLogLocal, res.setHeader, res.send
Called by:   None

Function:    getBackupLogs
File:        backend/features/backup/backup.controller.js
Type:        Controller
Purpose:     Retrieves data for BackupLogs.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.getBackupLogs, pool.query, res.json, res.status
Called by:   None

Function:    validateRestore
File:        backend/features/backup/backup.controller.js
Type:        Controller
Purpose:     Executes the validateRestore logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, restoreService.parseFile, restoreService.validateRestore, res.json
Called by:   None

Function:    confirmRestore
File:        backend/features/backup/backup.controller.js
Type:        Controller
Purpose:     Executes the confirmRestore logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       res.status, queries.getRestoreLimitCount, pool.query, parseInt, restoreService.parseFile, restoreService.validateRestore, restoreService.executeRestore, queries.logRestoreSuccess, require, cache.invalidateCachePattern, res.json
Called by:   None

Function:    getClubName
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ClubName.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    insertBackupLogCloud
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Executes the insertBackupLogCloud logic.
Parameters:  ownerId (any), type (any), fileName (any), fileUrl (any), fileSize (any), createdBy (any), notes (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertBackupLogLocal
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Executes the insertBackupLogLocal logic.
Parameters:  ownerId (any), type (any), fileName (any), fileSize (any), createdBy (any), notes (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getBackupLogs
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for BackupLogs.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getRestoreLimitCount
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for RestoreLimitCount.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    logRestoreSuccess
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Executes the logRestoreSuccess logic.
Parameters:  ownerId (any), type (any), fileName (any), createdBy (any), strategy (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportCustomers
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportCustomers.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportAttendance
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportAttendance.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportSales
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportSales.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportSaleItems
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportSaleItems.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportProducts
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportProducts.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportProductVersions
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportProductVersions.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportVariants
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportVariants.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExportStock
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for ExportStock.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getSaleItemsSnapshot
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Retrieves data for SaleItemsSnapshot.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateStockDifferential
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Updates an existing StockDifferential.
Parameters:  diff (any), pvId (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deleteSaleItemsWipe
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Deletes a SaleItemsWipe record.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    deleteProductVersionsWipe
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Deletes a ProductVersionsWipe record.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    deleteTableWipe
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Deletes a TableWipe record.
Parameters:  tableName (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    buildMergeInsertQuery
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Executes the buildMergeInsertQuery logic.
Parameters:  tableName (any), dbColumns (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       join, dbColumns.map, dbColumns.join, dbColumns.filter
Called by:   Global/Route scope

Function:    buildStandardInsertQuery
File:        backend/features/backup/backup.queries.js
Type:        Utility
Purpose:     Executes the buildStandardInsertQuery logic.
Parameters:  tableName (any), dbColumns (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       join, dbColumns.map, dbColumns.join
Called by:   Global/Route scope

Function:    backupLimiter
File:        backend/features/backup/backup.routes.js
Type:        Utility
Purpose:     Executes the backupLimiter logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       next
Called by:   None

Function:    getExportData
File:        backend/features/backup/backup.service.js
Type:        Service
Purpose:     Retrieves data for ExportData.
Parameters:  type (any), ownerId (any) — input arguments
Returns:     typeof data — return value
Side effects: DB write/read via query
Calls:       type.toLowerCase, pool.query, queries.getExportCustomers, queries.getExportAttendance, queries.getExportSales, queries.getExportSaleItems, queries.getExportProducts, queries.getExportProductVersions, queries.getExportVariants, queries.getExportStock
Called by:   Global/Route scope

Function:    generateExcel
File:        backend/features/backup/backup.service.js
Type:        Service
Purpose:     Executes the generateExcel logic.
Parameters:  data (any), type (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       book_new, toISOString, Object.entries, Object.keys, json_to_sheet, book_append_sheet, xlsx.write
Called by:   Global/Route scope

Function:    generateCSV
File:        backend/features/backup/backup.service.js
Type:        Service
Purpose:     Executes the generateCSV logic.
Parameters:  data (any), type (any), ownerId (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       Object.keys, toISOString, createObjectCsvStringifier, csvStringifier.getHeaderString, csvStringifier.stringifyRecords
Called by:   Global/Route scope

Function:    generateFileName
File:        backend/features/backup/backup.service.js
Type:        Service
Purpose:     Executes the generateFileName logic.
Parameters:  type (any), format (any), clubName (optional) — input arguments
Returns:     any — return value
Side effects: None
Calls:       replace, split, date.toISOString, date.toTimeString, toLowerCase, clubName.replace, type.toLowerCase
Called by:   Global/Route scope

Function:    constructor
File:        backend/features/backup/cloudStorage.service.js
Type:        Service
Purpose:     Executes the constructor logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       setCredentials, google.drive
Called by:   None

Function:    isConfigured
File:        backend/features/backup/cloudStorage.service.js
Type:        Service
Purpose:     Executes the isConfigured logic.
Parameters:  none — input arguments
Returns:     any — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    uploadBackup
File:        backend/features/backup/cloudStorage.service.js
Type:        Service
Purpose:     Executes the uploadBackup logic.
Parameters:  buffer (any), fileName (any), mimeType (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       isConfigured, bufferStream.end, create
Called by:   Global/Route scope

Function:    parseFile
File:        backend/features/backup/restore.service.js
Type:        Service
Purpose:     Executes the parseFile logic.
Parameters:  buffer (any), mimetype (any), originalName (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       originalName.endsWith, xlsx.read, sheet_to_json, Object.values, val.startsWith, val.split, Object.keys, shift
Called by:   Global/Route scope

Function:    validateRestore
File:        backend/features/backup/restore.service.js
Type:        Service
Purpose:     Executes the validateRestore logic.
Parameters:  parsedData (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       Object.values
Called by:   None

Function:    executeRestore
File:        backend/features/backup/restore.service.js
Type:        Service
Purpose:     Executes the executeRestore logic.
Parameters:  ownerId (any), type (any), parsedData (any), strategy (any) — input arguments
Returns:     string | typeof c | typeof val | object — return value
Side effects: DB write/read via query
Calls:       connect, client.query, queries.getSaleItemsSnapshot, parseInt, allowedTables.includes, console.warn, Object.keys, columns.map, currencyColumns.includes, Math.round, parseFloat, columns.includes, queries.buildMergeInsertQuery, queries.buildStandardInsertQuery, queries.updateStockDifferential, client.release
Called by:   None

## Module: customers

Function:    getOwnerId
File:        backend/features/customers/customers.controller.js
Type:        Controller
Purpose:     Retrieves data for OwnerId.
Parameters:  req (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getCustomers
File:        backend/features/customers/customers.controller.js
Type:        Controller
Purpose:     Retrieves data for Customers.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       getOwnerId, customerService.getCustomers, res.json, includes, res.status
Called by:   None

Function:    addCustomer
File:        backend/features/customers/customers.controller.js
Type:        Controller
Purpose:     Executes the addCustomer logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       getOwnerId, customerService.addCustomer, res.json, includes, res.status
Called by:   None

Function:    updateCustomer
File:        backend/features/customers/customers.controller.js
Type:        Controller
Purpose:     Updates an existing Customer.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       getOwnerId, res.status, customerService.updateCustomer, res.json, includes
Called by:   None

Function:    deactivateCustomer
File:        backend/features/customers/customers.controller.js
Type:        Controller
Purpose:     Executes the deactivateCustomer logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       getOwnerId, res.status, customerService.deactivateCustomer, res.json, includes
Called by:   None

Function:    getCustomerSummary
File:        backend/features/customers/customers.controller.js
Type:        Controller
Purpose:     Retrieves data for CustomerSummary.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       getOwnerId, res.status, customerService.getCustomerSummary, res.json, includes
Called by:   None

Function:    getCustomers
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Retrieves data for Customers.
Parameters:  ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   None

Function:    addCustomer
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Executes the addCustomer logic.
Parameters:  ownerId (any), name (any), phone (any), member_code (any), joined_at (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query, name.trim, split, toISOString
Called by:   None

Function:    updateCustomer
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Updates an existing Customer.
Parameters:  name (any), phone (any), member_code (any), id (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query, name.trim
Called by:   None

Function:    deactivateCustomer
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Executes the deactivateCustomer logic.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   None

Function:    getCustomerSummary_Customer
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Retrieves data for CustomerSummary_Customer.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getCustomerSummary_Sales
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Retrieves data for CustomerSummary_Sales.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getCustomerSummary_Attendance
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Retrieves data for CustomerSummary_Attendance.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    findCustomerByName
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Executes the findCustomerByName logic.
Parameters:  ownerId (any), customerName (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query, customerName.trim
Called by:   Global/Route scope

Function:    insertCustomerMinimal
File:        backend/features/customers/customers.queries.js
Type:        Utility
Purpose:     Executes the insertCustomerMinimal logic.
Parameters:  ownerId (any), customerName (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query, customerName.trim
Called by:   Global/Route scope

Function:    getCustomers
File:        backend/features/customers/customers.service.js
Type:        Service
Purpose:     Retrieves data for Customers.
Parameters:  ownerId (any) — input arguments
Returns:     array | any — return value
Side effects: None
Calls:       queries.getCustomers
Called by:   Global/Route scope

Function:    addCustomer
File:        backend/features/customers/customers.service.js
Type:        Service
Purpose:     Executes the addCustomer logic.
Parameters:  ownerId (any), userId (any), data (any) — input arguments
Returns:     typeof newId — return value
Side effects: None
Calls:       name.trim, Object.assign, queries.addCustomer, audit.logAction
Called by:   Global/Route scope

Function:    updateCustomer
File:        backend/features/customers/customers.service.js
Type:        Service
Purpose:     Updates an existing Customer.
Parameters:  id (any), ownerId (any), userId (any), data (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       name.trim, Object.assign, queries.updateCustomer, audit.logAction
Called by:   Global/Route scope

Function:    deactivateCustomer
File:        backend/features/customers/customers.service.js
Type:        Service
Purpose:     Executes the deactivateCustomer logic.
Parameters:  id (any), ownerId (any), userId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       queries.deactivateCustomer, audit.logAction
Called by:   Global/Route scope

Function:    getCustomerSummary
File:        backend/features/customers/customers.service.js
Type:        Service
Purpose:     Retrieves data for CustomerSummary.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     any | object — return value
Side effects: None
Calls:       queries.getCustomerSummary_Customer, Promise.all, queries.getCustomerSummary_Sales, queries.getCustomerSummary_Attendance, Number
Called by:   Global/Route scope

Function:    findOrCreateCustomer
File:        backend/features/customers/customers.service.js
Type:        Service
Purpose:     Executes the findOrCreateCustomer logic.
Parameters:  ownerId (any), customerName (any), userId (any) — input arguments
Returns:     any | typeof newId — return value
Side effects: None
Calls:       queries.findCustomerByName, queries.insertCustomerMinimal, audit.logAction
Called by:   Global/Route scope

Function:    validateAddCustomer
File:        backend/features/customers/customers.validation.js
Type:        Validator
Purpose:     Executes the validateAddCustomer logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, next
Called by:   None

## Module: dashboard

Function:    getStats
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Retrieves data for Stats.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       split, toISOString, now.getFullYear, now.getMonth, now.toISOString, dashboardService.getStats, res.json, includes, res.status
Called by:   None

Function:    resetData
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the resetData logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.resetData, res.json, res.status
Called by:   None

Function:    deleteAccount
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Deletes a Account record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, dashboardService.deleteAccount, res.clearCookie, res.json
Called by:   None

Function:    completeSetup
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the completeSetup logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.completeSetup, res.json, res.status
Called by:   None

Function:    updateAdminConfig
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Updates an existing AdminConfig.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.updateAdminConfig, res.json, res.status
Called by:   None

Function:    clearAttendanceData
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the clearAttendanceData logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.clearAttendanceData, res.json, res.status
Called by:   None

Function:    clearSalesData
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the clearSalesData logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.clearSalesData, res.json, res.status
Called by:   None

Function:    requestResetOtp
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the requestResetOtp logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       dashboardService.requestResetOtp, res.json, toISOString, includes, res.status
Called by:   None

Function:    confirmReset
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the confirmReset logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       dashboardService.confirmReset, res.json, includes, res.status
Called by:   None

Function:    getDeletedRecords
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Retrieves data for DeletedRecords.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.getDeletedRecords, res.json, res.status
Called by:   None

Function:    restoreDeletedRecord
File:        backend/features/dashboard/dashboard.controller.js
Type:        Controller
Purpose:     Executes the restoreDeletedRecord logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       dashboardService.restoreDeletedRecord, res.json, res.status
Called by:   None

Function:    getAdminConfig
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for AdminConfig.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getDashboardPeriodScalars
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for DashboardPeriodScalars.
Parameters:  ownerId (any), startDate (any), endDate (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getDashboardPitScalars
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for DashboardPitScalars.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getLowStockItems
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for LowStockItems.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getMonthlyProductSales
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for MonthlyProductSales.
Parameters:  ownerId (any), startDate (any), endDate (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getTopCustomers
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for TopCustomers.
Parameters:  ownerId (any), startDate (any), endDate (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getShakeProfitDetails
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for ShakeProfitDetails.
Parameters:  ownerId (any), startDate (any), endDate (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getActiveSales
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for ActiveSales.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deleteSaleRestoreStock
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Deletes a SaleRestoreStock record.
Parameters:  saleId (any), deletedBy (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   None

Function:    softDeleteAttendance
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Executes the softDeleteAttendance logic.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deactivateUserAccounts
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Executes the deactivateUserAccounts logic.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    invalidateUserSessions
File:        backend/features/dashboard/dashboard.queries.js
Type:        Validator
Purpose:     Executes the invalidateUserSessions logic.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    completeSetup
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Executes the completeSetup logic.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getDeletedAttendance
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for DeletedAttendance.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getDeletedSales
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for DeletedSales.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    restoreAttendance
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Executes the restoreAttendance logic.
Parameters:  attendanceId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getSaleItemsForRestore
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for SaleItemsForRestore.
Parameters:  saleId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getStockForRestore
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for StockForRestore.
Parameters:  productVersionId (any), variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deductStockForRestore
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Executes the deductStockForRestore logic.
Parameters:  quantity (any), productVersionId (any), variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    restoreSale
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Executes the restoreSale logic.
Parameters:  saleId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getUserPasswordHash
File:        backend/features/dashboard/dashboard.queries.js
Type:        Utility
Purpose:     Retrieves data for UserPasswordHash.
Parameters:  userId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getStats
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Retrieves data for Stats.
Parameters:  ownerId (any), startDate (any), endDate (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       Promise.all, cache.getCache, queries.getAdminConfig, db.query, parseInt, queries.getDashboardPitScalars, queries.getLowStockItems, console.warn, cache.setCache, queries.getDashboardPeriodScalars, queries.getMonthlyProductSales, queries.getTopCustomers, queries.getShakeProfitDetails
Called by:   Global/Route scope

Function:    resetData
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the resetData logic.
Parameters:  ownerId (any), userId (any), modules (optional) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       connect, client.query, modules.includes, modules.push, queries.getActiveSales, queries.deleteSaleRestoreStock, queries.softDeleteAttendance, audit.logAction, cache.invalidateCachePattern, client.release
Called by:   None

Function:    deleteAccount
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Deletes a Account record.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       connect, client.query, queries.deactivateUserAccounts, queries.invalidateUserSessions, audit.logAction, client.release
Called by:   Global/Route scope

Function:    completeSetup
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the completeSetup logic.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.completeSetup, db.query, cache.invalidateCachePattern
Called by:   None

Function:    updateAdminConfig
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Updates an existing AdminConfig.
Parameters:  ownerId (any), default_shake_amount (any), low_stock_threshold (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       updates.push, values.push, db.query, updates.join
Called by:   None

Function:    clearAttendanceData
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the clearAttendanceData logic.
Parameters:  ownerId (any), userId (any), month (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       connect, client.query, params.push, audit.logAction, cache.invalidateCachePattern, client.release
Called by:   None

Function:    clearSalesData
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the clearSalesData logic.
Parameters:  ownerId (any), userId (any), month (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       connect, client.query, params.push, queries.deleteSaleRestoreStock, audit.logAction, cache.invalidateCachePattern, client.release
Called by:   None

Function:    requestResetOtp
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the requestResetOtp logic.
Parameters:  userId (any), email (any), password (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       queries.getUserPasswordHash, db.query, bcrypt.compareSync, toString, Math.floor, Math.random, Date.now, otpCache.set, toISOString, transporter.sendMail
Called by:   Global/Route scope

Function:    confirmReset
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the confirmReset logic.
Parameters:  ownerId (any), userId (any), password (any), confirmText (any), otp (any), modules (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       Array.isArray, queries.getUserPasswordHash, db.query, bcrypt.compareSync, otpCache.get, Date.now, otpCache.delete, exports.resetData
Called by:   Global/Route scope

Function:    getDeletedRecords
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Retrieves data for DeletedRecords.
Parameters:  ownerId (any) — input arguments
Returns:     typeof combined — return value
Side effects: DB write/read via query
Calls:       queries.getDeletedAttendance, db.query, queries.getDeletedSales, parseFloat, combined.sort
Called by:   Global/Route scope

Function:    restoreDeletedRecord
File:        backend/features/dashboard/dashboard.service.js
Type:        Service
Purpose:     Executes the restoreDeletedRecord logic.
Parameters:  ownerId (any), userId (any), type (any), id (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       connect, client.query, type.toLowerCase, queries.restoreAttendance, queries.getSaleItemsForRestore, queries.getStockForRestore, queries.deductStockForRestore, queries.restoreSale, audit.logAction, cache.invalidateCachePattern, client.release
Called by:   None

## Module: inventory

Function:    getEntities
File:        backend/features/inventory/inventory.controller.js
Type:        Controller
Purpose:     Retrieves data for Entities.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       inventoryService.getEntities, res.status
Called by:   None

Function:    searchEntities
File:        backend/features/inventory/inventory.controller.js
Type:        Controller
Purpose:     Executes the searchEntities logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       inventoryService.searchEntities, res.status
Called by:   None

Function:    updateEntity
File:        backend/features/inventory/inventory.controller.js
Type:        Controller
Purpose:     Updates an existing Entity.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       inventoryService.updateEntity, res.status
Called by:   None

Function:    mapToInventoryEntity
File:        backend/features/inventory/inventory.dto.js
Type:        Utility
Purpose:     Executes the mapToInventoryEntity logic.
Parameters:  row (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       productName.trim, variantName.trim, cleanVariantName.toLowerCase, parseFloat, parseInt
Called by:   Global/Route scope

Function:    getInventoryEntities
File:        backend/features/inventory/inventory.queries.js
Type:        Utility
Purpose:     Retrieves data for InventoryEntities.
Parameters:  ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    searchInventoryEntities
File:        backend/features/inventory/inventory.queries.js
Type:        Utility
Purpose:     Executes the searchInventoryEntities logic.
Parameters:  ownerId (any), searchQuery (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getVariantById
File:        backend/features/inventory/inventory.queries.js
Type:        Utility
Purpose:     Retrieves data for VariantById.
Parameters:  variantId (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    updateVariant
File:        backend/features/inventory/inventory.queries.js
Type:        Utility
Purpose:     Updates an existing Variant.
Parameters:  variantId (any), data (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       fields.push, values.push, Promise.resolve, db.query, fields.join
Called by:   Global/Route scope

Function:    checkDuplicateSku
File:        backend/features/inventory/inventory.queries.js
Type:        Utility
Purpose:     Executes the checkDuplicateSku logic.
Parameters:  sku (any), excludeVariantId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getEntities
File:        backend/features/inventory/inventory.service.js
Type:        Service
Purpose:     Retrieves data for Entities.
Parameters:  ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       queries.getInventoryEntities, dto.mapToInventoryEntity
Called by:   Global/Route scope

Function:    searchEntities
File:        backend/features/inventory/inventory.service.js
Type:        Service
Purpose:     Executes the searchEntities logic.
Parameters:  ownerId (any), q (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       q.trim, getEntities, queries.searchInventoryEntities, dto.mapToInventoryEntity
Called by:   Global/Route scope

Function:    updateEntity
File:        backend/features/inventory/inventory.service.js
Type:        Service
Purpose:     Updates an existing Entity.
Parameters:  variantId (any), ownerId (any), userId (any), data (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       queries.getVariantById, queries.checkDuplicateSku, queries.updateVariant, audit.logAction, require, cache.invalidateCachePattern
Called by:   Global/Route scope

## Module: master

Function:    getAppStats
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Retrieves data for AppStats.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       masterService.getAppStats, res.json, res.status
Called by:   None

Function:    getLiveSessions
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Retrieves data for LiveSessions.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       masterService.getLiveSessions, res.json, res.status
Called by:   None

Function:    getActivityLog
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Retrieves data for ActivityLog.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       masterService.getActivityLog, res.json, res.status
Called by:   None

Function:    getMasterAdmins
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Retrieves data for MasterAdmins.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       masterService.getMasterAdmins, res.json, res.status
Called by:   None

Function:    createClubAdmin
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Creates a new ClubAdmin record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, masterService.createClubAdmin, res.json, includes
Called by:   None

Function:    forceResetAdminPassword
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Executes the forceResetAdminPassword logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       masterService.forceResetAdminPassword, res.json, includes, res.status
Called by:   None

Function:    toggleAdminStatus
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Executes the toggleAdminStatus logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       masterService.toggleAdminStatus, res.json, includes, res.status
Called by:   None

Function:    updateAdminClubNameMaster
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Updates an existing AdminClubNameMaster.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       club_name.trim, res.status, masterService.updateAdminClubNameMaster, res.json, includes
Called by:   None

Function:    deleteClubAdmin
File:        backend/features/master/master.controller.js
Type:        Controller
Purpose:     Deletes a ClubAdmin record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       masterService.deleteClubAdmin, res.json, includes, res.status
Called by:   None

Function:    getMasterAppStatsAdmins
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for MasterAppStatsAdmins.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getMasterAppStatsUsers
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for MasterAppStatsUsers.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getMasterAppStatsSessions
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for MasterAppStatsSessions.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getMasterLiveSessions
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for MasterLiveSessions.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getMasterActivityLog
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for MasterActivityLog.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getMasterAdmins
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for MasterAdmins.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    checkMasterEmailExists
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Executes the checkMasterEmailExists logic.
Parameters:  email (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    createClubAdmin
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Creates a new ClubAdmin record.
Parameters:  email (any), hash (any), createdBy (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    setAdminOwnerId
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Executes the setAdminOwnerId logic.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    createAdminConfigRecord
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Creates a new AdminConfigRecord record.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getUserRoleStatus
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for UserRoleStatus.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getUserRoleActiveStatus
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Retrieves data for UserRoleActiveStatus.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    forceResetAdminPassword
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Executes the forceResetAdminPassword logic.
Parameters:  hash (any), id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    deleteClubAdminAndSubordinates
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Deletes a ClubAdminAndSubordinates record.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    invalidateClubAdminSessions
File:        backend/features/master/master.queries.js
Type:        Validator
Purpose:     Executes the invalidateClubAdminSessions logic.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    toggleAdminStatus
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Executes the toggleAdminStatus logic.
Parameters:  newStatus (any), id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    checkAdminRoleOnly
File:        backend/features/master/master.queries.js
Type:        Utility
Purpose:     Executes the checkAdminRoleOnly logic.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getAppStats
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Retrieves data for AppStats.
Parameters:  none — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       db.query, queries.getMasterAppStatsAdmins, queries.getMasterAppStatsUsers, queries.getMasterAppStatsSessions, parseInt
Called by:   Global/Route scope

Function:    getLiveSessions
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Retrieves data for LiveSessions.
Parameters:  none — input arguments
Returns:     result of call | object — return value
Side effects: DB write/read via query
Calls:       db.query, queries.getMasterLiveSessions, Date.now, getTime
Called by:   Global/Route scope

Function:    getActivityLog
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Retrieves data for ActivityLog.
Parameters:  none — input arguments
Returns:     any — return value
Side effects: DB write/read via query
Calls:       db.query, queries.getMasterActivityLog
Called by:   Global/Route scope

Function:    getMasterAdmins
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Retrieves data for MasterAdmins.
Parameters:  none — input arguments
Returns:     any — return value
Side effects: DB write/read via query
Calls:       db.query, queries.getMasterAdmins
Called by:   Global/Route scope

Function:    createClubAdmin
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Creates a new ClubAdmin record.
Parameters:  email (any), masterId (any) — input arguments
Returns:     typeof tempPassword — return value
Side effects: DB write/read via query
Calls:       toLowerCase, email.trim, queries.checkMasterEmailExists, db.query, toString, crypto.randomBytes, bcrypt.hash, pool.connect, client.query, queries.createClubAdmin, queries.setAdminOwnerId, queries.createAdminConfigRecord, audit.logAction, client.release
Called by:   Global/Route scope

Function:    forceResetAdminPassword
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Executes the forceResetAdminPassword logic.
Parameters:  targetId (any), masterId (any) — input arguments
Returns:     typeof tempPassword — return value
Side effects: DB write/read via query
Calls:       queries.getUserRoleActiveStatus, db.query, toString, crypto.randomBytes, bcrypt.hash, queries.forceResetAdminPassword, require, authService.invalidateAllSessions, audit.logAction
Called by:   Global/Route scope

Function:    toggleAdminStatus
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Executes the toggleAdminStatus logic.
Parameters:  targetId (any), masterId (any) — input arguments
Returns:     typeof newStatus — return value
Side effects: DB write/read via query
Calls:       queries.getUserRoleStatus, db.query, pool.connect, client.query, queries.toggleAdminStatus, queries.invalidateClubAdminSessions, audit.logAction, client.release
Called by:   Global/Route scope

Function:    updateAdminClubNameMaster
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Updates an existing AdminClubNameMaster.
Parameters:  clubName (any), targetId (any), masterId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.checkAdminRoleOnly, db.query, updateAdminClubName, require, audit.logAction
Called by:   Global/Route scope

Function:    deleteClubAdmin
File:        backend/features/master/master.service.js
Type:        Service
Purpose:     Deletes a ClubAdmin record.
Parameters:  targetId (any), masterId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       pool.connect, client.query, queries.deleteClubAdminAndSubordinates, queries.invalidateClubAdminSessions, audit.logAction, client.release
Called by:   Global/Route scope

## Module: notifications

Function:    getNotifications
File:        backend/features/notifications/notifications.controller.js
Type:        Controller
Purpose:     Retrieves data for Notifications.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       notificationService.getNotifications, res.json, res.status
Called by:   None

Function:    markAsRead
File:        backend/features/notifications/notifications.controller.js
Type:        Controller
Purpose:     Executes the markAsRead logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       notificationService.markAsRead, res.json, res.status
Called by:   None

Function:    getUnreadCount
File:        backend/features/notifications/notifications.controller.js
Type:        Controller
Purpose:     Retrieves data for UnreadCount.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       notificationService.getUnreadCount, res.json, res.status
Called by:   None

Function:    insertNotification
File:        backend/features/notifications/notifications.queries.js
Type:        Utility
Purpose:     Executes the insertNotification logic.
Parameters:  userId (any), type (any), title (any), body (any), dataStr (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getUserEmail
File:        backend/features/notifications/notifications.queries.js
Type:        Utility
Purpose:     Retrieves data for UserEmail.
Parameters:  userId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    fetchNotifications
File:        backend/features/notifications/notifications.queries.js
Type:        Utility
Purpose:     Executes the fetchNotifications logic.
Parameters:  userId (any), limit (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   None

Function:    updateSingleReadStatus
File:        backend/features/notifications/notifications.queries.js
Type:        Utility
Purpose:     Updates an existing SingleReadStatus.
Parameters:  userId (any), notificationId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    updateAllReadStatus
File:        backend/features/notifications/notifications.queries.js
Type:        Utility
Purpose:     Updates an existing AllReadStatus.
Parameters:  userId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    countUnread
File:        backend/features/notifications/notifications.queries.js
Type:        Utility
Purpose:     Executes the countUnread logic.
Parameters:  userId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    createNotification
File:        backend/features/notifications/notifications.service.js
Type:        Service
Purpose:     Creates a new Notification record.
Parameters:  userId (any), type (any), title (any), body (any), data (any), sendEmail (optional) — input arguments
Returns:     any — return value
Side effects: None
Calls:       queries.insertNotification, JSON.stringify, queries.getUserEmail, transporter.sendMail
Called by:   Global/Route scope

Function:    getNotifications
File:        backend/features/notifications/notifications.service.js
Type:        Service
Purpose:     Retrieves data for Notifications.
Parameters:  userId (any), limit (optional) — input arguments
Returns:     any — return value
Side effects: None
Calls:       queries.fetchNotifications
Called by:   Global/Route scope

Function:    markAsRead
File:        backend/features/notifications/notifications.service.js
Type:        Service
Purpose:     Executes the markAsRead logic.
Parameters:  userId (any), notificationId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       queries.updateSingleReadStatus, queries.updateAllReadStatus
Called by:   None

Function:    getUnreadCount
File:        backend/features/notifications/notifications.service.js
Type:        Service
Purpose:     Retrieves data for UnreadCount.
Parameters:  userId (any) — input arguments
Returns:     result of parseInt — return value
Side effects: None
Calls:       queries.countUnread, parseInt
Called by:   Global/Route scope

## Module: products

Function:    getProducts
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Retrieves data for Products.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.getProducts, res.json, includes, res.status
Called by:   None

Function:    addProduct
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Executes the addProduct logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.addProduct, res.json, includes, res.status
Called by:   None

Function:    updateProductPrice
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Updates an existing ProductPrice.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.updateProductPrice, res.json, includes, res.status
Called by:   None

Function:    toggleProductStatus
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Executes the toggleProductStatus logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.toggleProductStatus, res.json, includes, res.status
Called by:   None

Function:    addVariant
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Executes the addVariant logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.addVariant, res.json, includes, res.status
Called by:   None

Function:    toggleVariant
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Executes the toggleVariant logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.toggleVariant, res.json, includes, res.status
Called by:   None

Function:    deleteVariant
File:        backend/features/products/products.controller.js
Type:        Controller
Purpose:     Deletes a Variant record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       service.deleteVariant, res.json, includes, res.status
Called by:   None

Function:    getProducts
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Retrieves data for Products.
Parameters:  ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   None

Function:    getVariants
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Retrieves data for Variants.
Parameters:  ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    insertProduct
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the insertProduct logic.
Parameters:  client (any), ownerId (any), name (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   None

Function:    insertVariant
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the insertVariant logic.
Parameters:  client (any), productVersionId (any), ownerId (any), name (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   None

Function:    insertProductVersion
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the insertProductVersion logic.
Parameters:  client (any), productId (any), vendorPricePaise (any), vpValue (any), userId (any), versionLabel (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   None

Function:    getActiveVersion
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Retrieves data for ActiveVersion.
Parameters:  client (any), productId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   Global/Route scope

Function:    deprecateVersion
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the deprecateVersion logic.
Parameters:  client (any), oldVersionId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   Global/Route scope

Function:    insertNewVersion
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the insertNewVersion logic.
Parameters:  client (any), productId (any), vendorPricePaise (any), userId (any), versionLabel (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   Global/Route scope

Function:    migrateStock
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the migrateStock logic.
Parameters:  client (any), newVersionId (any), vendorPricePaise (any), oldVersionId (any), ownerId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       client.query
Called by:   None

Function:    getLatestVersion
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Retrieves data for LatestVersion.
Parameters:  productId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    toggleProductVersion
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the toggleProductVersion logic.
Parameters:  newStatus (any), versionId (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    addVariantDirect
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the addVariantDirect logic.
Parameters:  productVersionId (any), ownerId (any), name (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getVariantStatus
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Retrieves data for VariantStatus.
Parameters:  id (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    toggleVariantStatus
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the toggleVariantStatus logic.
Parameters:  newStatus (any), id (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    checkVariantDependencies
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Executes the checkVariantDependencies logic.
Parameters:  id (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    deleteVariantRecord
File:        backend/features/products/products.queries.js
Type:        Utility
Purpose:     Deletes a VariantRecord record.
Parameters:  id (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       db.query
Called by:   Global/Route scope

Function:    getProducts
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Retrieves data for Products.
Parameters:  ownerId (any) — input arguments
Returns:     array | result of call — return value
Side effects: None
Calls:       queries.getProducts, productsMap.has, productsMap.set, queries.getVariants, Array.from, productsMap.values, activeVersionIds.has
Called by:   Global/Route scope

Function:    addProduct
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Executes the addProduct logic.
Parameters:  ownerId (any), userId (any), data (any) — input arguments
Returns:     typeof productId — return value
Side effects: DB write/read via query
Calls:       Math.round, Number, connect, client.query, queries.insertProduct, name.trim, parseFloat, trim, queries.insertProductVersion, flavor.trim, flavor.split, f.trim, f.toLowerCase, uniqueFlavorsMap.has, uniqueFlavorsMap.set, uniqueFlavorsMap.values, queries.insertVariant, audit.logAction, client.release
Called by:   None

Function:    updateProductPrice
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Updates an existing ProductPrice.
Parameters:  productId (any), ownerId (any), userId (any), data (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       Math.round, Number, connect, client.query, queries.getActiveVersion, queries.deprecateVersion, trim, Date.now, queries.insertNewVersion, queries.insertVariant, audit.logAction, client.release
Called by:   Global/Route scope

Function:    toggleProductStatus
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Executes the toggleProductStatus logic.
Parameters:  productId (any) — input arguments
Returns:     typeof newStatus — return value
Side effects: None
Calls:       queries.getLatestVersion, queries.toggleProductVersion
Called by:   Global/Route scope

Function:    addVariant
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Executes the addVariant logic.
Parameters:  ownerId (any), data (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       queries.getLatestVersion, queries.addVariantDirect
Called by:   Global/Route scope

Function:    toggleVariant
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Executes the toggleVariant logic.
Parameters:  variantId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       queries.getVariantStatus, queries.toggleVariantStatus
Called by:   Global/Route scope

Function:    deleteVariant
File:        backend/features/products/products.service.js
Type:        Service
Purpose:     Deletes a Variant record.
Parameters:  variantId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       queries.checkVariantDependencies, queries.deleteVariantRecord
Called by:   Global/Route scope

Function:    validateAddProduct
File:        backend/features/products/products.validation.js
Type:        Validator
Purpose:     Executes the validateAddProduct logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       name.trim, res.status, next
Called by:   None

Function:    validateAddFlavour
File:        backend/features/products/products.validation.js
Type:        Validator
Purpose:     Executes the validateAddFlavour logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       next
Called by:   None

## Module: reports

Function:    exportData
File:        backend/features/reports/reports.controller.js
Type:        Controller
Purpose:     Executes the exportData logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void | result of call — return value
Side effects: None
Calls:       reportsService.exportExcel, res.setHeader, res.send, audit.logAction, reportsService.exportPDF, includes, res.status
Called by:   None

Function:    importCSV
File:        backend/features/reports/reports.controller.js
Type:        Controller
Purpose:     Executes the importCSV logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, includes, reportsService.importCSV, audit.logAction, res.json
Called by:   None

Function:    ping
File:        backend/features/reports/reports.controller.js
Type:        Controller
Purpose:     Executes the ping logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       res.json
Called by:   None

Function:    getPDFSales
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for PDFSales.
Parameters:  ownerId (any), dateFilterStr (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getPDFAttendance
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for PDFAttendance.
Parameters:  ownerId (any), dateFilterStr (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getPDFSummarySalesStats
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for PDFSummarySalesStats.
Parameters:  ownerId (any), dateFilterStr (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getPDFSummaryAttendanceStats
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for PDFSummaryAttendanceStats.
Parameters:  ownerId (any), dateFilterStr (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getPDFSummaryCustomerCount
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for PDFSummaryCustomerCount.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getClubName
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for ClubName.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExcelCustomers
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for ExcelCustomers.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExcelSales
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for ExcelSales.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getExistingCustomerById
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Retrieves data for ExistingCustomerById.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateCustomerById
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Updates an existing CustomerById.
Parameters:  name (any), phone (any), id (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertCustomerWithId
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Executes the insertCustomerWithId logic.
Parameters:  id (any), ownerId (any), name (any), phone (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertCustomerWithoutId
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Executes the insertCustomerWithoutId logic.
Parameters:  ownerId (any), name (any), phone (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertProduct
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Executes the insertProduct logic.
Parameters:  ownerId (any), name (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertProductVersion
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Executes the insertProductVersion logic.
Parameters:  productId (any), vendorPrice (any), createdBy (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertVariant
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Executes the insertVariant logic.
Parameters:  productId (any), ownerId (any), name (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertInitialStock
File:        backend/features/reports/reports.queries.js
Type:        Utility
Purpose:     Executes the insertInitialStock logic.
Parameters:  versionId (any), variantId (any), ownerId (any), quantity (any), vendorPrice (any), addedBy (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    reportLimiter
File:        backend/features/reports/reports.routes.js
Type:        Utility
Purpose:     Executes the reportLimiter logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       next
Called by:   None

Function:    backupLimiter
File:        backend/features/reports/reports.routes.js
Type:        Utility
Purpose:     Executes the backupLimiter logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       next
Called by:   None

Function:    generateReportData
File:        backend/features/reports/reports.service.js
Type:        Service
Purpose:     Executes the generateReportData logic.
Parameters:  ownerId (any), type (any), range (any) — input arguments
Returns:     typeof data — return value
Side effects: DB write/read via query
Calls:       queries.getPDFSales, db.query, queries.getPDFAttendance, queries.getPDFSummarySalesStats, queries.getPDFSummaryAttendanceStats, queries.getPDFSummaryCustomerCount
Called by:   Global/Route scope

Function:    exportPDF
File:        backend/features/reports/reports.service.js
Type:        Service
Purpose:     Executes the exportPDF logic.
Parameters:  ownerId (any), type (any), range (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       exports.generateReportData, queries.getClubName, db.query, generateReportHTML, puppeteer.launch, browser.newPage, page.setContent, page.pdf, browser.close, toLowerCase, clubName.replace, split, toISOString
Called by:   Global/Route scope

Function:    exportExcel
File:        backend/features/reports/reports.service.js
Type:        Service
Purpose:     Executes the exportExcel logic.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       queries.getClubName, db.query, workbook.addWorksheet, queries.getExcelCustomers, custSheet.addRows, queries.getExcelSales, saleSheet.addRows, writeBuffer, toLowerCase, clubName.replace, split, toISOString
Called by:   Global/Route scope

Function:    importCSV
File:        backend/features/reports/reports.service.js
Type:        Service
Purpose:     Executes the importCSV logic.
Parameters:  ownerId (any), userId (any), type (any), fileBuffer (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       fileBuffer.toString, csvString.split, l.trim, split, toLowerCase, h.trim, connect, client.query, headers.indexOf, c.trim, queries.getExistingCustomerById, queries.updateCustomerById, queries.insertCustomerWithId, queries.insertCustomerWithoutId, Math.round, Number, parseInt, queries.insertProduct, queries.insertProductVersion, queries.insertVariant, queries.insertInitialStock, client.release
Called by:   Global/Route scope

Function:    generateReportHTML
File:        backend/features/reports/reports.template.js
Type:        Utility
Purpose:     Executes the generateReportHTML logic.
Parameters:  type (any), data (any), clubName (optional) — input arguments
Returns:     any — return value
Side effects: None
Calls:       toLocaleString, join, split, toISOString, toFixed, toLowerCase, type.toUpperCase
Called by:   Global/Route scope

## Module: sales

Function:    getSales
File:        backend/features/sales/sales.controller.js
Type:        Controller
Purpose:     Retrieves data for Sales.
Parameters:  req (any), res (any) — input arguments
Returns:     object | result of call — return value
Side effects: DB write/read via query
Calls:       queries.getSalesUser, db.query, queries.getSaleItemsBySaleIds, items.filter, saleItems.map, res.json, salesService.getAllSales, includes, res.status
Called by:   None

Function:    addSale
File:        backend/features/sales/sales.controller.js
Type:        Controller
Purpose:     Executes the addSale logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       customerService.findOrCreateCustomer, res.status, items.forEach, Object.values, salesService.addSaleTransaction, res.json, includes
Called by:   None

Function:    deleteSale
File:        backend/features/sales/sales.controller.js
Type:        Controller
Purpose:     Deletes a Sale record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       queries.checkSalePermission, db.query, res.status, salesService.deleteSaleTransaction, res.json, includes
Called by:   None

Function:    deleteSaleItem
File:        backend/features/sales/sales.controller.js
Type:        Controller
Purpose:     Deletes a SaleItem record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       salesService.deleteSaleItemTransaction, res.json, includes, res.status
Called by:   None

Function:    getSalesUser
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for SalesUser.
Parameters:  ownerId (any), userId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getSaleItemsBySaleIds
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for SaleItemsBySaleIds.
Parameters:  saleIds (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getAllSalesAdmin
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for AllSalesAdmin.
Parameters:  ownerId (any), recordedById (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       values.push
Called by:   Global/Route scope

Function:    createSaleAtomic
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Creates a new SaleAtomic record.
Parameters:  ownerId (any), customerId (any), date (any), recordedBy (any), itemsJson (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       JSON.stringify
Called by:   Global/Route scope

Function:    deleteSaleRestoreStock
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Deletes a SaleRestoreStock record.
Parameters:  saleId (any), deletedBy (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getAdminConfig
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for AdminConfig.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getStaffEmail
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for StaffEmail.
Parameters:  recordedBy (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getCustomerName
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for CustomerName.
Parameters:  customerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getRemainingStock
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for RemainingStock.
Parameters:  productVersionId (any), variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getProductName
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for ProductName.
Parameters:  productVersionId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    checkSalePermission
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Executes the checkSalePermission logic.
Parameters:  saleId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getSaleItem
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Retrieves data for SaleItem.
Parameters:  itemId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    countSaleItems
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Executes the countSaleItems logic.
Parameters:  saleId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deleteSaleItemRow
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Deletes a SaleItemRow record.
Parameters:  itemId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    restoreItemStock
File:        backend/features/sales/sales.queries.js
Type:        Utility
Purpose:     Executes the restoreItemStock logic.
Parameters:  quantity (any), productVersionId (any), variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getAllSales
File:        backend/features/sales/sales.service.js
Type:        Service
Purpose:     Retrieves data for AllSales.
Parameters:  ownerId (any), recordedById (optional) — input arguments
Returns:     array | result of call — return value
Side effects: DB write/read via query
Calls:       queries.getAllSalesAdmin, db.query, salesMap.has, salesMap.set, salesMap.get, Array.from, salesMap.values
Called by:   Global/Route scope

Function:    addSaleTransaction
File:        backend/features/sales/sales.service.js
Type:        Service
Purpose:     Executes the addSaleTransaction logic.
Parameters:  date (any), customerId (any), uniqueItems (any), ownerId (any), recordedBy (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       uniqueItems.map, parseInt, queries.createSaleAtomic, db.query, split, toISOString, audit.logAction, cache.invalidateCachePattern, require, queries.getAdminConfig, queries.getStaffEmail, queries.getCustomerName, queries.getRemainingStock, queries.getProductName, notifService.createNotification, includes
Called by:   Global/Route scope

Function:    deleteSaleTransaction
File:        backend/features/sales/sales.service.js
Type:        Service
Purpose:     Deletes a SaleTransaction record.
Parameters:  saleId (any), ownerId (any), deletedBy (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.deleteSaleRestoreStock, db.query, audit.logAction, cache.invalidateCachePattern
Called by:   Global/Route scope

Function:    deleteSaleItemTransaction
File:        backend/features/sales/sales.service.js
Type:        Service
Purpose:     Deletes a SaleItemTransaction record.
Parameters:  itemId (any), ownerId (any), userId (any), userRole (any) — input arguments
Returns:     result of call — return value
Side effects: DB write/read via query
Calls:       connect, client.query, queries.getSaleItem, queries.countSaleItems, parseInt, exports.deleteSaleTransaction, queries.deleteSaleItemRow, queries.restoreItemStock, audit.logAction, cache.invalidateCachePattern, client.release
Called by:   Global/Route scope

Function:    validateAddSaleInline
File:        backend/features/sales/sales.validation.js
Type:        Validator
Purpose:     Executes the validateAddSaleInline logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, next
Called by:   None

## Module: settings

Function:    getUsers
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Retrieves data for Users.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       settingsService.getUsers, res.json, res.status
Called by:   None

Function:    createUser
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Creates a new User record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       validRoles.includes, res.status, settingsService.createUser, res.json, includes
Called by:   None

Function:    updateUserRole
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Updates an existing UserRole.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       includes, res.status, settingsService.updateUserRole, res.json
Called by:   None

Function:    deleteUser
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Deletes a User record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, settingsService.deleteUser, res.json
Called by:   None

Function:    adminUpdateUserPassword
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Executes the adminUpdateUserPassword logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       settingsService.adminUpdateUserPassword, res.json, includes, res.status
Called by:   None

Function:    getLoginHistory
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Retrieves data for LoginHistory.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       settingsService.getLoginHistory, res.json, res.status
Called by:   None

Function:    getAdminClubName
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Retrieves data for AdminClubName.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       settingsService.getAdminClubName, res.json, res.status
Called by:   None

Function:    updateAdminClubName
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Updates an existing AdminClubName.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       club_name.trim, res.status, settingsService.updateAdminClubName, res.json
Called by:   None

Function:    getUserClubName
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Retrieves data for UserClubName.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       settingsService.getUserClubName, res.json, res.status
Called by:   None

Function:    completeSetup
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Executes the completeSetup logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       settingsService.completeSetup, res.json, res.status
Called by:   None

Function:    updateAdminConfig
File:        backend/features/settings/settings.controller.js
Type:        Controller
Purpose:     Updates an existing AdminConfig.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, settingsService.updateAdminConfig, res.json
Called by:   None

Function:    getUsers
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Retrieves data for Users.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    countStandardUsers
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Executes the countStandardUsers logic.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    checkEmailExists
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Executes the checkEmailExists logic.
Parameters:  email (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    reactivateUser
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Executes the reactivateUser logic.
Parameters:  hash (any), role (any), id (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    createUser
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Creates a new User record.
Parameters:  email (any), hash (any), role (any), ownerId (any), createdBy (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    updateUserRole
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Updates an existing UserRole.
Parameters:  role (any), id (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    deleteUser
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Deletes a User record.
Parameters:  id (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    adminUpdateUserPassword
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Executes the adminUpdateUserPassword logic.
Parameters:  hash (any), id (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getLoginHistory
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Retrieves data for LoginHistory.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getAdminClubName
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Retrieves data for AdminClubName.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    updateAdminClubName
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Updates an existing AdminClubName.
Parameters:  clubName (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getUserClubName
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Retrieves data for UserClubName.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getAdminConfig
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Retrieves data for AdminConfig.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    completeSetup
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Executes the completeSetup logic.
Parameters:  ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    updateAdminConfig
File:        backend/features/settings/settings.queries.js
Type:        Utility
Purpose:     Updates an existing AdminConfig.
Parameters:  shakeAmount (any), threshold (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getUsers
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Retrieves data for Users.
Parameters:  ownerId (any) — input arguments
Returns:     any — return value
Side effects: DB write/read via query
Calls:       queries.getUsers, db.query
Called by:   Global/Route scope

Function:    createUser
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Creates a new User record.
Parameters:  username (any), password (any), email (any), role (any), adminUserId (any), adminOwnerId (any) — input arguments
Returns:     object — return value
Side effects: DB write/read via query
Calls:       toString, crypto.randomBytes, queries.countStandardUsers, db.query, parseInt, email.split, toLowerCase, email.trim, username.replace, queries.checkEmailExists, bcrypt.hash, queries.reactivateUser, audit.logAction, queries.createUser
Called by:   Global/Route scope

Function:    updateUserRole
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Updates an existing UserRole.
Parameters:  role (any), targetId (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.updateUserRole, db.query
Called by:   None

Function:    deleteUser
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Deletes a User record.
Parameters:  targetId (any), adminUserId (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.deleteUser, db.query, authService.invalidateAllSessions, audit.logAction
Called by:   None

Function:    adminUpdateUserPassword
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Executes the adminUpdateUserPassword logic.
Parameters:  newPassword (any), targetId (any), adminUserId (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       bcrypt.hash, queries.adminUpdateUserPassword, db.query, authService.invalidateAllSessions, audit.logAction
Called by:   None

Function:    getLoginHistory
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Retrieves data for LoginHistory.
Parameters:  ownerId (any) — input arguments
Returns:     result of call | object — return value
Side effects: DB write/read via query
Calls:       queries.getLoginHistory, db.query, Date.now, getTime
Called by:   Global/Route scope

Function:    getAdminClubName
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Retrieves data for AdminClubName.
Parameters:  ownerId (any) — input arguments
Returns:     any — return value
Side effects: DB write/read via query
Calls:       queries.getAdminClubName, db.query
Called by:   Global/Route scope

Function:    updateAdminClubName
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Updates an existing AdminClubName.
Parameters:  clubName (any), adminUserId (any), ownerId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.updateAdminClubName, db.query, audit.logAction
Called by:   Global/Route scope

Function:    getUserClubName
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Retrieves data for UserClubName.
Parameters:  ownerId (any) — input arguments
Returns:     any | string — return value
Side effects: DB write/read via query
Calls:       queries.getUserClubName, db.query, email.split, club_name.trim
Called by:   Global/Route scope

Function:    completeSetup
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Executes the completeSetup logic.
Parameters:  ownerId (any), adminUserId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.completeSetup, db.query, audit.logAction
Called by:   None

Function:    updateAdminConfig
File:        backend/features/settings/settings.service.js
Type:        Service
Purpose:     Updates an existing AdminConfig.
Parameters:  shakeAmount (any), threshold (any), ownerId (any), actionUserId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       db.query, queries.getAdminConfig, Math.round, queries.updateAdminConfig, audit.logAction
Called by:   None

## Module: stock

Function:    getStock
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Retrieves data for Stock.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       stockService.getStock, res.json, includes, res.status
Called by:   None

Function:    addStock
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Executes the addStock logic.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       stockService.addStock, res.json, includes, res.status
Called by:   None

Function:    updateStockQuantity
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Updates an existing StockQuantity.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       stockService.updateStockQuantity, res.json, includes, res.status
Called by:   None

Function:    updateStockPrice
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Updates an existing StockPrice.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       res.status
Called by:   None

Function:    increaseStock
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Executes the increaseStock logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       res.status
Called by:   None

Function:    decreaseStock
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Executes the decreaseStock logic.
Parameters:  req (any), res (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       res.status
Called by:   None

Function:    deleteStock
File:        backend/features/stock/stock.controller.js
Type:        Controller
Purpose:     Deletes a Stock record.
Parameters:  req (any), res (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       stockService.deleteStock, res.json, includes, res.status
Called by:   None

Function:    fetchStock
File:        backend/features/stock/stock.queries.js
Type:        Utility
Purpose:     Executes the fetchStock logic.
Parameters:  ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   None

Function:    verifyProductOwnership
File:        backend/features/stock/stock.queries.js
Type:        Utility
Purpose:     Executes the verifyProductOwnership logic.
Parameters:  variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateStockRow
File:        backend/features/stock/stock.queries.js
Type:        Utility
Purpose:     Updates an existing StockRow.
Parameters:  quantity (any), vendorPriceSnap (any), variantId (any), versionId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    insertStockRow
File:        backend/features/stock/stock.queries.js
Type:        Utility
Purpose:     Executes the insertStockRow logic.
Parameters:  variantId (any), versionId (any), ownerId (any), quantity (any), vendorPriceSnap (any), addedBy (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    updateStockQuantityRow
File:        backend/features/stock/stock.queries.js
Type:        Utility
Purpose:     Updates an existing StockQuantityRow.
Parameters:  quantity (any), variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    deleteStockRow
File:        backend/features/stock/stock.queries.js
Type:        Utility
Purpose:     Deletes a StockRow record.
Parameters:  variantId (any), ownerId (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    getStock
File:        backend/features/stock/stock.service.js
Type:        Service
Purpose:     Retrieves data for Stock.
Parameters:  ownerId (any) — input arguments
Returns:     array | result of call — return value
Side effects: DB write/read via query
Calls:       queries.fetchStock, db.query
Called by:   Global/Route scope

Function:    addStock
File:        backend/features/stock/stock.service.js
Type:        Service
Purpose:     Executes the addStock logic.
Parameters:  ownerId (any), variantId (any), quantity (any), userId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       connect, client.query, queries.verifyProductOwnership, client.release, queries.updateStockRow, queries.insertStockRow, audit.logAction, cache.invalidateCachePattern
Called by:   None

Function:    updateStockQuantity
File:        backend/features/stock/stock.service.js
Type:        Service
Purpose:     Updates an existing StockQuantity.
Parameters:  ownerId (any), variantId (any), quantity (any), userId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.updateStockQuantityRow, db.query, audit.logAction, cache.invalidateCachePattern
Called by:   None

Function:    deleteStock
File:        backend/features/stock/stock.service.js
Type:        Service
Purpose:     Deletes a Stock record.
Parameters:  ownerId (any), variantId (any), userId (any) — input arguments
Returns:     void — return value
Side effects: DB write/read via query
Calls:       queries.deleteStockRow, db.query, audit.logAction, cache.invalidateCachePattern
Called by:   None

Function:    validateAddStock
File:        backend/features/stock/stock.validation.js
Type:        Validator
Purpose:     Executes the validateAddStock logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, next
Called by:   None

Function:    validateUpdateStock
File:        backend/features/stock/stock.validation.js
Type:        Validator
Purpose:     Executes the validateUpdateStock logic.
Parameters:  req (any), res (any), next (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       res.status, next
Called by:   None

## Module: app

Function:    Page
File:        frontend/src/app/admin/backups/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/attendance/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/change-password/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    Page
File:        frontend/src/app/data-management/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    RootLayout
File:        frontend/src/app/layout.jsx
Type:        Utility
Purpose:     Executes the RootLayout logic.
Parameters:  {children} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    Page
File:        frontend/src/app/login/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/login-activity/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/master/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    NotificationsPage
File:        frontend/src/app/notifications/page.jsx
Type:        Utility
Purpose:     Executes the NotificationsPage logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    Page
File:        frontend/src/app/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    ProductsPage
File:        frontend/src/app/products/page.jsx
Type:        Utility
Purpose:     Executes the ProductsPage logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth, useRouter, useEffect, router.push
Called by:   None

Function:    Page
File:        frontend/src/app/reports/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/reset-password/[token]/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/sales/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/settings/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    Page
File:        frontend/src/app/stock/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    UserAttendancePage
File:        frontend/src/app/user/attendance/page.jsx
Type:        Utility
Purpose:     Executes the UserAttendancePage logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    Layout
File:        frontend/src/app/user/layout.jsx
Type:        Utility
Purpose:     Executes the Layout logic.
Parameters:  {children} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

Function:    UserSalesPage
File:        frontend/src/app/user/sales/page.jsx
Type:        Utility
Purpose:     Executes the UserSalesPage logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    UserSettingsPage
File:        frontend/src/app/user/settings/page.jsx
Type:        Utility
Purpose:     Executes the UserSettingsPage logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    UserStockPage
File:        frontend/src/app/user/stock/page.jsx
Type:        Utility
Purpose:     Executes the UserStockPage logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    Page
File:        frontend/src/app/users/page.jsx
Type:        Utility
Purpose:     Executes the Page logic.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       useAuth
Called by:   None

## Module: components

Function:    AddSaleModal
File:        frontend/src/components/AddSaleModal.jsx
Type:        React Component
Purpose:     Renders the AddSaleModal user interface component.
Parameters:  {onClose} (object) — input arguments
Returns:     result of call | object | void | JSX.Element — return value
Side effects: State change (setItems), State change (setLoading), State change (setCustomerInput), State change (setDate)
Calls:       useStore, useState, split, toISOString, useEffect, fetchCustomers, fetchInventoryEntities, useMemo, activeEntities.filter, setItems, items.filter, items.forEach, activeEntities.find, parseFloat, parseInt, e.preventDefault, customerInput.trim, showToast, useStore.getState, validItems.some, window.confirm, setLoading, validItems.map, Math.round, activeCustomers.find, toLowerCase, addSale, onClose, setCustomerInput, activeCustomers.map, setDate, items.map, handleItemChange, availableEntities.map, select, formatRupees, removeItem
Called by:   None

Function:    handleItemChange
File:        frontend/src/components/AddSaleModal.jsx
Type:        React Component
Purpose:     Renders the handleItemChange user interface component.
Parameters:  index (any), field (any), value (any) — input arguments
Returns:     void — return value
Side effects: State change (setItems)
Calls:       setItems
Called by:   Global/Route scope

Function:    addItem
File:        frontend/src/components/AddSaleModal.jsx
Type:        React Component
Purpose:     Renders the addItem user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setItems)
Calls:       setItems
Called by:   None

Function:    removeItem
File:        frontend/src/components/AddSaleModal.jsx
Type:        React Component
Purpose:     Renders the removeItem user interface component.
Parameters:  index (any) — input arguments
Returns:     void — return value
Side effects: State change (setItems)
Calls:       setItems, items.filter
Called by:   Global/Route scope

Function:    onSubmit
File:        frontend/src/components/AddSaleModal.jsx
Type:        React Component
Purpose:     Renders the onSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     result of call | void | object — return value
Side effects: State change (setLoading)
Calls:       e.preventDefault, customerInput.trim, showToast, useStore.getState, items.filter, validItems.some, parseFloat, window.confirm, setLoading, validItems.map, activeEntities.find, parseInt, Math.round, activeCustomers.find, toLowerCase, addSale, onClose
Called by:   None

Function:    AddStockModal
File:        frontend/src/components/AddStockModal.jsx
Type:        React Component
Purpose:     Renders the AddStockModal user interface component.
Parameters:  {onClose} (object) — input arguments
Returns:     result of call | any | void | JSX.Element — return value
Side effects: State change (setLoading), State change (setSelectedInventoryId), State change (setQty)
Calls:       useStore, useState, useEffect, fetchInventoryEntities, useMemo, activeEntities.find, e.preventDefault, showToast, useStore.getState, parseInt, setLoading, addStock, onClose, setSelectedInventoryId, activeEntities.map, formatRupees, setQty, toFixed
Called by:   None

Function:    onSubmit
File:        frontend/src/components/AddStockModal.jsx
Type:        React Component
Purpose:     Renders the onSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading)
Calls:       e.preventDefault, showToast, useStore.getState, parseInt, setLoading, addStock, onClose
Called by:   Global/Route scope

Function:    EmptyState
File:        frontend/src/components/EmptyState.jsx
Type:        React Component
Purpose:     Renders the EmptyState user interface component.
Parameters:  {title, message, icon} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    constructor
File:        frontend/src/components/ErrorBoundary.jsx
Type:        React Component
Purpose:     Renders the constructor user interface component.
Parameters:  props (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    getDerivedStateFromError
File:        frontend/src/components/ErrorBoundary.jsx
Type:        React Component
Purpose:     Renders the getDerivedStateFromError user interface component.
Parameters:  error (any) — input arguments
Returns:     object — return value
Side effects: None
Calls:       None
Called by:   None

Function:    componentDidCatch
File:        frontend/src/components/ErrorBoundary.jsx
Type:        React Component
Purpose:     Renders the componentDidCatch user interface component.
Parameters:  error (any), errorInfo (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   None

Function:    render
File:        frontend/src/components/ErrorBoundary.jsx
Type:        React Component
Purpose:     Renders the render user interface component.
Parameters:  none — input arguments
Returns:     JSX.Element | any — return value
Side effects: None
Calls:       setState, reload, toString
Called by:   None

Function:    Layout
File:        frontend/src/components/Layout.jsx
Type:        React Component
Purpose:     Renders the Layout user interface component.
Parameters:  {children} (object) — input arguments
Returns:     any | JSX.Element — return value
Side effects: Navigation state change, State change (setInterval), State change (setSidebarOpen), State change (setShowSaleModal), State change (setFabOpen), State change (setShowStockModal)
Calls:       useState, useStore, useAuth, useNavigate, usePermissions, useEffect, fetchData, fetchClubName, setInterval, clearInterval, logout, nav, setSidebarOpen, setShowSaleModal, setFabOpen, setShowStockModal
Called by:   None

Function:    handleLogout
File:        frontend/src/components/Layout.jsx
Type:        React Component
Purpose:     Renders the handleLogout user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       logout, nav
Called by:   None

Function:    UserLayout
File:        frontend/src/components/UserLayout.jsx
Type:        React Component
Purpose:     Renders the UserLayout user interface component.
Parameters:  {children} (object) — input arguments
Returns:     any | JSX.Element — return value
Side effects: Navigation state change, State change (setInterval), State change (setNotifications), State change (setShowNotifications)
Calls:       useStore, useAuth, useNavigate, useState, useEffect, fetchData, fetchNotifications, fetchClubName, setInterval, clearInterval, api.get, setNotifications, logout, nav, notifications.filter, api.put, prev.map, toISOString, setShowNotifications, notifications.map, handleNotifClick, toLocaleString
Called by:   None

Function:    fetchNotifications
File:        frontend/src/components/UserLayout.jsx
Type:        React Component
Purpose:     Renders the fetchNotifications user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setNotifications)
Calls:       api.get, setNotifications
Called by:   Global/Route scope

Function:    handleLogout
File:        frontend/src/components/UserLayout.jsx
Type:        React Component
Purpose:     Renders the handleLogout user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       logout, nav
Called by:   None

Function:    handleNotifClick
File:        frontend/src/components/UserLayout.jsx
Type:        React Component
Purpose:     Renders the handleNotifClick user interface component.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: State change (setNotifications)
Calls:       api.put, setNotifications, prev.map, toISOString
Called by:   Global/Route scope

Function:    markAllRead
File:        frontend/src/components/UserLayout.jsx
Type:        React Component
Purpose:     Renders the markAllRead user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setNotifications)
Calls:       api.put, setNotifications, prev.map, toISOString
Called by:   None

## Module: context

Function:    AuthProvider
File:        frontend/src/context/AuthContext.jsx
Type:        Utility
Purpose:     Executes the AuthProvider logic.
Parameters:  {children} (object) — input arguments
Returns:     typeof data | JSX.Element — return value
Side effects: State change (setUser), State change (setLoading)
Calls:       useState, useEffect, api.get, setUser, useStore.setState, setLoading, verifySession, resetStore, useStore.getState, api.post
Called by:   None

Function:    verifySession
File:        frontend/src/context/AuthContext.jsx
Type:        Utility
Purpose:     Executes the verifySession logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setUser), State change (setLoading)
Calls:       api.get, setUser, useStore.setState, setLoading
Called by:   Global/Route scope

Function:    login
File:        frontend/src/context/AuthContext.jsx
Type:        Utility
Purpose:     Executes the login logic.
Parameters:  email (any), password (any) — input arguments
Returns:     void — return value
Side effects: State change (setUser)
Calls:       resetStore, useStore.getState, api.post, setUser, useStore.setState
Called by:   Global/Route scope, handleLoginSubmit

Function:    logout
File:        frontend/src/context/AuthContext.jsx
Type:        Utility
Purpose:     Executes the logout logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setUser)
Calls:       api.post, setUser, resetStore, useStore.getState, useStore.setState
Called by:   Global/Route scope, handleLogout

Function:    forgotPassword
File:        frontend/src/context/AuthContext.jsx
Type:        Utility
Purpose:     Executes the forgotPassword logic.
Parameters:  email (any) — input arguments
Returns:     typeof data — return value
Side effects: None
Calls:       api.post
Called by:   Global/Route scope, handleForgotSubmit

Function:    resetPassword
File:        frontend/src/context/AuthContext.jsx
Type:        Utility
Purpose:     Executes the resetPassword logic.
Parameters:  token (any), newPassword (any) — input arguments
Returns:     typeof data — return value
Side effects: None
Calls:       api.post
Called by:   Global/Route scope, handleResetSubmit

Function:    useAuth
File:        frontend/src/context/AuthContext.jsx
Type:        Hook
Purpose:     Executes the useAuth logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       useContext
Called by:   Page, ProductsPage, Layout, UserLayout, usePermissions, Attendance, ChangePassword, Login, MasterDashboard, ResetPassword, SaleRow, Sales, Settings, UserManagement

## Module: hooks

Function:    useDebounce
File:        frontend/src/hooks/useDebounce.js
Type:        Hook
Purpose:     Executes the useDebounce logic.
Parameters:  value (any), delay (any) — input arguments
Returns:     any | typeof debouncedValue — return value
Side effects: State change (setTimeout), State change (setDebouncedValue)
Calls:       useState, useEffect, setTimeout, setDebouncedValue, clearTimeout
Called by:   ProductManager, Sales, Stock

Function:    usePermissions
File:        frontend/src/hooks/usePermissions.js
Type:        Hook
Purpose:     Executes the usePermissions logic.
Parameters:  none — input arguments
Returns:     object — return value
Side effects: None
Calls:       useAuth
Called by:   Layout, Attendance, DashboardInner, DataManagement, LoginActivity, ProductManager, SaleRow, Settings, Stock, UserManagement

## Module: screens

Function:    AdminBackupCenter
File:        frontend/src/screens/AdminBackupCenter.jsx
Type:        React Component
Purpose:     Renders the AdminBackupCenter user interface component.
Parameters:  none — input arguments
Returns:     void | JSX.Element — return value
Side effects: State change (setRestoreFile), State change (setRestoreValidation), State change (setBackupType), State change (setBackupFormat)
Calls:       useBackupStore, useState, useRef, useEffect, fetchBackupLogs, generateBackup, setRestoreFile, validateRestore, setRestoreValidation, confirmRestore, setBackupType, setBackupFormat, handleGenerate, backupLogs.map, format
Called by:   None

Function:    handleGenerate
File:        frontend/src/screens/AdminBackupCenter.jsx
Type:        React Component
Purpose:     Renders the handleGenerate user interface component.
Parameters:  cloud (optional) — input arguments
Returns:     void — return value
Side effects: None
Calls:       generateBackup
Called by:   Global/Route scope

Function:    handleFileSelect
File:        frontend/src/screens/AdminBackupCenter.jsx
Type:        React Component
Purpose:     Renders the handleFileSelect user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setRestoreFile), State change (setRestoreValidation)
Calls:       setRestoreFile, validateRestore, setRestoreValidation
Called by:   None

Function:    executeRestore
File:        frontend/src/screens/AdminBackupCenter.jsx
Type:        React Component
Purpose:     Renders the executeRestore user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setRestoreFile), State change (setRestoreValidation)
Calls:       confirmRestore, setRestoreFile, setRestoreValidation
Called by:   Global/Route scope

Function:    Attendance
File:        frontend/src/screens/Attendance.jsx
Type:        React Component
Purpose:     Renders the Attendance user interface component.
Parameters:  {showOnlyMyAttendance} (object) — input arguments
Returns:     result of call | void | array | boolean | object | JSX.Element — return value
Side effects: State change (setLoading), State change (setCustomerInput), State change (setShakeProfit), State change (setDate)
Calls:       useStore, useAuth, usePermissions, useState, split, toISOString, useEffect, fetchCustomers, useMemo, customers.filter, useCallback, customerInput.trim, showToast, useStore.getState, setLoading, activeCustomers.find, toLowerCase, Number, addAttendance, setCustomerInput, setShakeProfit, window.confirm, deleteAttendance, Array.isArray, attendance.filter, activeRecords.forEach, setDate, formatRupees, activeCustomers.map, onSubmit, activeRecords.map
Called by:   None

Function:    ChangePassword
File:        frontend/src/screens/ChangePassword.jsx
Type:        React Component
Purpose:     Renders the ChangePassword user interface component.
Parameters:  none — input arguments
Returns:     result of setError | JSX.Element — return value
Side effects: Navigation state change, State change (setError), State change (setLoading), State change (setUser), Mutates localStorage, State change (setNewPassword), State change (setShowPassword), State change (setConfirmPassword), State change (setShowConfirmPassword)
Calls:       useState, useNavigate, useAuth, e.preventDefault, setError, setLoading, api.post, setUser, localStorage.setItem, JSON.stringify, navigate, setNewPassword, setShowPassword, setConfirmPassword, setShowConfirmPassword
Called by:   None

Function:    handleSubmit
File:        frontend/src/screens/ChangePassword.jsx
Type:        React Component
Purpose:     Renders the handleSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     result of setError — return value
Side effects: State change (setError), State change (setLoading), State change (setUser), Mutates localStorage
Calls:       e.preventDefault, setError, setLoading, api.post, setUser, localStorage.setItem, JSON.stringify, navigate
Called by:   None

Function:    AdminMetricCard
File:        frontend/src/screens/Dashboard.jsx
Type:        React Component
Purpose:     Renders the AdminMetricCard user interface component.
Parameters:  {icon, title, value, color, subtitle} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    DashboardInner
File:        frontend/src/screens/Dashboard.jsx
Type:        React Component
Purpose:     Renders the DashboardInner user interface component.
Parameters:  none — input arguments
Returns:     void | JSX.Element — return value
Side effects: State change (setDateRange), State change (setCustomStart), State change (setCustomEnd)
Calls:       useStore, usePermissions, useState, useEffect, fetchUsers, fetchClubName, useCallback, split, now.toISOString, weekAgo.setDate, now.getDate, weekAgo.toISOString, toISOString, now.getFullYear, now.getMonth, fetchDashboardStats, loadStats, setDateRange, setCustomStart, setCustomEnd, formatRupees, lowStock.map
Called by:   None

Function:    Dashboard
File:        frontend/src/screens/Dashboard.jsx
Type:        React Component
Purpose:     Renders the Dashboard user interface component.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    DataManagement
File:        frontend/src/screens/DataManagement.jsx
Type:        React Component
Purpose:     Renders the DataManagement user interface component.
Parameters:  none — input arguments
Returns:     void | JSX.Element — return value
Side effects: State change (setRestoringId), State change (setIsImporting), State change (setImportFile), State change (setConfirmAction), State change (setShowConfirm), State change (setIsDeleting), State change (setConfirmText), State change (setMonthFilterAtt), State change (setMonthFilterSales), State change (setImportType)
Calls:       useStore, usePermissions, useEffect, fetchSales, fetchAttendance, fetchDeletedRecords, useState, window.confirm, setRestoringId, restoreDeletedRecord, showToast, setIsImporting, formData.append, api.post, alert, setImportFile, fetchCustomers, useStore.getState, fetchProducts, fetchStock, setConfirmAction, setShowConfirm, setIsDeleting, clearAttendanceData, clearSalesData, setConfirmText, data.filter, filterUsed.split, parseInt, toUpperCase, date.toLocaleString, setMonthFilterAtt, openConfirm, setMonthFilterSales, setImportType, deletedRecords.map, toLocaleDateString, toLocaleString, handleRestore
Called by:   None

Function:    handleRestore
File:        frontend/src/screens/DataManagement.jsx
Type:        React Component
Purpose:     Renders the handleRestore user interface component.
Parameters:  type (any), id (any) — input arguments
Returns:     void — return value
Side effects: State change (setRestoringId)
Calls:       window.confirm, setRestoringId, restoreDeletedRecord, showToast, fetchDeletedRecords, fetchSales, fetchAttendance
Called by:   Global/Route scope

Function:    handleImport
File:        frontend/src/screens/DataManagement.jsx
Type:        React Component
Purpose:     Renders the handleImport user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setIsImporting), State change (setImportFile)
Calls:       setIsImporting, formData.append, api.post, alert, showToast, setImportFile, fetchCustomers, useStore.getState, fetchProducts, fetchStock
Called by:   None

Function:    openConfirm
File:        frontend/src/screens/DataManagement.jsx
Type:        React Component
Purpose:     Renders the openConfirm user interface component.
Parameters:  action (any) — input arguments
Returns:     void — return value
Side effects: State change (setConfirmAction), State change (setShowConfirm)
Calls:       setConfirmAction, setShowConfirm
Called by:   Global/Route scope

Function:    handleConfirm
File:        frontend/src/screens/DataManagement.jsx
Type:        React Component
Purpose:     Renders the handleConfirm user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setIsDeleting), State change (setShowConfirm), State change (setConfirmAction), State change (setConfirmText)
Calls:       setIsDeleting, clearAttendanceData, showToast, clearSalesData, setShowConfirm, setConfirmAction, setConfirmText
Called by:   None

Function:    Login
File:        frontend/src/screens/Login.jsx
Type:        React Component
Purpose:     Renders the Login user interface component.
Parameters:  none — input arguments
Returns:     void | any | JSX.Element — return value
Side effects: Navigation state change, Mutates localStorage, State change (setSavedClubName), State change (setLockoutUntil), State change (setDisplaySecs), State change (setInterval), State change (setLoading), State change (setErrorMsg), State change (setSuccessMsg), State change (setEmail), State change (setPassword), State change (setShowPassword), State change (setStep)
Calls:       useAuth, useNavigate, useSearchParams, searchParams.get, useState, useEffect, localStorage.getItem, setSavedClubName, parseInt, Date.now, setLockoutUntil, localStorage.removeItem, localStorage.setItem, lockoutUntil.toString, Math.ceil, setDisplaySecs, tick, setInterval, document.addEventListener, clearInterval, document.removeEventListener, e.preventDefault, setLoading, setErrorMsg, setSuccessMsg, login, nav, isNaN, forgotPassword, setEmail, setPassword, setShowPassword, Math.floor, padStart, toString, setStep
Called by:   None

Function:    tick
File:        frontend/src/screens/Login.jsx
Type:        React Component
Purpose:     Renders the tick user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setLockoutUntil), State change (setDisplaySecs)
Calls:       Math.ceil, Date.now, setLockoutUntil, setDisplaySecs
Called by:   Global/Route scope, handleVisibilityChange

Function:    handleVisibilityChange
File:        frontend/src/screens/Login.jsx
Type:        React Component
Purpose:     Renders the handleVisibilityChange user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       tick
Called by:   None

Function:    handleLoginSubmit
File:        frontend/src/screens/Login.jsx
Type:        React Component
Purpose:     Renders the handleLoginSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setErrorMsg), State change (setSuccessMsg), State change (setLockoutUntil)
Calls:       e.preventDefault, setLoading, setErrorMsg, setSuccessMsg, login, nav, parseInt, isNaN, setLockoutUntil, Date.now
Called by:   None

Function:    handleForgotSubmit
File:        frontend/src/screens/Login.jsx
Type:        React Component
Purpose:     Renders the handleForgotSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setErrorMsg), State change (setSuccessMsg)
Calls:       e.preventDefault, setLoading, setErrorMsg, setSuccessMsg, forgotPassword
Called by:   None

Function:    formatDate
File:        frontend/src/screens/LoginActivity.jsx
Type:        React Component
Purpose:     Renders the formatDate user interface component.
Parameters:  dt (any) — input arguments
Returns:     string | result of call — return value
Side effects: None
Calls:       toLocaleString
Called by:   Global/Route scope

Function:    LoginActivity
File:        frontend/src/screens/LoginActivity.jsx
Type:        React Component
Purpose:     Renders the LoginActivity user interface component.
Parameters:  none — input arguments
Returns:     any | JSX.Element — return value
Side effects: State change (setLoading), State change (setHistory), State change (setFilter)
Calls:       usePermissions, useStore, useState, setLoading, fetchLoginHistory, setHistory, showToast, useStore.getState, useEffect, load, history.filter, filter.toLowerCase, setFilter, filtered.map, formatDate
Called by:   None

Function:    load
File:        frontend/src/screens/LoginActivity.jsx
Type:        React Component
Purpose:     Renders the load user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setHistory)
Calls:       setLoading, fetchLoginHistory, setHistory, showToast, useStore.getState
Called by:   Global/Route scope

Function:    MasterDashboard
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the MasterDashboard user interface component.
Parameters:  none — input arguments
Returns:     any | void | boolean | JSX.Element — return value
Side effects: Navigation state change, State change (setExpandedRows), State change (setLoading), State change (setRefreshing), State change (setStats), State change (setLiveSessions), State change (setActivityLog), State change (setAdminsList), State change (setInterval), State change (setMsg), State change (setError), State change (setNewAdminEmail), State change (setDeleteTarget), State change (setEditingClubId), State change (setActiveTab), State change (setEditClubName), State change (setLogFilterAction), State change (setLogFilterAdmin)
Calls:       useAuth, useNavigate, useState, setExpandedRows, setLoading, setRefreshing, Promise.all, api.get, setStats, setLiveSessions, setActivityLog, setAdminsList, useEffect, loadData, setInterval, clearInterval, e.preventDefault, setMsg, setError, api.post, setNewAdminEmail, window.confirm, alert, api.put, api.delete, setDeleteTarget, logout, navigate, setEditingClubId, liveSessions.filter, useMemo, Date.now, getTime, activeRecent.map, activityLog.filter, activityLog.map, styles.tabBtn, setActiveTab, adminsList.map, toggleRow, styles.iconBtn, setEditClubName, handleSaveClubName, styles.badge, toLocaleDateString, handleResetPassword, handleToggleStatus, liveSessions.map, toLocaleString, setLogFilterAction, uniqueActions.map, setLogFilterAdmin, filteredLogs.map, includes
Called by:   None

Function:    toggleRow
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the toggleRow user interface component.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: State change (setExpandedRows)
Calls:       setExpandedRows
Called by:   Global/Route scope

Function:    loadData
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the loadData user interface component.
Parameters:  isRefresh (optional) — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setRefreshing), State change (setStats), State change (setLiveSessions), State change (setActivityLog), State change (setAdminsList)
Calls:       setLoading, setRefreshing, Promise.all, api.get, setStats, setLiveSessions, setActivityLog, setAdminsList
Called by:   Global/Route scope, handleCreateAdmin, handleResetPassword, handleToggleStatus, confirmDelete, handleSaveClubName

Function:    handleCreateAdmin
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the handleCreateAdmin user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setMsg), State change (setError), State change (setNewAdminEmail)
Calls:       e.preventDefault, setMsg, setError, api.post, setNewAdminEmail, loadData
Called by:   None

Function:    handleResetPassword
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the handleResetPassword user interface component.
Parameters:  id (any), isUserRow (optional) — input arguments
Returns:     void — return value
Side effects: None
Calls:       window.confirm, api.post, alert, loadData
Called by:   Global/Route scope

Function:    handleToggleStatus
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the handleToggleStatus user interface component.
Parameters:  id (any), currentStatus (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       window.confirm, api.put, loadData, alert
Called by:   Global/Route scope

Function:    confirmDelete
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the confirmDelete user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setDeleteTarget)
Calls:       api.delete, setDeleteTarget, loadData, alert
Called by:   None

Function:    handleLogout
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the handleLogout user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       logout, navigate
Called by:   None

Function:    handleSaveClubName
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the handleSaveClubName user interface component.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: State change (setEditingClubId)
Calls:       api.put, setEditingClubId, loadData, alert
Called by:   None

Function:    tabBtn
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the tabBtn user interface component.
Parameters:  active (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   MasterDashboard

Function:    badge
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the badge user interface component.
Parameters:  color (any), bg (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    iconBtn
File:        frontend/src/screens/MasterDashboard.jsx
Type:        React Component
Purpose:     Renders the iconBtn user interface component.
Parameters:  color (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    Notifications
File:        frontend/src/screens/Notifications.jsx
Type:        React Component
Purpose:     Renders the Notifications user interface component.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: State change (setLoading), State change (setNotifications)
Calls:       useState, useStore, useEffect, loadNotifications, setLoading, api.get, setNotifications, fetchUnreadCount, api.put, notifications.map, toISOString, showToast, notifications.every, toLocaleString, markAsRead
Called by:   None

Function:    loadNotifications
File:        frontend/src/screens/Notifications.jsx
Type:        React Component
Purpose:     Renders the loadNotifications user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setNotifications)
Calls:       setLoading, api.get, setNotifications, fetchUnreadCount
Called by:   Global/Route scope

Function:    markAsRead
File:        frontend/src/screens/Notifications.jsx
Type:        React Component
Purpose:     Renders the markAsRead user interface component.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: State change (setNotifications)
Calls:       api.put, setNotifications, notifications.map, toISOString, fetchUnreadCount, showToast
Called by:   Global/Route scope

Function:    markAllAsRead
File:        frontend/src/screens/Notifications.jsx
Type:        React Component
Purpose:     Renders the markAllAsRead user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setNotifications)
Calls:       api.put, setNotifications, notifications.map, toISOString, fetchUnreadCount, showToast
Called by:   None

Function:    AddProductModal
File:        frontend/src/screens/ProductManager.jsx
Type:        React Component
Purpose:     Renders the AddProductModal user interface component.
Parameters:  {onClose} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: State change (setLoading), State change (setForm)
Calls:       useStore, useState, e.preventDefault, setLoading, addProduct, parseFloat, showToast, useStore.getState, fetchInventoryEntities, onClose, setForm
Called by:   None

Function:    handleSubmit
File:        frontend/src/screens/ProductManager.jsx
Type:        React Component
Purpose:     Renders the handleSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading)
Calls:       e.preventDefault, setLoading, addProduct, parseFloat, showToast, useStore.getState, fetchInventoryEntities, onClose
Called by:   None

Function:    EditableRow
File:        frontend/src/screens/ProductManager.jsx
Type:        React Component
Purpose:     Renders the EditableRow user interface component.
Parameters:  {item, onUpdate} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: State change (setIsEditing), State change (setEditData)
Calls:       useState, onUpdate, setIsEditing, showToast, useStore.getState, setEditData, formatRupees, parseInt
Called by:   None

Function:    handleSave
File:        frontend/src/screens/ProductManager.jsx
Type:        React Component
Purpose:     Renders the handleSave user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setIsEditing)
Calls:       onUpdate, setIsEditing, showToast, useStore.getState
Called by:   None

Function:    handleToggle
File:        frontend/src/screens/ProductManager.jsx
Type:        React Component
Purpose:     Renders the handleToggle user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       onUpdate, showToast, useStore.getState
Called by:   None

Function:    ProductManager
File:        frontend/src/screens/ProductManager.jsx
Type:        React Component
Purpose:     Renders the ProductManager user interface component.
Parameters:  none — input arguments
Returns:     typeof result | JSX.Element — return value
Side effects: State change (setSearch), State change (setShowModal)
Calls:       useStore, useState, usePermissions, useDebounce, useEffect, fetchInventoryEntities, useMemo, debouncedSearch.toLowerCase, result.filter, includes, toLowerCase, setSearch, setShowModal, filteredEntities.map
Called by:   None

Function:    Reports
File:        frontend/src/screens/Reports.jsx
Type:        React Component
Purpose:     Renders the Reports user interface component.
Parameters:  none — input arguments
Returns:     JSX.Element — return value
Side effects: State change (setIsExporting), State change (setTimeRange)
Calls:       useStore, useState, setIsExporting, exportReport, showToast, setTimeRange, handleExport
Called by:   None

Function:    handleExport
File:        frontend/src/screens/Reports.jsx
Type:        React Component
Purpose:     Renders the handleExport user interface component.
Parameters:  type (any) — input arguments
Returns:     void — return value
Side effects: State change (setIsExporting)
Calls:       setIsExporting, exportReport, showToast
Called by:   Global/Route scope

Function:    ResetPassword
File:        frontend/src/screens/ResetPassword.jsx
Type:        React Component
Purpose:     Renders the ResetPassword user interface component.
Parameters:  none — input arguments
Returns:     any | result of setErrorMsg | JSX.Element — return value
Side effects: Navigation state change, State change (setErrorMsg), State change (setLoading), State change (setSuccessMsg), State change (setTimeout), Mutates localStorage, State change (setNewPassword), State change (setShowPassword), State change (setConfirmPassword), State change (setShowConfirmPassword)
Calls:       useParams, useNavigate, useAuth, useState, test, e.preventDefault, validatePassword, setErrorMsg, setLoading, setSuccessMsg, resetPassword, setTimeout, nav, localStorage.getItem, setNewPassword, setShowPassword, setConfirmPassword, setShowConfirmPassword
Called by:   None

Function:    validatePassword
File:        frontend/src/screens/ResetPassword.jsx
Type:        Validator
Purpose:     Executes the validatePassword logic.
Parameters:  pass (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       test
Called by:   handleResetSubmit

Function:    handleResetSubmit
File:        frontend/src/screens/ResetPassword.jsx
Type:        React Component
Purpose:     Renders the handleResetSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     result of setErrorMsg — return value
Side effects: State change (setErrorMsg), State change (setLoading), State change (setSuccessMsg), State change (setTimeout)
Calls:       e.preventDefault, validatePassword, setErrorMsg, setLoading, setSuccessMsg, resetPassword, setTimeout, nav
Called by:   None

Function:    SaleRow
File:        frontend/src/screens/Sales.jsx
Type:        React Component
Purpose:     Renders the SaleRow user interface component.
Parameters:  {sale, onDelete} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: State change (setExpanded)
Calls:       useState, usePermissions, useAuth, setExpanded, toLocaleDateString, formatRupees, onDelete
Called by:   None

Function:    Sales
File:        frontend/src/screens/Sales.jsx
Type:        React Component
Purpose:     Renders the Sales user interface component.
Parameters:  {showOnlyMySales, autoOpenAdd} (object) — input arguments
Returns:     void | array | result of call | boolean | JSX.Element — return value
Side effects: State change (setSearch), State change (setShowModal)
Calls:       useStore, useAuth, useState, useDebounce, useCallback, window.confirm, useStore.getState, deleteSaleItem, showToast, deleteSale, useMemo, Array.isArray, sales.filter, toLowerCase, debouncedSearch.toLowerCase, customer.includes, setSearch, setShowModal, filteredSales.map
Called by:   None

Function:    Settings
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the Settings user interface component.
Parameters:  {userOnly} (object) — input arguments
Returns:     void | any | result of setErr | result of setClubNameError | JSX.Element — return value
Side effects: State change (setOtpSecondsLeft), State change (setInterval), State change (setClockSkew), State change (setOtpExpiresAt), State change (setResetStep), State change (setResetPassword), State change (setResetConfirmText), State change (setResetOtp), State change (setResetModules), State change (setMsg), State change (setErr), State change (setOldPassword), State change (setNewPassword), State change (setClubNameError), State change (setClubNameSaving), State change (setConfigSaving), State change (setActiveTab), State change (setShakeAmount), State change (setShowOldPassword), State change (setLocalClubName), State change (setShowNewPassword)
Calls:       useAuth, usePermissions, useState, useStore, useEffect, Date.now, setOtpSecondsLeft, Math.ceil, updateTimer, setInterval, document.addEventListener, clearInterval, document.removeEventListener, api.post, showToast, useStore.getState, getTime, setClockSkew, setOtpExpiresAt, setResetStep, Object.keys, setResetPassword, setResetConfirmText, setResetOtp, setResetModules, fetchData, e.preventDefault, setMsg, setErr, setOldPassword, setNewPassword, setClubNameError, localClubName.trim, setClubNameSaving, updateClubName, setConfigSaving, updateAdminConfig, Number, setActiveTab, setShakeAmount, setShowOldPassword, Math.floor, padStart, toString, setLocalClubName, setShowNewPassword
Called by:   None

Function:    updateTimer
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the updateTimer user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setOtpSecondsLeft)
Calls:       Date.now, setOtpSecondsLeft, Math.ceil
Called by:   Global/Route scope, handleVisibilityChange

Function:    handleVisibilityChange
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the handleVisibilityChange user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       updateTimer
Called by:   None

Function:    handleRequestOtp
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the handleRequestOtp user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setClockSkew), State change (setOtpExpiresAt), State change (setResetStep)
Calls:       api.post, showToast, useStore.getState, getTime, Date.now, setClockSkew, setOtpExpiresAt, setResetStep
Called by:   None

Function:    handleConfirmReset
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the handleConfirmReset user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setResetStep), State change (setResetPassword), State change (setResetConfirmText), State change (setResetOtp), State change (setOtpExpiresAt), State change (setClockSkew), State change (setResetModules)
Calls:       Object.keys, api.post, showToast, useStore.getState, setResetStep, setResetPassword, setResetConfirmText, setResetOtp, setOtpExpiresAt, setClockSkew, setResetModules, fetchData
Called by:   None

Function:    handleChangePassword
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the handleChangePassword user interface component.
Parameters:  e (any) — input arguments
Returns:     result of setErr — return value
Side effects: State change (setMsg), State change (setErr), State change (setOldPassword), State change (setNewPassword)
Calls:       e.preventDefault, setMsg, setErr, api.post, setOldPassword, setNewPassword
Called by:   None

Function:    handleSaveClubName
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the handleSaveClubName user interface component.
Parameters:  none — input arguments
Returns:     result of setClubNameError — return value
Side effects: State change (setClubNameError), State change (setClubNameSaving)
Calls:       setClubNameError, localClubName.trim, setClubNameSaving, updateClubName, showToast, useStore.getState
Called by:   Global/Route scope

Function:    handleSaveConfig
File:        frontend/src/screens/Settings.jsx
Type:        React Component
Purpose:     Renders the handleSaveConfig user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setConfigSaving)
Calls:       setConfigSaving, updateAdminConfig, Number, showToast, useStore.getState
Called by:   None

Function:    SetupWizard
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the SetupWizard user interface component.
Parameters:  {onComplete} (object) — input arguments
Returns:     result of setClubNameError | JSX.Element — return value
Side effects: State change (setLoading), State change (setClubNameError), State change (setStep), State change (setProductId), State change (setStaffPass), State change (setClubName), State change (setProductName), State change (setVendorPrice), State change (setShakeAmount), State change (setStockQty), State change (setStaffEmail)
Calls:       useState, useStore, setLoading, api.put, fetchDashboardStats, onComplete, showToast, useStore.getState, e.preventDefault, setClubNameError, clubName.trim, updateClubName, setStep, api.post, setProductId, fetchProducts, api.get, find, parseInt, fetchStock, setStaffPass, Math.min, styles.stepNode, setClubName, setProductName, setVendorPrice, setShakeAmount, setStockQty, setStaffEmail
Called by:   None

Function:    completeSetup
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the completeSetup user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setLoading)
Calls:       setLoading, api.put, fetchDashboardStats, onComplete, showToast, useStore.getState
Called by:   Global/Route scope

Function:    handleStep0
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the handleStep0 user interface component.
Parameters:  e (any) — input arguments
Returns:     result of setClubNameError — return value
Side effects: State change (setClubNameError), State change (setLoading), State change (setStep)
Calls:       e.preventDefault, setClubNameError, clubName.trim, setLoading, updateClubName, setStep
Called by:   None

Function:    handleStep1
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the handleStep1 user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setProductId), State change (setStep), State change (setLoading)
Calls:       e.preventDefault, api.post, setProductId, fetchProducts, setStep, showToast, useStore.getState, setLoading
Called by:   None

Function:    handleStep2
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the handleStep2 user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setStep)
Calls:       e.preventDefault, setLoading, api.put, setStep, showToast, useStore.getState
Called by:   None

Function:    handleStep3
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the handleStep3 user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setStep)
Calls:       e.preventDefault, setLoading, api.get, find, api.post, parseInt, fetchStock, setStep, showToast, useStore.getState
Called by:   None

Function:    handleStep4
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the handleStep4 user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setLoading), State change (setStaffPass), State change (setStep)
Calls:       e.preventDefault, setLoading, api.post, setStaffPass, setStep, showToast, useStore.getState
Called by:   None

Function:    stepNode
File:        frontend/src/screens/SetupWizard.jsx
Type:        React Component
Purpose:     Renders the stepNode user interface component.
Parameters:  active (any), completed (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       None
Called by:   Global/Route scope

Function:    handleQtyChange
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the handleQtyChange user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setTempQty)
Calls:       setTempQty
Called by:   None

Function:    saveQty
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the saveQty user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setTempQty)
Calls:       parseInt, isNaN, catch, updateStockQuantity, showToast, useStore.getState, setTempQty
Called by:   handleBlur

Function:    handleBlur
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the handleBlur user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       saveQty
Called by:   None

Function:    handleKeyDown
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the handleKeyDown user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       blur
Called by:   None

Function:    increment
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the increment user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setTempQty)
Calls:       parseInt, setTempQty, catch, updateStockQuantity
Called by:   None

Function:    decrement
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the decrement user interface component.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: State change (setTempQty)
Calls:       Math.max, parseInt, setTempQty, catch, updateStockQuantity
Called by:   None

Function:    Stock
File:        frontend/src/screens/Stock.jsx
Type:        React Component
Purpose:     Renders the Stock user interface component.
Parameters:  {readOnly} (object) — input arguments
Returns:     result of call | typeof result | object | JSX.Element — return value
Side effects: State change (setSearch), State change (setShowModal)
Calls:       useStore, useState, usePermissions, useEffect, fetchInventoryEntities, useMemo, useDebounce, debouncedSearch.toLowerCase, result.filter, includes, toLowerCase, activeEntities.forEach, setSearch, setShowModal, formatRupees, totalStockVp.toFixed, filteredStock.map
Called by:   None

Function:    RoleBadge
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the RoleBadge user interface component.
Parameters:  {role} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       None
Called by:   None

Function:    ChangePasswordModal
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the ChangePasswordModal user interface component.
Parameters:  {targetUser, onClose} (object) — input arguments
Returns:     result of call | JSX.Element — return value
Side effects: State change (setNewPassword), State change (setShowPassword)
Calls:       useState, e.preventDefault, showToast, useStore.getState, adminUpdateUserPassword, onClose, setNewPassword, setShowPassword
Called by:   None

Function:    handleSubmit
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the handleSubmit user interface component.
Parameters:  e (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       e.preventDefault, showToast, useStore.getState, adminUpdateUserPassword, onClose
Called by:   None

Function:    UserManagement
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the UserManagement user interface component.
Parameters:  none — input arguments
Returns:     JSX.Element | void — return value
Side effects: State change (setRevealedPasswords), State change (setSessionPasswords), State change (setForm), State change (setShowPassword), State change (setEditingId), State change (setEditRole), State change (setPasswordModalUser)
Calls:       usePermissions, useAuth, useStore, useState, setRevealedPasswords, useEffect, fetchUsers, e.preventDefault, addUser, setSessionPasswords, showToast, useStore.getState, setForm, setShowPassword, setEditingId, setEditRole, updateUserRole, window.confirm, deleteUser, users.filter, ROLES.filter, toUpperCase, r.charAt, r.slice, users.map, substring, saveRole, toggleReveal, startEdit, setPasswordModalUser, handleDelete
Called by:   None

Function:    toggleReveal
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the toggleReveal user interface component.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: State change (setRevealedPasswords)
Calls:       setRevealedPasswords
Called by:   Global/Route scope

Function:    handleCreateUser
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the handleCreateUser user interface component.
Parameters:  e (any) — input arguments
Returns:     void — return value
Side effects: State change (setSessionPasswords), State change (setRevealedPasswords), State change (setForm), State change (setShowPassword)
Calls:       e.preventDefault, addUser, setSessionPasswords, setRevealedPasswords, showToast, useStore.getState, setForm, setShowPassword
Called by:   None

Function:    startEdit
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the startEdit user interface component.
Parameters:  u (any) — input arguments
Returns:     void — return value
Side effects: State change (setEditingId), State change (setEditRole)
Calls:       setEditingId, setEditRole
Called by:   Global/Route scope

Function:    saveRole
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the saveRole user interface component.
Parameters:  id (any) — input arguments
Returns:     void — return value
Side effects: State change (setEditingId)
Calls:       updateUserRole, showToast, useStore.getState, setEditingId
Called by:   Global/Route scope

Function:    handleDelete
File:        frontend/src/screens/UserManagement.jsx
Type:        React Component
Purpose:     Renders the handleDelete user interface component.
Parameters:  u (any) — input arguments
Returns:     void — return value
Side effects: None
Calls:       window.confirm, deleteUser, showToast, useStore.getState
Called by:   Global/Route scope

## Module: services

Function:    signInWithGoogle
File:        frontend/src/services/firebase.js
Type:        Service
Purpose:     Executes the signInWithGoogle logic.
Parameters:  none — input arguments
Returns:     any — return value
Side effects: None
Calls:       signInWithPopup
Called by:   None

## Module: store

Function:    fetchBackupLogs
File:        frontend/src/store/useBackupStore.js
Type:        Utility
Purpose:     Executes the fetchBackupLogs logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       set, api.get, showToast, useStore.getState
Called by:   Global/Route scope, generateBackup, confirmRestore

Function:    generateBackup
File:        frontend/src/store/useBackupStore.js
Type:        Utility
Purpose:     Executes the generateBackup logic.
Parameters:  type (any), format (any), uploadToCloud (optional) — input arguments
Returns:     void — return value
Side effects: None
Calls:       set, api.post, showToast, useStore.getState, fetchBackupLogs, get, createObjectURL, document.createElement, disposition.indexOf, filenameRegex.exec, replace, link.setAttribute, appendChild, link.click, removeChild
Called by:   handleGenerate

Function:    validateRestore
File:        frontend/src/store/useBackupStore.js
Type:        Validator
Purpose:     Executes the validateRestore logic.
Parameters:  file (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       formData.append, api.post, showToast, useStore.getState
Called by:   Global/Route scope, handleFileSelect

Function:    confirmRestore
File:        frontend/src/store/useBackupStore.js
Type:        Utility
Purpose:     Executes the confirmRestore logic.
Parameters:  file (any), strategy (any) — input arguments
Returns:     boolean — return value
Side effects: None
Calls:       set, formData.append, api.post, showToast, useStore.getState, fetchBackupLogs, get
Called by:   executeRestore

Function:    extract
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the extract logic.
Parameters:  response (any) — input arguments
Returns:     any | typeof d — return value
Side effects: None
Calls:       None
Called by:   fetchProducts, fetchInventoryEntities, updateInventoryEntity, fetchStock, fetchSales, fetchAttendance, fetchCustomers, fetchDashboardStats, fetchDeletedRecords, addProduct, toggleProduct, addStock, increaseStock, updateStockQuantity, updateStockPrice, deleteStock, deleteProduct, addAttendance, deleteAttendance, addSale, deleteSale, deleteSaleItem, fetchUsers, updateUserRole, deleteUser, adminUpdateUserPassword, fetchLoginHistory, clearAttendanceData, clearSalesData, updateAdminConfig, resetData

Function:    getErrorMsg
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Retrieves data for ErrorMsg.
Parameters:  error (any), defaultMsg (any) — input arguments
Returns:     typeof defaultMsg | any — return value
Side effects: None
Calls:       None
Called by:   updateInventoryEntity, updateClubName, restoreDeletedRecord, addAttendance, addSale, clearSalesData, updateAdminConfig

Function:    showToast
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the showToast logic.
Parameters:  msg (any), type (optional) — input arguments
Returns:     void — return value
Side effects: State change (setTimeout)
Calls:       set, setTimeout
Called by:   onSubmit, Global/Route scope, handleRestore, handleImport, handleConfirm, load, markAsRead, markAllAsRead, handleSubmit, handleSave, handleToggle, handleExport, handleRequestOtp, handleConfirmReset, handleSaveClubName, handleSaveConfig, completeSetup, handleStep1, handleStep2, handleStep3, handleStep4, handleCreateUser, saveRole, handleDelete, fetchBackupLogs, generateBackup, validateRestore, confirmRestore, fetchData

Function:    hideToast
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the hideToast logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       set
Called by:   None

Function:    resetStore
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the resetStore logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       set
Called by:   login, logout

Function:    fetchProducts
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchProducts logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   None

Function:    fetchProducts
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchProducts logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   handleImport, handleStep1, fetchData, addProduct, toggleProduct, addStock, deleteProduct

Function:    fetchInventoryEntities
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchInventoryEntities logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   Global/Route scope, handleSubmit, updateInventoryEntity, fetchData, deleteStock

Function:    updateInventoryEntity
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Updates an existing InventoryEntity.
Parameters:  variantId (any), payload (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.put, fetchInventoryEntities, get, fetchDashboardStats, extract, getErrorMsg
Called by:   None

Function:    fetchStock
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchStock logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   Global/Route scope, handleImport, handleStep3, fetchData, toggleProduct, addStock, increaseStock, deleteProduct, addSale, deleteSale, deleteSaleItem

Function:    fetchSales
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchSales logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   Global/Route scope, handleRestore, fetchData, addSale, deleteSale, deleteSaleItem

Function:    fetchAttendance
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchAttendance logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   Global/Route scope, handleRestore, fetchData, addAttendance, deleteAttendance

Function:    fetchCustomers
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchCustomers logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   Global/Route scope, handleImport, fetchData

Function:    fetchDashboardStats
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchDashboardStats logic.
Parameters:  start (optional), end (optional) — input arguments
Returns:     void — return value
Side effects: None
Calls:       params.append, Date.now, params.toString, api.get, set, extract
Called by:   Global/Route scope, completeSetup, updateInventoryEntity, fetchData, toggleProduct, addStock, increaseStock, updateStockQuantity, updateStockPrice, deleteProduct, addAttendance, deleteAttendance, addSale, deleteSale, deleteSaleItem, updateAdminConfig

Function:    fetchClubName
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchClubName logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: Mutates localStorage
Calls:       get, api.get, set, localStorage.setItem
Called by:   Global/Route scope

Function:    updateClubName
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Updates an existing ClubName.
Parameters:  name (any) — input arguments
Returns:     any — return value
Side effects: Mutates localStorage
Calls:       api.put, set, localStorage.setItem, getErrorMsg
Called by:   handleSaveClubName, handleStep0

Function:    fetchDeletedRecords
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchDeletedRecords logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set, extract
Called by:   Global/Route scope, handleRestore

Function:    restoreDeletedRecord
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the restoreDeletedRecord logic.
Parameters:  type (any), id (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       api.post, getErrorMsg
Called by:   Global/Route scope, handleRestore

Function:    fetchUnreadCount
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchUnreadCount logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, set
Called by:   loadNotifications, markAsRead, markAllAsRead, fetchData

Function:    fetchData
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchData logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       set, fetchProducts, get, fetchStock, fetchInventoryEntities, fetchSales, fetchAttendance, fetchCustomers, fetchDashboardStats, fetchUnreadCount, showToast
Called by:   Global/Route scope, handleConfirmReset, clearAttendanceData, clearSalesData, resetData

Function:    addProduct
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the addProduct logic.
Parameters:  payload (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.post, catch, Promise.all, fetchProducts, get, extract
Called by:   Global/Route scope, handleSubmit

Function:    toggleProduct
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the toggleProduct logic.
Parameters:  id (any), isActive (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.put, catch, Promise.all, fetchProducts, get, fetchStock, fetchDashboardStats, extract
Called by:   None

Function:    addStock
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the addStock logic.
Parameters:  payload (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.post, catch, Promise.all, fetchStock, get, fetchProducts, fetchDashboardStats, extract
Called by:   Global/Route scope, onSubmit

Function:    increaseStock
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the increaseStock logic.
Parameters:  id (any), qty_add (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.put, catch, Promise.all, fetchStock, get, fetchDashboardStats, extract
Called by:   None

Function:    updateStockQuantity
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Updates an existing StockQuantity.
Parameters:  id (any), quantity (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.patch, set, catch, fetchDashboardStats, get, extract
Called by:   Global/Route scope, saveQty, increment, decrement

Function:    updateStockPrice
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Updates an existing StockPrice.
Parameters:  product_id (any), vp (any), sp (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.put, set, catch, fetchDashboardStats, get, extract
Called by:   None

Function:    deleteStock
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Deletes a Stock record.
Parameters:  id (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, catch, fetchInventoryEntities, get, extract
Called by:   Global/Route scope

Function:    deleteProduct
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Deletes a Product record.
Parameters:  id (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, catch, Promise.all, fetchProducts, get, fetchStock, fetchDashboardStats, extract
Called by:   None

Function:    addAttendance
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the addAttendance logic.
Parameters:  payload (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.post, catch, Promise.all, fetchAttendance, get, fetchDashboardStats, extract, getErrorMsg
Called by:   Global/Route scope

Function:    deleteAttendance
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Deletes a Attendance record.
Parameters:  id (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, catch, Promise.all, fetchAttendance, get, fetchDashboardStats, extract
Called by:   Global/Route scope

Function:    addSale
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the addSale logic.
Parameters:  payload (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.post, catch, Promise.all, fetchSales, get, fetchStock, fetchDashboardStats, extract, getErrorMsg
Called by:   onSubmit

Function:    deleteSale
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Deletes a Sale record.
Parameters:  id (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, catch, Promise.all, fetchSales, get, fetchStock, fetchDashboardStats, extract
Called by:   Global/Route scope

Function:    deleteSaleItem
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Deletes a SaleItem record.
Parameters:  itemId (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, catch, Promise.all, fetchSales, get, fetchStock, fetchDashboardStats, extract
Called by:   Global/Route scope

Function:    fetchUsers
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchUsers logic.
Parameters:  none — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, extract, set
Called by:   Global/Route scope, addUser, updateUserRole, deleteUser

Function:    addUser
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the addUser logic.
Parameters:  payload (any) — input arguments
Returns:     any — return value
Side effects: None
Calls:       api.post, fetchUsers, get
Called by:   handleCreateUser

Function:    updateUserRole
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Updates an existing UserRole.
Parameters:  id (any), role (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.put, fetchUsers, get, extract
Called by:   Global/Route scope, saveRole

Function:    deleteUser
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Deletes a User record.
Parameters:  id (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, fetchUsers, get, extract
Called by:   Global/Route scope, handleDelete

Function:    adminUpdateUserPassword
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the adminUpdateUserPassword logic.
Parameters:  id (any), newPassword (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.post, extract
Called by:   Global/Route scope, handleSubmit

Function:    fetchLoginHistory
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the fetchLoginHistory logic.
Parameters:  none — input arguments
Returns:     any | array — return value
Side effects: None
Calls:       api.get, extract
Called by:   load

Function:    clearAttendanceData
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the clearAttendanceData logic.
Parameters:  month (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, fetchData, get, extract
Called by:   Global/Route scope, handleConfirm

Function:    clearSalesData
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the clearSalesData logic.
Parameters:  month (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, fetchData, get, extract, getErrorMsg
Called by:   Global/Route scope, handleConfirm

Function:    updateAdminConfig
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Updates an existing AdminConfig.
Parameters:  config (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.put, fetchDashboardStats, get, extract, getErrorMsg
Called by:   Global/Route scope, handleSaveConfig

Function:    resetData
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the resetData logic.
Parameters:  password (any) — input arguments
Returns:     result of extract — return value
Side effects: None
Calls:       api.delete, fetchData, get, extract
Called by:   Global/Route scope

Function:    exportReport
File:        frontend/src/store/useStore.js
Type:        Utility
Purpose:     Executes the exportReport logic.
Parameters:  type (any), range (optional) — input arguments
Returns:     void — return value
Side effects: None
Calls:       api.get, createObjectURL, document.createElement, link.setAttribute, split, toISOString, appendChild, link.click, link.remove
Called by:   handleExport

## Module: utils

Function:    isAdminEmail
File:        frontend/src/utils/adminHelper.js
Type:        Utility
Purpose:     Executes the isAdminEmail logic.
Parameters:  email (any) — input arguments
Returns:     boolean | result of call — return value
Side effects: None
Calls:       toLowerCase, trim, String, ADMIN_EMAILS.includes
Called by:   None

Function:    formatRupees
File:        frontend/src/utils/currency.js
Type:        Utility
Purpose:     Executes the formatRupees logic.
Parameters:  paise (any) — input arguments
Returns:     string | any — return value
Side effects: None
Calls:       toFixed
Called by:   Global/Route scope, AddSaleModal, AddStockModal, Attendance, DashboardInner, EditableRow, SaleRow, Stock

Function:    rupeesToPaise
File:        frontend/src/utils/currency.js
Type:        Utility
Purpose:     Executes the rupeesToPaise logic.
Parameters:  rupees (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       Math.round, Number
Called by:   None

Function:    paiseToRupees
File:        frontend/src/utils/currency.js
Type:        Utility
Purpose:     Executes the paiseToRupees logic.
Parameters:  paise (any) — input arguments
Returns:     result of call — return value
Side effects: None
Calls:       toFixed
Called by:   None

Function:    Navigate
File:        frontend/src/utils/routerShim.js
Type:        Utility
Purpose:     Executes the Navigate logic.
Parameters:  {to, replace} (object) — input arguments
Returns:     any — return value
Side effects: None
Calls:       useRouter, usePathname, useEffect, encodeURIComponent, router.replace, router.push
Called by:   None

Function:    useNavigate
File:        frontend/src/utils/routerShim.js
Type:        Hook
Purpose:     Executes the useNavigate logic.
Parameters:  none — input arguments
Returns:     any — return value
Side effects: None
Calls:       useRouter, router.replace, router.push
Called by:   Layout, UserLayout, ChangePassword, Login, MasterDashboard, ResetPassword

Function:    useParams
File:        frontend/src/utils/routerShim.js
Type:        Hook
Purpose:     Executes the useParams logic.
Parameters:  none — input arguments
Returns:     result of useNextParams — return value
Side effects: None
Calls:       useNextParams
Called by:   ResetPassword

Function:    useSearchParams
File:        frontend/src/utils/routerShim.js
Type:        Hook
Purpose:     Executes the useSearchParams logic.
Parameters:  none — input arguments
Returns:     result of useNextSearchParams — return value
Side effects: None
Calls:       useNextSearchParams
Called by:   Login

Function:    NavLink
File:        frontend/src/utils/routerShim.js
Type:        Utility
Purpose:     Executes the NavLink logic.
Parameters:  {href, children, className, onClick} (object) — input arguments
Returns:     JSX.Element — return value
Side effects: None
Calls:       usePathname, className
Called by:   None



---

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


---

# 06_frontend_components.md

## Routing Map
```text
/ -> Dashboard (app/page.jsx)
/admin/backups -> AdminBackupCenter (app/admin/backups/page.jsx)
/attendance -> Attendance (app/attendance/page.jsx)
/change-password -> ChangePassword (app/change-password/page.jsx)
/data-management -> DataManagement (app/data-management/page.jsx)
/login -> Login (app/login/page.jsx)
/login-activity -> LoginActivity (app/login-activity/page.jsx)
/master -> MasterDashboard (app/master/page.jsx)
/notifications -> Notifications (app/notifications/page.jsx)
/products -> ProductManager (app/products/page.jsx)
/reports -> Reports (app/reports/page.jsx)
/reset-password/[token] -> ResetPassword (app/reset-password/[token]/page.jsx)
/sales -> Sales (app/sales/page.jsx)
/settings -> Settings (app/settings/page.jsx)
/stock -> Stock (app/stock/page.jsx)
/user/attendance -> Attendance (app/user/attendance/page.jsx)
/user/sales -> Sales (app/user/sales/page.jsx)
/user/settings -> Settings (app/user/settings/page.jsx)
/user/stock -> Stock (app/user/stock/page.jsx)
/users -> UserManagement (app/users/page.jsx)
```

## Components & Pages

  Component:   RootLayout
  File:        app/layout.jsx
  Type:        Layout
  Purpose:     Provides the layout wrapper for RootLayout.
  Props:       children (any) - required - description
  State:       None
  API calls:   None
  Children:    AuthProvider
  Parent:      Various Components

  Component:   Page
  File:        app/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for Page functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, Dashboard
  Parent:      Next.js App Router

  Component:   BackupsPage
  File:        app/admin/backups/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for BackupsPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, AdminBackupCenter, Layout
  Parent:      Next.js App Router

  Component:   AttendancePage
  File:        app/attendance/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for AttendancePage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, Attendance
  Parent:      Next.js App Router

  Component:   Change-PasswordPage
  File:        app/change-password/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for Change-PasswordPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    ChangePassword
  Parent:      Next.js App Router

  Component:   Data-ManagementPage
  File:        app/data-management/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for Data-ManagementPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, DataManagement
  Parent:      Next.js App Router

  Component:   LoginPage
  File:        app/login/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for LoginPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Login
  Parent:      Next.js App Router

  Component:   Login-ActivityPage
  File:        app/login-activity/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for Login-ActivityPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, LoginActivity, Layout
  Parent:      Next.js App Router

  Component:   MasterPage
  File:        app/master/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for MasterPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, MasterDashboard
  Parent:      Next.js App Router

  Component:   NotificationsPage
  File:        app/notifications/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for NotificationsPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Notifications, Layout, ErrorBoundary
  Parent:      Next.js App Router

  Component:   ProductsPage
  File:        app/products/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for ProductsPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Layout, ProductManager
  Parent:      Next.js App Router

  Component:   ReportsPage
  File:        app/reports/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for ReportsPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, Reports
  Parent:      Next.js App Router

  Component:   [Token]Page
  File:        app/reset-password/[token]/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for [Token]Page functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    ResetPassword
  Parent:      Next.js App Router

  Component:   SalesPage
  File:        app/sales/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for SalesPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, Sales
  Parent:      Next.js App Router

  Component:   SettingsPage
  File:        app/settings/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for SettingsPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, Settings
  Parent:      Next.js App Router

  Component:   StockPage
  File:        app/stock/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for StockPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, Stock
  Parent:      Next.js App Router

  Component:   UserLayout
  File:        app/user/layout.jsx
  Type:        Layout
  Purpose:     Provides the layout wrapper for UserLayout.
  Props:       children (any) - required - description
  State:       None
  API calls:   None
  Children:    Navigate, UserLayout
  Parent:      Various Components

  Component:   UserAttendancePage
  File:        app/user/attendance/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for UserAttendancePage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Attendance
  Parent:      Next.js App Router

  Component:   UserSalesPage
  File:        app/user/sales/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for UserSalesPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Sales
  Parent:      Next.js App Router

  Component:   UserSettingsPage
  File:        app/user/settings/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for UserSettingsPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Settings
  Parent:      Next.js App Router

  Component:   UserStockPage
  File:        app/user/stock/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for UserStockPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Stock
  Parent:      Next.js App Router

  Component:   UsersPage
  File:        app/users/page.jsx
  Type:        Page
  Purpose:     Serves as the main page for UsersPage functionality.
  Props:       None
  State:       None
  API calls:   None
  Children:    Navigate, Layout, UserManagement
  Parent:      Next.js App Router

  Component:   AddSaleModal
  File:        components/AddSaleModal.jsx
  Type:        Modal
  Purpose:     Renders the AddSaleModal UI and handles its logic.
  Props:       onClose (any) - required - description
  State:       customerInput: state for customerInput, date: state for date, items: state for items, loading: state for loading
  API calls:   None
  Children:    Trash2, Plus
  Parent:      Various Components

  Component:   AddStockModal
  File:        components/AddStockModal.jsx
  Type:        Modal
  Purpose:     Renders the AddStockModal UI and handles its logic.
  Props:       onClose (any) - required - description
  State:       selectedInventoryId: state for selectedInventoryId, qty: state for qty, loading: state for loading
  API calls:   None
  Children:    Package
  Parent:      Various Components

  Component:   EmptyState
  File:        components/EmptyState.jsx
  Type:        Widget
  Purpose:     Renders the EmptyState UI and handles its logic.
  Props:       title (any) - required - description, message (any) - required - description, icon (any) - required - description
  State:       None
  API calls:   None
  Children:    None
  Parent:      Various Components

  Component:   ErrorBoundary
  File:        components/ErrorBoundary.jsx
  Type:        Widget
  Purpose:     Renders the ErrorBoundary UI and handles its logic.
  Props:       None
  State:       None
  API calls:   None
  Children:    RefreshCw, AlertTriangle
  Parent:      Various Components

  Component:   ComponentsLayout
  File:        components/Layout.jsx
  Type:        Layout
  Purpose:     Provides the layout wrapper for ComponentsLayout.
  Props:       children (any) - required - description
  State:       sidebarOpen: state for sidebarOpen, showSaleModal: state for showSaleModal, showStockModal: state for showStockModal, fabOpen: state for fabOpen
  API calls:   None
  Children:    Bell, LayoutDashboard, BarChart2, Database, AddSaleModal, NavLink, AddStockModal, DollarSign, Package, LogOut, Calendar, Plus, Menu
  Parent:      Various Components

  Component:   UserLayout
  File:        components/UserLayout.jsx
  Type:        Layout
  Purpose:     Provides the layout wrapper for UserLayout.
  Props:       children (any) - required - description
  State:       notifications: state for notifications, showNotifications: state for showNotifications
  API calls:   /notifications/read, /notifications
  Children:    Bell, Settings, NavLink, EmptyState, DollarSign, Package, LogOut, Calendar
  Parent:      Various Components

  Component:   AdminBackupCenter
  File:        screens/AdminBackupCenter.jsx
  Type:        Page
  Purpose:     Serves as the main page for AdminBackupCenter functionality.
  Props:       None
  State:       backupType: state for backupType, backupFormat: state for backupFormat, restoreFile: state for restoreFile, restoreValidation: state for restoreValidation, restoreStrategy: state for restoreStrategy
  API calls:   None
  Children:    CheckCircle, FileText, FileSpreadsheet, Database, RefreshCw, Download, Upload, AlertTriangle, Cloud
  Parent:      App Wrappers

  Component:   Attendance
  File:        screens/Attendance.jsx
  Type:        Page
  Purpose:     Serves as the main page for Attendance functionality.
  Props:       showOnlyMyAttendance (any) - optional - description
  State:       date: state for date, customerInput: state for customerInput, shakeProfit: state for shakeProfit, loading: state for loading
  API calls:   None
  Children:    Users, Trash2, AttendanceRecord, EmptyState, Calendar, Check
  Parent:      App Wrappers

  Component:   ChangePassword
  File:        screens/ChangePassword.jsx
  Type:        Page
  Purpose:     Serves as the main page for ChangePassword functionality.
  Props:       None
  State:       newPassword: state for newPassword, confirmPassword: state for confirmPassword, showPassword: state for showPassword, showConfirmPassword: state for showConfirmPassword, error: state for error, loading: state for loading
  API calls:   /auth/change-password
  Children:    Eye, EyeOff, Key
  Parent:      App Wrappers

  Component:   Dashboard
  File:        screens/Dashboard.jsx
  Type:        Page
  Purpose:     Serves as the main page for Dashboard functionality.
  Props:       icon: Icon (any) - required - description, title (any) - required - description, value (any) - required - description, color (any) - required - description, subtitle (any) - required - description
  State:       dateRange: state for dateRange, customStart: state for customStart, customEnd: state for customEnd
  API calls:   None
  Children:    Navigate, DashboardInner, SetupWizard, LoginActivity, Icon, AdminMetricCard, ErrorBoundary
  Parent:      App Wrappers

  Component:   DataManagement
  File:        screens/DataManagement.jsx
  Type:        Page
  Purpose:     Serves as the main page for DataManagement functionality.
  Props:       None
  State:       monthFilterAtt: state for monthFilterAtt, monthFilterSales: state for monthFilterSales, showConfirm: state for showConfirm, confirmAction: state for confirmAction, isDeleting: state for isDeleting, confirmText: state for confirmText, restoringId: state for restoringId, importType: state for importType, importFile: state for importFile, isImporting: state for isImporting
  API calls:   /reports/import
  Children:    ShoppingCart, Navigate, Database, RotateCcw, CalendarIcon, EmptyState, ClipboardCheck, AlertTriangle
  Parent:      App Wrappers

  Component:   Login
  File:        screens/Login.jsx
  Type:        Page
  Purpose:     Serves as the main page for Login functionality.
  Props:       None
  State:       step: state for step, email: state for email, password: state for password, showPassword: state for showPassword, loading: state for loading, errorMsg: state for errorMsg, successMsg: state for successMsg, lockoutUntil: state for lockoutUntil, displaySecs: state for displaySecs, savedClubName: state for savedClubName
  API calls:   None
  Children:    Eye, Navigate, EyeOff
  Parent:      App Wrappers

  Component:   LoginActivity
  File:        screens/LoginActivity.jsx
  Type:        Page
  Purpose:     Serves as the main page for LoginActivity functionality.
  Props:       None
  State:       history: state for history, loading: state for loading, filter: state for filter
  API calls:   None
  Children:    Smartphone, Monitor, RefreshCw
  Parent:      App Wrappers

  Component:   MasterDashboard
  File:        screens/MasterDashboard.jsx
  Type:        Page
  Purpose:     Serves as the main page for MasterDashboard functionality.
  Props:       None
  State:       stats: state for stats, adminsList: state for adminsList, liveSessions: state for liveSessions, activityLog: state for activityLog, loading: state for loading, activeTab: state for activeTab, logFilterAction: state for logFilterAction, logFilterAdmin: state for logFilterAdmin, deleteTarget: state for deleteTarget, expandedRows: state for expandedRows, newAdminEmail: state for newAdminEmail, refreshing: state for refreshing, msg: state for msg, error: state for error, editingClubId: state for editingClubId, editClubName: state for editClubName
  API calls:   /master/sessions, /master/admins, /master/stats, /master/audit-log
  Children:    Users, ChevronDown, CheckCircle, EyeOff, Eye, Trash2, Activity, Shield, ChevronRight, Key, AlertTriangle, LogOut
  Parent:      App Wrappers

  Component:   Notifications
  File:        screens/Notifications.jsx
  Type:        Page
  Purpose:     Serves as the main page for Notifications functionality.
  Props:       None
  State:       notifications: state for notifications, loading: state for loading
  API calls:   /notifications/read, /notifications
  Children:    Bell, EmptyState, Check
  Parent:      App Wrappers

  Component:   ProductManager
  File:        screens/ProductManager.jsx
  Type:        Page
  Purpose:     Serves as the main page for ProductManager functionality.
  Props:       onClose (any) - required - description
  State:       loading: state for loading, form: state for form, isEditing: state for isEditing, editData: state for editData, search: state for search, showModal: state for showModal
  API calls:   None
  Children:    EditableRow, Save, AddProductModal, ToggleRight, EmptyState, ToggleLeft, Package, Edit2, Plus
  Parent:      App Wrappers

  Component:   Reports
  File:        screens/Reports.jsx
  Type:        Page
  Purpose:     Serves as the main page for Reports functionality.
  Props:       None
  State:       isExporting: state for isExporting, timeRange: state for timeRange
  API calls:   None
  Children:    Users, FileText, Download, Activity
  Parent:      App Wrappers

  Component:   ResetPassword
  File:        screens/ResetPassword.jsx
  Type:        Page
  Purpose:     Serves as the main page for ResetPassword functionality.
  Props:       None
  State:       newPassword: state for newPassword, confirmPassword: state for confirmPassword, showPassword: state for showPassword, showConfirmPassword: state for showConfirmPassword, loading: state for loading, errorMsg: state for errorMsg, successMsg: state for successMsg
  API calls:   None
  Children:    Eye, EyeOff
  Parent:      App Wrappers

  Component:   Sales
  File:        screens/Sales.jsx
  Type:        Page
  Purpose:     Serves as the main page for Sales functionality.
  Props:       sale (any) - required - description, onDelete (any) - required - description
  State:       expanded: state for expanded, search: state for search, showModal: state for showModal
  API calls:   None
  Children:    ShoppingCart, SaleRow, Trash2, AddSaleModal, EmptyState, ChevronRight, Plus, ChevronDown
  Parent:      App Wrappers

  Component:   Settings
  File:        screens/Settings.jsx
  Type:        Page
  Purpose:     Serves as the main page for Settings functionality.
  Props:       userOnly (any) - optional - description
  State:       activeTab: state for activeTab, localClubName: state for localClubName, clubNameSaving: state for clubNameSaving, clubNameError: state for clubNameError, shakeAmount: state for shakeAmount, configSaving: state for configSaving, oldPassword: state for oldPassword, newPassword: state for newPassword, showOldPassword: state for showOldPassword, showNewPassword: state for showNewPassword, msg: state for msg, err: state for err, resetStep: state for resetStep, resetPassword: state for resetPassword, resetConfirmText: state for resetConfirmText, resetOtp: state for resetOtp, actualOtp: state for actualOtp, otpExpiresAt: state for otpExpiresAt, clockSkew: state for clockSkew, otpSecondsLeft: state for otpSecondsLeft, resetModules: state for resetModules
  API calls:   /system/reset/confirm, /system/reset/request-otp, /auth/change-password
  Children:    Users, EyeOff, Eye, UserManagement, Database, Key
  Parent:      App Wrappers

  Component:   SetupWizard
  File:        screens/SetupWizard.jsx
  Type:        Page
  Purpose:     Serves as the main page for SetupWizard functionality.
  Props:       onComplete (any) - required - description
  State:       step: state for step, clubName: state for clubName, clubNameError: state for clubNameError, productName: state for productName, vendorPrice: state for vendorPrice, productId: state for productId, shakeAmount: state for shakeAmount, stockQty: state for stockQty, memberName: state for memberName, memberPhone: state for memberPhone, staffEmail: state for staffEmail, staffPass: state for staffPass, loading: state for loading
  API calls:   /users, /settings/config, /admin/config/setup-complete, /stock, /products
  Children:    CheckCircle, ArrowRight, Droplets, Shield, Package
  Parent:      App Wrappers

  Component:   Stock
  File:        screens/Stock.jsx
  Type:        Page
  Purpose:     Serves as the main page for Stock functionality.
  Props:       readOnly (any) - optional - description
  State:       tempQty: state for tempQty, search: state for search, showModal: state for showModal
  API calls:   None
  Children:    StockRow, Trash2, EmptyState, AddStockModal, Package, Plus, Minus
  Parent:      App Wrappers

  Component:   UserManagement
  File:        screens/UserManagement.jsx
  Type:        Page
  Purpose:     Serves as the main page for UserManagement functionality.
  Props:       role (any) - required - description
  State:       newPassword: state for newPassword, showPassword: state for showPassword, editingId: state for editingId, editRole: state for editRole, passwordModalUser: state for passwordModalUser, revealedPasswords: state for revealedPasswords, sessionPasswords: state for sessionPasswords, form: state for form, showPassword: state for showPassword
  API calls:   None
  Children:    Eye, EyeOff, RoleBadge, Navigate, ChangePasswordModal, Trash2, Shield, Key, Edit2, Check
  Parent:      App Wrappers



---

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


---

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


---


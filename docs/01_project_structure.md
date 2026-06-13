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

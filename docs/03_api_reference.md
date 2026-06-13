# SECTION 3 — BACKEND API REFERENCE

## Module: `attendance\attendance.routes.js`

### `[GET] /api/attendance\attendance/attendance`
- **File:** `features/attendance/attendance.routes.js`
- **Handlers/Controller:** `authenticateToken, attendanceController.getAttendance`
- **Auth required:** No
- **Role required:** Any
- **Tenant scoped:** No

**Request:**
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

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
- Params: `[NEEDS CLARIFICATION]`
- Query: `[NEEDS CLARIFICATION]`
- Body: `[NEEDS CLARIFICATION]`

**Response:**
- 200: `{ success: true, data: [...] }`
- 400: `{ message: "Bad Request" }`
- 401: `{ message: "Unauthorized" }`
- 500: `{ message: "Internal Server Error" }`


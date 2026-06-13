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


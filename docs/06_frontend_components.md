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


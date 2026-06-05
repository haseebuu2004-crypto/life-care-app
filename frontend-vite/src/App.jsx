import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Stock } from './pages/Stock';
import { Sales } from './pages/Sales';
import { Attendance } from './pages/Attendance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { UserManagement } from './pages/UserManagement';
import { DataManagement } from './pages/DataManagement';
import { LoginActivity } from './pages/LoginActivity';
import { AdminBackupCenter } from './pages/AdminBackupCenter';
import { MasterDashboard } from './pages/MasterDashboard';

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'master') return <Navigate to="/master" replace />;
    return <Layout>{children}</Layout>;
}

function AdminRoute({ children }) {
    const { user } = useAuth();
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return <Layout>{children}</Layout>;
}

function MasterRoute({ children }) {
    const { user } = useAuth();
    if (!user || user.role !== 'master') {
        return <Navigate to="/" replace />;
    }
    // Master doesn't need the standard side nav, they get a dedicated dashboard
    return <Layout>{children}</Layout>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Master Routes */}
                <Route path="/master" element={<MasterRoute><MasterDashboard /></MasterRoute>} />

                {/* Protected Routes wrapped in Layout */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/overview" element={<Navigate to="/" replace />} />
                <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
                <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                <Route path="/data-management" element={<ProtectedRoute><DataManagement /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/login-activity" element={<AdminRoute><LoginActivity /></AdminRoute>} />
                <Route path="/admin/backups" element={<AdminRoute><AdminBackupCenter /></AdminRoute>} />

                {/* Catch-all redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

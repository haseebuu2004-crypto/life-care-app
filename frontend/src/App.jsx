import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useStore from './store/useStore';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Performance: Lazy loading pages to reduce initial bundle size
const Overview = lazy(() => import('./pages/Overview').then(m => ({ default: m.Overview })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Sales = lazy(() => import('./pages/Sales').then(m => ({ default: m.Sales })));
const Attendance = lazy(() => import('./pages/Attendance').then(m => ({ default: m.Attendance })));
const Stock = lazy(() => import('./pages/Stock').then(m => ({ default: m.Stock })));
const DataManagement = lazy(() => import('./pages/DataManagement').then(m => ({ default: m.DataManagement })));

const PageLoader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: 'center', alignItems: 'center', color: 'var(--text-light)' }}>
        <div className="loader" style={{ marginBottom: 20 }}></div>
        <p>Loading view...</p>
    </div>
);

function Login() {
    const { login } = useAuth();
    const nav = useNavigate();

    const [loginError, setLoginError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsSubmitting(true);
        try {
            await login(e.target.username.value, e.target.password.value);
            nav('/');
        } catch (error) {
            setLoginError(error.message || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={onSubmit} className="card" style={{ width: 400 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🥗 Life Care</h2>
                <div className="form-group">
                    <label>Username</label>
                    <input name="username" required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input name="password" type="password" required />
                </div>
                {loginError && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 12px', borderRadius: 8, marginBottom: 10, fontSize: 14 }}>
                        {loginError}
                    </div>
                )}
                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const fetchData = useStore(s => s.fetchData);
    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);
    if (!user) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
}

function AdminRoute({ children }) {
    const { user } = useAuth();
    const fetchData = useStore(s => s.fetchData);
    useEffect(() => {
        if (user && user.role === 'admin') fetchData();
    }, [user, fetchData]);
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return <Layout>{children}</Layout>;
}

function App() {
    const { user } = useAuth();
    
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/overview' : '/sales'} replace />} />
                    <Route path="/overview" element={<AdminRoute><Overview /></AdminRoute>} />
                    <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                    <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
                    <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
                    <Route path="/data-management" element={<AdminRoute><DataManagement /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;

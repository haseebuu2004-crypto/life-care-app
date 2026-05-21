import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import useStore from './store/useStore';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { isAdminEmail } from './utils/adminHelper';

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
    const { googleLogin } = useAuth();
    const nav = useNavigate();
    const [loginError, setLoginError] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoginError('');
        setIsGoogleLoading(true);
        try {
            const { auth, googleProvider } = await import('./services/firebase');
            const { signInWithPopup } = await import('firebase/auth');
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const { allowedRoles } = await googleLogin(idToken);
            nav('/select-role', { state: { allowedRoles } });
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                return; // Ignore
            }
            console.error("Google Login Error:", error);
            setLoginError(error.message || 'Google Login failed');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
            <div className="card" style={{ width: 400, padding: 40, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 28, color: '#1e293b' }}>🥗 Life Care</h2>
                <p style={{ color: '#64748b', margin: '10px 0 30px' }}>Welcome back! Please sign in to continue.</p>

                {loginError && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
                        {loginError}
                    </div>
                )}

                <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    disabled={isGoogleLoading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        fontSize: 16,
                        fontWeight: 500,
                        color: '#334155',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                </button>
            </div>
        </div>
    );
}

function SelectRole() {
    const { selectFinalRole } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const allowedRoles = location.state?.allowedRoles || [];
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedRoleForPassword, setSelectedRoleForPassword] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');

    useEffect(() => {
        if (!allowedRoles.length) nav('/login');
    }, [allowedRoles, nav]);

    const initiateRoleSelect = (role) => {
        setSelectedRoleForPassword(role);
        setPasswordInput('');
        setError('');
        setShowPasswordModal(true);
    };

    const handleRoleSelect = async () => {
        if (!selectedRoleForPassword) return;
        setError('');
        setLoading(true);
        try {
            await selectFinalRole(selectedRoleForPassword, passwordInput);
            if (selectedRoleForPassword === 'admin') {
                nav('/overview');
            } else {
                nav('/sales');
            }
        } catch (err) {
            setError(err.message || 'Failed to assign role');
            setLoading(false); // Only stop loading if error, otherwise let navigation happen
        }
    };

    if (!allowedRoles.length) return null;

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
            <div className="card" style={{ width: 400, padding: 40, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center', position: 'relative' }}>
                <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>Select Role</h2>
                <p style={{ color: '#64748b', margin: '10px 0 30px' }}>Choose how you want to view your workspace.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <button 
                        onClick={() => initiateRoleSelect('admin')}
                        className="btn btn-primary"
                        style={{ padding: '14px', fontSize: 16 }}
                    >
                        Admin
                    </button>
                    
                    <button 
                        onClick={() => initiateRoleSelect('user')}
                        className="btn btn-outline"
                        style={{ padding: '14px', fontSize: 16 }}
                    >
                        User
                    </button>
                </div>

                {showPasswordModal && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(255,255,255,0.95)', display: 'flex', 
                        flexDirection: 'column', justifyContent: 'center', padding: 30, borderRadius: 12
                    }}>
                        <h3 style={{ margin: '0 0 15px', color: '#1e293b' }}>
                            Enter {selectedRoleForPassword === 'admin' ? 'Admin' : 'User'} Password
                        </h3>
                        
                        {error && (
                            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: 8, marginBottom: 15, fontSize: 13 }}>
                                {error}
                            </div>
                        )}

                        <input 
                            type="password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Password"
                            style={{ padding: '12px', borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 15, fontSize: 16 }}
                            onKeyDown={(e) => e.key === 'Enter' && handleRoleSelect()}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button 
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setError('');
                                }}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '12px' }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRoleSelect}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '12px' }}
                                disabled={loading || !passwordInput}
                            >
                                {loading ? 'Verifying...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
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
                    <Route path="/select-role" element={<SelectRole />} />
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

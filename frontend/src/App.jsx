import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useStore from './store/useStore';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Stock } from './pages/Stock';
import { Sales } from './pages/Sales';
import { Attendance } from './pages/Attendance';
import { Usage } from './pages/Usage';

function Login() {
    const login = useStore(s => s.login);
    const nav = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(e.target.username.value, e.target.password.value);
            nav('/');
        } catch (error) {
            alert('Invalid credentials');
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
                <button type="submit" className="btn btn-primary w-full">Login</button>
            </form>
        </div>
    );
}

function ProtectedRoute({ children }) {
    const user = useStore(s => s.user);
    if (!user) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
                <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
                <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                <Route path="/usage" element={<ProtectedRoute><Usage /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

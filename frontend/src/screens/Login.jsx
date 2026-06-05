"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from "@/utils/routerShim";
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function Login() {
    const { login, forgotPassword, user } = useAuth();
    const nav = useNavigate();
    
    // UI Flow State: 1=Login, 2=ForgotPwd
    const [step, setStep] = useState(1);
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const [displaySecs, setDisplaySecs] = useState(0);
    const [savedClubName, setSavedClubName] = useState('Life Care System');

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('savedClubName');
        if (stored) {
            setSavedClubName(stored);
        }
        
        const savedLockout = localStorage.getItem('loginLockoutTime');
        if (savedLockout) {
            const time = parseInt(savedLockout, 10);
            if (time > Date.now()) {
                setLockoutUntil(time);
            } else {
                localStorage.removeItem('loginLockoutTime');
            }
        }
    }, []);

    useEffect(() => {
        if (lockoutUntil) {
            localStorage.setItem('loginLockoutTime', lockoutUntil.toString());
        } else {
            localStorage.removeItem('loginLockoutTime');
        }
        if (!lockoutUntil) return;
        
        const tick = () => {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
            if (remaining <= 0) {
                setLockoutUntil(null);
                setDisplaySecs(0);
            } else {
                setDisplaySecs(remaining);
            }
        };
        
        tick(); // Initial tick
        const timer = setInterval(tick, 1000);
        
        // Handle visibility change to instantly catch up the timer if browser suspended setInterval
        const handleVisibilityChange = () => {
            if (!document.hidden) tick();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [lockoutUntil]);

    if (user) return <Navigate to="/" replace />;

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true); setErrorMsg(''); setSuccessMsg('');
            await login(email, password);
            nav('/');
        } catch (error) {
            if (error.response?.status === 429) {
                const retrySecs = parseInt(error.response.headers?.['retry-after'], 10);
                if (!isNaN(retrySecs) && retrySecs > 0) {
                    setLockoutUntil(Date.now() + (retrySecs * 1000));
                } else {
                    setLockoutUntil(Date.now() + (15 * 60 * 1000)); // Default to 15 mins
                }
            }
            setErrorMsg(error.message || 'Login failed. Please check your credentials.');
        } finally { setLoading(false); }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true); setErrorMsg(''); setSuccessMsg('');
            const data = await forgotPassword(email);
            setSuccessMsg(data.message || 'Reset link sent to your email.');
        } catch (error) {
            setErrorMsg(error.message || 'Failed to send reset link.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
            <div className="card" style={{ width: 420, padding: '40px 30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '12px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 30, fontSize: '24px', fontWeight: '700', color: '#111827' }}>🥗 {savedClubName}</h2>

                {errorMsg && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{errorMsg}</div>}
                {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{successMsg}</div>}

                {step === 1 && (
                    <form onSubmit={handleLoginSubmit}>
                        <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px', textTransform: 'uppercase' }}>ACCOUNT LOGIN</h3>
                        
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: '#4b5563', fontWeight: '600' }}>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="name@example.com" 
                                suppressHydrationWarning
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }} 
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 25 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: '#4b5563', fontWeight: '600' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="Enter password" 
                                    suppressHydrationWarning
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px', paddingRight: '40px' }} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading || displaySecs > 0} className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                            {loading ? 'Authenticating...' : displaySecs > 0 ? `Blocked (${Math.floor(displaySecs / 60)}:${(displaySecs % 60).toString().padStart(2, '0')})` : 'Sign In'}
                        </button>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 15 }}>
                            <button type="button" onClick={() => { setStep(2); setErrorMsg(''); setSuccessMsg(''); }} style={{ border: 'none', background: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}>
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleForgotSubmit}>
                        <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px', textTransform: 'uppercase' }}>RESET PASSWORD</h3>
                        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: 20 }}>Enter your email and we will send a secure reset link.</p>
                        
                        <div className="form-group" style={{ marginBottom: 25 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: '#4b5563', fontWeight: '600' }}>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="name@example.com" 
                                suppressHydrationWarning
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }} 
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        
                        <button type="button" onClick={() => { setStep(1); setErrorMsg(''); setSuccessMsg(''); }} style={{ marginTop: 15, border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', width: '100%' }}>
                            ← Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

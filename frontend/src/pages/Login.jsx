import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/firebase';

export function Login() {
    const { googleLogin, selectRole, verifyPassword, setPassword, forgotPassword, user } = useAuth();
    const nav = useNavigate();
    
    // UI Flow State: 1=Google, 2=Role, 3=VerifyPwd, 4=CreatePwd, 5=ForgotPwd
    const [step, setStep] = useState(1);
    const [allowedRoles, setAllowedRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePassword, setRolePassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (user) return <Navigate to="/" replace />;

    const validatePassword = (pass) => {
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasLength = pass.length >= 8;
        return hasUpper && hasLower && hasNumber && hasLength;
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true); setErrorMsg('');
            const firebaseUser = await signInWithGoogle();
            const idToken = await firebaseUser.getIdToken();
            const data = await googleLogin(idToken);
            setAllowedRoles(data.allowedRoles || ['admin', 'user']);
            setStep(2);
        } catch (error) {
            setErrorMsg(error.message || 'Google login failed');
        } finally { setLoading(false); }
    };

    const handleRoleSelection = async (role) => {
        try {
            setLoading(true); setErrorMsg('');
            setSelectedRole(role);
            const data = await selectRole(role);
            if (data.hasPassword) {
                setStep(3); // Verify Password
            } else {
                setStep(4); // Create Password
            }
        } catch (error) {
            setErrorMsg(error.message || 'Role selection failed');
        } finally { setLoading(false); }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true); setErrorMsg('');
            await verifyPassword(selectedRole, rolePassword);
            nav('/');
        } catch (error) {
            setErrorMsg(error.message || 'Verification failed');
        } finally { setLoading(false); }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(rolePassword)) {
            return setErrorMsg('Password must contain uppercase, lowercase, number, and be 8+ chars.');
        }
        if (rolePassword !== confirmPassword) {
            return setErrorMsg('Passwords do not match');
        }
        try {
            setLoading(true); setErrorMsg('');
            await setPassword(selectedRole, rolePassword);
            nav('/');
        } catch (error) {
            setErrorMsg(error.message || 'Password creation failed');
        } finally { setLoading(false); }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true); setErrorMsg(''); setSuccessMsg('');
            const data = await forgotPassword(selectedRole);
            setSuccessMsg(data.message || 'Reset link sent');
        } catch (error) {
            setErrorMsg(error.message || 'Failed to send reset link');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
            <div className="card" style={{ width: 420, padding: '40px 30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 30, fontSize: '24px', fontWeight: '700', color: '#111827' }}>🥗 Life Care</h2>

                {errorMsg && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{errorMsg}</div>}
                {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{successMsg}</div>}

                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ marginBottom: 24, color: '#4b5563', fontSize: '15px' }}>Sign in to access your workspace</p>
                        <button type="button" onClick={handleGoogleLogin} disabled={loading} className="btn btn-outline w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', fontSize: '16px', fontWeight: '600', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151' }}>
                            {loading ? 'Connecting...' : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px' }}>Select Your Role</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            {allowedRoles.includes('admin') && (
                                <button onClick={() => handleRoleSelection('admin')} disabled={loading} className="btn btn-outline w-full" style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', border: '2px solid #111827', color: '#111827' }}>
                                    {loading && selectedRole === 'admin' ? 'Checking...' : 'ADMIN PANEL'}
                                </button>
                            )}
                            {allowedRoles.includes('user') && (
                                <button onClick={() => handleRoleSelection('user')} disabled={loading} className="btn btn-outline w-full" style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', border: '2px solid #4b5563', color: '#4b5563' }}>
                                    {loading && selectedRole === 'user' ? 'Checking...' : 'USER PANEL'}
                                </button>
                            )}
                        </div>
                        <button type="button" onClick={() => setStep(1)} className="btn btn-outline w-full" style={{ marginTop: 20, border: 'none', color: '#6b7280' }}>← Back</button>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleVerifySubmit}>
                        <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px', textTransform: 'uppercase' }}>{selectedRole} LOGIN</h3>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: '#4b5563', fontWeight: '600' }}>Password</label>
                            <input type="password" value={rolePassword} onChange={(e) => setRolePassword(e.target.value)} required placeholder={`Enter password`} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }} />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>{loading ? 'Verifying...' : 'Verify Access'}</button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15 }}>
                            <button type="button" onClick={() => { setStep(2); setRolePassword(''); setErrorMsg(''); }} style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer' }}>← Back</button>
                            <button type="button" onClick={() => { setStep(5); setErrorMsg(''); setSuccessMsg(''); }} style={{ border: 'none', background: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}>Forgot Password?</button>
                        </div>
                    </form>
                )}

                {step === 4 && (
                    <form onSubmit={handleCreateSubmit}>
                        <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px', textTransform: 'uppercase' }}>CREATE {selectedRole} PASSWORD</h3>
                        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: 20 }}>Secure this panel by creating a new password.</p>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <input type="password" value={rolePassword} onChange={(e) => setRolePassword(e.target.value)} required placeholder={`New Password`} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder={`Confirm Password`} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }} />
                        </div>
                        <ul style={{ fontSize: '12px', color: '#6b7280', paddingLeft: 20, marginBottom: 20 }}>
                            <li style={{ color: rolePassword.length >= 8 ? '#16a34a' : 'inherit' }}>Min 8 characters</li>
                            <li style={{ color: /[A-Z]/.test(rolePassword) ? '#16a34a' : 'inherit' }}>One uppercase letter</li>
                            <li style={{ color: /[a-z]/.test(rolePassword) ? '#16a34a' : 'inherit' }}>One lowercase letter</li>
                            <li style={{ color: /[0-9]/.test(rolePassword) ? '#16a34a' : 'inherit' }}>One number</li>
                        </ul>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>{loading ? 'Creating...' : 'Create Secure Password'}</button>
                        <button type="button" onClick={() => { setStep(2); setRolePassword(''); setConfirmPassword(''); setErrorMsg(''); }} style={{ marginTop: 15, border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', width: '100%' }}>← Back to Roles</button>
                    </form>
                )}

                {step === 5 && (
                    <form onSubmit={handleForgotSubmit}>
                        <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px', textTransform: 'uppercase' }}>RESET {selectedRole} PASSWORD</h3>
                        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: 20 }}>We will send a secure reset link to your workspace email.</p>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                        <button type="button" onClick={() => { setStep(3); setErrorMsg(''); setSuccessMsg(''); }} style={{ marginTop: 15, border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', width: '100%' }}>← Back to Login</button>
                    </form>
                )}
            </div>
        </div>
    );
}

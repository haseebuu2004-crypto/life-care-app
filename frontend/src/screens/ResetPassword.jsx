"use client";
import React, { useState } from 'react';
import { useParams, useNavigate } from "@/utils/routerShim";
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
    const { token } = useParams();
    const nav = useNavigate();
    const { resetPassword } = useAuth();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const validatePassword = (pass) => {
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasLength = pass.length >= 8;
        return hasUpper && hasLower && hasNumber && hasLength;
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            return setErrorMsg('Password must contain uppercase, lowercase, number, and be 8+ chars.');
        }
        if (newPassword !== confirmPassword) {
            return setErrorMsg('Passwords do not match');
        }
        try {
            setLoading(true); setErrorMsg(''); setSuccessMsg('');
            const data = await resetPassword(token, newPassword);
            setSuccessMsg(data.message || 'Password reset successfully');
            setTimeout(() => { nav('/login'); }, 2000);
        } catch (error) {
            setErrorMsg(error.message || 'Password reset failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
            <div className="card" style={{ width: 420, padding: '40px 30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '12px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 30, fontSize: '24px', fontWeight: '700', color: '#111827' }}>🥗 {typeof window !== 'undefined' ? localStorage.getItem('clubName') || 'Life Care System' : 'Life Care System'}</h2>

                {errorMsg && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{errorMsg}</div>}
                {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{successMsg}</div>}

                <form onSubmit={handleResetSubmit}>
                    <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#374151', fontSize: '18px', textTransform: 'uppercase' }}>RESET PASSWORD</h3>
                    <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: 20 }}>Please enter your new secure password.</p>
                    <div className="form-group" style={{ marginBottom: 15, position: 'relative' }}>
                        <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder={`New Password`} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px', paddingRight: '40px' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: 20, position: 'relative' }}>
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder={`Confirm Password`} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px', paddingRight: '40px' }} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <ul style={{ fontSize: '12px', color: '#6b7280', paddingLeft: 20, marginBottom: 20 }}>
                        <li style={{ color: newPassword.length >= 8 ? '#16a34a' : 'inherit' }}>Min 8 characters</li>
                        <li style={{ color: /[A-Z]/.test(newPassword) ? '#16a34a' : 'inherit' }}>One uppercase letter</li>
                        <li style={{ color: /[a-z]/.test(newPassword) ? '#16a34a' : 'inherit' }}>One lowercase letter</li>
                        <li style={{ color: /[0-9]/.test(newPassword) ? '#16a34a' : 'inherit' }}>One number</li>
                    </ul>
                    <button type="submit" disabled={loading || successMsg} className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>{loading ? 'Resetting...' : 'Save New Password'}</button>
                    <button type="button" onClick={() => nav('/login')} className="btn btn-outline w-full" style={{ marginTop: 15, border: 'none', color: '#6b7280' }}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

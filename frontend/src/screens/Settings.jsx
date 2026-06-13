"use client";
import { useState, useEffect } from 'react';
import { Package, Users, Clock, Database, Key, Eye, EyeOff } from 'lucide-react';
import { Stock } from './Stock';
import { UserManagement } from './UserManagement';
import { LoginActivity } from './LoginActivity';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import api from '../services/api';

export function Settings({ userOnly = false }) {
    const { user, login } = useAuth();
    const perm = usePermissions();
    const [activeTab, setActiveTab] = useState(perm.isAdmin && !userOnly ? 'config' : 'account');
    const { resetData, dashboardStats, updateAdminConfig, clubName, updateClubName } = useStore();
    
    // Club Name state
    const [localClubName, setLocalClubName] = useState(clubName || '');
    const [clubNameSaving, setClubNameSaving] = useState(false);
    const [clubNameError, setClubNameError] = useState('');
    
    // System Config state
    const [shakeAmount, setShakeAmount] = useState(dashboardStats?.adminConfig?.default_shake_amount ?? 50);
    const [configSaving, setConfigSaving] = useState(false);

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    // System Reset state
    const [resetStep, setResetStep] = useState(0); // 0 = default, 1 = password, 2 = text, 3 = OTP
    const [resetPassword, setResetPassword] = useState('');
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [actualOtp, setActualOtp] = useState('');
    const [otpExpiresAt, setOtpExpiresAt] = useState(null);
    const [clockSkew, setClockSkew] = useState(0);
    const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
    const [resetModules, setResetModules] = useState({
        attendance: false,
        sales_and_stock: false,
        products: false
    });

    useEffect(() => {
        if (!otpExpiresAt) return;

        const updateTimer = () => {
            const adjustedNow = Date.now() + clockSkew;
            const remainingMs = otpExpiresAt - adjustedNow;
            if (remainingMs <= 0) {
                setOtpSecondsLeft(0);
            } else {
                setOtpSecondsLeft(Math.ceil(remainingMs / 1000));
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        const handleVisibilityChange = () => {
            if (!document.hidden) updateTimer();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [otpExpiresAt]);

    const handleRequestOtp = async () => {
        try {
            const res = await api.post('/system/reset/request-otp', { password: resetPassword });
            useStore.getState().showToast("OTP sent to your email.", "success");
            if (res.data.expires_at) {
                const serverTime = res.data.server_time ? new Date(res.data.server_time).getTime() : Date.now();
                setClockSkew(serverTime - Date.now());
                setOtpExpiresAt(new Date(res.data.expires_at).getTime());
            } else {
                setClockSkew(0);
                setOtpExpiresAt(Date.now() + 600000);
            }
            setResetStep(2);
        } catch (error) {
            useStore.getState().showToast(error.response?.data?.message || "Failed to generate OTP", "error");
        }
    };

    const handleConfirmReset = async () => {
        try {
            const selectedModules = Object.keys(resetModules).filter(k => resetModules[k]);
            await api.post('/system/reset/confirm', {
                password: resetPassword,
                confirmText: resetConfirmText,
                otp: resetOtp,
                modules: selectedModules
            });
            useStore.getState().showToast("System reset successful", "success");
            setResetStep(0);
            setResetPassword('');
            setResetConfirmText('');
            setResetOtp('');
            setOtpExpiresAt(null);
            setClockSkew(0);
            setResetModules({ attendance: false, sales_and_stock: false, products: false });
            useStore.getState().fetchData();
        } catch (error) {
            useStore.getState().showToast(error.response?.data?.message || "Reset failed", "error");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            setMsg(''); setErr('');
            if (newPassword.length < 8) return setErr('New password must be at least 8 characters long.');
            await api.post('/auth/change-password', { oldPassword, newPassword });
            setMsg('Password changed successfully.');
            setOldPassword(''); setNewPassword('');
        } catch (error) {
            setErr(error.response?.data?.message || 'Failed to change password.');
        }
    };

    const handleSaveClubName = async () => {
        setClubNameError('');
        if (!localClubName || localClubName.trim().length === 0) {
            return setClubNameError('Please enter your club name.');
        }
        if (localClubName.length > 100) {
            return setClubNameError('Club name is too long (max 100 characters).');
        }
        
        setClubNameSaving(true);
        try {
            await updateClubName(localClubName);
            useStore.getState().showToast('Club name saved.', 'success');
        } catch (error) {
            setClubNameError(error.message || 'Failed to save club name.');
        } finally {
            setClubNameSaving(false);
        }
    };

    const handleSaveConfig = async () => {
        setConfigSaving(true);
        try {
            await updateAdminConfig({ 
                default_shake_amount: Number(shakeAmount)
            });
            useStore.getState().showToast("Configuration saved successfully", "success");
        } catch (error) {
            useStore.getState().showToast(error.message || "Failed to save configuration", "error");
        } finally {
            setConfigSaving(false);
        }
    };

    return (
        <div>
            <h2>Settings</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {perm.isAdmin && !userOnly && (
                    <>
                        <button className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('config')}><Database size={16}/> App Config</button>
                        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}><Users size={16}/> Users</button>
                        <button className={`btn ${activeTab === 'system' ? 'btn-danger' : 'btn-outline'}`} onClick={() => setActiveTab('system')}><Database size={16}/> Danger Zone</button>
                    </>
                )}
                <button className={`btn ${activeTab === 'account' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('account')}><Key size={16}/> Account</button>
            </div>

            <div className="card">
                {activeTab === 'config' && perm.isAdmin && (
                    <div style={{ padding: 20 }}>
                        <h3 style={{ marginBottom: 20 }}>App Configuration</h3>
                        <div style={{ maxWidth: 400, marginBottom: 20 }}>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Default Shake Profit (Rs.)</label>
                                <input type="number" className="form-control" value={shakeAmount} onChange={e => setShakeAmount(e.target.value)} />
                                <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>This amount is automatically applied to attendance records if left blank.</p>
                            </div>
                            <button className="btn btn-primary" onClick={handleSaveConfig} disabled={configSaving}>
                                {configSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'users' && perm.isAdmin && <UserManagement />}
                
                {activeTab === 'system' && perm.isAdmin && (
                    <div style={{ padding: 20 }}>
                        <h3 style={{ color: 'var(--alert-color)', marginBottom: 10 }}>Danger Zone</h3>
                        <p style={{ marginBottom: 20 }}>This action cannot be undone. It will wipe all business data (Sales, Stock, Attendance).</p>
                        
                        {resetStep === 0 && (
                            <div style={{ border: '1px solid var(--border-color)', padding: 15, borderRadius: 8, maxWidth: 400, marginBottom: 15, background: 'var(--card-bg)' }}>
                                <h4 style={{ marginBottom: 15, fontSize: 16 }}>Select Data to Reset</h4>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={resetModules.attendance} onChange={e => setResetModules(prev => ({ ...prev, attendance: e.target.checked }))} style={{ width: 16, height: 16 }} />
                                    <span style={{ fontSize: 14 }}>Attendance History</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', opacity: resetModules.products ? 0.6 : 1 }}>
                                    <input type="checkbox" checked={resetModules.products ? true : resetModules.sales_and_stock} disabled={resetModules.products} onChange={e => setResetModules(prev => ({ ...prev, sales_and_stock: e.target.checked }))} style={{ width: 16, height: 16 }} />
                                    <span style={{ fontSize: 14 }}>Sales & Stock Inventory</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={resetModules.products} onChange={e => {
                                        const checked = e.target.checked;
                                        setResetModules(prev => ({ 
                                            ...prev, 
                                            products: checked,
                                            sales_and_stock: checked ? true : prev.sales_and_stock 
                                        }));
                                    }} style={{ width: 16, height: 16 }} />
                                    <span style={{ fontSize: 14 }}>Product Manager <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 4 }}>(Forces Sales & Stock reset)</span></span>
                                </label>
                                <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => setResetStep(1)} disabled={!resetModules.attendance && !resetModules.sales_and_stock && !resetModules.products}>Proceed to Reset</button>
                            </div>
                        )}
                        
                        {resetStep === 1 && (
                            <div style={{ border: '1px solid #ef4444', padding: 15, borderRadius: 8, maxWidth: 400 }}>
                                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>Step 1: Enter Admin Password</p>
                                <div style={{ position: 'relative', marginBottom: 10 }}>
                                    <input type={showOldPassword ? "text" : "password"} value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="form-control" style={{ width: '100%', paddingRight: 40 }} placeholder="Admin Password" />
                                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn btn-outline" onClick={() => { setResetStep(0); setResetPassword(''); }}>Cancel</button>
                                    <button className="btn btn-danger" onClick={handleRequestOtp} disabled={!resetPassword}>Next</button>
                                </div>
                            </div>
                        )}

                        {resetStep === 2 && (
                            <div style={{ border: '1px solid #ef4444', padding: 15, borderRadius: 8, maxWidth: 400 }}>
                                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>Step 2: Type Confirmation</p>
                                <p style={{ fontSize: 13, marginBottom: 10 }}>Type <b>RESET ALL DATA</b> to proceed.</p>
                                <input type="text" value={resetConfirmText} onChange={e => setResetConfirmText(e.target.value)} className="form-control" style={{ marginBottom: 10 }} placeholder="RESET ALL DATA" />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn btn-outline" onClick={() => setResetStep(1)}>Back</button>
                                    <button className="btn btn-danger" onClick={() => setResetStep(3)} disabled={resetConfirmText !== 'RESET ALL DATA'}>Next</button>
                                </div>
                            </div>
                        )}

                        {resetStep === 3 && (
                            <div style={{ border: '1px solid #ef4444', padding: 15, borderRadius: 8, maxWidth: 400 }}>
                                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>Step 3: Email OTP Verification</p>
                                <p style={{ fontSize: 13, marginBottom: 10 }}>Enter the 6-digit code sent to your email.</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Time remaining:</span>
                                    <span style={{ fontSize: 12, fontWeight: 'bold', color: otpSecondsLeft > 0 ? 'var(--text-color)' : '#dc2626' }}>
                                        {Math.floor(otpSecondsLeft / 60)}:{(otpSecondsLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <input type="text" value={resetOtp} onChange={e => setResetOtp(e.target.value)} disabled={otpSecondsLeft <= 0} className="form-control" style={{ marginBottom: 10 }} placeholder="123456" maxLength={6} />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn btn-outline" onClick={() => setResetStep(2)}>Back</button>
                                    {otpSecondsLeft > 0 ? (
                                        <button className="btn btn-danger" onClick={handleConfirmReset} disabled={resetOtp.length !== 6}>Confirm Reset</button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => { setResetStep(1); setResetOtp(''); setResetPassword(''); setOtpExpiresAt(null); setClockSkew(0); }}>Resend OTP</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'account' && (
                    <div style={{ padding: 20, maxWidth: 500 }}>
                        {perm.isAdmin && !userOnly && (
                            <div style={{ marginBottom: 40 }}>
                                <h3 style={{ marginBottom: 20 }}>Club Name</h3>
                                {clubNameError && <div style={{ color: '#dc2626', padding: 10, background: '#fee2e2', borderRadius: 5, marginBottom: 15 }}>{clubNameError}</div>}
                                <div className="form-group" style={{ marginBottom: 15 }}>
                                    <label>Club Name</label>
                                    <input 
                                        type="text" 
                                        value={localClubName} 
                                        onChange={e => setLocalClubName(e.target.value)} 
                                        maxLength={100}
                                        className="form-control" 
                                        placeholder="e.g. LIFE CARE" 
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Appears on your dashboard, reports, and exports.</span>
                                        <span style={{ fontSize: 12, color: localClubName.length > 100 ? '#dc2626' : 'var(--text-light)' }}>{localClubName.length} / 100</span>
                                    </div>
                                </div>
                                <button className="btn btn-primary w-full" onClick={handleSaveClubName} disabled={clubNameSaving}>
                                    {clubNameSaving ? 'Saving...' : 'Save Club Name'}
                                </button>
                            </div>
                        )}

                        <h3 style={{ marginBottom: 20 }}>Change Password</h3>
                        {msg && <div style={{ color: '#16a34a', padding: 10, background: '#dcfce7', borderRadius: 5, marginBottom: 15 }}>{msg}</div>}
                        {err && <div style={{ color: '#dc2626', padding: 10, background: '#fee2e2', borderRadius: 5, marginBottom: 15 }}>{err}</div>}
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="form-control" style={{ paddingRight: 40 }} />
                                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label>New Password (Min 8 characters)</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="form-control" style={{ paddingRight: 40 }} />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Update Password</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

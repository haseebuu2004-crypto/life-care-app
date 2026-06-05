"use client";
import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Navigate } from "@/utils/routerShim";
import { Plus, Trash2, Edit2, X, Check, Shield, Eye, EyeOff, Mail, Key } from 'lucide-react';

const ROLES = ['admin', 'user'];

const ROLE_COLORS = {
    admin:   { bg: '#fef3f2', color: '#b91c1c', border: '#fca5a5' },
    user:    { bg: '#f9fafb', color: '#374151', border: '#d1d5db' },
};

function RoleBadge({ role }) {
    const c = ROLE_COLORS[role] || ROLE_COLORS.user;
    return (
        <span style={{
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
        }}>
            {role}
        </span>
    );
}

function ChangePasswordModal({ targetUser, onClose }) {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) return useStore.getState().showToast('Password must be at least 8 characters', 'error');
        try {
            await useStore.getState().adminUpdateUserPassword(targetUser.id, newPassword);
            useStore.getState().showToast('Password updated successfully', 'success');
            onClose();
        } catch (err) {
            useStore.getState().showToast(err.message || 'Failed to update password', 'error');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <span>Change Password for {targetUser.username}</span>
                    <button onClick={onClose} className="btn icon-btn"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                        <label>New Password (Min 8 characters)</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="form-control" style={{ paddingRight: 40 }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function UserManagement() {
    const perm = usePermissions();
    const { user: currentUser } = useAuth();
    const { users, fetchUsers, updateUserRole, deleteUser, addUser } = useStore();
    
    const [editingId, setEditingId] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [passwordModalUser, setPasswordModalUser] = useState(null);
    const [revealedPasswords, setRevealedPasswords] = useState({});
    const [sessionPasswords, setSessionPasswords] = useState({});
    
    const toggleReveal = (id) => {
        setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (perm.canManageUsers) fetchUsers();
    }, []);

    if (!perm.canManageUsers) return <Navigate to="/" replace />;

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const currentPassword = form.password;
            const resData = await addUser(form);
            const returnedPassword = resData.tempPassword || currentPassword;
            if (returnedPassword && resData.data?.id) {
                setSessionPasswords(prev => ({ ...prev, [resData.data.id]: returnedPassword }));
                setRevealedPasswords(prev => ({ ...prev, [resData.data.id]: true }));
            }
            useStore.getState().showToast(`User "${form.username}" created`, 'success');
            setForm({ username: '', email: '', password: '', role: 'user' });
            setShowPassword(false);
        } catch (err) {
            const msg = err.message || err.response?.data?.message || err.response?.data?.error || 'Failed to create user';
            useStore.getState().showToast(msg, 'error');
        }
    };

    const startEdit = (u) => {
        setEditingId(u.id);
        setEditRole(u.role);
    };

    const saveRole = async (id) => {
        try {
            await updateUserRole(id, editRole);
            useStore.getState().showToast('Role updated', 'success');
        } catch (err) {
            useStore.getState().showToast(err.message || err.response?.data?.message || 'Failed to update role', 'error');
        }
        setEditingId(null);
    };

    const handleDelete = async (u) => {
        if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
        try {
            await deleteUser(u.id);
            useStore.getState().showToast(`User "${u.username}" deleted`, 'info');
        } catch (err) {
            useStore.getState().showToast(err.message || err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 30 }}>
                <div>
                    <h2 style={{ marginBottom: 4 }}>User Management</h2>
                    <p style={{ color: 'var(--text-light)', margin: 0 }}>Manage system users and their roles</p>
                </div>
            </div>

            {/* Role Permission Summary */}
            <div className="card-grid" style={{ padding: 0, marginBottom: 30, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {[
                    { role: 'admin',   label: 'Admin',   desc: 'Full control over everything' },
                    { role: 'user',    label: 'User',    desc: 'Attendance & sales operations' },
                ].map(({ role, label, desc }) => {
                    const c = ROLE_COLORS[role];
                    return (
                        <div key={role} className="card" style={{ borderLeft: `4px solid ${c.border}`, padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Shield size={14} color={c.color} />
                                <span style={{ fontWeight: 700, color: c.color }}>{label}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{desc}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, color: 'var(--text-dark)' }}>
                                {users.filter(u => u.role === role).length} user(s)
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }} className="user-management-grid">
                {/* Add User Form */}
                <div className="card" style={{ padding: 25, height: 'fit-content', flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
                    <h3 style={{ marginBottom: 20, fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>Add New User</h3>
                    <form onSubmit={handleCreateUser}>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Username (Name)</label>
                            <input value={form.username} onChange={e=>setForm({...form, username: e.target.value})} required className="form-control" placeholder="e.g. John Doe" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Email Address</label>
                            <input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required className="form-control" placeholder="john@clubab.com" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? "text" : "password"} value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Leave blank for auto-generated password" minLength={8} className="form-control" style={{ paddingRight: '40px' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Role</label>
                            <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="form-control">
                                {ROLES.filter(r => currentUser?.role === 'master' ? true : r === 'user').map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Create User</button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="card" style={{ padding: 25, flex: '2 1 500px', minWidth: '300px' }}>
                    <h3 style={{ marginBottom: 20, fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>Workspace Accounts</h3>
                    <div className="table-container" style={{ margin: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Password (Raw)</th>
                                    <th style={{ width: 120 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ color: 'var(--text-light)', fontSize: 13, fontFamily: 'monospace' }} title={u.id}>{u.id.substring(0, 8)}</td>
                                        <td>
                                            <strong>{u.username}</strong>
                                            {u.id === currentUser?.id && (
                                                <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--primary-color)', color: 'white', padding: '1px 7px', borderRadius: 10 }}>You</span>
                                            )}
                                        </td>
                                        <td style={{ color: '#6b7280' }}>
                                            {u.email || '-'}
                                        </td>
                                        <td>
                                            {editingId === u.id ? (
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: 120, padding: '4px 8px' }}>
                                                        {ROLES.filter(r => currentUser?.role === 'master' ? true : r === 'user').map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                                    </select>
                                                    <button className="btn icon-btn" onClick={() => saveRole(u.id)} style={{ color: 'var(--primary-color)' }}><Check size={16}/></button>
                                                    <button className="btn icon-btn" onClick={() => setEditingId(null)} style={{ color: 'var(--text-light)' }}><X size={16}/></button>
                                                </div>
                                            ) : (
                                                <RoleBadge role={u.role} />
                                            )}
                                        </td>
                                        <td style={{ fontFamily: 'monospace', color: '#dc2626', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {revealedPasswords[u.id] ? (sessionPasswords[u.id] || '********') : '********'}
                                                {sessionPasswords[u.id] && (
                                                    <button type="button" onClick={() => toggleReveal(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
                                                        {revealedPasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {u.id !== currentUser?.id && (
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    <button className="btn icon-btn" onClick={() => startEdit(u)} title="Change Role">
                                                        <Edit2 size={15}/>
                                                    </button>
                                                    <button className="btn icon-btn" onClick={() => setPasswordModalUser(u)} title="Change Password" style={{ color: '#0ea5e9' }}>
                                                        <Key size={15}/>
                                                    </button>
                                                    <button className="btn icon-btn" style={{ color: 'var(--alert-color)' }} onClick={() => handleDelete(u)} title="Delete User">
                                                        <Trash2 size={15}/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>Loading users...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {passwordModalUser && <ChangePasswordModal targetUser={passwordModalUser} onClose={() => setPasswordModalUser(null)} />}
        </div>
    );
}

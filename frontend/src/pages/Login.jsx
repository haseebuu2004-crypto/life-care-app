import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/firebase';

export function Login() {
    const { login, googleLogin, selectFinalRole, user } = useAuth();
    const nav = useNavigate();
    const [isGoogleFlow, setIsGoogleFlow] = useState(false);
    const [allowedRoles, setAllowedRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('admin');
    const [rolePassword, setRolePassword] = useState('');

    // If already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/" replace />;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(e.target.username.value, e.target.password.value);
            nav('/');
        } catch (error) {
            alert(error.message || 'Invalid credentials');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const firebaseUser = await signInWithGoogle();
            const idToken = await firebaseUser.getIdToken();
            const data = await googleLogin(idToken);
            setAllowedRoles(data.allowedRoles || ['admin', 'user']);
            setIsGoogleFlow(true);
        } catch (error) {
            console.error("Google login error:", error);
            alert(error.message || 'Google login failed');
        }
    };

    const handleRoleSelection = async (e) => {
        e.preventDefault();
        try {
            await selectFinalRole(selectedRole, rolePassword);
            nav('/');
        } catch (error) {
            alert(error.message || 'Role selection failed');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            {!isGoogleFlow ? (
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

                    <button type="submit" className="btn btn-primary w-full">
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="btn btn-outline w-full"
                        style={{ marginTop: 12 }}
                    >
                        Continue with Google
                    </button>
                </form>
            ) : (
                <form onSubmit={handleRoleSelection} className="card" style={{ width: 400 }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Select Your Role</h2>

                    <div className="form-group">
                        <label>Role</label>
                        <select 
                            value={selectedRole} 
                            onChange={(e) => setSelectedRole(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {allowedRoles.map(role => (
                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Role Password</label>
                        <input 
                            type="password" 
                            value={rolePassword}
                            onChange={(e) => setRolePassword(e.target.value)}
                            required 
                            placeholder={`Enter ${selectedRole} password`}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                        Complete Sign In
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setIsGoogleFlow(false)}
                        className="btn btn-outline w-full"
                        style={{ marginTop: 12 }}
                    >
                        Back to Login
                    </button>
                </form>
            )}
        </div>
    );
}

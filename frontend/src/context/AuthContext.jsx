"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import useStore from '../store/useStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const { data } = await api.get('/auth/session');
                if (data.success && data.user) {
                    setUser(data.user);
                    useStore.setState({ user: data.user });
                } else {
                    setUser(null);
                    useStore.setState({ user: null });
                }
            } catch (err) {
                setUser(null);
                useStore.setState({ user: null });
            } finally {
                setLoading(false);
            }
        };

        if (typeof window !== 'undefined') {
            verifySession();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            useStore.getState().resetStore();
            const { data } = await api.post('/auth/login', { email, password });
            
            // Note: Tokens are no longer stored in localStorage (HttpOnly cookies now)
            // But we keep user details for UI rendering
            // Update: We ARE using localStorage for Bearer tokens now to fix cross-domain third-party cookie blocking!
            if (data.session_token) {
                localStorage.setItem('session_token', data.session_token);
            }
            const loggedInUser = { id: data.user.id, email: data.user.email, username: data.user.username, role: data.user.role, force_password_change: data.user.force_password_change };
            setUser(loggedInUser);
            useStore.setState({ user: loggedInUser });
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            const err = new Error(msg);
            err.response = error.response;
            throw err;
        }
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        localStorage.removeItem('session_token');
        setUser(null);
        useStore.getState().resetStore();
        useStore.setState({ user: null });
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send reset link';
            throw new Error(msg);
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const { data } = await api.post('/auth/reset-password', { token, newPassword });
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reset password';
            throw new Error(msg);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, forgotPassword, resetPassword, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

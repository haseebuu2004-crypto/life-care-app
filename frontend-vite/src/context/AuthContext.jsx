import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import useStore from '../store/useStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

    const login = async (email, password) => {
        try {
            useStore.getState().resetStore();
            const { data } = await api.post('/auth/login', { email, password });
            if (!data?.success) throw new Error('Invalid response from server');
            const loggedInUser = { id: data.user.id, username: data.user.username || data.user.email, email: data.user.email, role: data.user.role, forcePasswordChange: data.user.forcePasswordChange };
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            throw new Error(msg);
        }
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        localStorage.removeItem('user');
        useStore.getState().resetStore();
        setUser(null);
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
        <AuthContext.Provider value={{ user, login, logout, forgotPassword, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

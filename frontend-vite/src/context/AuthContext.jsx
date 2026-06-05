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
            if (!data?.token) throw new Error('Invalid response from server');
            localStorage.setItem('token', data.token);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('sessionId', String(data.sessionId || ''));
            const loggedInUser = { id: data.user.id, username: data.user.username, email: data.user.email, role: data.role };
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            throw new Error(msg);
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const sessionId = localStorage.getItem('sessionId');
        try { await api.post('/auth/logout', { sessionId, refreshToken }); } catch (_) {}
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionId');
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

    return (
        <AuthContext.Provider value={{ user, login, logout, forgotPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

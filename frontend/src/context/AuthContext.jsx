import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import useStore from '../store/useStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

    const login = async (username, password) => {
        try {
            useStore.getState().resetStore();
            const { data } = await api.post('/auth/login', { username, password });
            if (!data?.token) throw new Error('Invalid response from server');
            localStorage.setItem('token', data.token);
            localStorage.setItem('sessionId', String(data.sessionId || ''));
            const loggedInUser = { username: data.username, email: data.email };
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            throw new Error(msg);
        }
    };

    const logout = async () => {
        const sessionId = localStorage.getItem('sessionId');
        try { await api.post('/auth/logout', { sessionId }); } catch (_) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionId');
        useStore.getState().resetStore();
        setUser(null);
    };

    const googleLogin = async (idToken) => {
        try {
            useStore.getState().resetStore();
            const { data } = await api.post('/auth/google', { idToken });
            if (!data?.token) throw new Error('Invalid response from server');
            localStorage.setItem('token', data.token);
            localStorage.setItem('sessionId', String(data.sessionId || ''));
            const loggedInUser = { username: data.username, email: data.email };
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Google Login failed';
            throw new Error(msg);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

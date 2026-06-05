"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import useStore from '../store/useStore';

const AuthContext = createContext();

const setStorage = (key, val) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, val);
};
const getStorage = (key) => {
    if (typeof window !== 'undefined') return localStorage.getItem(key);
    return null;
};
const removeStorage = (key) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = getStorage('user');
            if (saved) {
                try {
                    setUser(JSON.parse(saved));
                } catch (e) {
                    removeStorage('user');
                }
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            useStore.getState().resetStore();
            const { data } = await api.post('/auth/login', { email, password });
            
            // Note: Tokens are no longer stored in localStorage (HttpOnly cookies now)
            // But we keep user details for UI rendering
            const loggedInUser = { id: data.user.id, email: data.user.email, role: data.user.role, force_password_change: data.user.force_password_change };
            setStorage('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            const err = new Error(msg);
            err.response = error.response;
            throw err;
        }
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        removeStorage('user');
        setUser(null);
        useStore.getState().resetStore();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

"use client";
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    withCredentials: true // Still needed if we ever fallback to cookies
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('session_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(response => {
    if (typeof window !== 'undefined' && response.data?.session_token) {
        localStorage.setItem('session_token', response.data.session_token);
    }
    return response;
}, error => {
    if (typeof window !== 'undefined') {
        // If the server returns a 403 Force Password Change interceptor
        if (error.response && error.response.status === 403 && error.response.data?.forcePasswordChange) {
            // Only redirect if we are not already on the change password page
            if (window.location.pathname !== '/change-password') {
                window.location.href = '/change-password';
            }
        } else if (error.response && error.response.status === 401) {
            // Session invalid, redirect to login
            if (window.location.pathname !== '/login' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/reset-password')) {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    }
    
    return Promise.reject(error);
});

export default api;

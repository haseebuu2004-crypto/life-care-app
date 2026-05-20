import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // If it's a token error, force logout
        if (error.response.data?.message?.includes('token') || error.response.data?.message?.includes('Access denied')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionId');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;

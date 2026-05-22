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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(response => {
    return response;
}, async error => {
    const originalRequest = error.config;
    
    // Check if error is 401/403 and the request hasn't been retried yet
    if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
        // Exclude the refresh endpoint to prevent infinite loops
        if (originalRequest.url === '/auth/refresh') {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            isRefreshing = false;
            // No refresh token, force logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionId');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.post('/api/auth/refresh', { refreshToken });
            const newToken = data.token;
            localStorage.setItem('token', newToken);
            
            api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            
            processQueue(null, newToken);
            return api(originalRequest);
        } catch (err) {
            processQueue(err, null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionId');
            window.location.href = '/login';
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
    
    return Promise.reject(error);
});

export default api;

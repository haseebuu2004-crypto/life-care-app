import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const useStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    products: [],
    stock: [],
    sales: [],
    attendance: [],
    usage: [],
    isLoading: false,
    
    login: async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        const user = { username: data.username, role: data.role };
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null });
    },

    fetchData: async () => {
        set({ isLoading: true });
        try {
            const [p, s, sl, a, u] = await Promise.all([
                api.get('/products'),
                api.get('/stock'),
                api.get('/sales'),
                api.get('/attendance'),
                api.get('/usage')
            ]);
            set({ products: p.data, stock: s.data, sales: sl.data, attendance: a.data, usage: u.data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Stock Actions
    addStock: async (payload) => {
        await api.post('/stock', payload);
        get().fetchData();
    },
    increaseStock: async (id, qty_add) => {
        await api.put(`/stock/${id}/add`, { qty_add });
        get().fetchData();
    },
    deleteStock: async (id) => {
        await api.delete(`/stock/${id}`);
        get().fetchData();
    },

    // Attendance
    addAttendance: async (payload) => {
        await api.post('/attendance', payload);
        get().fetchData();
    },

    // Sales
    addSale: async (payload) => {
        await api.post('/sales', payload);
        get().fetchData();
    },
    
    // Usage
    updateUsage: async (id, payload) => {
        await api.put(`/usage/${id}`, payload);
        get().fetchData(); 
    }
}));

export default useStore;

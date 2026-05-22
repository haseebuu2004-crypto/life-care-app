import { create } from 'zustand';
import api from '../services/api';

// Helper to safely extract data from standardized API responses
const extract = (response) => {
    const d = response.data;
    // Handle both { success, data } format and plain array format (compatibility)
    if (d && typeof d === 'object' && 'success' in d) {
        return d.data ?? d;
    }
    return d;
};

const useStore = create((set, get) => ({
    products: [],
    stock: [],
    sales: [],
    user: JSON.parse(localStorage.getItem("user")) || null,
    attendance: [],
    users: [],
    dashboardStats: null,
    isLoading: false,
    toast: null,
    
    showToast: (msg, type = 'info') => {
        set({ toast: { msg, type } });
        setTimeout(() => set({ toast: null }), 3500);
    },
    hideToast: () => set({ toast: null }),

    resetStore: () => {
        set({
            products: [],
            stock: [],
            sales: [],
            attendance: [],
            users: [],
            dashboardStats: null,
            toast: null
        });
    },
    
    fetchData: async () => {
        set({ isLoading: true });
        try {
            const [p, s, sl, a, ds] = await Promise.all([
                api.get('/products'),
                api.get('/stock'),
                api.get('/sales'),
                api.get('/attendance'),
                api.get('/dashboard/stats')
            ]);
            set({
                products: extract(p) || [],
                stock: extract(s) || [],
                sales: extract(sl) || [],
                attendance: extract(a) || [],
                dashboardStats: extract(ds) || null,
            });
        } catch (error) {
            console.error('fetchData error:', error);
            get().showToast('Failed to load data. Please refresh.', 'error');
        } finally {
            set({ isLoading: false });
        }
    },



    // Stock Actions
    addStock: async (payload) => {
        try {
            const res = await api.post('/stock', payload);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add stock';
            throw new Error(msg);
        }
    },
    increaseStock: async (id, qty_add) => {
        try {
            const res = await api.put(`/stock/${id}/add`, { qty_add });
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update stock';
            throw new Error(msg);
        }
    },
    updateStockQuantity: async (id, quantity) => {
        try {
            const res = await api.patch(`/stock/${id}`, { quantity });
            // Update local state without full refresh for smooth UI
            set((state) => ({
                stock: state.stock.map(s => s.id === id ? { ...s, qty: quantity } : s)
            }));
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update stock';
            throw new Error(msg);
        }
    },
    deleteStock: async (id) => {
        try {
            const res = await api.delete(`/stock/${id}`);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete stock';
            throw new Error(msg);
        }
    },
    deleteProduct: async (id) => {
        try {
            const res = await api.delete(`/products/${id}`);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete product';
            throw new Error(msg);
        }
    },

    // Attendance
    addAttendance: async (payload) => {
        try {
            const res = await api.post('/attendance', payload);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to log attendance';
            throw new Error(msg);
        }
    },
    deleteAttendance: async (id) => {
        try {
            const res = await api.delete(`/attendance/${id}`);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete attendance';
            throw new Error(msg);
        }
    },

    // Sales
    addSale: async (payload) => {
        try {
            const res = await api.post('/sales', payload);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add sale';
            throw new Error(msg);
        }
    },
    deleteSale: async (id) => {
        try {
            const res = await api.delete(`/sales/${id}`);
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete sale';
            throw new Error(msg);
        }
    },
    
    // User Management
    fetchUsers: async () => {
        try {
            const res = await api.get('/users');
            const users = extract(res) || [];
            set({ users });
        } catch (error) {
            console.error('fetchUsers error:', error);
        }
    },
    addUser: async (payload) => {
        try {
            const res = await api.post('/users', payload);
            await get().fetchUsers();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add user';
            throw new Error(msg);
        }
    },
    updateUserRole: async (id, role) => {
        try {
            const res = await api.put(`/users/${id}/role`, { role });
            await get().fetchUsers();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update role';
            throw new Error(msg);
        }
    },
    deleteUser: async (id) => {
        try {
            const res = await api.delete(`/users/${id}`);
            await get().fetchUsers();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete user';
            throw new Error(msg);
        }
    },

    // Login History
    fetchLoginHistory: async () => {
        try {
            const res = await api.get('/login-history');
            return extract(res) || [];
        } catch (error) {
            console.error('fetchLoginHistory error:', error);
            return [];
        }
    },

    // System Actions (Admin)
    clearAttendanceData: async (month) => {
        try {
            const res = await api.delete('/data-management/attendance', { data: { month } });
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to clear attendance data';
            throw new Error(msg);
        }
    },
    clearSalesData: async (month) => {
        try {
            const res = await api.delete('/data-management/sales', { data: { month } });
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to clear sales data';
            throw new Error(msg);
        }
    },
    resetData: async (password) => {
        try {
            const res = await api.delete('/system/reset', { data: { password } });
            await get().fetchData();
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to reset data';
            throw new Error(msg);
        }
    },
    exportReport: async (type) => {
        try {
            const res = await api.get(`/reports/export?type=${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export error:", error);
            const msg = 'Failed to export report';
            throw new Error(msg);
        }
    },
}));

export default useStore;

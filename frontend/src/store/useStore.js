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

// Helper to safely extract error messages from standardized API error responses
const getErrorMsg = (error, defaultMsg) => {
    const data = error.response?.data;
    if (!data) return defaultMsg;
    if (data.message) return data.message;
    if (data.error) {
        if (typeof data.error === 'string') return data.error;
        if (data.error.message) return data.error.message;
    }
    return defaultMsg;
};

const useStore = create((set, get) => ({
    inventoryEntities: [],
    products: [],
    stock: [],
    sales: [],
    user: null,
    attendance: [],
    users: [],
    customers: [],
    deletedRecords: [],
    dashboardStats: null,
    clubName: null,
    unreadCount: 0,
    isLoading: false,
    toast: null,
    
    showToast: (msg, type = 'info') => {
        set({ toast: { msg, type } });
        setTimeout(() => set({ toast: null }), 3500);
    },
    hideToast: () => set({ toast: null }),

    resetStore: () => {
        set({
            inventoryEntities: [],
            products: [],
            stock: [],
            sales: [],
            attendance: [],
            users: [],
            customers: [],
            deletedRecords: [],
            dashboardStats: null,
            clubName: null,
            toast: null
        });
    },
    
    fetchProducts: async () => {
        try {
            const p = await api.get('/products');
            set({ products: extract(p) || [] });
        } catch (error) { console.error(error); }
    },
    fetchProducts: async () => {
        try {
            const p = await api.get('/products');
            set({ products: extract(p) || [] });
        } catch (error) { console.error(error); }
    },
    fetchInventoryEntities: async () => {
        try {
            const res = await api.get('/inventory/entities');
            set({ inventoryEntities: extract(res) || [] });
        } catch (error) { console.error(error); }
    },
    updateInventoryEntity: async (variantId, payload) => {
        try {
            const res = await api.put(`/inventory/entities/${variantId}`, payload);
            await get().fetchInventoryEntities();
            await get().fetchDashboardStats();
            return extract(res);
        } catch (error) {
            throw new Error(getErrorMsg(error, 'Failed to update entity'));
        }
    },
    fetchStock: async () => {
        try {
            const s = await api.get('/stock');
            set({ stock: extract(s) || [] });
        } catch (error) { console.error(error); }
    },
    fetchSales: async () => {
        try {
            const sl = await api.get('/sales');
            set({ sales: extract(sl) || [] });
        } catch (error) { console.error(error); }
    },
    fetchAttendance: async () => {
        try {
            const a = await api.get('/attendance');
            set({ attendance: extract(a) || [] });
        } catch (error) { console.error(error); }
    },
    fetchCustomers: async () => {
        try {
            const c = await api.get('/customers');
            set({ customers: extract(c) || [] });
        } catch (error) { console.error(error); }
    },
    fetchDashboardStats: async (start = '', end = '') => {
        try {
            const params = new URLSearchParams();
            if (start) params.append('startDate', start);
            if (end) params.append('endDate', end);
            params.append('t', Date.now()); // Cache buster
            const query = params.toString() ? `?${params.toString()}` : '';
            const ds = await api.get(`/dashboard/stats${query}`);
            set({ dashboardStats: extract(ds) || null });
        } catch (error) { console.error(error); }
    },
    fetchClubName: async () => {
        try {
            const user = get().user;
            if (!user || user.role === 'master') return;
            const endpoint = user.role === 'admin' ? '/admin/club-name' : '/user/club-name';
            const res = await api.get(endpoint);
            if (res.data && res.data.success) {
                set({ clubName: res.data.club_name });
                if (typeof window !== 'undefined' && res.data.club_name) {
                    localStorage.setItem('savedClubName', res.data.club_name);
                }
            }
        } catch (error) { console.error(error); }
    },
    updateClubName: async (name) => {
        try {
            const res = await api.put('/admin/club-name', { club_name: name });
            if (res.data && res.data.success) {
                set({ clubName: res.data.club_name });
                if (typeof window !== 'undefined' && res.data.club_name) {
                    localStorage.setItem('savedClubName', res.data.club_name);
                }
                return res.data;
            }
        } catch (error) {
            throw new Error(getErrorMsg(error, 'Failed to update club name'));
        }
    },
    fetchDeletedRecords: async () => {
        try {
            const res = await api.get('/data-management/deleted');
            set({ deletedRecords: extract(res) || [] });
        } catch (error) { console.error(error); }
    },
    restoreDeletedRecord: async (type, id) => {
        try {
            const res = await api.post(`/data-management/deleted/${type}/${id}/restore`);
            return res.data;
        } catch (error) {
            throw new Error(getErrorMsg(error, 'Failed to restore record'));
        }
    },
    fetchUnreadCount: async () => {
        try {
            const countRes = await api.get('/notifications/unread-count');
            set({ unreadCount: countRes.data.count || 0 });
        } catch (error) { console.error(error); }
    },

    fetchData: async () => {
        set({ isLoading: true });
        try {
            await get().fetchProducts();
            await get().fetchStock();
            await get().fetchInventoryEntities();
            await get().fetchSales();
            await get().fetchAttendance();
            await get().fetchCustomers();
            await get().fetchDashboardStats();
            await get().fetchUnreadCount();
        } catch (error) {
            console.error('fetchData error:', error);
            get().showToast('Failed to load data. Please refresh.', 'error');
        } finally {
            set({ isLoading: false });
        }
    },

    // Product Actions
    addProduct: async (payload) => {
        try {
            const res = await api.post('/products', payload);
            Promise.all([get().fetchProducts()]).catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add product';
            throw new Error(msg);
        }
    },
    toggleProduct: async (id, isActive) => {
        try {
            const res = await api.put(`/products/${id}/toggle`, { isActive });
            Promise.all([get().fetchProducts(), get().fetchStock(), get().fetchDashboardStats()]).catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to toggle product status';
            throw new Error(msg);
        }
    },

    // Stock Actions
    addStock: async (payload) => {
        try {
            const res = await api.post('/stock', payload);
            Promise.all([get().fetchStock(), get().fetchProducts(), get().fetchDashboardStats()]).catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add stock';
            throw new Error(msg);
        }
    },
    increaseStock: async (id, qty_add) => {
        try {
            const res = await api.put(`/stock/${id}/add`, { qty_add });
            Promise.all([get().fetchStock(), get().fetchDashboardStats()]).catch(console.error);
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
                inventoryEntities: state.inventoryEntities.map(s => s.inventoryId === id ? { ...s, stock: quantity } : s)
            }));
            get().fetchDashboardStats().catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update stock';
            throw new Error(msg);
        }
    },
    updateStockPrice: async (product_id, vp, sp) => {
        try {
            const res = await api.put(`/products/${product_id}/price`, { vendor_price: vp, selling_price: sp });
            // Update local state without full refresh for smooth UI
            set((state) => ({
                stock: state.stock.map(s => s.product_id === product_id ? { ...s, sp: sp, vp: vp } : s)
            }));
            get().fetchDashboardStats().catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update price';
            throw new Error(msg);
        }
    },
    deleteStock: async (id) => {
        try {
            const res = await api.delete(`/stock/${id}`);
            get().fetchInventoryEntities().catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete stock';
            throw new Error(msg);
        }
    },
    deleteProduct: async (id) => {
        try {
            const res = await api.delete(`/products/${id}`);
            Promise.all([get().fetchProducts(), get().fetchStock(), get().fetchDashboardStats()]).catch(console.error);
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
            Promise.all([get().fetchAttendance(), get().fetchDashboardStats()]).catch(console.error);
            return extract(res);
        } catch (error) {
            throw new Error(getErrorMsg(error, 'Failed to log attendance'));
        }
    },
    deleteAttendance: async (id) => {
        try {
            const res = await api.delete(`/attendance/${id}`);
            Promise.all([get().fetchAttendance(), get().fetchDashboardStats()]).catch(console.error);
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
            Promise.all([get().fetchSales(), get().fetchStock(), get().fetchDashboardStats()]).catch(console.error);
            return extract(res);
        } catch (error) {
            throw new Error(getErrorMsg(error, 'Failed to add sale'));
        }
    },
    deleteSale: async (id) => {
        try {
            const res = await api.delete(`/sales/${id}`);
            Promise.all([get().fetchSales(), get().fetchStock(), get().fetchDashboardStats()]).catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete sale';
            throw new Error(msg);
        }
    },
    deleteSaleItem: async (itemId) => {
        try {
            const res = await api.delete(`/sales/item/${itemId}`);
            Promise.all([get().fetchSales(), get().fetchStock(), get().fetchDashboardStats()]).catch(console.error);
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete sale item';
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
            return res.data;
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
    adminUpdateUserPassword: async (id, newPassword) => {
        try {
            const res = await api.post(`/users/${id}/reset-password`, { newPassword });
            return extract(res);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update user password';
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
            throw new Error(getErrorMsg(error, 'Failed to clear sales data'));
        }
    },
    updateAdminConfig: async (config) => {
        try {
            const res = await api.put('/settings/config', config);
            await get().fetchDashboardStats();
            return extract(res);
        } catch (error) {
            throw new Error(getErrorMsg(error, 'Failed to update system configuration'));
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
    exportReport: async (type, range = 'all') => {
        try {
            const res = await api.get(`/reports/export?type=${type}&range=${range}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${range}_${new Date().toISOString().split('T')[0]}.pdf`);
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

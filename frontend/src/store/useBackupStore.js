"use client";
import { create } from 'zustand';
import api from '../services/api';
import useStore from './useStore';

const useBackupStore = create((set, get) => ({
    backupLogs: [],
    loading: false,
    generating: false,
    restoring: false,
    
    fetchBackupLogs: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/backup/logs');
            set({ backupLogs: res.data.data });
        } catch (error) {
            useStore.getState().showToast('Failed to fetch backup logs', 'error');
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    generateBackup: async (type, format, uploadToCloud = false) => {
        set({ generating: true });
        try {
            if (uploadToCloud) {
                const res = await api.post('/backup/generate', { type, format, uploadToCloud });
                useStore.getState().showToast(res.data.data.message, 'success');
                get().fetchBackupLogs();
            } else {
                const res = await api.post('/backup/generate', { type, format, uploadToCloud }, { responseType: 'blob' });
                
                // Create download link
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                
                // Extract filename from header or fallback
                const disposition = res.headers['content-disposition'];
                let fileName = `backup_${type}.${format}`;
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) { 
                        fileName = matches[1].replace(/['"]/g, '');
                    }
                }
                
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                
                useStore.getState().showToast('Backup downloaded successfully', 'success');
                get().fetchBackupLogs();
            }
        } catch (error) {
            useStore.getState().showToast('Backup generation failed', 'error');
            console.error(error);
        } finally {
            set({ generating: false });
        }
    },

    validateRestore: async (file) => {
        const formData = new FormData();
        formData.append('backupFile', file);
        
        try {
            const res = await api.post('/backup/restore/validate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data; // { type, message, isValid }
        } catch (error) {
            useStore.getState().showToast(error.response?.data?.message || 'Validation failed', 'error');
            throw error;
        }
    },

    confirmRestore: async (file, strategy) => {
        set({ restoring: true });
        const formData = new FormData();
        formData.append('backupFile', file);
        formData.append('strategy', strategy);

        try {
            const res = await api.post('/backup/restore/confirm', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            useStore.getState().showToast(res.data.data.message, 'success');
            get().fetchBackupLogs();
            return true;
        } catch (error) {
            useStore.getState().showToast(error.response?.data?.message || 'Restore failed', 'error');
            return false;
        } finally {
            set({ restoring: false });
        }
    }
}));

export default useBackupStore;

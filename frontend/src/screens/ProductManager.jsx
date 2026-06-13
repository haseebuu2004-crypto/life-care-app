"use client";
import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Plus, Package, X, ToggleLeft, ToggleRight, Edit2, Save } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';
import EmptyState from '../components/EmptyState';
import { formatRupees } from '../utils/currency';

function AddProductModal({ onClose }) {
    const { addProduct } = useStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        hasFlavour: false,
        flavor: '',
        vp: '',
        volume_points: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addProduct({
                name: form.name,
                flavor: form.hasFlavour ? form.flavor : '',
                vp: parseFloat(form.vp) || 0,
                volume_points: parseFloat(form.volume_points) || 0
            });
            useStore.getState().showToast("Product added successfully", "success");
            // Also refresh inventory entities
            useStore.getState().fetchInventoryEntities();
            onClose();
        } catch (err) {
            useStore.getState().showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <span>Add New Product</span>
                    <button onClick={onClose} className="btn icon-btn"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input 
                            value={form.name} 
                            onChange={e=>setForm({...form, name: e.target.value})} 
                            required 
                            placeholder="e.g. Formula 1"
                        />
                    </div>
                    
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input 
                            type="checkbox" 
                            id="hasFlavour"
                            checked={form.hasFlavour}
                            onChange={(e) => setForm({...form, hasFlavour: e.target.checked})}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="hasFlavour" style={{ margin: 0, cursor: 'pointer' }}>Add Flavours? (comma-separated)</label>
                    </div>

                    {form.hasFlavour && (
                        <div className="form-group">
                            <label>Flavours</label>
                            <input 
                                value={form.flavor} 
                                onChange={e=>setForm({...form, flavor: e.target.value})} 
                                required={form.hasFlavour} 
                                placeholder="e.g. Mango, Chocolate, Banana"
                            />
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <div className="form-group">
                            <label>Vendor Price (Rs.)</label>
                            <input 
                                type="number" min="0" step="0.01"
                                value={form.vp} 
                                onChange={e=>setForm({...form, vp: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>V.P (Volume Points)</label>
                            <input 
                                type="number" min="0" step="0.01"
                                value={form.volume_points} 
                                onChange={e=>setForm({...form, volume_points: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex justify-between" style={{ marginTop: 20 }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditableRow({ item, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        sku: item.sku || '',
        lowStockThreshold: item.lowStockThreshold || 5,
        alertEnabled: item.alertEnabled
    });

    const handleSave = async () => {
        try {
            await onUpdate(item.inventoryId, {
                sku: editData.sku,
                low_stock_threshold: editData.lowStockThreshold,
                alert_enabled: editData.alertEnabled
            });
            setIsEditing(false);
        } catch (err) {
            useStore.getState().showToast(err.message, "error");
        }
    };

    const handleToggle = async () => {
        try {
            await onUpdate(item.inventoryId, {
                is_active: !item.isActive
            });
        } catch (err) {
            useStore.getState().showToast(err.message, "error");
        }
    };

    return (
        <tr style={{ borderBottom: '1px solid #f1f5f9', opacity: item.isActive ? 1 : 0.6 }}>
            <td style={{ padding: '12px 16px' }}><strong>{item.displayName}</strong></td>
            <td style={{ padding: '12px 16px' }}>
                {isEditing ? (
                    <input 
                        value={editData.sku} 
                        onChange={e => setEditData({...editData, sku: e.target.value})} 
                        style={{ width: '100px', padding: '4px 8px' }}
                    />
                ) : (
                    item.sku || 'N/A'
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>{formatRupees(item.vendorPrice * 100)}</td>
            <td style={{ padding: '12px 16px' }}>{item.vp}</td>
            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <input 
                            type="number" 
                            value={editData.lowStockThreshold} 
                            onChange={e => setEditData({...editData, lowStockThreshold: parseInt(e.target.value)})}
                            style={{ width: '60px', padding: '4px' }}
                        />
                        <input 
                            type="checkbox"
                            checked={editData.alertEnabled}
                            onChange={e => setEditData({...editData, alertEnabled: e.target.checked})}
                            title="Enable Low Stock Alerts"
                        />
                    </div>
                ) : (
                    <span style={{ color: item.alertEnabled ? 'inherit' : '#94a3b8' }}>
                        {item.lowStockThreshold} {item.alertEnabled ? '🔔' : '🔕'}
                    </span>
                )}
            </td>
            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <span style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                    background: item.isActive ? '#dcfce7' : '#f1f5f9',
                    color: item.isActive ? '#166534' : '#64748b'
                }}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {isEditing ? (
                        <button className="btn icon-btn" onClick={handleSave} title="Save changes"><Save size={20} color="#0ea5e9" /></button>
                    ) : (
                        <button className="btn icon-btn" onClick={() => setIsEditing(true)} title="Edit SKU and Thresholds"><Edit2 size={20} color="#64748b" /></button>
                    )}
                    <button 
                        className="btn icon-btn" 
                        onClick={handleToggle}
                        title={item.isActive ? "Deactivate Entity" : "Activate Entity"}
                    >
                        {item.isActive ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#94a3b8" />}
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function ProductManager() {
    const { inventoryEntities, fetchInventoryEntities, updateInventoryEntity } = useStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const perm = usePermissions();
    const isAdmin = perm.isAdmin; 

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        fetchInventoryEntities();
    }, [fetchInventoryEntities]);

    const filteredEntities = useMemo(() => {
        let result = inventoryEntities || [];
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(e => 
                e.displayName.toLowerCase().includes(q) || 
                (e.sku || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [inventoryEntities, debouncedSearch]);

    if (!isAdmin) {
        return <div style={{ padding: 40, textAlign: 'center' }}>You do not have permission to manage products.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                <h2 style={{ margin: 0 }}>Inventory Entity Manager</h2>
                <div className="flex gap-4" style={{ flex: 1, justifyContent: 'flex-end', minWidth: 300 }}>
                    <input 
                        placeholder="Search entities (Name, SKU)..." 
                        value={search} onChange={e => setSearch(e.target.value)} 
                        style={{ maxWidth: 300, flex: 1 }} 
                    />
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Entity Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>SKU</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Vendor Price</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>V.P</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Threshold</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntities.map(item => (
                            <EditableRow 
                                key={item.inventoryId} 
                                item={item} 
                                onUpdate={updateInventoryEntity}
                            />
                        ))}
                    </tbody>
                </table>
                
                {filteredEntities.length === 0 && (
                    <EmptyState 
                        icon={<Package size={48} />}
                        title="No Entities Found" 
                        message={search ? "We couldn't find any entities matching your search." : "No inventory entities have been added yet."}
                    />
                )}
            </div>

            {showModal && <AddProductModal onClose={() => setShowModal(false)} />}
        </div>
    );
}

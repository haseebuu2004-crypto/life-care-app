"use client";
import { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { Plus, Package, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
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
                    <span>Add New Product Variant</span>
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
                        <label htmlFor="hasFlavour" style={{ margin: 0, cursor: 'pointer' }}>Has Flavours?</label>
                    </div>

                    {form.hasFlavour && (
                        <div className="form-group">
                            <label>Flavour</label>
                            <input 
                                value={form.flavor} 
                                onChange={e=>setForm({...form, flavor: e.target.value})} 
                                required={form.hasFlavour} 
                                placeholder="e.g. Vanilla"
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

export function ProductManager() {
    const { products, toggleProduct, deleteProduct } = useStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const perm = usePermissions();
    const isAdmin = perm.isAdmin; // Only admins should manage products

    const debouncedSearch = useDebounce(search, 300);

    const filteredProducts = useMemo(() => {
        let result = products || [];
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(q) || 
                (p.flavor || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [products, debouncedSearch]);

    if (!isAdmin) {
        return <div style={{ padding: 40, textAlign: 'center' }}>You do not have permission to manage products.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                <h2 style={{ margin: 0 }}>Product Manager</h2>
                <div className="flex gap-4" style={{ flex: 1, justifyContent: 'flex-end', minWidth: 300 }}>
                    <input 
                        placeholder="Search products..." 
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
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Flavour</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>VENDOR PRICE</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>V.P</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Toggle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: item.is_active ? 1 : 0.6 }}>
                                <td style={{ padding: '12px 16px' }}><strong>{item.name}</strong></td>
                                <td style={{ padding: '12px 16px' }}>{item.flavours && item.flavours.length > 0 ? item.flavours.map(f => f.name).join(', ') : 'Base'}</td>
                                <td style={{ padding: '12px 16px' }}>{formatRupees(item.vendor_price * 100)}</td>
                                <td style={{ padding: '12px 16px' }}>{item.vp}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                                        background: item.is_active ? '#dcfce7' : '#f1f5f9',
                                        color: item.is_active ? '#166534' : '#64748b'
                                    }}>
                                        {item.is_active ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <button 
                                        className="btn icon-btn" 
                                        onClick={() => toggleProduct(item.id, item.is_active ? 0 : 1)}
                                        title={item.is_active ? "Disable Product" : "Enable Product"}
                                    >
                                        {item.is_active ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#94a3b8" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredProducts.length === 0 && (
                    <EmptyState 
                        icon={<Package size={48} />}
                        title="No Products Configured" 
                        message={search ? "We couldn't find any products matching your search." : "No products have been added yet."}
                    />
                )}
            </div>

            {showModal && <AddProductModal onClose={() => setShowModal(false)} />}
        </div>
    );
}

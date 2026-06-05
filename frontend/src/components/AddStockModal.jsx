"use client";
import { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { X, Package } from 'lucide-react';
import { formatRupees } from '../utils/currency';

export function AddStockModal({ onClose }) {
    const { addStock, products } = useStore();
    
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [qty, setQty] = useState('');
    const [loading, setLoading] = useState(false);

    // Only show products that are active (enabled)
    const activeProducts = useMemo(() => {
        return (products || []).filter(p => p.is_active === true);
    }, [products]);

    const selectedProduct = useMemo(() => {
        if (!selectedVariantId) return null;
        return activeProducts.find(p => p.version_id === selectedVariantId);
    }, [selectedVariantId, activeProducts]);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedVariantId) {
            useStore.getState().showToast("Please select a product", "error");
            return;
        }

        const quantity = parseInt(qty) || 0;
        if (quantity <= 0) {
            useStore.getState().showToast("Quantity must be greater than 0", "error");
            return;
        }

        try {
            setLoading(true);
            await addStock({
                variantId: selectedVariantId,
                quantity: quantity
            });
            useStore.getState().showToast("Stock added successfully", "success");
            onClose();
        } catch (err) {
            const errorMsg = err.message || "Failed to add stock.";
            useStore.getState().showToast(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <span>Add Stock Inventory</span>
                    <button type="button" onClick={onClose} className="btn icon-btn"><X size={20}/></button>
                </div>

                {activeProducts.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
                        <Package size={48} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                        <p>No active products found.</p>
                        <p style={{ fontSize: 13, marginTop: 10 }}>Please define and enable products in the <strong>Product Mgr</strong> first.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Select Product</label>
                            <select 
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="" disabled>-- Select a product --</option>
                                {activeProducts.map(p => {
                                    const firstFlavour = p.flavours && p.flavours.length > 0 ? p.flavours[0].name : 'Base';
                                    return (
                                        <option key={p.version_id} value={p.version_id}>
                                            {p.name} {firstFlavour !== 'Base' ? `(${firstFlavour})` : ''} - {formatRupees(p.vendor_price * 100)} ({p.vp} VP)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {selectedProduct && (
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Vendor Price</span>
                                    <strong>{formatRupees(selectedProduct.vendor_price * 100)}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Unit V.P</span>
                                    <strong>{selectedProduct.vp}</strong>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Quantity to Add</label>
                            <input 
                                type="number" min="1"
                                value={qty} 
                                onChange={e=>setQty(e.target.value)} 
                                required 
                                placeholder="Enter quantity"
                            />
                        </div>

                        {selectedProduct && qty > 0 && (
                            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ color: '#1e3a8a', fontWeight: 500 }}>Total Value:</span>
                                    <strong style={{ color: '#1e3a8a', fontSize: '18px' }}>{formatRupees(selectedProduct.vendor_price * qty * 100)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#1e3a8a', fontWeight: 500 }}>Total V.P:</span>
                                    <strong style={{ color: '#1e3a8a' }}>{(selectedProduct.vp * qty).toFixed(2)}</strong>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between" style={{ marginTop: 20 }}>
                            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading || !selectedVariantId || qty <= 0}>
                                {loading ? 'Saving...' : 'Add Stock'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

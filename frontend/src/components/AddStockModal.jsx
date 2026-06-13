"use client";
import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { X, Package } from 'lucide-react';
import { formatRupees } from '../utils/currency';

export function AddStockModal({ onClose }) {
    const { addStock, inventoryEntities, fetchInventoryEntities } = useStore();
    
    const [selectedInventoryId, setSelectedInventoryId] = useState('');
    const [qty, setQty] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!inventoryEntities || inventoryEntities.length === 0) {
            fetchInventoryEntities();
        }
    }, [inventoryEntities, fetchInventoryEntities]);

    // Only show entities that are active
    const activeEntities = useMemo(() => {
        return (inventoryEntities || []).filter(e => e.isActive === true);
    }, [inventoryEntities]);

    const selectedEntity = useMemo(() => {
        if (!selectedInventoryId) return null;
        return activeEntities.find(e => e.inventoryId === selectedInventoryId);
    }, [selectedInventoryId, activeEntities]);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedInventoryId) {
            useStore.getState().showToast("Please select an inventory entity", "error");
            return;
        }

        const quantity = parseInt(qty) || 0;
        if (quantity <= 0) {
            useStore.getState().showToast("Quantity must be greater than 0", "error");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                inventoryId: selectedInventoryId,
                quantity: quantity
            };
            console.log("---- DEBUG SUBMIT ----");
            console.log("selectedEntity:", selectedEntity);
            console.log("payload to send:", payload);
            console.log("----------------------");
            
            await addStock(payload);
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

                {activeEntities.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
                        <Package size={48} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                        <p>No active inventory entities found.</p>
                        <p style={{ fontSize: 13, marginTop: 10 }}>Please define and enable products in the <strong>Product Mgr</strong> first.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Select Inventory Entity</label>
                            <select 
                                value={selectedInventoryId}
                                onChange={(e) => setSelectedInventoryId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="" disabled>-- Select an entity --</option>
                                {activeEntities.map(e => (
                                    <option key={e.inventoryId} value={e.inventoryId}>
                                        {e.displayName} - {formatRupees(e.vendorPrice * 100)} ({e.vp} VP)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedEntity && (
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Vendor Price</span>
                                    <strong>{formatRupees(selectedEntity.vendorPrice * 100)}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Unit V.P</span>
                                    <strong>{selectedEntity.vp}</strong>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Quantity to Add</label>
                            <input 
                                type="number" 
                                min="1"
                                step="1"
                                value={qty} 
                                onKeyDown={(e) => {
                                    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setQty(isNaN(val) ? '' : val);
                                }}
                                required 
                                placeholder="Enter quantity"
                            />
                        </div>

                        {selectedEntity && qty > 0 && (
                            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ color: '#1e3a8a', fontWeight: 500 }}>Total Value:</span>
                                    <strong style={{ color: '#1e3a8a', fontSize: '18px' }}>{formatRupees(selectedEntity.vendorPrice * qty * 100)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#1e3a8a', fontWeight: 500 }}>Total V.P:</span>
                                    <strong style={{ color: '#1e3a8a' }}>{(selectedEntity.vp * qty).toFixed(2)}</strong>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between" style={{ marginTop: 20 }}>
                            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading || !selectedInventoryId || qty <= 0}>
                                {loading ? 'Saving...' : 'Add Stock'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import useStore from '../store/useStore';
import { X } from 'lucide-react';

export function AddStockModal({ onClose }) {
    const { addStock } = useStore();
    
    const [form, setForm] = useState({
        product_name: '',
        flavor: '',
        vp: '',
        sp: '',
        qty: ''
    });
    
    const [hasFlavour, setHasFlavour] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        const normName = form.product_name.trim().toLowerCase();
        const finalFlavor = (hasFlavour && form.flavor.trim() !== '') ? form.flavor.trim().toLowerCase() : 'base';
        
        // Frontend duplicate validation
        const existingItems = useStore.getState().stock || [];
        const isDuplicate = existingItems.some(item => {
            const itemName = item.product_name.trim().toLowerCase();
            const itemFlavor = (item.flavor || 'base').trim().toLowerCase();
            return itemName === normName && itemFlavor === finalFlavor;
        });

        if (isDuplicate) {
            const displayFlavor = hasFlavour ? form.flavor.trim() : 'Base';
            useStore.getState().showToast(
                hasFlavour 
                    ? `Product "${form.product_name.trim()}" with flavour "${displayFlavor}" already exists.`
                    : `Product "${form.product_name.trim()}" already exists.`,
                "error"
            );
            return;
        }

        try {
            setLoading(true);
            await addStock({
                productName: form.product_name,
                hasFlavours: hasFlavour,
                flavour: hasFlavour ? form.flavor : '',
                volumePoint: parseFloat(form.vp) || 0,
                price: parseFloat(form.sp) || 0,
                quantity: parseInt(form.qty) || 0
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
                    <span>Add New Stock</span>
                    <button onClick={onClose} className="btn icon-btn"><X size={20}/></button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input 
                            value={form.product_name} 
                            onChange={e=>setForm({...form, product_name: e.target.value})} 
                            required 
                            placeholder="e.g. Formula 1"
                        />
                    </div>
                    
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input 
                            type="checkbox" 
                            id="hasFlavour"
                            checked={hasFlavour}
                            onChange={(e) => setHasFlavour(e.target.checked)}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="hasFlavour" style={{ margin: 0, cursor: 'pointer' }}>Has Flavours?</label>
                    </div>

                    {hasFlavour && (
                        <div className="form-group">
                            <label>Flavour</label>
                            <input 
                                value={form.flavor} 
                                onChange={e=>setForm({...form, flavor: e.target.value})} 
                                required={hasFlavour} 
                                placeholder="e.g. Mango"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Volume Points (V.P)</label>
                        <input 
                            type="number" step="0.01" min="0"
                            value={form.vp} 
                            onChange={e=>setForm({...form, vp: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Our Price (₹)</label>
                        <input 
                            type="number" min="0" step="0.01"
                            value={form.sp} 
                            onChange={e=>setForm({...form, sp: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Initial Quantity</label>
                        <input 
                            type="number" min="0"
                            value={form.qty} 
                            onChange={e=>setForm({...form, qty: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="flex justify-between" style={{ marginTop: 20 }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

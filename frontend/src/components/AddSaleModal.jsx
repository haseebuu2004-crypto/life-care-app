"use client";
import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2, X } from 'lucide-react';
import { formatRupees } from '../utils/currency';

export function AddSaleModal({ onClose }) {
    const { stock, customers, fetchCustomers, addSale } = useStore();
    
    const [customerInput, setCustomerInput] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([{ stock_id: '', flavour_id: '', qty: 1, sellingPrice: '' }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const activeCustomers = useMemo(() => {
        return customers.filter(c => c.is_active);
    }, [customers]);

    const stockOptions = useMemo(() => {
        const products = [];
        stock.forEach(s => {
            let p = products.find(p => p.name === s.product_name);
            if (!p) {
                p = { name: s.product_name, variants: [] };
                products.push(p);
            }
            p.variants.push(s);
        });
        return products;
    }, [stock]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        if (field === 'productName') {
            const product = stockOptions.find(p => p.name === value);
            if (product && product.variants.length > 0) {
                newItems[index].stock_id = product.variants[0].id;
                newItems[index].sellingPrice = '';
            } else {
                newItems[index].stock_id = '';
                newItems[index].sellingPrice = '';
            }
        }
        
        if (field === 'stock_id') {
            const s = stock.find(st => st.id === value);
            if (s) newItems[index].sellingPrice = '';
        }
        
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { stock_id: '', flavour_id: '', qty: 1, sellingPrice: '' }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const calculations = useMemo(() => {
        let total = 0;
        let profit = 0;
        items.forEach(item => {
            const stockId = item.stock_id; // UUID
            const s = stock.find(st => st.id === stockId);
            if (s && item.stock_id) {
                const costPrice = s.vendor_price || 0;
                const sellingPrice = parseFloat(item.sellingPrice) || 0;
                const qty = parseInt(item.qty) || 0;
                total += sellingPrice * qty;
                profit += (sellingPrice - costPrice) * qty;
            }
        });
        return { total, profit };
    }, [items, stock]);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (!customerInput.trim()) return useStore.getState().showToast("Please select or enter a customer", "warn");
        
        const validItems = items.filter(i => i.stock_id && i.qty > 0 && i.sellingPrice !== '');
        if (validItems.length === 0) return useStore.getState().showToast("At least 1 valid product required", "warn");

        const hasZeroPrice = validItems.some(i => parseFloat(i.sellingPrice) === 0);
        if (hasZeroPrice) {
            const confirmZero = window.confirm("You are charging Rs.0 for this item. Is this intentional?");
            if (!confirmZero) return;
        }

        try {
            setLoading(true);
            const itemsPayload = validItems.map(i => {
                const s = stock.find(st => st.id === i.stock_id);
                return {
                    product_version_id: s.version_id,
                    flavour_id: s.flavour_id || null,
                    quantity: parseInt(i.qty) || 1,
                    price_charged: Math.round(i.sellingPrice * 100),
                    standard_price_snap: 0,
                    vendor_price_snap: Math.round((s?.vendor_price || 0) * 100)
                };
            });

            const existing = activeCustomers.find(c => c.name.toLowerCase() === customerInput.trim().toLowerCase());
            const payload = {
                sale_date: date,
                items: itemsPayload
            };
            if (existing) {
                payload.customer_id = existing.id;
            } else {
                payload.customer_name = customerInput.trim();
            }

            await addSale(payload);
            useStore.getState().showToast("Sale completed successfully", "success");
            onClose();
        } catch (err) {
            let msg = err.message || "Failed to complete sale.";
            useStore.getState().showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 800 }}>
                <div className="modal-header">
                    <span>Add New Sale</span>
                    <button onClick={onClose} className="btn icon-btn"><X size={20}/></button>
                </div>
                <form onSubmit={onSubmit}>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Customer Name</label>
                            <input 
                                list="customer-list"
                                value={customerInput}
                                onChange={e => setCustomerInput(e.target.value)}
                                placeholder="Select or type new customer"
                                required
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                            <datalist id="customer-list">
                                {activeCustomers.map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                            {activeCustomers.length === 0 && (
                                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
                                    Type a name to add a new customer on the fly.
                                </div>
                            )}
                        </div>
                        <div className="form-group" style={{ width: 160 }}>
                            <label>Date</label>
                            <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />
                        </div>
                    </div>

                    <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Products</div>
                    
                    {items.map((item, index) => {
                        const selectedStock = stock.find(s => s.id === item.stock_id);
                        const selectedProductName = selectedStock ? selectedStock.product_name : '';
                        const productVariants = selectedProductName ? stockOptions.find(p => p.name === selectedProductName)?.variants : [];

                        const costPrice = selectedStock?.vendor_price || 0;
                        const sellingPrice = parseFloat(item.sellingPrice) || 0;
                        const rowProfit = (sellingPrice - costPrice) * item.qty;

                        return (
                            <div key={index} style={{ marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) minmax(120px, 1.5fr) 70px 100px 100px 40px', gap: '10px', alignItems: 'start' }}>
                                    
                                    <div>
                                        <select 
                                            value={selectedProductName} 
                                            onChange={e => handleItemChange(index, 'productName', e.target.value)}
                                            required
                                            style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="">Product</option>
                                            {stockOptions.map(p => (
                                                <option key={p.name} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <select 
                                            value={item.stock_id} 
                                            onChange={e => handleItemChange(index, 'stock_id', e.target.value)}
                                            required
                                            disabled={!productVariants || productVariants.length === 0}
                                            style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="">Variant</option>
                                            {productVariants?.map(v => (
                                                <option key={v.id} value={v.id}>{v.flavor || 'Standard'} ({formatRupees(v.vendor_price * 100)})</option>
                                            ))}
                                        </select>
                                        {selectedStock && (
                                            <div style={{ fontSize: 11, color: selectedStock.qty < item.qty ? 'var(--alert-color)' : 'var(--text-light)', marginTop: 4 }}>
                                                Available: {selectedStock.qty}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <input 
                                            type="number" min="1" 
                                            inputMode="decimal"
                                            value={item.qty} 
                                            onChange={e => handleItemChange(index, 'qty', parseInt(e.target.value)||0)}
                                            required
                                            title="Quantity"
                                            style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <input 
                                            type="number" min="0" step="0.5"
                                            inputMode="decimal"
                                            value={item.sellingPrice} 
                                            onChange={e => handleItemChange(index, 'sellingPrice', e.target.value)}
                                            onFocus={e => e.target.select()}
                                            required
                                            title="Selling Price"
                                            placeholder="Sell Price"
                                            style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        />
                                        {selectedStock && (
                                            <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                                                Vendor Price: {formatRupees(costPrice * 100)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 'bold', color: rowProfit > 0 ? 'var(--primary-color)' : 'var(--alert-color)' }}>
                                            {selectedStock && item.sellingPrice !== '' ? formatRupees(rowProfit * 100) : '-'}
                                        </div>
                                        {selectedStock && item.sellingPrice !== '' && rowProfit < 0 && (
                                            <div style={{ fontSize: 11, color: 'var(--alert-color)', marginTop: 4, textAlign: 'right' }}>
                                                Below cost
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <button type="button" onClick={() => removeItem(index)} className="btn icon-btn" style={{color: 'var(--alert-color)', padding: '4px'}} disabled={items.length === 1}>
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <button type="button" onClick={addItem} className="btn btn-outline" style={{ marginTop: 10, width: '100%', borderStyle: 'dashed' }}>
                        <Plus size={16}/> Add Product
                    </button>

                    <div className="flex justify-between items-center" style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--border-color)', fontSize: 16 }}>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Total Sales: </span>
                            <span style={{ fontSize: 18 }}>{formatRupees(calculations.total * 100)}</span>
                        </div>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Total Profit: </span>
                            <span style={{ fontSize: 18, color: calculations.profit > 0 ? 'var(--primary-color)' : 'inherit' }}>{formatRupees(calculations.profit * 100)}</span>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 15, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Completing Sale...' : 'Complete Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

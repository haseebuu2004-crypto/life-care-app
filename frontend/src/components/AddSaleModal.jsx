import { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2, X } from 'lucide-react';

export function AddSaleModal({ onClose }) {
    const { stock, sales, addSale } = useStore();
    
    const [customer, setCustomer] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([{ stock_id: '', qty: 1, sellingPrice: '' }]);
    const [loading, setLoading] = useState(false);

    // Extract unique customers for datalist
    const uniqueCustomers = useMemo(() => {
        const customers = sales.map(s => s.customer).filter(Boolean);
        return [...new Set(customers)];
    }, [sales]);

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
                newItems[index].sellingPrice = product.variants[0].sp || 0;
            } else {
                newItems[index].stock_id = '';
                newItems[index].sellingPrice = '';
            }
        }
        
        if (field === 'stock_id') {
            const s = stock.find(st => st.id === value);
            if (s) newItems[index].sellingPrice = s.sp || 0;
        }
        
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { stock_id: '', qty: 1, sellingPrice: '' }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const calculations = useMemo(() => {
        let total = 0;
        let profit = 0;
        items.forEach(item => {
            const stockId = parseInt(item.stock_id);
            const s = stock.find(st => st.id === stockId);
            if (s && item.stock_id) {
                const costPrice = s.sp || 0;
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
        
        if (!customer.trim()) return useStore.getState().showToast("Customer name required", "warn");
        
        const validItems = items.filter(i => i.stock_id && i.qty > 0 && i.sellingPrice !== '');
        if (validItems.length === 0) return useStore.getState().showToast("At least 1 valid product required", "warn");

        try {
            setLoading(true);
            const productsPayload = validItems.map(i => {
                const stockId = parseInt(i.stock_id);
                const s = stock.find(st => st.id === stockId);
                const qty = parseInt(i.qty) || 1;
                const sellingPrice = parseFloat(i.sellingPrice) || 0;
                const costPrice = s?.sp || 0;
                return {
                    stock_id: stockId,
                    quantity: qty,
                    sellingPrice,
                    profit: (sellingPrice - costPrice) * qty  // total profit for this row
                };
            });

            await addSale({
                customerName: customer.trim(),
                date,
                products: productsPayload,
            });
            useStore.getState().showToast("Sale completed successfully", "success");
            onClose();
        } catch (err) {
            let msg = err.message || "Failed to complete sale.";
            if (msg.includes("SQLITE_")) {
                msg = "Failed to save sale. Please try again.";
            }
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
                                value={customer} 
                                onChange={e=>setCustomer(e.target.value)} 
                                required 
                                placeholder="Enter customer name"
                                list="customer-list"
                                autoComplete="off"
                            />
                            <datalist id="customer-list">
                                {uniqueCustomers.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div className="form-group" style={{ width: 160 }}>
                            <label>Date</label>
                            <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />
                        </div>
                    </div>

                    <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Products</div>
                    
                    {items.map((item, index) => {
                        const selectedStock = stock.find(s => s.id === parseInt(item.stock_id));
                        const selectedProductName = selectedStock ? selectedStock.product_name : '';
                        const productVariants = selectedProductName ? stockOptions.find(p => p.name === selectedProductName)?.variants : [];

                        const costPrice = selectedStock?.sp || 0;
                        const sellingPrice = parseFloat(item.sellingPrice) || 0;
                        const rowProfit = (sellingPrice - costPrice) * item.qty;

                        return (
                            <div key={index} className="flex items-center" style={{ marginBottom: 10, flexWrap: 'nowrap', gap: '10px' }}>
                                <div style={{ flex: 1, minWidth: 120 }}>
                                    <select 
                                        value={selectedProductName} 
                                        onChange={e => handleItemChange(index, 'productName', e.target.value)}
                                        required
                                    >
                                        <option value="">Product</option>
                                        {stockOptions.map(p => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div style={{ width: 120 }}>
                                    <select 
                                        value={item.stock_id} 
                                        onChange={e => handleItemChange(index, 'stock_id', parseInt(e.target.value))}
                                        required
                                        disabled={!productVariants || productVariants.length === 0}
                                    >
                                        <option value="">Variant</option>
                                        {productVariants?.map(v => (
                                            <option key={v.id} value={v.id}>{v.flavor || 'Standard'}</option>
                                        ))}
                                    </select>
                                    {selectedStock && (
                                        <div style={{ fontSize: 11, color: selectedStock.qty < item.qty ? 'var(--alert-color)' : 'var(--text-light)', marginTop: 4 }}>
                                            Available: {selectedStock.qty}
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ width: 70 }}>
                                    <input 
                                        type="number" min="1" 
                                        value={item.qty} 
                                        onChange={e => handleItemChange(index, 'qty', parseInt(e.target.value)||0)}
                                        required
                                        title="Quantity"
                                    />
                                </div>
                                
                                <div style={{ width: 80, color: 'var(--text-light)', fontSize: 13 }}>
                                    Cost: {costPrice}
                                </div>
                                
                                <div style={{ width: 90 }}>
                                    <input 
                                        type="number" min="0" step="0.5"
                                        value={item.sellingPrice} 
                                        onChange={e => handleItemChange(index, 'sellingPrice', e.target.value)}
                                        onFocus={e => e.target.select()}
                                        required
                                        title="Selling Price"
                                        placeholder="Sell Price"
                                    />
                                </div>

                                <div style={{ width: 80, textAlign: 'right', fontWeight: 'bold', color: rowProfit > 0 ? 'var(--primary-color)' : 'inherit' }}>
                                    {selectedStock ? `₹${rowProfit}` : '-'}
                                </div>
                                
                                <div>
                                    <button type="button" onClick={() => removeItem(index)} className="btn icon-btn" style={{color: 'var(--alert-color)'}} disabled={items.length === 1}>
                                        <Trash2 size={16}/>
                                    </button>
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
                            <span style={{ fontSize: 18 }}>₹{calculations.total}</span>
                        </div>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Total Profit: </span>
                            <span style={{ fontSize: 18, color: calculations.profit > 0 ? 'var(--primary-color)' : 'inherit' }}>₹{calculations.profit}</span>
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

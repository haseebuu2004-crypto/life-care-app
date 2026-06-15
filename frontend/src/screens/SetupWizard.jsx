"use client";
import React, { useState } from 'react';
import useStore from '../store/useStore';
import api from '../services/api';
import { Package, Droplets, Users, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export function SetupWizard({ onComplete }) {
    const [step, setStep] = useState(0);
    const { fetchDashboardStats, fetchStock, fetchProducts, fetchCustomers, updateClubName } = useStore();
    
    const [clubName, setClubName] = useState('');
    const [clubNameError, setClubNameError] = useState('');

    const [productName, setProductName] = useState('');
    const [vendorPrice, setVendorPrice] = useState('');
    const [productId, setProductId] = useState(null);

    const [shakeAmount, setShakeAmount] = useState('');
    const [stockQty, setStockQty] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberPhone, setMemberPhone] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffPass, setStaffPass] = useState('');

    const [loading, setLoading] = useState(false);

    const completeSetup = async () => {
        try {
            setLoading(true);
            await api.put('/admin/config/setup-complete');
            await fetchDashboardStats();
            onComplete();
        } catch (e) {
            useStore.getState().showToast("Failed to complete setup", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStep0 = async (e) => {
        e.preventDefault();
        setClubNameError('');
        if (!clubName || clubName.trim().length === 0) {
            return setClubNameError('Please enter your club name.');
        }
        if (clubName.length > 100) {
            return setClubNameError('Club name is too long (max 100 characters).');
        }
        try {
            setLoading(true);
            await updateClubName(clubName);
            setStep(1);
        } catch (e) {
            setClubNameError(e.message || 'Failed to save club name.');
        } finally {
            setLoading(false);
        }
    };

    const handleStep1 = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post('/products', { name: productName, vendor_price: vendorPrice });
            setProductId(res.data.product_id);
            await fetchProducts();
            setStep(2);
        } catch (e) {
            useStore.getState().showToast("Failed to create product", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put('/settings/config', { default_shake_amount: shakeAmount });
            setStep(3);
        } catch (e) {
            useStore.getState().showToast("Failed to save config", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStep3 = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const products = await api.get('/products');
            const p = products.data.data.find(x => x.name === productName);
            if (p && p.flavours && p.flavours.length > 0) {
                const variantId = p.flavours[0].id;
                await api.post('/stock', { inventoryId: variantId, quantity: parseInt(stockQty, 10) });
                await fetchStock();
            }
            setStep(4);
        } catch (e) {
            useStore.getState().showToast("Failed to add stock", "error");
        } finally {
            setLoading(false);
        }
    };



    const handleStep4 = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post('/users', { email: staffEmail });
            setStaffPass(res.data.tempPassword);
            setStep(5);
        } catch (e) {
            useStore.getState().showToast("Failed to add staff", "error");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9))', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.4s ease'
        },
        modal: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '24px', maxWidth: '650px', width: '90%', padding: '48px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.5)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)'
        },
        title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px' },
        subtitle: { fontSize: '16px', color: '#475569', textAlign: 'center', marginBottom: '40px' },
        progressContainer: { display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '48px' },
        progressBarBg: { position: 'absolute', top: '50%', left: '0', right: '0', height: '6px', backgroundColor: '#e2e8f0', transform: 'translateY(-50%)', zIndex: 0, borderRadius: '3px' },
        progressBarFill: { position: 'absolute', top: '50%', left: '0', height: '6px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transform: 'translateY(-50%)', zIndex: 0, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '3px' },
        stepNode: (active, completed) => ({
            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '700', position: 'relative', zIndex: 1, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: completed ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : active ? '#ffffff' : '#f8fafc',
            color: completed ? '#ffffff' : active ? '#6366f1' : '#94a3b8',
            border: `3px solid ${completed ? 'transparent' : active ? '#6366f1' : '#e2e8f0'}`,
            boxShadow: active ? '0 0 0 4px rgba(99, 102, 241, 0.15), 0 4px 6px -1px rgba(0,0,0,0.1)' : completed ? '0 4px 6px -1px rgba(99, 102, 241, 0.4)' : 'none'
        }),
        formContainer: { minHeight: '300px', display: 'flex', flexDirection: 'column' },
        stepHeader: { fontSize: '22px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', letterSpacing: '-0.3px' },
        stepDesc: { fontSize: '15px', color: '#475569', marginBottom: '30px', lineHeight: '1.6' },
        inputGroup: { marginBottom: '24px', flex: 1 },
        label: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
        input: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', color: '#0f172a', outline: 'none', transition: 'all 0.2s ease', backgroundColor: '#ffffff', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' },
        row: { display: 'flex', gap: '20px' },
        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '30px' },
        btnSkip: { background: 'none', border: 'none', color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer', padding: '12px 20px', borderRadius: '10px', transition: 'all 0.2s', ':hover': { backgroundColor: '#f1f5f9', color: '#334155' } },
        btnNext: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)' },
        successCard: { backgroundColor: 'rgba(240, 253, 244, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '30px', textAlign: 'left', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h1 style={styles.title}>Welcome to Life Care System!</h1>
                <p style={styles.subtitle}>Let's set up your club in 4 easy steps.</p>

                <div style={styles.progressContainer}>
                    <div style={styles.progressBarBg}></div>
                    <div style={{ ...styles.progressBarFill, width: `${Math.min((step/4)*100, 100)}%` }}></div>
                    
                    {[0, 1, 2, 3, 4].map(i => {
                        const active = step === i;
                        const completed = step > i;
                        return (
                            <div key={i} style={styles.stepNode(active, completed)}>
                                {completed ? <CheckCircle size={18} /> : (i === 0 ? 'C' : i)}
                            </div>
                        );
                    })}
                </div>

                <div style={styles.formContainer}>
                    {step === 0 && (
                        <form onSubmit={handleStep0} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={styles.stepHeader}>What is your club called?</div>
                            <div style={styles.stepDesc}>This will appear on your dashboard and reports.</div>
                            
                            {clubNameError && <div style={{ color: '#dc2626', padding: '10px', background: '#fee2e2', borderRadius: '8px', marginBottom: '15px' }}>{clubNameError}</div>}
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Club Name</label>
                                <input value={clubName} onChange={e=>setClubName(e.target.value)} style={styles.input} placeholder="e.g. LIFE CARE" maxLength={100} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}></span>
                                    <span style={{ fontSize: '12px', color: clubName.length > 100 ? '#dc2626' : '#64748b' }}>{clubName.length} / 100</span>
                                </div>
                            </div>
                            
                            <div style={styles.footer}>
                                <button type="button" disabled={loading} onClick={() => setStep(1)} style={{...styles.btnSkip, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Skip for now</button>
                                <button type="submit" disabled={loading} style={{...styles.btnNext, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Continue <ArrowRight size={18} /></button>
                            </div>
                        </form>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={styles.stepHeader}><Package color="#6366f1" size={24} /> Step 1: Add your first product</div>
                            <div style={styles.stepDesc}>Every club starts with great products. Let's add your flagship item.</div>
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Product Name</label>
                                <input required value={productName} onChange={e=>setProductName(e.target.value)} style={styles.input} placeholder="e.g. Formula 1 Shake" />
                            </div>
                            
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Vendor Price (Cost) Rs.</label>
                                    <input type="number" required value={vendorPrice} onChange={e=>setVendorPrice(e.target.value)} style={styles.input} placeholder="e.g. 1500" />
                                </div>
                            </div>
                            
                            <div style={styles.footer}>
                                <button type="button" disabled={loading} onClick={completeSetup} style={{...styles.btnSkip, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}} onMouseOver={(e) => !loading && (e.target.style.color = '#64748b')} onMouseOut={(e) => !loading && (e.target.style.color = '#94a3b8')}>Skip Wizard</button>
                                <button type="submit" disabled={loading} style={{...styles.btnNext, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Next Step <ArrowRight size={18} /></button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={styles.stepHeader}><Droplets color="#0ea5e9" size={24} /> Step 2: Default Shake Amount</div>
                            <div style={styles.stepDesc}>When marking a member 'Present' for attendance, this is the default profit generated from their daily shake.</div>
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Default Shake Profit (Rs.)</label>
                                <input type="number" required value={shakeAmount} onChange={e=>setShakeAmount(e.target.value)} style={styles.input} placeholder="e.g. 50" />
                            </div>
                            
                            <div style={styles.footer}>
                                <button type="button" disabled={loading} onClick={completeSetup} style={{...styles.btnSkip, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Skip</button>
                                <button type="submit" disabled={loading} style={{...styles.btnNext, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Next Step <ArrowRight size={18} /></button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleStep3} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={styles.stepHeader}><Package color="#f59e0b" size={24} /> Step 3: Add Initial Stock</div>
                            <div style={styles.stepDesc}>How many units of "{productName}" do you currently have in inventory?</div>
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Starting Quantity</label>
                                <input type="number" required value={stockQty} onChange={e=>setStockQty(e.target.value)} style={styles.input} placeholder="e.g. 10" />
                            </div>
                            
                            <div style={styles.footer}>
                                <button type="button" disabled={loading} onClick={completeSetup} style={{...styles.btnSkip, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Skip</button>
                                <button type="submit" disabled={loading} style={{...styles.btnNext, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Next Step <ArrowRight size={18} /></button>
                            </div>
                        </form>
                    )}



                    {step === 4 && (
                        <form onSubmit={handleStep4} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={styles.stepHeader}><Shield color="#ec4899" size={24} /> Step 4: Add a Staff Member</div>
                            <div style={styles.stepDesc}>Add a staff member who can record sales and attendance. They won't have access to your financials.</div>
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Staff Email</label>
                                <input type="email" required value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} style={styles.input} placeholder="e.g. staff@club.com" />
                            </div>
                            
                            <div style={styles.footer}>
                                <button type="button" disabled={loading} onClick={completeSetup} style={{...styles.btnSkip, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Finish Setup</button>
                                <button type="submit" disabled={loading} style={{...styles.btnNext, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>Complete Setup <CheckCircle size={18} /></button>
                            </div>
                        </form>
                    )}

                    {step === 5 && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle color="#22c55e" size={32} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Setup Complete! 🎉</h2>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>Your club is ready to go. We've created your staff account.</p>
                            
                            <div style={styles.successCard}>
                                <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>STAFF CREDENTIALS</div>
                                <div style={{ marginBottom: '4px', fontSize: '14px', color: '#14532d' }}>Email: <strong>{staffEmail}</strong></div>
                                <div style={{ fontSize: '14px', color: '#14532d' }}>Temporary Password: <strong style={{ fontFamily: 'monospace', fontSize: '16px', background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>{staffPass}</strong></div>
                            </div>
                            
                            <button onClick={completeSetup} disabled={loading} style={{ ...styles.btnNext, width: '100%', justifyContent: 'center', padding: '14px', opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>Go to Dashboard</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

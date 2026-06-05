import { useState } from 'react';
import useStore from '../store/useStore';
import { Download, FileText, Activity, Users } from 'lucide-react';

export function Reports() {
    const { exportReport, showToast } = useStore();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type) => {
        setIsExporting(true);
        try {
            await exportReport(type);
            showToast(`${type} report exported successfully`, "success");
        } catch (err) {
            showToast(err.message || "Failed to export report", "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 30 }}>
                <h2>Business Reports</h2>
            </div>
            
            <div className="card-grid" style={{ padding: 0 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 'bold' }}>
                        <FileText size={24} color="var(--primary-color)" /> Sales Report
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Export detailed sales history, including products sold, quantities, and profit margins.</p>
                    <button className="btn btn-outline" disabled={isExporting} onClick={() => handleExport('sales')} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 'bold' }}>
                        <Users size={24} color="var(--accent-color)" /> Attendance Report
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Export daily customer attendance and generated shake profit calculations.</p>
                    <button className="btn btn-outline" disabled={isExporting} onClick={() => handleExport('attendance')} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 'bold' }}>
                        <Activity size={24} color="#8b5cf6" /> Summary Report
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Export a consolidated financial and operational summary of the business.</p>
                    <button className="btn btn-outline" disabled={isExporting} onClick={() => handleExport('summary')} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

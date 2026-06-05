"use client";
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Overview Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 40, borderTop: '4px solid var(--alert-color)' }}>
                        <AlertTriangle size={48} color="var(--alert-color)" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ marginBottom: 10 }}>Unable to load overview data</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
                            There was an unexpected error rendering the dashboard metrics. 
                            This could be due to missing or invalid data.
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                        >
                            <RefreshCw size={16} /> Retry / Refresh
                        </button>
                        
                        {/* Error details for debugging */}
                        {this.state.error && (
                            <div style={{ marginTop: 30, padding: 15, background: '#f8f9fa', borderRadius: 8, textAlign: 'left', fontSize: 12, color: '#e8590c', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                <strong>Error Details:</strong><br/>
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

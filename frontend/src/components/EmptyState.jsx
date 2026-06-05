import React from 'react';

const EmptyState = ({ title, message, icon }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            margin: '20px 0',
            textAlign: 'center',
            minHeight: '200px'
        }}>
            {icon && <div style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}>{icon}</div>}
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 8px 0' }}>{title}</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0, maxWidth: '400px' }}>{message}</p>
        </div>
    );
};

export default EmptyState;

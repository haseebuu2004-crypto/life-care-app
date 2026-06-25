"use client";
import { useState, useRef, useEffect, useMemo } from 'react';

export function CustomerAutocomplete({ 
    customers, 
    value, 
    onChange, 
    placeholder = "Select or type new customer" 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        if (!value.trim()) return customers.slice(0, 10);
        const lower = value.toLowerCase();
        return customers
            .filter(c => c.name.toLowerCase().includes(lower))
            .slice(0, 10);
    }, [customers, value]);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                value={value}
                onChange={e => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)', 
                    outline: 'none',
                    background: 'var(--card-bg)'
                }}
            />
            {isOpen && filtered.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    margin: 0,
                    marginTop: 4,
                    padding: '8px 0',
                    listStyle: 'none',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    maxHeight: 250,
                    overflowY: 'auto'
                }}>
                    {filtered.map(c => (
                        <li 
                            key={c.id} 
                            style={{ 
                                padding: '8px 16px', 
                                cursor: 'pointer',
                                ':hover': { background: 'var(--bg-color)' }
                            }}
                            onMouseDown={() => {
                                onChange(c.name);
                                setIsOpen(false);
                            }}
                            onMouseEnter={e => e.target.style.background = 'var(--bg-color)'}
                            onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                            {c.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

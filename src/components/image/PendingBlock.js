import React from 'react';

export default function PendingBlock({ pendingGeneration }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#fff8e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            {/* Loading animation placeholder */}
            <div style={{
                color: '#f57c00',
                textAlign: 'center',
                padding: '20px'
            }}>
                <div style={{ 
                    fontSize: '24px', 
                    marginBottom: '8px',
                    animation: 'spin 1s linear infinite'
                }}>
                    ⟳
                </div>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    Generating...
                </div>
                {pendingGeneration && (
                    <div style={{ fontSize: '12px', color: '#f57c00' }}>
                        {pendingGeneration.type || 'image'}
                    </div>
                )}
            </div>
            
            {/* Add CSS animation for spinning */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

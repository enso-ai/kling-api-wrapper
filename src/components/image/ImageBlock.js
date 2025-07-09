import React from 'react';

export default function ImageBlock({ imageRecord }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            {/* Placeholder for image display */}
            <div style={{
                color: '#666',
                textAlign: 'center',
                padding: '20px'
            }}>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                    Image Block
                </div>
                {imageRecord && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                        ID: {imageRecord.id?.slice(0, 8)}...
                    </div>
                )}
            </div>
        </div>
    );
}

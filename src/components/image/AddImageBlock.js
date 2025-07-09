import React from 'react';

export default function AddImageBlock({ onOpenModal }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.2s ease',
            ':hover': {
                borderColor: '#007bff',
                backgroundColor: '#f0f8ff'
            }
        }}
        onClick={onOpenModal}
        >
            <div style={{
                fontSize: '48px',
                color: '#ccc',
                fontWeight: 'bold'
            }}>
                +
            </div>
        </div>
    );
}

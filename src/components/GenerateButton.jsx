{/* app/components/GenerateButton.jsx */}
import React from 'react';
import './GenerateButton.css';

export default function GenerateButton({ onClick }) {
  return (
    <button className="generate-btn" onClick={onClick}>
      Generate
    </button>
  );
}

{/* app/components/GenerateButton.jsx */}
import React from 'react';
import { FaRedo } from "react-icons/fa";
import './GenerateButton.css';

export default function GenerateButton({ onClick, loading }) {
  return (
    <button 
      className={`generate-btn ${loading ? 'loading' : ''}`} 
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <FaRedo className="spin" />
      ) : (
        "Generate"
      )}
    </button>
  );
}

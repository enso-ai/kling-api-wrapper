{/* app/components/PromptInput.jsx */}
import React from 'react';
import './PromptInput.css';

export default function PromptInput({ value, onChange, label, id, placeholder }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <textarea 
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      ></textarea>
    </div>
  );
}

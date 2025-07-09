import React from 'react';
import './ModeSelector.css';

export default function ModeSelector({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="mode-type">Mode</label>
      <select 
        id="mode-type" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="std">Standard</option>
        <option value="pro">Professional</option>
      </select>
    </div>
  );
}

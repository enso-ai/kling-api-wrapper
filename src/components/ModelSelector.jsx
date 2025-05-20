{/* app/components/ModelSelector.jsx */}
import React from 'react';
import './ModelSelector.css';

export default function ModelSelector({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="model-type">Model Type</label>
      <select 
        id="model-type" 
        value={value} 
        onChange={(e) => { onChange(e.target.value); console.log("target model:", e.target.value) }}
      >
        <option value="kling-v1-6">Kling 1.6</option>
        <option value="kling-v2-master">Kling 2.0</option>
      </select>
    </div>
  );
}

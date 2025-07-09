import React from 'react';
import './DurationSelector.css';

export default function DurationSelector({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="duration">Duration</label>
      <select 
        id="duration" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="5">5 seconds</option>
        <option value="10">10 seconds</option>
      </select>
    </div>
  );
}

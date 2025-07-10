import React from 'react';
import styles from './ModeSelector.module.css';

export default function ModeSelector({ value, onChange }) {
  return (
    <div className={styles.formGroup}>
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

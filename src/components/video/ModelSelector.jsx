import React from 'react';
import styles from './ModelSelector.module.css';

export default function ModelSelector({ value, onChange }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor="model-type">Model Type</label>
      <select 
        id="model-type" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="v1"> Video Engine (Legacy) </option>
        <option value="v2"> Video Engine 2 </option>
      </select>
    </div>
  );
}

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
        <option value="kling-v1-6">Kling 1.6 (fallback)</option>
        <option value="kling-v2-1">Kling 2.1</option>
        <option value="kling-v2-1-master">Kling 2.1 (master)</option>
      </select>
    </div>
  );
}

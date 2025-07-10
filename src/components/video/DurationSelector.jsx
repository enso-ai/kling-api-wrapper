import React from 'react';
import styles from './DurationSelector.module.css';

export default function DurationSelector({ value, onChange }) {
  return (
    <div className={styles.formGroup}>
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

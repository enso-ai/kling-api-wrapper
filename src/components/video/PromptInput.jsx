import React from 'react';
import styles from './PromptInput.module.css';

export default function PromptInput({ value, onChange, label, id, placeholder }) {
  return (
    <div className={styles.formGroup}>
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

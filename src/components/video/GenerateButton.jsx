import React from 'react';
import { FaRedo } from "react-icons/fa";
import styles from './GenerateButton.module.css';

export default function GenerateButton({ onClick, loading }) {
  return (
    <button 
      className={`${styles.generateBtn} ${loading ? styles.disabled : ''}`} 
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <FaRedo className={styles.spin} size={18} />
      ) : (
        "Generate"
      )}
    </button>
  );
}

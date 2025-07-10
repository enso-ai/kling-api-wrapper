import React from 'react';
import { IoAdd } from 'react-icons/io5';
import styles from './AddImageBlock.module.css';

export default function AddImageBlock({ onOpenModal }) {
    return (
        <div 
            className={styles.addImageBlock}
            onClick={onOpenModal}
        >
            <div className={styles.iconContainer}>
                <IoAdd className={styles.icon} />
                <div className={styles.text}>Add New Image</div>
            </div>
        </div>
    );
}

import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { useImageGenModalContext } from '@/context/ImageGenModalContext';
import styles from './AddImageBlock.module.css';

export default function AddImageBlock() {
    const { openImageGenModal } = useImageGenModalContext();

    return (
        <div 
            className={styles.addImageBlock}
            onClick={() => openImageGenModal()}
        >
            <div className={styles.iconContainer}>
                <IoAdd className={styles.icon} />
                <div className={styles.text}>Add New Image</div>
            </div>
        </div>
    );
}

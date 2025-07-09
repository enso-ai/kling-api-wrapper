"use client";

import React, { useEffect, useState } from 'react';
import PromptTab from './tabs/PromptTab';
import InpaintingTab from './tabs/InpaintingTab';
import styles from './ImageGenModal.module.css';

const ImageGenModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('prompt');

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'prompt':
                return <PromptTab onClose={onClose} />;
            case 'inpainting':
                return <InpaintingTab onClose={onClose} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>Generate Image</h2>
                </div>

                <>
                    <div className={styles.tabNavigation}>
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === 'prompt' ? styles.active : ''
                            }`}
                            onClick={() => handleTabClick('prompt')}
                        >
                            Prompt
                        </button>
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === 'inpainting' ? styles.active : ''
                            }`}
                            onClick={() => handleTabClick('inpainting')}
                        >
                            Inpainting
                        </button>
                    </div>

                    <div className={styles.content}>{renderTabContent()}</div>
                </>
            </div>
        </div>
    );
};

export default ImageGenModal;

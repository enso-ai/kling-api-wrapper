"use client";

import React, { useEffect, useState } from 'react';
import { useImageContext } from '@/context/ImageContext';
import PromptTab from './tabs/PromptTab';
import InpaintingTab from './tabs/InpaintingTab';
import styles from './ImageGenModal.module.css';

const ImageGenModal = () => {
    const { 
        isImageGenModalOpen, 
        imageGenModalPrefillData, 
        closeImageGenModal 
    } = useImageContext();
    
    const [activeTab, setActiveTab] = useState('prompt');

    // Set initial tab based on prefill data
    useEffect(() => {
        if (imageGenModalPrefillData?.initialTab) {
            setActiveTab(imageGenModalPrefillData.initialTab);
        } else {
            setActiveTab('prompt');
        }
    }, [imageGenModalPrefillData]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeImageGenModal();
            }
        };

        if (isImageGenModalOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isImageGenModalOpen, closeImageGenModal]);

    if (!isImageGenModalOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeImageGenModal();
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'prompt':
                return <PromptTab onClose={closeImageGenModal} prefillData={imageGenModalPrefillData} />;
            case 'inpainting':
                return <InpaintingTab onClose={closeImageGenModal} prefillData={imageGenModalPrefillData} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={closeImageGenModal}>
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

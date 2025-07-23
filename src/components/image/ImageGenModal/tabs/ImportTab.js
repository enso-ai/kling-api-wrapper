"use client";

import React, { useState } from 'react';
import { useImageContext } from '@/context/ImageContext';
import styles from './ImportTab.module.css';

const ImportTab = ({ onClose }) => {
    const { defaultProjectImages, importImage } = useImageContext();
    const [importingImageIds, setImportingImageIds] = useState(new Set());

    const handleImportImage = async (imageId) => {
        if (importingImageIds.has(imageId)) return;

        setImportingImageIds(prev => new Set(prev).add(imageId));

        try {
            await importImage(imageId);
            // Close modal after successful import
            onClose();
        } catch (error) {
            console.error('Failed to import image:', error);
            // Remove from importing state on error
            setImportingImageIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(imageId);
                return newSet;
            });
        }
    };

    const getSelectedImageUrl = (imageRecord) => {
        if (!imageRecord.imageUrls || imageRecord.imageUrls.length === 0) {
            return null;
        }
        const selectedIndex = imageRecord.selectedImageIdx || 0;
        return imageRecord.imageUrls[selectedIndex];
    };

    if (!defaultProjectImages || defaultProjectImages.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>No favorite images available to import.</p>
                    <p className={styles.emptySubtext}>
                        Star images in other projects to add them to your favorites.
                    </p>
                </div>
            </div>
        );
    }

    const imgs = [...defaultProjectImages, ...defaultProjectImages]
    // const imgs = defaultProjectImages

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Import from Favorites</h3>
                <p className={styles.subtitle}>
                    Select an image from your favorites to import into the current project.
                </p>
            </div>

            <div className={styles.imageGrid}>
                {imgs.map((imageRecord) => { // defaultProjectImages
                    const selectedImageUrl = getSelectedImageUrl(imageRecord);
                    const isImporting = importingImageIds.has(imageRecord.id);

                    if (!selectedImageUrl) return null;

                    return (
                        <div key={imageRecord.id} className={styles.imageItem}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={selectedImageUrl}
                                    alt={imageRecord.prompt || 'Generated image'}
                                    className={styles.image}
                                />
                            </div>
                            <div className={styles.overlay}>
                                <button
                                    className={`${styles.importButton} ${isImporting ? styles.importing : ''}`}
                                    onClick={() => handleImportImage(imageRecord.id)}
                                    disabled={isImporting}
                                >
                                    {isImporting ? 'Importing...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImportTab;

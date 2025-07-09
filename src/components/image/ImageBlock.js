import React, { useState } from 'react';
import styles from './ImageBlock.module.css';
import ImageDetailModal from './ImageDetailModal';
import { useImageContext } from '../../context/ImageContext';

export default function ImageBlock({ imageRecord }) {
    const { removeImageRecord, updateSelectedImage } = useImageContext();
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleImageClick = () => {
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        // TODO: Implement edit functionality
        console.log('Edit clicked for image:', imageRecord.id);
    };

    const handleBrushClick = (e) => {
        e.stopPropagation();
        // TODO: Implement brush functionality
        console.log('Brush clicked for image:', imageRecord.id);
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation();
        
        // Show confirmation dialog
        const confirmed = window.confirm('Are you sure you want to delete this image? This action cannot be undone.');
        
        if (confirmed) {
            try {
                await removeImageRecord(imageRecord.id);
                console.log('Image deleted successfully:', imageRecord.id);
            } catch (error) {
                console.error('Failed to delete image:', error);
                alert('Failed to delete image. Please try again.');
            }
        }
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        const currentIdx = imageRecord.selectedImageIdx || 0;
        if (currentIdx > 0) {
            updateSelectedImage(imageRecord.id, currentIdx - 1);
        }
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        const currentIdx = imageRecord.selectedImageIdx || 0;
        if (currentIdx < imageRecord.imageUrls.length - 1) {
            updateSelectedImage(imageRecord.id, currentIdx + 1);
        }
    };

    const renderContent = () => {
        if (imageRecord?.imageUrls && imageRecord.imageUrls.length > 0) {
            const currentIdx = imageRecord.selectedImageIdx || 0;
            const currentImageUrl = imageRecord.imageUrls[currentIdx];
            const hasMultipleImages = imageRecord.imageUrls.length > 1;

            return (
                <div className={styles.imageWrapper}>
                    <img
                        src={currentImageUrl}
                        alt={imageRecord.prompt || 'Generated image'}
                        className={styles.image}
                    />
                    
                    {/* Navigation arrows for multiple images */}
                    {hasMultipleImages && (
                        <>
                            {currentIdx > 0 && (
                                <button
                                    className={`${styles.navButton} ${styles.prevButton}`}
                                    onClick={handlePrevImage}
                                    title="Previous image"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15,18 9,12 15,6"></polyline>
                                    </svg>
                                </button>
                            )}
                            
                            {currentIdx < imageRecord.imageUrls.length - 1 && (
                                <button
                                    className={`${styles.navButton} ${styles.nextButton}`}
                                    onClick={handleNextImage}
                                    title="Next image"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9,18 15,12 9,6"></polyline>
                                    </svg>
                                </button>
                            )}
                        </>
                    )}

                    {/* Image counter */}
                    {hasMultipleImages && (
                        <div className={styles.imageCounter}>
                            {currentIdx + 1}/{imageRecord.imageUrls.length}
                        </div>
                    )}

                    <div className={styles.controls}>
                        <button
                            className={styles.iconButton}
                            onClick={handleEditClick}
                            title="Edit image"
                        >
                            {/* Pencil icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button
                            className={styles.iconButton}
                            onClick={handleBrushClick}
                            title="Brush tool"
                        >
                            {/* Brush icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
                                <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
                            </svg>
                        </button>
                        <button
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                            title="Delete image"
                        >
                            {/* Trash icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }

        // Placeholder when no image
        return (
            <div className={styles.placeholder}>
                <div>
                    <div className={styles.placeholderText}>
                        Image Block
                    </div>
                    {imageRecord && (
                        <div className={styles.placeholderSubtext}>
                            ID: {imageRecord.id?.slice(0, 8)}...
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={styles.container} onClick={handleImageClick}>
                {renderContent()}
            </div>
            {showDetailModal && (
                <ImageDetailModal
                    imageRecord={imageRecord}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}

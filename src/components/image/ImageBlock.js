import React, { useState } from 'react';
import styles from './ImageBlock.module.css';
import ImageDetailModal from './ImageDetailModal';
import { useImageContext } from '../../context/ImageContext';
import { FaChevronLeft, FaChevronRight, FaPencilAlt, FaPaintBrush, FaTrash, FaDownload } from 'react-icons/fa';
import { downloadImage } from '../../utils/download';

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

    const handleDownloadClick = async (e) => {
        e.stopPropagation();
        const currentIdx = imageRecord.selectedImageIdx || 0;
        const currentImageUrl = imageRecord.imageUrls[currentIdx];
        await downloadImage(currentImageUrl, currentIdx);
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
                                    <FaChevronLeft />
                                </button>
                            )}
                            
                            {currentIdx < imageRecord.imageUrls.length - 1 && (
                                <button
                                    className={`${styles.navButton} ${styles.nextButton}`}
                                    onClick={handleNextImage}
                                    title="Next image"
                                >
                                    <FaChevronRight />
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

                    {/* Download button */}
                    <button
                        className={styles.downloadButton}
                        onClick={handleDownloadClick}
                        title="Download image"
                    >
                        <FaDownload />
                    </button>

                    <div className={styles.controls}>
                        <button
                            className={styles.iconButton}
                            onClick={handleEditClick}
                            title="Edit image"
                        >
                            <FaPencilAlt />
                        </button>
                        <button
                            className={styles.iconButton}
                            onClick={handleBrushClick}
                            title="Brush tool"
                        >
                            <FaPaintBrush />
                        </button>
                        <button
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                            title="Delete image"
                        >
                            <FaTrash />
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

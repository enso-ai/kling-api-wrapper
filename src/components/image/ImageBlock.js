import React from 'react';
import styles from './ImageBlock.module.css';
import { useImageContext } from '@/context/ImageContext';
import { FaChevronLeft, FaChevronRight, FaTrash, FaDownload } from 'react-icons/fa';
import { downloadImage } from '@/utils/download';
import EditButton from './EditButton';
import InpaintingButton from './InpaintingButton';

function ImageBlock({ imageRecord, onOpenDetailModal }) {
    const { removeImageRecord, updateSelectedImage } = useImageContext();

    const handleImageClick = () => {
        if (onOpenDetailModal) {
            onOpenDetailModal(imageRecord);
        }
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation();

        // Show confirmation dialog
        const confirmed = window.confirm(
            'Are you sure you want to delete this image? This action cannot be undone.'
        );

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

    // Reusable control buttons component
    const ControlButtons = () => {
        return (
            <div className={styles.controls}>
                <EditButton imageRecord={imageRecord} className={styles.iconButton} />
                <button
                    className={styles.deleteButton}
                    onClick={handleDeleteClick}
                    title='Delete image'
                >
                    <FaTrash />
                </button>
            </div>
        );
    };

    // Placeholder content component
    const PlaceholderContent = () => {
        return (
            <div className={styles.placeholder}>
                <div>
                    <div className={styles.placeholderText}>No Image returned</div>
                    {imageRecord && (
                        <div className={styles.placeholderSubtext}>
                            ID: {imageRecord.id?.slice(0, 8)}...
                        </div>
                    )}
                </div>
                <ControlButtons />
            </div>
        );
    };

    const ImageBasedActions = () => (
        <div className={styles.imageBasedActions}>
            <InpaintingButton imageRecord={imageRecord} className={styles.imageBasedAction} />
            <button
                className={styles.imageBasedAction}
                onClick={handleDownloadClick}
                title='Download image'
            >
                <FaDownload />
            </button>
        </div>
    );

    // Image content component
    const ImageContent = () => {
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
                                title='Previous image'
                            >
                                <FaChevronLeft />
                            </button>
                        )}

                        {currentIdx < imageRecord.imageUrls.length - 1 && (
                            <button
                                className={`${styles.navButton} ${styles.nextButton}`}
                                onClick={handleNextImage}
                                title='Next image'
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

                <ControlButtons showBrush={true} />
                {/* Action applied on image */}
                <ImageBasedActions />
            </div>
        );
    };

    const renderContent = () => {
        const hasImages = imageRecord?.imageUrls && imageRecord.imageUrls.length > 0;

        switch (hasImages) {
            case true:
                return <ImageContent />;
            case false:
            default:
                return <PlaceholderContent />;
        }
    };

    return (
        <div className={styles.container} onClick={handleImageClick}>
            {renderContent()}
        </div>
    );
}

export default React.memo(ImageBlock);
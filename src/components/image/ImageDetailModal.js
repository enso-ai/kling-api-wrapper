import React, { useMemo } from 'react';
import styles from './ImageDetailModal.module.css';
import { FaTimes, FaDownload } from 'react-icons/fa';
import { useImageContext } from '../../context/ImageContext';
import { downloadImage } from '../../utils/download';
import InpaintingComposite from './InpaintingComposite';

export default function ImageDetailModal({ imageRecordId, onClose }) {
    const { imageRecords, updateSelectedImage } = useImageContext();

    // Memoized lookup of the current imageRecord
    const imageRecord = useMemo(() => {
        return imageRecords.find(record => record.id === imageRecordId);
    }, [imageRecords, imageRecordId]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleThumbnailClick = (index) => {
        updateSelectedImage(imageRecord.id, index);
    };

    const formatCreatedAt = (createdAt) => {
        try {
            const date = new Date(createdAt);
            return date.toLocaleString();
        } catch (error) {
            return createdAt;
        }
    };

    if (!imageRecord) {
        return null;
    }

    // Check if images exist and are valid
    const hasImages = imageRecord.imageUrls && imageRecord.imageUrls.length > 0;
    console.log("hasImages:", hasImages)

    const handleDownloadClick = async () => {
        if (!hasImages) return;
        const currentImageIndex = imageRecord.selectedImageIdx || 0;
        const currentImageUrl = imageRecord.imageUrls[currentImageIndex];
        await downloadImage(currentImageUrl, currentImageIndex);
    };
    const currentImageIndex = imageRecord.selectedImageIdx || 0;
    const currentImageUrl = hasImages ? imageRecord.imageUrls[currentImageIndex] : null;
    const hasMultipleImages = hasImages && imageRecord.imageUrls.length > 1;
    const hasReferenceImages = imageRecord.srcImageUrls && imageRecord.srcImageUrls.length > 0;
    const isInpaintingImage = hasReferenceImages && imageRecord.mask;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Image Details</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className={styles.content}>
                    <div className={styles.mainContainer}>
                        {/* Left Column - Image Display and Carousel */}
                        <div className={styles.leftColumn}>
                            {hasImages ? (
                                <>
                                    {/* Main Image Display */}
                                    <div className={styles.mainImageContainer}>
                                        <img
                                            src={currentImageUrl}
                                            alt={imageRecord.prompt || 'Generated image'}
                                            className={styles.mainImage}
                                        />
                                        {/* Download button */}
                                        <button
                                            className={styles.downloadButton}
                                            onClick={handleDownloadClick}
                                            title="Download image"
                                        >
                                            <FaDownload />
                                        </button>
                                    </div>

                                    {/* Image Carousel */}
                                    {hasMultipleImages && (
                                        <div className={styles.carouselContainer}>
                                            <div className={styles.carousel}>
                                                {imageRecord.imageUrls.map((imageUrl, index) => (
                                                    <button
                                                        key={index}
                                                        className={`${styles.carouselThumbnail} ${
                                                            index === currentImageIndex
                                                                ? styles.carouselThumbnailActive
                                                                : ''
                                                        }`}
                                                        onClick={() => handleThumbnailClick(index)}
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Image ${index + 1}`}
                                                            className={styles.carouselImage}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Placeholder when no images */
                                <div className={styles.mainImageContainer}>
                                <div className={styles.imagePlaceholder}>
                                    <div className={styles.placeholderContent}>
                                        <div className={styles.placeholderText}>
                                            No Image returned
                                        </div>
                                    </div>
                                </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Details */}
                        <div className={styles.rightColumn}>
                            {/* Creation Info */}
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Image Information</h3>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Created:</span>
                                    <span className={styles.infoValue}>
                                        {formatCreatedAt(imageRecord.createdAt)}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Model:</span>
                                    <span className={styles.infoValue}>
                                        {imageRecord.modelName || 'Unknown'}
                                    </span>
                                </div>
                                {hasMultipleImages && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Images:</span>
                                        <span className={styles.infoValue}>
                                            {imageRecord.imageUrls.length} generated
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Prompt */}
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Prompt</h3>
                                <textarea
                                    className={styles.promptTextarea}
                                    value={imageRecord.prompt || ''}
                                    readOnly
                                    rows={4}
                                />
                            </div>

                            {/* Reference Images / Inpainting Source */}
                            {hasReferenceImages && (
                                <div className={styles.infoSection}>
                                    <h3 className={styles.sectionTitle}>
                                        {isInpaintingImage ? 'Inpainting Source' : 'Reference Images'}
                                    </h3>
                                    
                                    {isInpaintingImage ? (
                                        // Show inpainting composite for inpainting images
                                        <InpaintingComposite
                                            referenceImageUrl={imageRecord.srcImageUrls[0]}
                                            maskBase64={imageRecord.mask}
                                        />
                                    ) : (
                                        // Show regular grid for non-inpainting reference images
                                        <div className={styles.referenceGrid}>
                                            {imageRecord.srcImageUrls.map((imageUrl, index) => (
                                                <div
                                                    key={index}
                                                    className={styles.referenceImageContainer}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Reference ${index + 1}`}
                                                        className={styles.referenceImage}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import styles from './PendingBlock.module.css';
import { FaSpinner } from 'react-icons/fa';

export default function PendingBlock({ pendingGeneration }) {
    if (!pendingGeneration) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}>
                        <FaSpinner />
                    </div>
                    <div className={styles.loadingText}>
                        Generating...
                    </div>
                </div>
            </div>
        );
    }

    // Extract information from pendingGeneration
    const hasReferenceImages = pendingGeneration.referenceImages && pendingGeneration.referenceImages.length > 0;
    const isInpainting = pendingGeneration.type === 'inpainting';
    const prompt = pendingGeneration.prompt || '';
    const truncatedPrompt = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;

    // For reference images display (non-inpainting)
    const displayImages = hasReferenceImages && !isInpainting ? pendingGeneration.referenceImages.slice(0, 3) : [];
    const remainingCount = hasReferenceImages && !isInpainting ? Math.max(0, pendingGeneration.referenceImages.length - 3) : 0;

    return (
        <div className={styles.container}>
            <div className={styles.loadingContent}>
                <div className={styles.spinner}>
                    <FaSpinner />
                </div>
                <div className={styles.loadingText}>
                    Generating...
                </div>
                <div className={styles.typeText}>
                    {pendingGeneration.type || 'image'}
                </div>

                {/* Input Information Section */}
                <div className={styles.inputInfo}>
                    {/* Prompt Display */}
                    {prompt && (
                        <div className={styles.promptText}>
                            {truncatedPrompt}
                        </div>
                    )}

                    {/* Reference Images or Inpainting Preview */}
                    {hasReferenceImages && (
                        <div className={styles.referenceSection}>
                            {isInpainting ? (
                                // Inpainting: Show just the reference image (mask not available during pending)
                                <div className={styles.inpaintingPreview}>
                                    <div className={styles.referenceThumbnail}>
                                        <img
                                            src={pendingGeneration.referenceImages[0]}
                                            alt="Inpainting source"
                                            className={styles.thumbnailImage}
                                        />
                                    </div>
                                </div>
                            ) : (
                                // Regular reference images: Show thumbnails
                                <div className={styles.referenceImages}>
                                    {displayImages.map((imageUrl, index) => (
                                        <div key={index} className={styles.referenceThumbnail}>
                                            <img
                                                src={imageUrl}
                                                alt={`Reference ${index + 1}`}
                                                className={styles.thumbnailImage}
                                            />
                                        </div>
                                    ))}
                                    {remainingCount > 0 && (
                                        <div className={styles.moreIndicator}>
                                            +{remainingCount}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

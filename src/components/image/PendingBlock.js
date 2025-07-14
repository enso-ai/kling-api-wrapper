import React from 'react';
import styles from './PendingBlock.module.css';
import { FaSpinner } from 'react-icons/fa';
import InpaintingComposite from './InpaintingComposite';
import { FaPencilAlt } from 'react-icons/fa';
import { useImageGenModalContext } from '@/context/ImageGenModalContext';

export default function PendingBlock({ pendingGeneration }) {
    const { openImageGenModal } = useImageGenModalContext();

    if (!pendingGeneration) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}>
                        <FaSpinner />
                    </div>
                    <div className={styles.loadingText}>Generating...</div>
                </div>
            </div>
        );
    }

    // Extract information from pendingGeneration
    const hasReferenceImages =
        pendingGeneration.referenceImages && pendingGeneration.referenceImages.length > 0;
    const isInpainting = pendingGeneration.type === 'inpainting';
    const prompt = pendingGeneration.prompt || '';
    const truncatedPrompt = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;

    // For reference images display (non-inpainting)
    const displayImages =
        hasReferenceImages && !isInpainting ? pendingGeneration.referenceImages.slice(0, 3) : [];
    const remainingCount =
        hasReferenceImages && !isInpainting
            ? Math.max(0, pendingGeneration.referenceImages.length - 3)
            : 0;

    const handleEditClick = (e) => {
        e.stopPropagation();

        // Create prefill data based on imageRecord
        const prefillData = {
            initialTab: pendingGeneration.type == 'inpainting' ? 'inpainting' : 'prompt',
            prompt: pendingGeneration.prompt,
            srcImages: pendingGeneration.referenceImages,
            mask: pendingGeneration.mask,
        };

        // Open modal with prefill data
        openImageGenModal(prefillData);
    };

    const ControlButtons = () => {
        return (
            <div className={styles.controls}>
                <button className={styles.iconButton} onClick={handleEditClick} title='Edit image'>
                    <FaPencilAlt />
                </button>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.loadingContent}>
                <div className={styles.spinner}>
                    <FaSpinner />
                </div>
                <div className={styles.loadingText}>Generating...</div>
                <div className={styles.typeText}>{pendingGeneration.type || 'image'}</div>

                {/* Input Information Section */}
                <div className={styles.inputInfo}>
                    {/* Prompt Display */}
                    {prompt && <div className={styles.promptText}>{truncatedPrompt}</div>}

                    {/* Reference Images or Inpainting Preview */}
                    {hasReferenceImages && (
                        <div className={styles.referenceSection}>
                            {isInpainting ? (
                                // Inpainting: Show just the reference image (mask not available during pending)
                                // note, inpainting reference image is only passed in as a url
                                <div className={styles.inpaintingPreview}>
                                    <InpaintingComposite
                                        referenceImageUrl={
                                            pendingGeneration.referenceImages[0]?.url
                                        }
                                        maskBase64={pendingGeneration.mask}
                                    />
                                </div>
                            ) : (
                                // Regular reference images: Show thumbnails
                                // input image can be a generated image, which store on gcs and represented by a gcs url
                                // or user drag and dropped image which is a base64 format
                                <div className={styles.referenceImages}>
                                    {displayImages.map((imageObj, index) => (
                                        <div key={index} className={styles.referenceThumbnail}>
                                            <img
                                                src={imageObj?.url || imageObj?.base64 || undefined}
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
                <ControlButtons />
            </div>
        </div>
    );
}

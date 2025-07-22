"use client";

import React, { useCallback } from 'react';
import { useImageDropAndPaste } from '@/hooks/useImageDropAndPaste';
import { validateAndResizeImage } from '@/utils/image';
import styles from './ReferenceImageStack.module.css';

const ReferenceImageStack = ({
    referenceImageStack = [],
    onAddImage,
    onRemoveImage,
    onClearAll,
    maxImages = 10,
    disabled = false,
    validationError = null
}) => {
    // Validate image file type
    const validateImageFile = useCallback((file) => {
        // Check if it's a supported image file (will be converted to PNG)
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return 'Only PNG/JPG/WebP images are supported';
        }
        return null;
    }, []);

    // Convert blob to base64
    const blobToBase64 = useCallback((blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);

    // Handle adding image to stack with smart validation and resizing
    const handleAddBase64ToStack = useCallback(async (file) => {
        if (referenceImageStack.length >= maxImages) {
            if (onAddImage) {
                onAddImage(null, `Maximum ${maxImages} images allowed in stack`);
            }
            return;
        }

        // Validate file type first
        const fileError = validateImageFile(file);
        if (fileError) {
            if (onAddImage) {
                onAddImage(null, fileError);
            }
            return;
        }

        try {
            // Use the new smart validation and resizing function
            const validationResult = await validateAndResizeImage(file);
            
            // Convert the processed blob to base64
            const base64 = await blobToBase64(validationResult.blob);
            
            // Create enhanced filename if image was resized
            let displayFileName = file.name;
            if (validationResult.needsResize) {
                const { width, height } = validationResult.dimensions;
                const originalDimensions = validationResult.originalDimensions;
                displayFileName = `${file.name.replace(/\.[^/.]+$/, '')}_resized_${width}x${height}.png`;
                
                // Log resizing info for debugging
                console.log(`Image resized: ${originalDimensions.width}x${originalDimensions.height} → ${width}x${height}`);
                if (validationResult.quality < 0.9) {
                    console.log(`Quality adjusted to ${validationResult.quality} to meet file size requirements`);
                }
            }

            // Add to stack
            const newStackEntry = {
                id: Date.now() + Math.random(),
                base64,
                type: 'base64',
                fileName: displayFileName,
                dimensions: validationResult.dimensions,
                originalDimensions: validationResult.originalDimensions,
                wasResized: validationResult.needsResize,
                finalFileSize: validationResult.finalSize,
                originalFileSize: validationResult.originalSize
            };

            if (onAddImage) {
                // Include success message if image was automatically resized
                let successMessage = null;
                if (validationResult.needsResize) {
                    const originalSize = (validationResult.originalSize / (1024 * 1024)).toFixed(1);
                    const finalSize = (validationResult.finalSize / (1024 * 1024)).toFixed(1);
                    const originalDims = validationResult.originalDimensions;
                    const finalDims = validationResult.dimensions;
                    
                    successMessage = `Image automatically resized from ${originalDims.width}×${originalDims.height} to ${finalDims.width}×${finalDims.height} (${originalSize}MB → ${finalSize}MB)`;
                }
                
                onAddImage(newStackEntry, null, successMessage);
            }

        } catch (error) {
            if (onAddImage) {
                onAddImage(null, error.message);
            }
        }
    }, [referenceImageStack.length, maxImages, validateImageFile, blobToBase64, onAddImage]);

    // Use the shared hook for drag & drop and paste functionality
    const {
        isDragOver,
        isFocused,
        isHovered,
        elementRef,
        dragHandlers,
        pasteHandlers,
        focusHandlers
    } = useImageDropAndPaste({
        onFileProcessed: handleAddBase64ToStack,
        disabled,
        enablePaste: true,
        enableDrop: true,
        multiple: true,
        convertToPng: true
    });

    const handleRemoveFromStack = useCallback((stackEntryId) => {
        if (onRemoveImage) {
            onRemoveImage(stackEntryId);
        }
    }, [onRemoveImage]);

    const handleClearAll = useCallback(() => {
        if (onClearAll) {
            onClearAll();
        }
    }, [onClearAll]);

    return (
        <div className={styles.referenceStackSection}>
            <div className={styles.sectionHeader}>
                <label className={styles.sectionLabel}>
                    Reference Images ({referenceImageStack.length}/{maxImages})
                </label>
                {referenceImageStack.length > 0 && (
                    <div className={styles.stackActions}>
                        <button
                            className={styles.clearAllButton}
                            onClick={handleClearAll}
                            disabled={disabled}
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>
            <div
                ref={elementRef}
                tabIndex={0}
                className={`${styles.referenceStack} ${
                    referenceImageStack.length === 0 ? styles.emptyDropZone : ''
                } ${isDragOver ? styles.dragOver : ''} ${isFocused ? styles.focused : ''} ${
                    isHovered ? styles.hovered : ''
                } ${disabled ? styles.disabled : ''}`}
                {...dragHandlers}
                {...pasteHandlers}
                {...focusHandlers}
            >
                {referenceImageStack.length > 0 ? (
                    referenceImageStack.map((stackEntry) => (
                        <div
                            key={stackEntry.id}
                            className={styles.stackImageItem}
                            onClick={() => !disabled && handleRemoveFromStack(stackEntry.id)}
                        >
                            <img
                                src={stackEntry.type === 'url' ? stackEntry.url : stackEntry.base64}
                                alt='Reference image'
                                className={styles.stackImage}
                            />
                            <div className={styles.removeIcon}>×</div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyStateMessage}>
                        {isHovered
                            ? 'Ready to paste! Press Ctrl+V or drag and drop PNG/JPG/WebP files here'
                            : 'Pick one from left, drag and drop, or hover and paste PNG/JPG/WebP files here'}
                    </div>
                )}
            </div>
            {validationError && <div className={styles.validationError}>{validationError}</div>}
        </div>
    );
};

export default ReferenceImageStack;

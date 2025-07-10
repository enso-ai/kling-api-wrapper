"use client";

import React, { useState, useCallback } from 'react';
import { useImageContext } from '@/context/ImageContext';
import Dropdown from '@/components/common/Dropdown';
import styles from './PromptTab.module.css';

const PromptTab = ({ onClose }) => {
    const { imageRecords, startImageGeneration } = useImageContext();

    // State management
    const [referenceImageStack, setReferenceImageStack] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [validationError, setValidationError] = useState(null);

    // Dropdown options for number of images
    const numberOptions = [
        { value: 1, label: '1 image' },
        { value: 2, label: '2 images' },
        { value: 3, label: '3 images' },
        { value: 4, label: '4 images' },
        { value: 5, label: '5 images' },
    ];

    // Clear validation error after a delay
    const clearValidationError = useCallback(() => {
        setTimeout(() => setValidationError(null), 3000);
    }, []);

    // Validate image file
    const validateImageFile = useCallback((file) => {
        // Check if it's a PNG or JPG file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return 'Only PNG and JPG images are supported';
        }

        return null;
    }, []);

    // Validate image dimensions
    const validateImageDimensions = useCallback((img) => {
        const { width, height } = img;
        if (width < 768 || width > 2048 || height < 768 || height > 2048) {
            return 'Image dimensions must be between 768x768 and 2048x2048 pixels';
        }
        return null;
    }, []);

    // Convert file to base64
    const fileToBase64 = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    // Handle adding image to reference stack from library
    const handleAddToStack = useCallback((imageRecord) => {
        if (referenceImageStack.length >= 10) return; // Respect 10-image limit
        
        const imageUrl = imageRecord.imageUrls?.[imageRecord.selectedImageIdx || 0];
        setReferenceImageStack(prev => [...prev, { 
            id: Date.now() + Math.random(),
            url: imageUrl,
            sourceRecord: imageRecord,
            type: 'url'
        }]);
    }, [referenceImageStack.length]);

    // Handle adding base64 image to stack
    const handleAddBase64ToStack = useCallback(async (file) => {
        if (referenceImageStack.length >= 10) {
            setValidationError('Maximum 10 images allowed in stack');
            clearValidationError();
            return;
        }

        // Validate file type
        const fileError = validateImageFile(file);
        if (fileError) {
            setValidationError(fileError);
            clearValidationError();
            return;
        }

        try {
            // Convert to base64
            const base64 = await fileToBase64(file);
            
            // Create image element to check dimensions
            const img = new Image();
            img.onload = () => {
                // Validate dimensions
                const dimensionError = validateImageDimensions(img);
                if (dimensionError) {
                    setValidationError(dimensionError);
                    clearValidationError();
                    return;
                }

                // Add to stack
                setReferenceImageStack(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    base64,
                    type: 'base64',
                    fileName: file.name,
                    dimensions: { width: img.width, height: img.height }
                }]);
            };
            img.onerror = () => {
                setValidationError('Failed to load image');
                clearValidationError();
            };
            img.src = base64;
        } catch (error) {
            setValidationError('Failed to process image file');
            clearValidationError();
        }
    }, [referenceImageStack.length, validateImageFile, validateImageDimensions, fileToBase64, clearValidationError]);

    // Handle removing image from reference stack
    const handleRemoveFromStack = useCallback((stackEntryId) => {
        setReferenceImageStack(prev => prev.filter(entry => entry.id !== stackEntryId));
    }, []);

    // Clear all reference images from stack
    const handleClearAll = useCallback(() => {
        setReferenceImageStack([]);
    }, []);

    // Drag and drop handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        // Only set dragOver to false if we're leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            setValidationError('No image files found');
            clearValidationError();
            return;
        }

        // Process each image file
        imageFiles.forEach(file => {
            handleAddBase64ToStack(file);
        });
    }, [handleAddBase64ToStack, clearValidationError]);

    // Handle generation
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Convert reference stack to srcImages format for the ImageContext API
            const srcImages = referenceImageStack.map((stackEntry) => {
                if (stackEntry.type === 'url') {
                    return { url: stackEntry.url };
                } else {
                    return { base64: stackEntry.base64 };
                }
            });

            await startImageGeneration({
                prompt: prompt.trim(),
                selectedImages: srcImages,
                numberOfImages,
            });

            // Close modal on successful generation start
            onClose();
        } catch (error) {
            console.error('Generation failed:', error);
            if (error.message === 'CONTENT_MODERATION_BLOCKED') {
                setGenerationError(
                    'Content was blocked by moderation filters. Please try a different prompt.'
                );
            } else {
                setGenerationError(error.message || 'Failed to generate images. Please try again.');
            }
            setIsGenerating(false);
        }
    }, [prompt, referenceImageStack, numberOfImages, startImageGeneration, onClose]);

    return (
        <div className={styles.tabContent}>
            {/* Two Column Layout */}
            <div className={styles.twoColumnLayout}>
                {/* Left Column - Element Images */}
                <div className={styles.leftColumn}>
                    <div className={styles.elementImagesColumn}>
                        <label className={styles.sectionLabel}>
                            Reference Images (select up to 10):
                        </label>

                        {imageRecords.length > 0 ? (
                            <>
                                <div className={styles.verticalImageList}>
                                    {imageRecords.map((record) => {
                                        const isDisabled = referenceImageStack.length >= 10;
                                        return (
                                            <div
                                                key={record.id}
                                                className={`${styles.elementImageItem} ${
                                                    isDisabled ? styles.disabled : ''
                                                }`}
                                                onClick={() => !isDisabled && handleAddToStack(record)}
                                                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                            >
                                                <img
                                                    src={record.imageUrls?.[record.selectedImageIdx || 0]}
                                                    alt={record.prompt || 'Generated image'}
                                                    className={styles.elementImage}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={styles.selectionCounter}>
                                    <span>Stack: {referenceImageStack.length}/10</span>
                                    {referenceImageStack.length > 0 && (
                                        <button
                                            className={styles.clearAllButton}
                                            onClick={handleClearAll}
                                            disabled={isGenerating}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.noImagesMessage}>
                                No images available. Generate some images first to use as
                                references.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Prompt Input Area */}
                <div className={styles.rightColumn}>
                    <div className={styles.promptInputPanel}>
                        {/* Reference Image Stack Display - Always Visible */}
                        <div className={styles.referenceStackSection}>
                            <label className={styles.sectionLabel}>
                                Reference Images ({referenceImageStack.length}/10)
                            </label>
                            <div 
                                className={`${styles.referenceStack} ${
                                    referenceImageStack.length === 0 ? styles.emptyDropZone : ''
                                } ${isDragOver ? styles.dragOver : ''}`}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {referenceImageStack.length > 0 ? (
                                    referenceImageStack.map((stackEntry) => (
                                        <div
                                            key={stackEntry.id}
                                            className={styles.stackImageItem}
                                            onClick={() => handleRemoveFromStack(stackEntry.id)}
                                        >
                                            <img
                                                src={stackEntry.type === 'url' ? stackEntry.url : stackEntry.base64}
                                                alt="Reference image"
                                                className={styles.stackImage}
                                            />
                                            <div className={styles.removeIcon}>×</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyStateMessage}>
                                        Pick images from left or drag and drop PNG/JPG files here
                                    </div>
                                )}
                            </div>
                            {validationError && (
                                <div className={styles.validationError}>
                                    {validationError}
                                </div>
                            )}
                        </div>

                        {/* Prompt Input Section */}
                        <div className={styles.promptSection}>
                            <label htmlFor='prompt' className={styles.sectionLabel}>
                                Text Prompt *
                            </label>
                            <textarea
                                id='prompt'
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder='Describe the element you want to generate...'
                                className={styles.promptTextarea}
                                rows={6}
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Generation Options */}
                        <div className={styles.optionsSection}>
                            <label className={styles.sectionLabel}>
                                Number of images to generate:
                            </label>
                            <Dropdown
                                value={numberOfImages}
                                onChange={setNumberOfImages}
                                options={numberOptions}
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Generate Button */}
                        <div className={styles.generateSection}>
                            <button
                                className={styles.generateButton}
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </button>
                        </div>

                        {/* Error Message */}
                        {generationError && (
                            <div className={styles.errorMessage}>{generationError}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptTab;

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

    // Dropdown options for number of images
    const numberOptions = [
        { value: 1, label: '1 image' },
        { value: 2, label: '2 images' },
        { value: 3, label: '3 images' },
        { value: 4, label: '4 images' },
        { value: 5, label: '5 images' },
    ];

    // Handle adding image to reference stack
    const handleAddToStack = useCallback((imageRecord) => {
        if (referenceImageStack.length >= 10) return; // Respect 10-image limit
        
        const imageUrl = imageRecord.imageUrls?.[imageRecord.selectedImageIdx || 0];
        setReferenceImageStack(prev => [...prev, { 
            id: Date.now() + Math.random(),
            url: imageUrl,
            sourceRecord: imageRecord 
        }]);
    }, [referenceImageStack.length]);

    // Handle removing image from reference stack
    const handleRemoveFromStack = useCallback((stackEntryId) => {
        setReferenceImageStack(prev => prev.filter(entry => entry.id !== stackEntryId));
    }, []);

    // Clear all reference images from stack
    const handleClearAll = useCallback(() => {
        setReferenceImageStack([]);
    }, []);

    // Handle generation
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Convert reference stack to srcImages format for the ImageContext API
            const srcImages = referenceImageStack.map((stackEntry) => ({
                url: stackEntry.url
            }));

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
                        {/* Reference Image Stack Display */}
                        {referenceImageStack.length > 0 && (
                            <div className={styles.referenceStackSection}>
                                <label className={styles.sectionLabel}>
                                    Reference Images ({referenceImageStack.length}/10)
                                </label>
                                <div className={styles.referenceStack}>
                                    {referenceImageStack.map((stackEntry) => (
                                        <div
                                            key={stackEntry.id}
                                            className={styles.stackImageItem}
                                            onClick={() => handleRemoveFromStack(stackEntry.id)}
                                        >
                                            <img
                                                src={stackEntry.url}
                                                alt="Reference image"
                                                className={styles.stackImage}
                                            />
                                            <div className={styles.removeIcon}>×</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

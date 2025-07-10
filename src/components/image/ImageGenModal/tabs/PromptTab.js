"use client";

import React, { useState, useCallback } from 'react';
import { useImageContext } from '@/context/ImageContext';
import Dropdown from '@/components/common/Dropdown';
import styles from './PromptTab.module.css';

const PromptTab = ({ onClose }) => {
    const { imageRecords, startImageGeneration } = useImageContext();

    // State management
    const [selectedImages, setSelectedImages] = useState([]);
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

    // Handle element image selection
    const handleImageSelection = useCallback((elementImage) => {
        setSelectedImages((prev) => {
            const isSelected = prev.some((img) => img.id === elementImage.id);

            if (isSelected) {
                // Remove from selection
                return prev.filter((img) => img.id !== elementImage.id);
            } else {
                // Add to selection (max 10)
                if (prev.length >= 10) {
                    return prev; // Don't add if already at max
                }
                return [...prev, elementImage];
            }
        });
    }, []);

    // Clear all selected images
    const handleClearAll = useCallback(() => {
        setSelectedImages([]);
    }, []);

    // Handle generation
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Convert selected images to srcImages format for the ImageContext API
            const srcImages = selectedImages.map((img) => ({
                url: img.imageUrls?.[img.selectedImageIdx || 0]
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
    }, [prompt, selectedImages, numberOfImages, startImageGeneration, onClose]);

    // Check if an element image is selected
    const isElementImageSelected = useCallback(
        (elementImage) => {
            return selectedImages.some((img) => img.id === elementImage.id);
        },
        [selectedImages]
    );

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
                                        return (
                                            <div
                                                key={record.id}
                                                className={`${styles.elementImageItem} ${
                                                    isElementImageSelected(record)
                                                        ? styles.selected
                                                        : ''
                                                }`}
                                                onClick={() => handleImageSelection(record)}
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
                                    <span>Selected: {selectedImages.length}/10</span>
                                    {selectedImages.length > 0 && (
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

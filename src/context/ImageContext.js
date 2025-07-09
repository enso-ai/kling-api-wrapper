import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/service/backend';
import ImageRecord from '@/models/ImageRecord';
import { db, loadImageRecordsPage, getTotalImageRecordsCount } from '@/service/database';

const MAX_RECORDS = 20; // Maximum number of records to load per page

// Action types
const IMAGE_ACTIONS = {
    START_GENERATION: 'START_GENERATION',
    GENERATION_SUCCESS: 'GENERATION_SUCCESS',
    GENERATION_ERROR: 'GENERATION_ERROR',
    SET_RECORDS: 'SET_RECORDS',
    APPEND_RECORDS: 'APPEND_RECORDS',
    ADD_RECORD: 'ADD_RECORD',
    REMOVE_RECORD: 'REMOVE_RECORD',
    SET_LOADING_STATE: 'SET_LOADING_STATE',
    SET_PAGINATION: 'SET_PAGINATION',
};

// Initial state
const initialState = {
    imageRecords: [],
    pendingGenerations: [],
    isLoaded: false,        // Set to true after initial database load completes (success or error)
    currentPage: 1,
    hasMoreImages: true,
    isLoadingMore: false,   // Set to true when pagination loading is in progress
    totalImages: 0,
};

// Reducer
function imageReducer(state, action) {
    switch (action.type) {
        case IMAGE_ACTIONS.START_GENERATION:
            return {
                ...state,
                pendingGenerations: [...state.pendingGenerations, action.payload],
            };

        case IMAGE_ACTIONS.GENERATION_SUCCESS:
        case IMAGE_ACTIONS.GENERATION_ERROR:
            return {
                ...state,
                pendingGenerations: state.pendingGenerations.filter(
                    (gen) => gen.id !== action.payload.id
                ),
            };

        case IMAGE_ACTIONS.SET_RECORDS:
            return {
                ...state,
                imageRecords: action.payload,
            };

        case IMAGE_ACTIONS.APPEND_RECORDS:
            return {
                ...state,
                imageRecords: [...state.imageRecords, ...action.payload],
            };

        case IMAGE_ACTIONS.ADD_RECORD:
            return {
                ...state,
                imageRecords: [action.payload, ...state.imageRecords],
                totalImages: state.totalImages + 1,
            };

        case IMAGE_ACTIONS.REMOVE_RECORD:
            return {
                ...state,
                imageRecords: state.imageRecords.filter(record => record.id !== action.payload),
                totalImages: state.totalImages - 1,
            };

        case IMAGE_ACTIONS.SET_LOADING_STATE:
            return {
                ...state,
                ...action.payload,
            };

        case IMAGE_ACTIONS.SET_PAGINATION:
            return {
                ...state,
                ...action.payload,
            };

        default:
            return state;
    }
}

// Context
const ImageContext = createContext();

// Provider component
export const ImageContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(imageReducer, initialState);
    
    // Use ref to access current state in async functions
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Load records from database on initial mount with pagination
    useEffect(() => {
        const loadInitialRecords = async () => {
            try {
                // Get total count first
                const total = await getTotalImageRecordsCount();
                dispatch({
                    type: IMAGE_ACTIONS.SET_PAGINATION,
                    payload: { totalImages: total }
                });

                // Load first page
                const savedRecords = await loadImageRecordsPage(1, MAX_RECORDS);

                // Convert DB objects back to ImageRecord instances
                const records = savedRecords.map((data) => ImageRecord.fromDatabase(data));

                // Sort records by createdAt in descending order
                records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                dispatch({
                    type: IMAGE_ACTIONS.SET_RECORDS,
                    payload: records
                });

                dispatch({
                    type: IMAGE_ACTIONS.SET_PAGINATION,
                    payload: {
                        currentPage: 1,
                        hasMoreImages: total > MAX_RECORDS,
                        isLoaded: true
                    }
                });
            } catch (error) {
                console.error('Failed to load image records from database:', error);
                dispatch({
                    type: IMAGE_ACTIONS.SET_LOADING_STATE,
                    payload: { isLoaded: true }
                });
            }
        };

        loadInitialRecords();
    }, []);

    // Save a record to the database
    const saveRecordToDB = useCallback(async (record) => {
        if (!record.id) return;

        try {
            // Store in Dexie
            await db.imageRecords.put(record.toDatabase());
        } catch (error) {
            console.error('Error saving image record to database:', error);
        }
    }, []);

    // Add element image - handles both state and persistence
    const addElementImage = useCallback(async (imageUrl, generationSources) => {
        try {
            // Create ImageRecord instance
            const imageRecord = new ImageRecord({
                modelName: 'openai-dall-e-3', // Default model for now
                srcImageUrls: generationSources.referenceImages || [],
                mask: generationSources.mask || null,
                prompt: generationSources.prompt,
                imageUrl: imageUrl,
            });

            // Save to database
            await saveRecordToDB(imageRecord);

            // Add to state
            dispatch({
                type: IMAGE_ACTIONS.ADD_RECORD,
                payload: imageRecord
            });

            return { imageRecord };
        } catch (error) {
            console.error('Error adding image record:', error);
            throw error;
        }
    }, [saveRecordToDB]);

    // Remove image record
    const removeImageRecord = useCallback(async (id) => {
        try {
            await db.imageRecords.delete(id);
            dispatch({
                type: IMAGE_ACTIONS.REMOVE_RECORD,
                payload: id
            });
        } catch (error) {
            console.error('Error deleting image record:', error);
            throw error;
        }
    }, []);

    // Load more images (lazy loading)
    const loadMoreImages = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMoreImages) return;

        dispatch({
            type: IMAGE_ACTIONS.SET_LOADING_STATE,
            payload: { isLoadingMore: true }
        });

        try {
            const nextPage = state.currentPage + 1;
            const moreRecords = await loadImageRecordsPage(nextPage, MAX_RECORDS);

            if (moreRecords.length === 0) {
                dispatch({
                    type: IMAGE_ACTIONS.SET_PAGINATION,
                    payload: { hasMoreImages: false, isLoadingMore: false }
                });
                return;
            }

            // Convert DB objects back to ImageRecord instances
            const records = moreRecords.map((data) => ImageRecord.fromDatabase(data));

            // Sort records by createdAt in descending order
            records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Append to existing records
            dispatch({
                type: IMAGE_ACTIONS.APPEND_RECORDS,
                payload: records
            });

            // Check if we have more images to load
            const totalLoaded = nextPage * MAX_RECORDS;
            dispatch({
                type: IMAGE_ACTIONS.SET_PAGINATION,
                payload: {
                    currentPage: nextPage,
                    hasMoreImages: totalLoaded < state.totalImages,
                    isLoadingMore: false
                }
            });
        } catch (error) {
            console.error('Failed to load more images:', error);
            dispatch({
                type: IMAGE_ACTIONS.SET_LOADING_STATE,
                payload: { isLoadingMore: false }
            });
        }
    }, [state.currentPage, state.hasMoreImages, state.isLoadingMore, state.totalImages, state.imageRecords]);

    const executeElementGeneration = useCallback(async (
        generationId,
        isTextOnly,
        prompt,
        selectedImages,
        numberOfImages
    ) => {
        try {
            let result;

            if (isTextOnly) {
                // Text-to-image generation
                result = await apiClient.generateImage({
                    prompt: prompt.trim(),
                    n: numberOfImages,
                    asset_type: 'element_images'
                });
            } else {
                // Image extension
                const imageUrls = selectedImages.map((img) => {
                    return img.gcsUrls?.[img.selectedImageIdx] || img.gcsUrls?.[0];
                });
                result = await apiClient.extendImage({
                    image_urls: imageUrls,
                    prompt: prompt.trim(),
                    n: numberOfImages
                });
            }

            // Process each generated image
            for (const imageData of result.images) {
                const generationSources = {
                    type: isTextOnly ? 'text-to-image' : 'image-extension',
                    prompt: prompt.trim(),
                    referenceImages: isTextOnly ? null : selectedImages.map((img) => {
                        return img.gcsUrls?.[img.selectedImageIdx] || img.gcsUrls?.[0];
                    }),
                    revisedPrompt: imageData.revisedPrompt,
                };

                // Add to both state and database
                await addElementImage(imageData.imageUrl, generationSources);
            }

            // Remove from pending state
            dispatch({
                type: IMAGE_ACTIONS.GENERATION_SUCCESS,
                payload: { id: generationId },
            });
        } catch (error) {
            console.error('Element image generation failed:', error);

            // Update pending item with error state
            dispatch({
                type: IMAGE_ACTIONS.GENERATION_ERROR,
                payload: { id: generationId, error: error.message },
            });
        }
    }, [addElementImage]);

    const startElementImageGeneration = useCallback(
        ({ prompt, selectedImages = [], numberOfImages = 1 }) => {
            if (!prompt.trim()) {
                throw new Error('Prompt is required');
            }

            const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const isTextOnly = selectedImages.length === 0;

            // Add to pending state immediately
            const pendingItem = {
                id: generationId,
                type: isTextOnly ? 'text-to-image' : 'image-extension',
                prompt: prompt.trim(),
                referenceImages: isTextOnly ? null : selectedImages.map((img) => {
                    return img.gcsUrls?.[img.selectedImageIdx] || img.gcsUrls?.[0];
                }),
                numberOfImages,
                status: 'generating',
                startTime: Date.now(),
            };

            dispatch({
                type: IMAGE_ACTIONS.START_GENERATION,
                payload: pendingItem,
            });

            // Trigger async execution in background
            executeElementGeneration(
                generationId,
                isTextOnly,
                prompt,
                selectedImages,
                numberOfImages
            );

            // Return immediately with generationId
            return { generationId };
        },
        [executeElementGeneration]
    );

    const executeInpainting = useCallback(async (
        generationId,
        inputImageUrl,
        maskImage,
        prompt,
        numberOfImages
    ) => {
        try {
            // Call inpainting API
            const result = await apiClient.inpaintImage({
                image_gcs_url: inputImageUrl,
                mask: maskImage,
                prompt: prompt.trim(),
                n: numberOfImages,
                asset_type: 'element_images'
            });

            // Process each generated image
            for (const imageData of result.images) {
                const generationSources = {
                    type: 'inpainting',
                    prompt: prompt.trim(),
                    referenceImages: [inputImageUrl],
                    mask: maskImage,
                    revisedPrompt: imageData.revisedPrompt,
                };

                // Add to both state and database
                await addElementImage(imageData.imageUrl, generationSources);
            }

            // Remove from pending state
            dispatch({
                type: IMAGE_ACTIONS.GENERATION_SUCCESS,
                payload: { id: generationId },
            });
        } catch (error) {
            console.error('Inpainting generation failed:', error);

            // Update pending item with error state
            dispatch({
                type: IMAGE_ACTIONS.GENERATION_ERROR,
                payload: { id: generationId, error: error.message },
            });
        }
    }, [addElementImage]);

    const startInpaintingGeneration = useCallback(
        (inputImageUrl, maskImage, prompt, numberOfImages = 3) => {
            if (!inputImageUrl || !maskImage || !prompt.trim()) {
                throw new Error('Image, mask, and prompt are required');
            }

            const generationId = `inpaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Add to pending state immediately
            const pendingItem = {
                id: generationId,
                type: 'inpainting',
                prompt: prompt.trim(),
                referenceImages: [inputImageUrl],
                numberOfImages,
                status: 'generating',
                startTime: Date.now(),
            };

            dispatch({
                type: IMAGE_ACTIONS.START_GENERATION,
                payload: pendingItem,
            });

            // Trigger async execution in background
            executeInpainting(
                generationId,
                inputImageUrl,
                maskImage,
                prompt,
                numberOfImages
            );

            // Return immediately with generationId
            return { generationId };
        },
        [executeInpainting]
    );

    const contextValue = {
        // Image records state
        imageRecords: state.imageRecords,
        isLoaded: state.isLoaded,
        
        // Pagination
        loadMoreImages,
        hasMoreImages: state.hasMoreImages,
        isLoadingMore: state.isLoadingMore,
        totalImages: state.totalImages,
        
        // Pending generations
        pendingGenerations: state.pendingGenerations,
        
        // Generation methods
        startElementImageGeneration,
        startInpaintingGeneration,
        
        // Record management
        removeImageRecord,
    };

    return <ImageContext.Provider value={contextValue}>{children}</ImageContext.Provider>;
};

// Hook for consuming components
export const useImageContext = () => {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error('useImageContext must be used within an ImageContextProvider');
    }
    return context;
};

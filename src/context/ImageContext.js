import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useRef,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { apiClient } from '@/service/backend';
import ImageRecord from '@/models/ImageRecord';
import {
    db,
    loadImageRecordsPageByProject,
    getTotalImageRecordsCountByProject,
    createBookmarkImage,
    removeBookmarkImage,
    importImageFromDefault,
} from '@/service/database';
import { DEFAULT_PROJECT_ID } from '@/models/Project';
import { useProjectContext } from './ProjectContext';

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
    UPDATE_SELECTED_IMAGE: 'UPDATE_SELECTED_IMAGE',
};

// Initial state
const initialState = {
    imageRecords: [],
    pendingGenerations: [],
    isLoaded: false, // Set to true after initial database load completes (success or error)
    currentPage: 1,
    hasMoreImages: true,
    isLoadingMore: false, // Set to true when pagination loading is in progress
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
                imageRecords: state.imageRecords.filter((record) => record.id !== action.payload),
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

        case IMAGE_ACTIONS.UPDATE_SELECTED_IMAGE:
            return {
                ...state,
                imageRecords: state.imageRecords.map((record) =>
                    record.id === action.payload.recordId
                        ? { ...record, selectedImageIdx: action.payload.selectedImageIdx }
                        : record
                ),
            };

        default:
            return state;
    }
}

// Context
const ImageContext = createContext();

// Provider component
export const ImageContextProvider = ({ children }) => {
    const { curProjectId, isLoaded: projectsLoaded, isDefaultProject } = useProjectContext();
    const [state, dispatch] = useReducer(imageReducer, initialState);
    const [defaultProjectImages, setDefaultProjectImages] = useState([]);

    // Use ref to access current state in async functions
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Load records from database when project is loaded and project ID is available
    useEffect(() => {
        if (!projectsLoaded || !curProjectId) return;

        const loadInitialRecords = async () => {
            try {
                // Get total count first for the current project
                const total = await getTotalImageRecordsCountByProject(curProjectId);
                dispatch({
                    type: IMAGE_ACTIONS.SET_PAGINATION,
                    payload: { totalImages: total },
                });

                // Load first page for the current project
                const savedRecords = await loadImageRecordsPageByProject(
                    curProjectId,
                    1,
                    MAX_RECORDS
                );

                // Convert DB objects back to ImageRecord instances
                const records = savedRecords.map((data) => {
                    const record = ImageRecord.fromDatabase(data);
                    // Add selectedImageIdx in memory (default to first image)
                    record.selectedImageIdx = 0;
                    return record;
                });

                // Sort records by createdAt in descending order
                records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                dispatch({
                    type: IMAGE_ACTIONS.SET_RECORDS,
                    payload: records,
                });

                dispatch({
                    type: IMAGE_ACTIONS.SET_PAGINATION,
                    payload: {
                        currentPage: 1,
                        hasMoreImages: total > MAX_RECORDS,
                        isLoaded: true,
                    },
                });
            } catch (error) {
                console.error('Failed to load image records from database:', error);
                dispatch({
                    type: IMAGE_ACTIONS.SET_LOADING_STATE,
                    payload: { isLoaded: true },
                });
            }
        };

        loadInitialRecords();
    }, [projectsLoaded, curProjectId]);

    // Load default project images when project changes (but not if current project IS the default)
    useEffect(() => {
        if (!projectsLoaded || curProjectId === DEFAULT_PROJECT_ID ) {
            // reset list
            setDefaultProjectImages([])
        }

        const loadDefaultImages = async () => {
            try {
                const totalCount = await getTotalImageRecordsCountByProject(DEFAULT_PROJECT_ID);
                
                if (totalCount > 0) {
                    const allDefaultImages = await loadImageRecordsPageByProject(
                        DEFAULT_PROJECT_ID, 
                        1, 
                        totalCount
                    );
                    
                    const images = allDefaultImages.map((data) => {
                        const record = ImageRecord.fromDatabase(data);
                        record.selectedImageIdx = 0;
                        return record;
                    });
                    
                    images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setDefaultProjectImages(images);
                } else {
                    setDefaultProjectImages([]);
                }
            } catch (error) {
                console.error('Failed to load default project images:', error);
                setDefaultProjectImages([]); // Clear on error
            }
        };

        loadDefaultImages();
    }, [projectsLoaded, curProjectId]);

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

    // Add images - handles both state and persistence
    const addImages = useCallback(
        async (imageUrls, generationSources) => {
            try {
                // Create ImageRecord instance with array of URLs and current project ID
                const imageRecord = new ImageRecord({
                    modelName: 'gpt-image-1', // Default model for now
                    srcImages: generationSources.referenceImages || [],
                    mask: generationSources.mask || null,
                    prompt: generationSources.prompt,
                    size: generationSources.size || null,
                    imageUrls: imageUrls,
                    projectId: curProjectId,
                });

                // Add selectedImageIdx in memory (default to first image)
                imageRecord.selectedImageIdx = 0;

                // Save to database
                await saveRecordToDB(imageRecord);

                // Add to state
                dispatch({
                    type: IMAGE_ACTIONS.ADD_RECORD,
                    payload: imageRecord,
                });

                return { imageRecord };
            } catch (error) {
                console.error('Error adding image record:', error);
                throw error;
            }
        },
        [saveRecordToDB, curProjectId]
    );

    // Update selected image index for a record
    const updateSelectedImage = useCallback((recordId, newIndex) => {
        dispatch({
            type: IMAGE_ACTIONS.UPDATE_SELECTED_IMAGE,
            payload: { recordId, selectedImageIdx: newIndex },
        });
    }, []);

    // Remove image record
    const removeImageRecord = useCallback(
        async (id) => {
            try {
                // Find the image record to get the imageUrls
                const imageRecord = state.imageRecords.find((record) => record.id === id);

                // Delete from GCS first (if imageUrls exists)
                if (imageRecord?.imageUrls && imageRecord.imageUrls.length > 0) {
                    await apiClient.deleteImage(imageRecord.imageUrls);
                }

                // Delete from local database
                await db.imageRecords.delete(id);

                // Update UI state
                dispatch({
                    type: IMAGE_ACTIONS.REMOVE_RECORD,
                    payload: id,
                });
            } catch (error) {
                console.error('Error deleting image record:', error);
                throw error;
            }
        },
        [state.imageRecords]
    );

    // Load more images (lazy loading)
    const loadMoreImages = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMoreImages) return;

        dispatch({
            type: IMAGE_ACTIONS.SET_LOADING_STATE,
            payload: { isLoadingMore: true },
        });

        try {
            const nextPage = state.currentPage + 1;
            const moreRecords = await loadImageRecordsPageByProject(
                curProjectId,
                nextPage,
                MAX_RECORDS
            );

            if (moreRecords.length === 0) {
                dispatch({
                    type: IMAGE_ACTIONS.SET_PAGINATION,
                    payload: { hasMoreImages: false, isLoadingMore: false },
                });
                return;
            }

            // Convert DB objects back to ImageRecord instances
            const records = moreRecords.map((data) => {
                const record = ImageRecord.fromDatabase(data);
                // Add selectedImageIdx in memory (default to first image)
                record.selectedImageIdx = 0;
                return record;
            });

            // Sort records by createdAt in descending order
            records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Append to existing records
            dispatch({
                type: IMAGE_ACTIONS.APPEND_RECORDS,
                payload: records,
            });

            // Check if we have more images to load
            const totalLoaded = nextPage * MAX_RECORDS;
            dispatch({
                type: IMAGE_ACTIONS.SET_PAGINATION,
                payload: {
                    currentPage: nextPage,
                    hasMoreImages: totalLoaded < state.totalImages,
                    isLoadingMore: false,
                },
            });
        } catch (error) {
            console.error('Failed to load more images:', error);
            dispatch({
                type: IMAGE_ACTIONS.SET_LOADING_STATE,
                payload: { isLoadingMore: false },
            });
        }
    }, [
        state.currentPage,
        state.hasMoreImages,
        state.isLoadingMore,
        state.totalImages,
        state.imageRecords,
        curProjectId,
    ]);

    const executeImageGeneration = useCallback(
        async (generationId, isTextOnly, prompt, selectedImages, numberOfImages, size) => {
            try {
                let result;

                if (isTextOnly) {
                    // Text-to-image generation
                    result = await apiClient.generateImage({
                        prompt: prompt.trim(),
                        n: numberOfImages,
                        size: size,
                        asset_type: 'element_images',
                    });
                } else {
                    // Image extension
                    result = await apiClient.extendImage({
                        images: selectedImages,
                        prompt: prompt.trim(),
                        n: numberOfImages,
                        size: size,
                    });
                }

                if (!result.success) {
                    dispatch({
                        type: IMAGE_ACTIONS.GENERATION_ERROR,
                        payload: { id: generationId, error: result.error || 'Unknown error' },
                    });
                    console.error('Image generation failed:', result.error);
                    return;
                }

                // Collect all generated image URLs
                const allImageUrls = result.data?.images.map((img) => img.imageUrl);
                const generationSources = {
                    type: isTextOnly ? 'text-to-image' : 'image-extension',
                    prompt: prompt.trim(),
                    referenceImages: isTextOnly ? null : selectedImages,
                    size: size,
                    revisedPrompt: result.data?.images[0]?.revisedPrompt, // Use first image's revised prompt
                };

                // Add all images as one record to both state and database
                await addImages(allImageUrls, generationSources);

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
        },
        [addImages]
    );

    const startImageGeneration = useCallback(
        ({ prompt, selectedImages = [], numberOfImages = 1, size }) => {
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
                referenceImages: isTextOnly ? null : selectedImages,
                numberOfImages,
                size,
                status: 'generating',
                startTime: Date.now(),
            };

            dispatch({
                type: IMAGE_ACTIONS.START_GENERATION,
                payload: pendingItem,
            });

            // Trigger async execution in background
            executeImageGeneration(
                generationId,
                isTextOnly,
                prompt,
                selectedImages,
                numberOfImages,
                size
            );

            // Return immediately with generationId
            return { generationId };
        },
        [executeImageGeneration]
    );

    const executeInpainting = useCallback(
        async (generationId, inputImageUrl, maskImage, prompt, numberOfImages, size) => {
            try {
                // Call inpainting API
                const result = await apiClient.inpaintImage({
                    image_gcs_url: inputImageUrl,
                    mask: maskImage,
                    prompt: prompt.trim(),
                    n: numberOfImages,
                    size: size,
                    asset_type: 'element_images',
                });

                if (!result.success) {
                    dispatch({
                        type: IMAGE_ACTIONS.GENERATION_ERROR,
                        payload: { id: generationId, error: result.error || 'Unknown error' },
                    });
                    console.error('Inpainting generation failed:', result.error);
                    return;
                }

                // Collect all generated image URLs
                const allImageUrls = result.data?.images.map((img) => img.imageUrl);
                const generationSources = {
                    type: 'inpainting',
                    prompt: prompt.trim(),
                    referenceImages: [{ url: inputImageUrl }],
                    mask: maskImage,
                    size: size,
                    revisedPrompt: result.data?.images[0]?.revisedPrompt, // Use first image's revised prompt
                };

                // Add all images as one record to both state and database
                await addImages(allImageUrls, generationSources);

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
        },
        [addImages]
    );

    const startInpaintingGeneration = useCallback(
        (inputImageUrl, maskImage, prompt, numberOfImages = 3, size) => {
            if (!inputImageUrl || !maskImage || !prompt.trim()) {
                throw new Error('Image, mask, and prompt are required');
            }

            const generationId = `inpaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Add to pending state immediately
            const pendingItem = {
                id: generationId,
                type: 'inpainting',
                prompt: prompt.trim(),
                referenceImages: [{ url: inputImageUrl }],
                mask: maskImage,
                numberOfImages,
                size,
                status: 'generating',
                startTime: Date.now(),
            };

            dispatch({
                type: IMAGE_ACTIONS.START_GENERATION,
                payload: pendingItem,
            });

            // Trigger async execution in background
            executeInpainting(generationId, inputImageUrl, maskImage, prompt, numberOfImages, size);

            // Return immediately with generationId
            return { generationId };
        },
        [executeInpainting]
    );

    // Share image to favorites (disabled if current project is default)
    const bookmarkImage = useCallback(async (imageId) => {
        if (isDefaultProject) {
            throw new Error('Cannot share from default project');
        }

        try {
            // Create bookmark copy in default project
            // Note, if the source image already has a
            // bookmark record, it will directly return
            // the existing bookmark record
            const bookmark = await createBookmarkImage(imageId);

            // Update state to reflect the change
            dispatch({
                type: IMAGE_ACTIONS.SET_RECORDS,
                payload: state.imageRecords.map(record => 
                    record.id === imageId 
                        ? { ...record, favoriteId: bookmark.id }
                        : record
                )
            });

            console.log(`Image ${imageId} shared to favorites as bookmark ${bookmark.id}`);
        } catch (error) {
            console.error('Failed to share image to favorites:', error);
            throw error;
        }
    }, [isDefaultProject, state.imageRecords]);

    // Unshare image from favorites  
    const unbookmarkImage = useCallback(async (imageId) => {
        if (isDefaultProject) {
            throw new Error('Cannot unshare from default project');
        }

        try {
            // Find the original image
            await removeBookmarkImage(imageId)

            // Update state to reflect the change
            dispatch({
                type: IMAGE_ACTIONS.SET_RECORDS,
                payload: state.imageRecords.map(record => 
                    record.id === imageId 
                        ? { ...record, favoriteId: null }
                        : record
                )
            });

            console.log(`Image ${imageId} unshared from favorites`);
        } catch (error) {
            console.error('Failed to unshare image from favorites:', error);
            throw error;
        }
    }, [isDefaultProject, state.imageRecords]);

    // Import image from default project to current project
    const importImage = useCallback(async (imageId) => {
        if (isDefaultProject) {
            throw new Error('Cannot import within default project');
        }

        try {
            // Find the image in default project images
            const clonedImage = await importImageFromDefault(imageId, curProjectId)

            // Add to current project state
            dispatch({
                type: IMAGE_ACTIONS.ADD_RECORD,
                payload: clonedImage,
            });

            console.log(`Image ${imageId} imported to current project as ${clonedImage.id}`);
            return clonedImage;
        } catch (error) {
            console.error('Failed to import image to current project:', error);
            throw error;
        }
    }, [isDefaultProject, defaultProjectImages, curProjectId]);

    // Check if sharing is available (not in default project)
    const canShareImages = useCallback(() => {
        return !isDefaultProject;
    }, [isDefaultProject]);

    const contextValue = useMemo(
        () => ({
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
            startImageGeneration,
            startInpaintingGeneration,

            // Record management
            removeImageRecord,
            updateSelectedImage,

            // Default project images
            defaultProjectImages,

            // Sharing functions
            bookmarkImage,
            unbookmarkImage,
            importImage,
            canShareImages: canShareImages(),
        }),
        [state, defaultProjectImages, bookmarkImage, unbookmarkImage, importImage, canShareImages]
    );

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

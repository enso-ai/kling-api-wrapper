import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const MODAL_ACTIONS = {
    OPEN_IMAGE_GEN_MODAL: 'OPEN_IMAGE_GEN_MODAL',
    CLOSE_IMAGE_GEN_MODAL: 'CLOSE_IMAGE_GEN_MODAL',
};

// Initial state
const initialState = {
    isImageGenModalOpen: false,
    imageGenModalPrefillData: null,
};

// Reducer
function modalReducer(state, action) {
    switch (action.type) {
        case MODAL_ACTIONS.OPEN_IMAGE_GEN_MODAL:
            return {
                ...state,
                isImageGenModalOpen: true,
                imageGenModalPrefillData: action.payload,
            };

        case MODAL_ACTIONS.CLOSE_IMAGE_GEN_MODAL:
            return {
                ...state,
                isImageGenModalOpen: false,
                imageGenModalPrefillData: null,
            };

        default:
            return state;
    }
}

// Context
const ImageGenModalContext = createContext();

// Provider component
export const ImageGenModalContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(modalReducer, initialState);

    /**
     * Opens the image generation modal with optional prefill data
     * @param {Object} prefillData - Optional data to prefill the modal
     * @param {string} prefillData.initialTab - Which tab to open ('prompt' | 'inpainting')
     * @param {string} prefillData.prompt - Text prompt to prefill
     * @param {Array} prefillData.srcImages - Array of source images [{url: string} | {base64: string}]
     * @param {string} prefillData.mask - Base64 mask data for inpainting (optional)
     * @param {string} prefillData.sourceRecordId - ID of the original image record (for reference)
     */
    const openImageGenModal = useCallback((prefillData = null) => {
        dispatch({
            type: MODAL_ACTIONS.OPEN_IMAGE_GEN_MODAL,
            payload: prefillData
        });
    }, []);

    const closeImageGenModal = useCallback(() => {
        dispatch({
            type: MODAL_ACTIONS.CLOSE_IMAGE_GEN_MODAL
        });
    }, []);

    const contextValue = {
        // Modal state
        isImageGenModalOpen: state.isImageGenModalOpen,
        imageGenModalPrefillData: state.imageGenModalPrefillData,
        
        // Modal management
        openImageGenModal,
        closeImageGenModal,
    };

    return (
        <ImageGenModalContext.Provider value={contextValue}>
            {children}
        </ImageGenModalContext.Provider>
    );
};

// Hook for consuming components
export const useImageGenModalContext = () => {
    const context = useContext(ImageGenModalContext);
    if (!context) {
        throw new Error('useImageGenModalContext must be used within an ImageGenModalContextProvider');
    }
    return context;
};

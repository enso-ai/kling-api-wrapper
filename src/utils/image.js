/**
 * Converts an image file to the Base64 format required by Video Engine API
 * @param {string} dataUrl - The data URL string from FileReader (e.target.result)
 * @returns {string} - Clean Base64 string without the data URL prefix
 */
export const convertImageToBase64 = (dataUrl) => {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
        console.error('Invalid data URL format');
        return null;
    }

    // Extract the Base64 string without the prefix
    // Format is typically: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...
    const base64String = dataUrl.split(',')[1];

    if (!base64String) {
        console.error('Failed to extract Base64 string from data URL');
        return null;
    }

    return base64String;
}

/**
 * Extract URL from srcImage object (handles both url and base64)
 * @param {Object} srcImage - Source image object with url or base64 property
 * @returns {string|null} - The URL or base64 string, or null if not found
 */
export const getSrcImageUrl = (srcImage) => {
    if (!srcImage) return null;
    return srcImage.url || srcImage.base64 || null;
};

/**
 * Check if srcImages array has content
 * @param {Array} srcImages - Array of source image objects
 * @returns {boolean} - True if array exists and has content
 */
export const hasSrcImages = (srcImages) => {
    return srcImages && Array.isArray(srcImages) && srcImages.length > 0;
};

/**
 * Convert URL array to srcImages format (for backward compatibility)
 * @param {Array<string>} urls - Array of URL strings
 * @returns {Array<Object>} - Array of {url: string} objects
 */
export const urlsToSrcImages = (urls) => {
    if (!urls || !Array.isArray(urls)) return [];
    return urls.map(url => ({url}));
};

/**
 * Extract all URLs from srcImages array
 * @param {Array} srcImages - Array of source image objects
 * @returns {Array<string>} - Array of URL/base64 strings
 */
export const srcImagesToUrls = (srcImages) => {
    if (!hasSrcImages(srcImages)) return [];
    return srcImages.map(getSrcImageUrl).filter(Boolean);
};

/**
 * Get the first source image URL from srcImages array
 * @param {Array} srcImages - Array of source image objects
 * @returns {string|null} - First URL/base64 string or null
 */
export const getFirstSrcImageUrl = (srcImages) => {
    if (!hasSrcImages(srcImages)) return null;
    return getSrcImageUrl(srcImages[0]);
};

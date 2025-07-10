/**
 * Downloads an image from a URL with a formatted filename
 * @param {string} imageUrl - The URL of the image to download
 * @param {number} index - The index of the image (for multiple images)
 * @returns {Promise<void>}
 */
export const downloadImage = async (imageUrl, index = 0) => {
    try {
        // Generate timestamp for filename
        const now = new Date();
        const timestamp = now
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}Z$/, '')
            .replace('T', '_');

        const filename = `image_${timestamp}_${index + 1}.png`;

        // Fetch the image
        const response = await fetch(imageUrl, {
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Convert to blob
        const blob = await response.blob();

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        console.log(`Image downloaded successfully: ${filename}`);
    } catch (error) {
        console.error('Failed to download image:', error);
        alert('Failed to download image. Please try again.');
    }
};

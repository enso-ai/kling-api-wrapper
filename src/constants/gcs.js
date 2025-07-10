// GCS configuration constants
export const ASSET_TYPE_IMAGES = 'IMAGES';
export const ASSSET_TYPE_VIDEOS = 'VIDEOS';

export const GCS_CONFIG = {
    BUCKET_NAME: 'enso-playground-storage',
    BASE_URL: 'https://storage.googleapis.com',
    ASSET_CONFIG: {
        IMAGES: {
            FOLDER: 'images',
            CONTENT_TYPES: 'image/png',
            EXTENSION: '.png',
        },
        VIDEOS: {
            FOLDER: 'videos',
            CONTENT_TYPES: 'video/mp4',
            EXTENSION: '.mp4',
        },
    },
    RETRY_CONFIG: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000, // 1 second
    },
};


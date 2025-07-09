import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import { GCS_CONFIG } from '@/constants/gcs.js';

// Initialize Google Cloud Storage client
const storage = new Storage();
const bucket = storage.bucket(GCS_CONFIG.BUCKET_NAME);

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate GCS file path following the project structure
 * @param {string} folder - Folder name (generated_img or clips)
 * @param {string} fileId - Unique file ID
 * @param {string} extension - File extension (.png, .mp4)
 * @returns {string} GCS file path
 */
export function generateGCSPath(folder, fileId, extension) {
    return `${folder}/${fileId}${extension}`;
}

/**
 * Generate public GCS URL
 * @param {string} filePath - GCS file path
 * @returns {string} Public URL
 */
export function getPublicGCSUrl(filePath) {
    return `${GCS_CONFIG.BASE_URL}/${GCS_CONFIG.BUCKET_NAME}/${filePath}`;
}

/**
 * Extract GCS file path from public URL
 * @param {string} publicUrl - Public GCS URL
 * @returns {string|null} GCS file path or null if invalid URL
 */
export function extractGCSPath(publicUrl) {
    try {
        const baseUrl = `${GCS_CONFIG.BASE_URL}/${GCS_CONFIG.BUCKET_NAME}/`;
        if (!publicUrl.startsWith(baseUrl)) {
            return null;
        }
        return publicUrl.substring(baseUrl.length);
    } catch (error) {
        console.error('Error extracting GCS path:', error);
        return null;
    }
}


/**
 * Upload base64 data to GCS with retry logic
 * @param {string} base64Data - Base64 encoded data (without data URL prefix)
 * @param {string} assetType - Asset type key from GCS_CONFIG.FOLDERS
 * @returns {Promise<{success: boolean, gcsUrl?: string, error?: string}>}
 */
export async function uploadBase64ToGCS(base64Data, assetType) {
    // Validate asset type
    if (!assetType || !GCS_CONFIG.ASSET_CONFIG[assetType]) {
        return {
            success: false,
            error: `Invalid asset type: ${assetType}. Valid types: IMAGES, VIDEOS`,
        };
    }

    const fileId = randomUUID();
    const assetConfig = GCS_CONFIG.ASSET_CONFIG[assetType];
    // Determine content type and file extension based on asset type

    const filePath = generateGCSPath(assetConfig.FOLDER, fileId, assetConfig.EXTENSION);
    const file = bucket.file(filePath);

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    for (let attempt = 1; attempt <= GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES; attempt++) {
        try {
            console.log(
                `Uploading base64 to GCS (attempt ${attempt}/${GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES}): ${filePath}`
            );

            await file.save(buffer, {
                metadata: {
                    contentType: assetConfig.CONTENT_TYPE,
                },
                validation: 'md5',
            });

            const publicUrl = getPublicGCSUrl(filePath);
            console.log(`Successfully uploaded to GCS: ${publicUrl}`);

            return {
                success: true,
                gcsUrl: publicUrl,
                fileId: fileId,
            };
        } catch (error) {
            console.error(`GCS upload attempt ${attempt} failed:`, error);

            if (attempt === GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES) {
                return {
                    success: false,
                    error: `Failed to upload to GCS after ${GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES} attempts: ${error.message}`,
                };
            }

            // Wait before retry
            await sleep(GCS_CONFIG.RETRY_CONFIG.RETRY_DELAY * attempt);
        }
    }
}

/**
 * Download content from URL and upload to GCS with retry logic
 * @param {string} url - Source URL to download from
 * @param {string} assetType - Asset type key from GCS_CONFIG.FOLDERS
 * @returns {Promise<{success: boolean, gcsUrl?: string, error?: string}>}
 */
export async function downloadAndUploadToGCS(url, assetType) {
    // Validate asset type
    if (!assetType || !GCS_CONFIG.ASSET_CONFIG[assetType]) {
        return {
            success: false,
            error: `Invalid asset type: ${assetType}. Valid types: ${Object.keys(
                GCS_CONFIG.ASSET_CONFIG
            ).join(', ')}`,
        };
    }

    const fileId = randomUUID();
    const assetConfig = GCS_CONFIG.ASSET_CONFIG[assetType];

    const filePath = generateGCSPath(assetConfig.FOLDER, fileId, assetConfig.EXTENSION);
    const file = bucket.file(filePath);

    for (let attempt = 1; attempt <= GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES; attempt++) {
        try {
            console.log(
                `Downloading and uploading to GCS (attempt ${attempt}/${GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES}): ${url} -> ${filePath}`
            );

            // Download from source URL
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    `Failed to download from ${url}: ${response.status} ${response.statusText}`
                );
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload to GCS
            await file.save(buffer, {
                metadata: {
                    contentType: assetConfig.CONTENT_TYPE,
                },
                validation: 'md5',
            });

            const publicUrl = getPublicGCSUrl(filePath);
            console.log(`Successfully downloaded and uploaded to GCS: ${publicUrl}`);

            return {
                success: true,
                gcsUrl: publicUrl,
                fileId: fileId,
            };
        } catch (error) {
            console.error(`Download and upload attempt ${attempt} failed:`, error);

            if (attempt === GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES) {
                return {
                    success: false,
                    error: `Failed to download and upload to GCS after ${GCS_CONFIG.RETRY_CONFIG.MAX_RETRIES} attempts: ${error.message}`,
                };
            }

            // Wait before retry
            await sleep(GCS_CONFIG.RETRY_CONFIG.RETRY_DELAY * attempt);
        }
    }
}

/**
 * Create a Signed URL from GCS bucket
 * @param {string} assetType - Asset type (ELEMENT_IMAGES, GENERATED_IMAGES, CLIPS)
 * @returns {Promise<{success: boolean, signed_url?: string, public_url?: string, image_id?: string, error?: string}>}
 */
export async function createSignedURL(assetType) {
    try {
        if (!assetType) {
            return {
                success: false,
                error: 'Missing asset_type parameter'
            };
        }

        // Validate asset type and get folder name
        let folderName;
        try {
            folderName = getAssetFolder(assetType);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }

        // Generate unique image ID
        const imageId = randomUUID();

        // Create GCS file path following the pattern: {folder}/{image_id}.png
        const fileName = generateGCSPath(folderName, imageId, GCS_CONFIG.FILE_EXTENSIONS.IMAGE);
        
        // Generate signed URL for PUT operation (15 minutes expiration)
        const file = bucket.file(fileName);
        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: GCS_CONFIG.CONTENT_TYPES.IMAGE,
        });
        
        // Generate public URL
        const publicUrl = getPublicGCSUrl(fileName);
        
        console.log(`Generated signed URL for ${fileName}`);
        
        return {
            success: true,
            signed_url: signedUrl,
            public_url: publicUrl,
            image_id: imageId
        };
        
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return {
            success: false,
            error: `Failed to generate signed URL: ${error.message}`
        };
    }
}

/**
 * Delete multiple GCS assets in batch
 * @param {string[]} gcsUrls - Array of GCS URLs to delete
 * @returns {Promise<{success: boolean, message?: string, results?: Array, error?: string}>}
 */
export async function deleteGCSAssets(gcsUrls) {
    try {
        if (!Array.isArray(gcsUrls) || gcsUrls.length === 0) {
            return {
                success: false,
                error: 'URLs must be provided as a non-empty array'
            };
        }

        console.log(`Starting batch deletion of ${gcsUrls.length} GCS assets`);

        const deletionResults = [];
        const errors = [];

        // Process each URL
        for (const gcsUrl of gcsUrls) {
            const filePath = extractGCSPath(gcsUrl);
            
            if (!filePath) {
                console.warn(`Invalid GCS URL format: ${gcsUrl}`);
                continue;
            }

            try {
                const file = bucket.file(filePath);
                await file.delete();
                
                console.log(`Successfully deleted GCS asset: ${gcsUrl}`);
                deletionResults.push({ url: gcsUrl, success: true });
                
            } catch (error) {
                // 404 means already deleted - treat as success
                if (error.code === 404 || error.message.includes('No such object')) {
                    console.log(`GCS asset already deleted: ${gcsUrl}`);
                    deletionResults.push({ url: gcsUrl, success: true, note: 'already_deleted' });
                } else {
                    const errorMsg = `Failed to delete ${gcsUrl}: ${error.message}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                    deletionResults.push({ url: gcsUrl, success: false, error: error.message });
                }
            }
        }

        // If any real errors occurred, return error response
        if (errors.length > 0) {
            return {
                success: false,
                error: 'Failed to delete some GCS assets',
                details: errors,
                results: deletionResults
            };
        }

        return {
            success: true,
            message: `Successfully deleted ${gcsUrls.length} GCS assets`,
            results: deletionResults
        };

    } catch (error) {
        console.error('Error in GCS batch deletion:', error);
        return {
            success: false,
            error: `Internal error: ${error.message}`
        };
    }
}

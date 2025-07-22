import { IMAGE_SIZE_PORTRAIT } from '@/constants/image';
class ImageRecord {
    constructor(formData = {}) {
        // Core database fields
        this.id = crypto.randomUUID(); // Generate a unique ID
        this.createdAt = new Date().toLocaleString();
        this.timestamp = Date.now(); // For sorting purposes

        // Image-specific fields
        this.modelName = formData.modelName || null;
        // new srcImages field can contains two types of data (urls or base64)
        // [{url: {{url}} }, {base64: {{base64string}} }]
        this.srcImages = formData.srcImages || [];
        this.mask = formData.mask || null; // Base64 data
        this.prompt = formData.prompt || null;
        this.size = formData.size || IMAGE_SIZE_PORTRAIT; // Image size specification (e.g., "1024x1536")
        this.imageUrls = formData.imageUrls || []; // Array of generated image URLs
        this.projectId = formData.projectId || '00000000-0000-0000-0000-000000000001'; // Default project ID
    }

    // Convert to the format expected by components
    toPayload() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            modelName: this.modelName,
            srcImages: this.srcImages,
            mask: this.mask,
            prompt: this.prompt,
            size: this.size,
            imageUrls: this.imageUrls,
        };
    }

    // Serialize for database storage
    toDatabase() {
        return {
            id: this.id, // Primary key
            createdAt: this.createdAt,
            timestamp: this.timestamp,
            modelName: this.modelName,
            srcImages: this.srcImages,
            mask: this.mask,
            prompt: this.prompt,
            size: this.size,
            imageUrls: this.imageUrls,
            projectId: this.projectId, // Project association
        };
    }

    // Static method to recreate from database
    static fromDatabase(data) {
        const record = new ImageRecord();
        record.id = data.id;
        record.createdAt = data.createdAt;
        record.timestamp = data.timestamp || new Date(data.createdAt).getTime();
        record.modelName = data.modelName;
        // deprecated
        if (data.srcImageUrls) {
            record.srcImages = data.srcImageUrls.map((url) => ({ url }));
        } else {
            record.srcImages = data.srcImages || [];
        }
        record.mask = data.mask;
        record.prompt = data.prompt;
        record.size = data.size;
        record.imageUrls = data.imageUrls || [];
        record.projectId = data.projectId || '00000000-0000-0000-0000-000000000001'; // Default project for old records
        return record;
    }
}

export default ImageRecord;

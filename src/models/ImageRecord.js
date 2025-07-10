class ImageRecord {
    constructor(formData = {}) {
        // Core database fields
        this.id = crypto.randomUUID(); // Generate a unique ID
        this.createdAt = new Date().toLocaleString();
        this.timestamp = Date.now(); // For sorting purposes
        
        // Image-specific fields
        this.modelName = formData.modelName || null;
        // this is deprecated
        this.srcImageUrls = formData.srcImageUrls || []; // Array of source image URLs
        // new srcImages field can contains two typw of data (urls or base64)
        // [{url: {{url}} }, {base64: {{base64string}} }]
        this.srcImages = formData.srcImages || []
        this.mask = formData.mask || null; // Base64 data
        this.prompt = formData.prompt || null;
        this.imageUrls = formData.imageUrls || []; // Array of generated image URLs
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
            imageUrls: this.imageUrls,
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
            record.srcImages = data.srcImageUrls.map(url => ({url}));
        } else {
            record.srcImages = data.srcImages || [];
        }
        record.mask = data.mask;
        record.prompt = data.prompt;
        record.imageUrls = data.imageUrls || [];
        return record;
    }
}

export default ImageRecord;

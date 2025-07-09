class ImageRecord {
    constructor(formData = {}) {
        // Core database fields
        this.id = crypto.randomUUID(); // Generate a unique ID
        this.createdAt = new Date().toLocaleString();
        this.timestamp = Date.now(); // For sorting purposes
        
        // Image-specific fields
        this.modelName = formData.modelName || null;
        this.srcImageUrls = formData.srcImageUrls || []; // Array of source image URLs
        this.mask = formData.mask || null; // Base64 data
        this.prompt = formData.prompt || null;
        this.imageUrl = formData.imageUrl || null; // Generated image URL
    }

    // Convert to the format expected by components
    toPayload() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            modelName: this.modelName,
            srcImageUrls: this.srcImageUrls,
            mask: this.mask,
            prompt: this.prompt,
            imageUrl: this.imageUrl,
        };
    }

    // Serialize for database storage
    toDatabase() {
        return {
            id: this.id, // Primary key
            createdAt: this.createdAt,
            timestamp: this.timestamp,
            modelName: this.modelName,
            srcImageUrls: this.srcImageUrls,
            mask: this.mask,
            prompt: this.prompt,
            imageUrl: this.imageUrl,
        };
    }

    // Static method to recreate from database
    static fromDatabase(data) {
        const record = new ImageRecord();
        record.id = data.id;
        record.createdAt = data.createdAt;
        record.timestamp = data.timestamp || new Date(data.createdAt).getTime();
        record.modelName = data.modelName;
        record.srcImageUrls = data.srcImageUrls || [];
        record.mask = data.mask;
        record.prompt = data.prompt;
        record.imageUrl = data.imageUrl;
        return record;
    }
}

export default ImageRecord;

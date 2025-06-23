class ExtensionRecord {
    constructor(videoId, extensionOptions = {}) {
        // Store the original video ID and extension parameters
        this.originalVideoId = videoId;
        this.extensionOptions = extensionOptions;

        // Initialize with pending status
        this.taskId = null;
        this.videoId = null; // Video ID from API response (for future extensions)
        this.status = "pending";
        this.timestamp = Date.now();
        this.createdAt = new Date().toLocaleString();
        this.updatedTimestamp = Date.now();
        this.updatedAt = new Date().toLocaleString();
        this.error = null;
        this.videoUrl = null;
        this.isExtension = true; // Flag to identify this as an extension task
    }

    updateWithTaskInfo(apiResponse) {
        this.taskId = apiResponse.task_id;
        this.status = apiResponse.task_status;
        this.updatedTimestamp = Date.now();
        this.updatedAt = new Date().toLocaleString();
    }

    updateWithTaskResult(taskData) {
        this.status = taskData.data.task_status;
        if (
            taskData.data.task_status === "succeed" &&
            taskData.data.task_result?.videos?.length > 0
        ) {
            this.videoUrl = taskData.data.task_result.videos[0].url;
            this.videoId = taskData.data.task_result.videos[0].id; // Extract video ID for future extensions
        }

        if (taskData.data.task_status === "failed") {
            this.error = taskData.data.task_status_msg || "Unknown error";
        }

        this.updatedTimestamp = Date.now();
        this.updatedAt = new Date().toLocaleString();
    }

    setError(error) {
        this.status = "failed";
        this.error = error.message || "Unknown error";
        this.updatedAt = new Date().toLocaleString();
    }

    // Convert to the format expected by components
    toPayload() {
        return {
            taskId: this.taskId,
            videoId: this.videoId,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            videoUrl: this.videoUrl,
            error: this.error,
            isExtension: this.isExtension,
            originalVideoId: this.originalVideoId,
        };
    }

    // Serialize for database storage
    toDatabase() {
        return {
            id: this.taskId, // Primary key (backward compatibility)
            taskId: this.taskId, // Explicit task ID field
            videoId: this.videoId, // Video ID from extension result
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            timestamp: this.timestamp,
            updatedTimestamp: this.updatedTimestamp,
            error: this.error,
            videoUrl: this.videoUrl,
            isExtension: this.isExtension,
            originalVideoId: this.originalVideoId,
            extensionOptions: this.extensionOptions,
        };
    }

    // Static method to recreate from database
    static fromDatabase(data) {
        const record = new ExtensionRecord(data.originalVideoId, data.extensionOptions);
        record.taskId = data.taskId || data.id; // Use explicit taskId if available, fallback to id
        record.videoId = data.videoId || null; // Video ID for future extensions
        record.status = data.status;
        record.createdAt = data.createdAt;
        record.updatedAt = data.updatedAt;
        record.timestamp = data.timestamp || new Date(data.createdAt);
        record.updatedTimestamp = data.updatedTimestamp;
        record.error = data.error;
        record.videoUrl = data.videoUrl;
        record.isExtension = data.isExtension;
        return record;
    }
}

export default ExtensionRecord;

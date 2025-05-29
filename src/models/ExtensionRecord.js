class ExtensionRecord {
    constructor(videoId, extensionOptions = {}) {
        // Store the original video ID and extension parameters
        this.originalVideoId = videoId;
        this.extensionOptions = extensionOptions;

        // Initialize with pending status
        this.taskId = null;
        this.status = "pending";
        this.createdAt = new Date().toLocaleString();
        this.updatedAt = new Date().toLocaleString();
        this.error = null;
        this.videoUrl = null;
        this.isExtension = true; // Flag to identify this as an extension task
    }

    updateWithTaskInfo(apiResponse) {
        this.taskId = apiResponse.task_id;
        this.status = apiResponse.task_status;
        this.updatedAt = new Date().toLocaleString();
    }

    updateWithTaskResult(taskData) {
        this.status = taskData.data.task_status;
        if (
            taskData.data.task_status === "succeed" &&
            taskData.data.task_result?.videos?.length > 0
        ) {
            this.videoUrl = taskData.data.task_result.videos[0].url;
        }

        if (taskData.data.task_status === "failed") {
            this.error = taskData.data.task_status_msg || "Unknown error";
        }

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
            id: this.taskId, // Use taskId as primary key
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
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
        record.taskId = data.id; // Convert DB id to taskId
        record.status = data.status;
        record.createdAt = data.createdAt;
        record.updatedAt = data.updatedAt;
        record.error = data.error;
        record.videoUrl = data.videoUrl;
        record.isExtension = data.isExtension;
        return record;
    }
}

export default ExtensionRecord;

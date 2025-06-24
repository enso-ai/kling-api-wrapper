import VideoOptions from "./VideoOptions";

class VideoRecord {
    constructor(formData = {}) {
        // Store the input parameters
        this.options = new VideoOptions(
            formData.modelName,
            formData.mode,
            formData.duration,
            formData.image,
            formData.imageTail,
            formData.prompt,
            formData.negativePrompt,
            formData.cfgScale,
            formData.staticMask,
            formData.dynamicMasks,
            formData.cameraControl,
            formData.callbackUrl,
            formData.externalTaskId
        );

        // Initialize with pending status
        this.id = crypto.randomUUID(); // Generate a unique task ID
        this.taskId = null; // By default, taskId is null until set by API response
        this.videoId = null; // Video ID from API response for extensions
        this.status = "pending";
        this.task_msg = "";
        this.timestamp = Date.now();
        this.createdAt = new Date().toLocaleString();
        this.updatedTimestamp = Date.now();
        this.updatedAt = new Date().toLocaleString();
        this.error = null;
        this.videoUrl = null;
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
            this.videoId = taskData.data.task_result.videos[0].id; // Extract video ID for extensions
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
    }

    // Convert to the format expected by components
    toPayload() {
        return {
            id: this.id, // Unique ID for the video record
            taskId: this.taskId,
            videoId: this.videoId,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            videoUrl: this.videoUrl,
            error: this.error,
        };
    }

    // Serialize for database storage
    toDatabase() {
        return {
            id: this.id, // Primary key
            taskId: this.taskId, // Explicit task ID field
            videoId: this.videoId, // Video ID for extensions
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            timestamp: this.timestamp,
            updatedTimestamp: this.updatedTimestamp,
            error: this.error,
            videoUrl: this.videoUrl,
            options: this.options, // This contains the potentially large image data
        };
    }

    // Static method to recreate from database
    static fromDatabase(data) {
        const record = new VideoRecord();
        // Handle backward compatibility for old records
        record.id = data.id;
        record.taskId = data.taskId || null; // allow it to be null
        record.videoId = data.videoId || null; // Video ID for extensions (new field)
        record.status = data.status;
        record.createdAt = data.createdAt;
        record.updatedAt = data.updatedAt;
        record.timestamp = data.timestamp || new Date(data.createdAt);
        record.updatedTimestamp = data.updatedTimestamp;
        record.error = data.error;
        record.videoUrl = data.videoUrl;
        record.options = data.options;
        return record;
    }
}

export default VideoRecord;

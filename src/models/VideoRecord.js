import VideoOptions from "./VideoOptions";

class VideoRecord {
    constructor(formData) {
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
        this.taskId = null;
        this.status = "pending";
        this.createdAt = new Date();
        this.timestamp = new Date().toLocaleString();
        this.error = null;
        this.videoUrl = null;
    }

    updateWithTaskInfo(apiResponse) {
        this.taskId = apiResponse.task_id;
        this.status = apiResponse.task_status;
        this.timestamp = apiResponse.updated_at || this.timestamp;
    }

    updateWithTaskResult(taskData) {
        this.status = taskData.data.task_status;
        if (
            taskData.data.task_status === "succeed" &&
            taskData.data.task_result?.videos?.length > 0
        ) {
            this.videoUrl = taskData.data.task_result.videos[0].url;
        }

        this.timestamp = new Date().toLocaleString();
    }

    setError(error) {
        this.status = "failed";
        this.error = error.message || "Unknown error";
    }

    // Convert to the format expected by components
    toPayload() {
        return {
            taskId: this.taskId,
            status: this.status,
            createdAt: this.createdAt,
            timestamp: this.timestamp,
            videoUrl: this.videoUrl,
            error: this.error,
        };
    }
}

export default VideoRecord;

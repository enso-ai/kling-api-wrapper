// Client-side utilities for interacting with the Next.js API routes

// Custom error class for Kling API throttling
export class KlingThrottleError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KlingThrottleError';
    }
}

const createKlingApiClient = () => {
    // Create a video from an image
    const createVideo = async (videoOptions) => {
        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(videoOptions.toApiRequest()),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check for throttling error (429 status)
                if (response.status === 429) {
                    throw new KlingThrottleError(data.error || 'Request limit exceeded');
                }
                
                alert(`Error: ${data.error || 'Unknown error'}`);
                throw new Error(`API error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('Error generating video:', error);
            throw error;
        }
    };

    // Gets information about a specific task
    const getTaskById = async (taskId) => {
        try {
            const response = await fetch(`/api/videos/${taskId}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('Error getting task:', error);
            throw error;
        }
    };

    // Polling functionality can remain similar but using the new getTaskById
    const pollTaskUntilComplete = async (taskId, options = {}) => {
        const {
            interval = 5000,
            timeout = 300000, // 5 minutes
            onProgress,
        } = options;

        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkTask = async () => {
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Polling timed out'));
                    return;
                }

                try {
                    const taskData = await getTaskById(taskId);

                    if (onProgress) {
                        onProgress(taskData);
                    }

                    if (taskData.data.task_status === 'succeed') {
                        resolve(taskData.data.task_result);
                        return;
                    } else if (taskData.data.task_status === 'failed') {
                        reject(
                            new Error(
                                `Task failed: ${taskData.data.task_status_msg || 'Unknown error'}`
                            )
                        );
                        return;
                    }

                    // Continue polling
                    setTimeout(checkTask, interval);
                } catch (error) {
                    reject(error);
                }
            };

            checkTask();
        });
    };

    const getAccountInfo = async (startTime = null, endTime = null, resourcePackName = null) => {
        try {
            // Default values: start_time = 30 days ago, end_time = now
            const defaultStartTime = startTime || Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
            const defaultEndTime = endTime || Date.now(); // current time

            const params = new URLSearchParams({
                start_time: defaultStartTime,
                end_time: defaultEndTime,
            });

            if (resourcePackName) {
                params.append('resource_pack_name', resourcePackName);
            }

            const response = await fetch(`/api/account?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('Error getting account info:', error);
            throw error;
        }
    };

    /**
     * Creates a video extension task for an existing video
     * @param {string} videoId - The ID of the video to extend (required)
     * @param {Object} extensionOptions - Extension configuration options (optional)
     * @param {string} [extensionOptions.prompt] - Text prompt to guide the extension (max 2500 characters)
     * @param {string} [extensionOptions.negative_prompt] - Negative text prompt to avoid certain content (max 2500 characters)
     * @param {number} [extensionOptions.cfg_scale] - Flexibility in video generation, range [0, 1], default: 0.5
     * @param {string} [extensionOptions.callback_url] - Webhook URL for task status notifications
     * @returns {Promise<Object>} Task creation response with task_id and initial status
     */
    const extendVideo = async (videoId, extensionOptions = {}) => {
        try {
            const response = await fetch(`/api/videos/extension/${videoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(extensionOptions),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Error: ${data.error || 'Unknown error'}`);
                throw new Error(`API error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('Error extending video:', error);
            throw error;
        }
    };

    /**
     * Gets information about a specific video extension task
     * @param {string} taskId - The extension task ID to query (required)
     * @param {string} videoId - The original video ID (required for route path)
     * @returns {Promise<Object>} Extension task status and details
     */
    const getExtensionTaskById = async (taskId, videoId) => {
        try {
            const response = await fetch(`/api/videos/extension/${videoId}?taskId=${taskId}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('Error getting extension task:', error);
            throw error;
        }
    };

    /**
     * Polls a video extension task until completion with progress callbacks
     * @param {string} taskId - The extension task ID to poll (required)
     * @param {string} videoId - The original video ID (required)
     * @param {Object} options - Polling configuration options (optional)
     * @param {number} [options.interval=5000] - Polling interval in milliseconds
     * @param {number} [options.timeout=300000] - Maximum polling time in milliseconds (5 minutes)
     * @param {Function} [options.onProgress] - Callback function for progress updates
     * @returns {Promise<Object>} Final task result when completed successfully
     */
    const pollExtensionTaskUntilComplete = async (taskId, videoId, options = {}) => {
        const {
            interval = 5000,
            timeout = 300000, // 5 minutes
            onProgress,
        } = options;

        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkTask = async () => {
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Extension task polling timed out'));
                    return;
                }

                try {
                    const taskData = await getExtensionTaskById(taskId, videoId);

                    if (onProgress) {
                        onProgress(taskData);
                    }

                    if (taskData.data.task_status === 'succeed') {
                        resolve(taskData.data.task_result);
                        return;
                    } else if (taskData.data.task_status === 'failed') {
                        reject(
                            new Error(
                                `Extension task failed: ${taskData.data.task_status_msg || 'Unknown error'}`
                            )
                        );
                        return;
                    }

                    // Continue polling
                    setTimeout(checkTask, interval);
                } catch (error) {
                    reject(error);
                }
            };

            checkTask();
        });
    };

    const getIAPAuthInfo = async () => {
        try {
            const response = await fetch('/api/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting IAP auth info:', error);
            return null;
        }
    }

    // Return the client object with all methods
    return {
        createVideo,
        getTaskById,
        pollTaskUntilComplete,
        getAccountInfo,
        getIAPAuthInfo,
        extendVideo,
        getExtensionTaskById,
        pollExtensionTaskUntilComplete,
    };
};

export const apiClient = createKlingApiClient();

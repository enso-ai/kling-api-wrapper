// Client-side utilities for interacting with the Next.js API routes

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

    // Return the client object with all methods
    return {
        createVideo,
        getTaskById,
        pollTaskUntilComplete,
        getAccountInfo,
    };
};

export const apiClient = createKlingApiClient();

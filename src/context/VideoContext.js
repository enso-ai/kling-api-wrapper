import React, { createContext, useContext, useState, useCallback } from "react";
import { apiClient } from "../service/backend";
import VideoRecord from "../models/VideoRecord";

const VideoContext = createContext();

export function VideoProvider({ children }) {
    const [videoRecords, setVideoRecords] = useState([]);

    // Method to create a new video
    const createVideo = useCallback(async (formData) => {
        // Create a VideoRecord with input data
        const videoRecord = new VideoRecord(formData);

        // Add to state first (with pending status)
        setVideoRecords((prev) => [videoRecord, ...prev]);

        // Make the actual API request
        try {
            const response = await apiClient.createVideo(videoRecord.options);
            // Update the record with task info
            videoRecord.updateWithTaskInfo(response.data);
            setVideoRecords((prev) => [...prev]); // Trigger re-render
        } catch (error) {
            videoRecord.setError(error);
            setVideoRecords((prev) => [...prev]); // Trigger re-render
        }

        return videoRecord;
    }, []);

    // Method to update a video record
    const updateVideoRecord = useCallback(
        async (taskId) => {
        try {
            const taskData = await apiClient.getTaskById(taskId);

            setVideoRecords((prev) =>
            prev.map((record) => {
                if (record.taskId === taskId) {
                    record.updateWithTaskResult(taskData);
                }
                return record;
            })
            );

            // Return the updated record for the component that requested the update
            return videoRecords.find((record) => record.taskId === taskId);
        } catch (error) {
            console.error("Error updating video record:", error);
            return null;
        }
        },
        [videoRecords]
    );

    const value = {
        videoRecords,
        createVideo,
        updateVideoRecord,
    };

    return (
        <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
    );
}

export const useVideoContext = () => useContext(VideoContext);

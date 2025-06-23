import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../service/backend';
import VideoRecord from '../models/VideoRecord';
import VideoOptions from '../models/VideoOptions';
import ExtensionRecord from '../models/ExtensionRecord';
import { db, loadVideoRecordsPage, getTotalVideoRecordsCount } from '../service/database';

const MAX_RECORDS = 20; // Maximum number of records to load per page

const VideoContext = createContext();

export function VideoProvider({ children }) {
    const [videoRecords, setVideoRecords] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);

    // Lazy loading state
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreVideos, setHasMoreVideos] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalVideos, setTotalVideos] = useState(0);

    // Method to fetch account information
    const getAccountInfo = useCallback(async () => {
        try {
            console.log('Fetching account info from API...');
            const response = await fetch('/api/account');
            const data = await response.json();
            if (
                data.data &&
                data.data.resource_pack_subscribe_infos &&
                data.data.resource_pack_subscribe_infos.length > 0
            ) {
                console.log('Account info fetched successfully:', data);
                const info = data.data.resource_pack_subscribe_infos[0];
                setAccountInfo({
                    remaining_quantity: info.remaining_quantity,
                    total_quantity: info.total_quantity,
                });
            } else {
                console.error('Invalid account info format:', data);
            }
        } catch (error) {
            console.error('Error fetching account info:', error);
        }
    }, []);

    // Load account info on initial mount
    useEffect(() => {
        getAccountInfo();
    }, [getAccountInfo]);

    // Load records from database on initial mount with pagination
    useEffect(() => {
        const loadInitialRecords = async () => {
            try {
                // Get total count first
                const total = await getTotalVideoRecordsCount();
                setTotalVideos(total);

                // Load first page
                const savedRecords = await loadVideoRecordsPage(1, MAX_RECORDS);

                // Convert DB objects back to appropriate record instances
                const records = savedRecords.map((data) => {
                    if (data.isExtension) {
                        return ExtensionRecord.fromDatabase(data);
                    } else {
                        return VideoRecord.fromDatabase(data);
                    }
                });

                // sort records by createdAt in descending order
                records.sort((a, b) => b.timestamp - a.timestamp);

                setVideoRecords(records);
                setCurrentPage(1);
                setHasMoreVideos(total > MAX_RECORDS);
            } catch (error) {
                console.error('Failed to load records from database:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadInitialRecords();
    }, []);

    // Save a record to the database (only if it has a taskId)
    const saveRecordToDB = useCallback(async (record) => {
        // Only save records that have a taskId
        if (!record.taskId) return;

        try {
            // Store in Dexie
            await db.videoRecords.put(record.toDatabase());
        } catch (error) {
            console.error('Error saving record to database:', error);
        }
    }, []);

    // Method to create a new video (enhanced with DB persistence)
    const createVideo = useCallback(
        async (formData) => {
            // Create VideoOptions to pass to API
            const options = new VideoOptions(
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

            let videoRecord = null;

            // Make the API request first
            try {
                console.log('options from video context', options);
                const response = await apiClient.createVideo(options);

                // Only now create the VideoRecord with the taskId
                videoRecord = new VideoRecord(formData);
                videoRecord.updateWithTaskInfo(response.data);

                // Add to state
                setVideoRecords((prev) => [videoRecord, ...prev]);

                // Save to database (now that we have a taskId)
                await saveRecordToDB(videoRecord);

                // Trigger account info update after successful video creation
                setTimeout(() => {
                    getAccountInfo();
                }, 5000);
            } catch (error) {
                console.error('Error creating video:', error);
                // We don't create a record for failed requests
            }

            // Update total count after adding new video
            setTotalVideos((prev) => prev + 1);

            return videoRecord;
        },
        [saveRecordToDB, videoRecords, getAccountInfo]
    );

    // Method to update a video record (enhanced with DB persistence)
    const updateVideoRecord = useCallback(
        async (taskId) => {
            try {
                // Find the record to determine the correct API to call
                const record = videoRecords.find((r) => r.taskId === taskId);
                if (!record) {
                    console.warn(`Record with taskId ${taskId} not found`);
                    return null;
                }

                let taskData;
                if (record.isExtension) {
                    // For extension records, use the extension API
                    taskData = await apiClient.getExtensionTaskById(taskId, record.originalVideoId);
                } else {
                    // For regular video records, use the standard API
                    taskData = await apiClient.getTaskById(taskId);
                }

                setVideoRecords((prev) =>
                    prev.map((record) => {
                        if (record.taskId === taskId) {
                            record.updateWithTaskResult(taskData);

                            // Update in DB (async)
                            saveRecordToDB(record).catch(console.error);
                        }
                        return record;
                    })
                );

                // Return the updated record for the component that requested the update
                return record;
            } catch (error) {
                console.error('Error updating video record:', error);
                return null;
            }
        },
        [videoRecords, saveRecordToDB]
    );

    const removeVideoRecord = useCallback(async (taskId) => {
        setVideoRecords((prev) => prev.filter((record) => record.taskId !== taskId));
        try {
            await db.videoRecords.delete(taskId);
        } catch (error) {
            console.error('Error deleting video record:', error);
        }
    }, []);

    // Method to use a video as a template for a new generation
    const useVideoAsTemplate = useCallback(
        (taskId) => {
            const record = videoRecords.find((r) => r.taskId === taskId);
            if (record && record.options) {
                // Store only the generation parameters from the options object
                setCurrentTemplate({
                    modelName: record.options.modelName,
                    mode: record.options.mode,
                    duration: record.options.duration,
                    image: record.options.image,
                    imageTail: record.options.imageTail,
                    prompt: record.options.prompt,
                    negativePrompt: record.options.negativePrompt,
                    cfgScale: record.options.cfgScale,
                    // We don't include taskId, status, or other runtime properties
                });
            }
        },
        [videoRecords]
    );

    // Method to clear the current template
    const clearTemplate = useCallback(() => {
        setCurrentTemplate(null);
    }, []);

    // Method to create a video extension
    const addExtensionRecord = useCallback(
        async (videoId, extensionOptions) => {
            let extensionRecord = null;

            try {
                const response = await apiClient.extendVideo(videoId, extensionOptions);

                // Create the ExtensionRecord with the taskId
                extensionRecord = new ExtensionRecord(videoId, extensionOptions);
                extensionRecord.updateWithTaskInfo(response.data);

                // Add to state (treat as a video record in the list)
                setVideoRecords((prev) => [extensionRecord, ...prev]);

                // Save to database (now that we have a taskId)
                await saveRecordToDB(extensionRecord);

                // Trigger account info update after successful video extension
                setTimeout(() => {
                    getAccountInfo();
                }, 5000);
            } catch (error) {
                console.error('Error creating video extension:', error);
                throw error; // Re-throw to let the component handle it
            }

            // Update total count after adding new extension
            setTotalVideos((prev) => prev + 1);

            return extensionRecord;
        },
        [saveRecordToDB, videoRecords, getAccountInfo]
    );

    // Method to load more videos (lazy loading)
    const loadMoreVideos = useCallback(async () => {
        if (isLoadingMore || !hasMoreVideos) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const moreRecords = await loadVideoRecordsPage(nextPage, MAX_RECORDS);

            if (moreRecords.length === 0) {
                setHasMoreVideos(false);
                return;
            }

            // Convert DB objects back to appropriate record instances
            const records = moreRecords.map((data) => {
                if (data.isExtension) {
                    return ExtensionRecord.fromDatabase(data);
                } else {
                    return VideoRecord.fromDatabase(data);
                }
            });

            // Sort records by createdAt in descending order
            records.sort((a, b) => b.timestamp - a.timestamp);

            // Append to existing records
            setVideoRecords((prev) => [...prev, ...records]);
            setCurrentPage(nextPage);

            // Check if we have more videos to load
            const totalLoaded = currentPage * MAX_RECORDS + records.length;
            setHasMoreVideos(totalLoaded < totalVideos);
        } catch (error) {
            console.error('Failed to load more videos:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, hasMoreVideos, isLoadingMore, totalVideos]);

    const value = {
        videoRecords,
        createVideo,
        updateVideoRecord,
        removeVideoRecord,
        useVideoAsTemplate,
        clearTemplate,
        addExtensionRecord,
        currentTemplate,
        isLoaded,
        accountInfo,
        // Lazy loading
        loadMoreVideos,
        hasMoreVideos,
        isLoadingMore,
        totalVideos,
    };

    return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
}

export const useVideoContext = () => useContext(VideoContext);

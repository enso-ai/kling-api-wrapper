{/* app/components/VideoPlayer.jsx */ }
import { useEffect, useState, useRef } from 'react';
import { FaTrashAlt, FaPencilAlt, FaPlus } from "react-icons/fa";
import './VideoPlayer.css';
import { useVideoContext } from '../context/VideoContext';
import VideoExtensionModal from './VideoExtensionModal';

export default function VideoPlayer({ payload }) {
    const { id, videoId, status, updatedAt, videoUrl: initialVideoUrl, isExtension, originalVideoId, modelName } = payload;
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [extensionStatus, setExtensionStatus] = useState(null);
    const [extensionError, setExtensionError] = useState(null);
    const videoRef = useRef(null);
    const { updateVideoRecord, removeVideoRecord, useVideoAsTemplate, addExtensionRecord } = useVideoContext();

    useEffect(() => {
        let intervalId;
        if (id && status !== 'succeed' && status !== 'failed' && updateVideoRecord) {
            console.log("video status is not terminal, starting polling for updates:", status);
            // Set up polling interval
            intervalId = setInterval(() => {
                let res = updateVideoRecord(id)
                    .catch((error) => {
                        console.error("Error updating video record:", error);
                    });
                
                if (res && res.status === 'succeed' || res.status === 'failed') {
                    console.log('Video status meet terminal state:', res.status);
                    // terminal states, stop polling
                    clearInterval(intervalId);
                }
            }, 5000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [id, status, updateVideoRecord]);

    // Update local state when payload changes
    useEffect(() => {
        if (initialVideoUrl) {
            setVideoUrl(initialVideoUrl);
        }
    }, [initialVideoUrl]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            removeVideoRecord(id);
        }
    };

    const handleUseAsTemplate = () => {
        useVideoAsTemplate(id);
        // Provide user feedback
        alert("Video parameters loaded as template. You can now modify and generate a new video.");
    };

    const handleExtendVideo = () => {
        setShowExtensionModal(true);
        setExtensionError(null);
        setExtensionStatus(null);
    };

    const handleExtensionSubmit = async (extensionOptions) => {
        try {
            setExtensionStatus('processing');
            setExtensionError(null);

            // Use the actual video ID for extensions (not task ID)
            if (!videoId) {
                throw new Error('Video ID is required for extensions');
            }

            // Create extension task using the backend API
            const response = await addExtensionRecord(videoId, extensionOptions);

            if (response) {
                setExtensionStatus('submitted');
                setShowExtensionModal(false);
                alert('Video extension started! You will see the extended video in the grid once processing is complete.');
            }
        } catch (error) {
            console.error('Error extending video:', error);
            setExtensionError(error.message || 'Failed to extend video');
            setExtensionStatus('failed');
        }
    };

    const canExtendVideo = status === 'succeed' && videoUrl && videoId && modelName == 'kling-v1-6';

    return (
        <div className="video-item">
            <div className="video-player">
                <div className="video-player-buttons">
                    <button
                        className="edit-button"
                        onClick={handleUseAsTemplate}
                        aria-label="Use as template"
                    >
                        <FaPencilAlt />
                    </button>
                    {canExtendVideo && (
                        <button
                            className="extend-button"
                            onClick={handleExtendVideo}
                            aria-label="Extend video"
                        >
                            <FaPlus />
                        </button>
                    )}
                    <button
                        className="delete-button"
                        onClick={handleDelete}
                        aria-label="Delete video"
                    >
                        <FaTrashAlt />
                    </button>
                </div>
                <div className="video-player-content">
                    {status === 'failed' ? (
                        <div className="error-mask">
                            <div className="error-text">{payload.error || 'An error occurred'}</div>
                        </div>
                    ) : status === 'queued' ? (
                        <div className="generating-mask">
                            <div className="generating-text">Queued...</div>
                        </div>
                    ) : status === 'processing' ? (
                        <div className="generating-mask">
                            <div className="generating-text">Processing...</div>
                        </div>
                    ) : videoUrl ? (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            autoPlay
                            loop
                            muted={false}
                            className="video-element"
                        />
                    ) : (
                        <div className="generating-mask">
                            <div className="generating-text">Generating...</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="video-info">
                {isExtension && (
                    <p className="extension-badge">Extended from video {originalVideoId}</p>
                )}
                <p>Last updated at {updatedAt?.split(', ')[1] || updatedAt}</p>
            </div>

            {showExtensionModal && (
                <VideoExtensionModal
                    onSubmit={handleExtensionSubmit}
                    onCancel={() => setShowExtensionModal(false)}
                    isProcessing={extensionStatus === 'processing'}
                    error={extensionError}
                />
            )}
        </div>
    );
}

{/* app/components/VideoGrid.jsx */ }
import React from 'react';
import './VideoGrid.css';
import VideoPlayer from './VideoPlayer';
import { useVideoContext } from '../context/VideoContext';

export default function VideoGrid() {
    const { videoRecords, isLoaded } = useVideoContext();

    return (
        <div className="grid-container">
            <h1>Results</h1>
            <div className="video-grid">
                {!isLoaded ? (
                    <div className="loading">Loading video history...</div>
                ) : videoRecords.length > 0 ? (
                    videoRecords.map((result) => (
                        <VideoPlayer
                            key={result.taskId || result.createdAt}
                            payload={result.toPayload ? result.toPayload() : result}
                        />
                    ))
                ) : (
                    <div className="no-results">No videos generated yet</div>
                )}
            </div>
        </div>
    );
}

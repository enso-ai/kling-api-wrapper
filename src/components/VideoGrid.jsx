{/* app/components/VideoGrid.jsx */ }
import React from 'react';
import './VideoGrid.css';
import VideoPlayer from './VideoPlayer';
import { useVideoContext } from '../context/VideoContext';

export default function VideoGrid() {
    const { videoRecords, isLoaded, accountInfo } = useVideoContext();

    return (
        <div className="grid-container">
            <div className="grid-header">
                <div className="grid-header-title">Results</div>
                {accountInfo && (
                    <div className="account-info-indicator">
                        Remaining Credits: {accountInfo.remaining_quantity}/{accountInfo.total_quantity}
                    </div>
                )}
            </div>
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

{/* app/components/VideoGrid.jsx */}
import React from 'react';
import './VideoGrid.css';
import VideoPlayer from './VideoPlayer';
import { useVideoContext } from '../context/VideoContext';

export default function VideoGrid() {
  const { videoRecords } = useVideoContext();

  return (
    <div className="grid-container">
      <h1>Results</h1>
      <div className="video-grid">
        {videoRecords.length > 0 ? (
          videoRecords.map((result) => (
            <VideoPlayer
              key={result.taskId}
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

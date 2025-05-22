{/* app/components/VideoGrid.jsx */}
import React from 'react';
import './VideoGrid.css';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({ results }) {
  return (
    <div className="video-grid">
      {results.length > 0 ? (
        results.map((result) => (
          <VideoPlayer 
            key={result.taskId || result.createdAt.getTime()}
            payload={result.toPayload ? result.toPayload() : result}
          />
        ))
      ) : (
        <div className="no-results">No videos generated yet</div>
      )}
    </div>
  );
}

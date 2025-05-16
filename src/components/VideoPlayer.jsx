{/* app/components/VideoPlayer.jsx */}
import React from 'react';
import './VideoPlayer.css';

export default function VideoPlayer({ url, timestamp }) {
  return (
    <div className="video-item">
      <div className="video-player">
        <div className="video-player-content">
          <div className="play-icon">▶</div>
        </div>
      </div>
      <div className="video-info">
        <p>Generated on {timestamp}</p>
      </div>
    </div>
  );
}

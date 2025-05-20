{/* app/components/VideoPlayer.jsx */}
import { useEffect, useState, useRef } from 'react';
import { apiClient } from '../service/backend';
import './VideoPlayer.css';

export default function VideoPlayer({ payload }) {
  const { taskId, status, createdAt, timestamp } = payload;
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (taskId) {
      apiClient.pollTaskUntilComplete(taskId)
        .then((result) => {
          console.log("poll task result:", result);
          const video = result.videos[0]
          setVideoUrl(video.url)
        })
        .catch((error) => {
          console.error("Error polling task:", error);
        });
    }
  }, [taskId])

  return (
    <div className="video-item">
      <div className="video-player">
        <div className="video-player-content">
          {videoUrl ? (
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
            <div className="loading-indicator">Loading...</div>
          )}
        </div>
      </div>
      <div className="video-info">
        <p>Generated on {timestamp}</p>
      </div>
    </div>
  );
}

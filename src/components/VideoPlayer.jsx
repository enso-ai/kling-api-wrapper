{/* app/components/VideoPlayer.jsx */}
import { useEffect, useState, useRef } from 'react';
import './VideoPlayer.css';
import { useVideoContext } from '../context/VideoContext';

export default function VideoPlayer({ payload }) {
  const { taskId, status, createdAt, updatedAt, videoUrl: initialVideoUrl } = payload;
  console.log("VideoPlayer payload:", payload);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const videoRef = useRef(null);
  const { updateVideoRecord } = useVideoContext();

  useEffect(() => {
    let intervalId;

    if (taskId && status !== 'succeed' && status !== 'failed') {
      // Set up polling interval
      intervalId = setInterval(() => {
        updateVideoRecord(taskId)
          .catch((error) => {
            console.error("Error updating video record:", error);
          });
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [taskId, status, updateVideoRecord]);

  // Update local state when payload changes
  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
    }
  }, [initialVideoUrl]);

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
            <div className="generating-mask">
              <div className="generating-text">Generating...</div>
            </div>
          )}
        </div>
      </div>
      <div className="video-info">
        <p>Last updated at {updatedAt?.split(', ')[1] || updatedAt}</p>
      </div>
    </div>
  );
}

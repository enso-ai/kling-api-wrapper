{/* app/components/VideoPlayer.jsx */}
import { useEffect, useState, useRef } from 'react';
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import './VideoPlayer.css';
import { useVideoContext } from '../context/VideoContext';

export default function VideoPlayer({ payload }) {
  const { taskId, status, createdAt, updatedAt, videoUrl: initialVideoUrl } = payload;
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const videoRef = useRef(null);
  const { updateVideoRecord, removeVideoRecord, useVideoAsTemplate } = useVideoContext();

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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      removeVideoRecord(taskId);
    }
  };

  const handleUseAsTemplate = () => {
    useVideoAsTemplate(taskId);
    // Provide user feedback
    alert("Video parameters loaded as template. You can now modify and generate a new video.");
  };

  return (
    <div className="video-item">
      <div className="video-player">
        <button 
          className="edit-button" 
          onClick={handleUseAsTemplate}
          aria-label="Use as template"
        >
          <FaPencilAlt />
        </button>
        <button 
          className="delete-button" 
          onClick={handleDelete}
          aria-label="Delete video"
        >
          <FaTrashAlt />
        </button>
        <div className="video-player-content">
          {status === 'failed' ? (
            <div className="error-mask">
              <div className="error-text">{payload.error || 'An error occurred'}</div>
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
        <p>Last updated at {updatedAt?.split(', ')[1] || updatedAt}</p>
      </div>
    </div>
  );
}

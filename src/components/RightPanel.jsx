{/* app/components/RightPanel.jsx */}
import React from 'react';
import './RightPanel.css';
import VideoGrid from './VideoGrid';
import { useVideoContext } from '../context/VideoContext';

export default function RightPanel() {
  const { videoRecords } = useVideoContext();

  return (
    <div className="right-panel">
      <h1>Results</h1>
      <VideoGrid results={videoRecords} />
    </div>
  );
}

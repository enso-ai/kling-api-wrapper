{/* app/components/RightPanel.jsx */}
import React from 'react';
import './RightPanel.css';
import VideoGrid from './VideoGrid';

export default function RightPanel({ results }) {
  return (
    <div className="right-panel">
      <h1>Results</h1>
      <VideoGrid results={results} />
    </div>
  );
}

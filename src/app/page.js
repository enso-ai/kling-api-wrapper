'use client'

import React from 'react';
import LeftPanel from '../components/LeftPanel';
import VideoGrid from '../components/VideoGrid';
import '../styles/kling-ui.css';
import { VideoProvider } from '../context/VideoContext';

export default function Home() {
  return (
    <VideoProvider>
      <div className="kling-container">
        <LeftPanel />
        <VideoGrid />
      </div>
    </VideoProvider>
  );
}

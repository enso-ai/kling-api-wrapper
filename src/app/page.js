'use client'

import React from 'react';
import SidePanel from '../components/SidePanel';
import VideoGrid from '../components/VideoGrid';
import '../styles/kling-ui.css';
import { VideoProvider } from '../context/VideoContext';

export default function Home() {
  return (
    <VideoProvider>
      <div className="kling-container">
        <SidePanel />
        <VideoGrid />
      </div>
    </VideoProvider>
  );
}

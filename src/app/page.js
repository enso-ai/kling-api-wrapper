'use client'

import React from 'react';
import LeftPanel from '../components/LeftPanel';
import RightPanel from '../components/RightPanel';
import '../styles/kling-ui.css';
import { VideoProvider } from '../context/VideoContext';

export default function Home() {
  return (
    <VideoProvider>
      <div className="kling-container">
        <LeftPanel />
        <RightPanel />
      </div>
    </VideoProvider>
  );
}

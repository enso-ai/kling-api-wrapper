'use client';

import { useState } from 'react';
import ImageTool from './tabs/ImageTool';
import VideoTool from './tabs/videoTool';
import './page.css';
import { VideoProvider } from '@/context/VideoContext';

export default function Home() {
    const [activeTab, setActiveTab] = useState('image');

    return (
        <VideoProvider>
            <div className='container'>
                <div className='tabs'>
                    <button
                        className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                        onClick={() => setActiveTab('image')}
                    >
                        Image
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
                        onClick={() => setActiveTab('video')}
                    >
                        Video
                    </button>
                </div>
                {activeTab === 'image' && <ImageTool />}
                {activeTab === 'video' && <VideoTool />}
            </div>
        </VideoProvider>
    );
}

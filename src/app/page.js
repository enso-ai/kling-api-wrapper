'use client';

import { useState } from 'react';
import ImageTool from './tabs/ImageTool';
import VideoTool from './tabs/videoTool';
import styles from './page.module.css';
import { VideoProvider } from '@/context/VideoContext';

export default function Home() {
    const [activeTab, setActiveTab] = useState('image');

    return (
        <VideoProvider>
            <div className={styles.container}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'image' ? styles.active : ''}`}
                        onClick={() => setActiveTab('image')}
                    >
                        Image
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'video' ? styles.active : ''}`}
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

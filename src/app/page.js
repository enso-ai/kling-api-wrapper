'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ImageTool from './tabs/ImageTool';
import VideoTool from './tabs/videoTool';
import styles from './page.module.css';
import { VideoProvider } from '@/context/VideoContext';
import { ImageContextProvider } from '@/context/ImageContext';

export default function Home() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Get initial tab from URL, default to 'image'
    const getInitialTab = () => {
        const tabParam = searchParams.get('tab');
        return (tabParam === 'video' || tabParam === 'image') ? tabParam : 'image';
    };
    
    const [activeTab, setActiveTab] = useState(getInitialTab());
    
    // Sync state with URL changes
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const validTab = (tabParam === 'video' || tabParam === 'image') ? tabParam : 'image';
        setActiveTab(validTab);
    }, [searchParams]);
    
    // Handle tab change with URL update
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.push(`/?tab=${tab}`);
    };

    return (
        <VideoProvider>
            <ImageContextProvider>
                <div className={styles.container}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'image' ? styles.active : ''}`}
                            onClick={() => handleTabChange('image')}
                        >
                            Image
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'video' ? styles.active : ''}`}
                            onClick={() => handleTabChange('video')}
                        >
                            Video
                        </button>
                    </div>
                    {activeTab === 'image' && <ImageTool />}
                    {activeTab === 'video' && <VideoTool />}
                </div>
            </ImageContextProvider>
        </VideoProvider>
    );
}

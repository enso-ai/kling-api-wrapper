'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ImageTool from './tabs/ImageTool';
import VideoTool from './tabs/videoTool';
import Start from './tabs/Start';
import styles from './page.module.css';
import { VideoProvider } from '@/context/VideoContext';
import { ImageContextProvider } from '@/context/ImageContext';
import { ImageGenModalContextProvider } from '@/context/ImageGenModalContext';
import { ProjectProvider, useProjectContext } from '@/context/ProjectContext';

function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { curProjectId } = useProjectContext();

    const isProjectSelected = curProjectId !== null;

    // Get initial tab from URL, default to 'start'
    const getInitialTab = () => {
        const tabParam = searchParams.get('tab');
        const validTabs = ['start', 'video', 'image'];
        
        if (!validTabs.includes(tabParam)) {
            return 'start';
        }
        
        // If no project selected, force to start tab
        if (!isProjectSelected && (tabParam === 'video' || tabParam === 'image')) {
            return 'start';
        }
        
        return tabParam;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Sync state with URL changes and project selection
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const validTabs = ['start', 'video', 'image'];
        let validTab = validTabs.includes(tabParam) ? tabParam : 'start';
        
        // If no project selected, force to start tab
        if (!isProjectSelected && (validTab === 'video' || validTab === 'image')) {
            validTab = 'start';
            router.replace('/?tab=start');
        }
        
        setActiveTab(validTab);
    }, [searchParams, isProjectSelected, router]);

    // Handle tab change with URL update and project validation
    const handleTabChange = (tab) => {
        // Prevent navigation to locked tabs
        if (!isProjectSelected && (tab === 'video' || tab === 'image')) {
            return;
        }
        
        setActiveTab(tab);
        router.push(`/?tab=${tab}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'start' ? styles.active : ''}`}
                    onClick={() => handleTabChange('start')}
                >
                    Start
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'image' ? styles.active : ''} ${!isProjectSelected ? styles.disabled : ''}`}
                    onClick={() => handleTabChange('image')}
                    disabled={!isProjectSelected}
                    title={!isProjectSelected ? 'Select a project to access this tab' : ''}
                >
                    Image
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'video' ? styles.active : ''} ${!isProjectSelected ? styles.disabled : ''}`}
                    onClick={() => handleTabChange('video')}
                    disabled={!isProjectSelected}
                    title={!isProjectSelected ? 'Select a project to access this tab' : ''}
                >
                    Video
                </button>
            </div>
            {activeTab === 'start' && <Start />}
            {activeTab === 'image' && isProjectSelected && <ImageTool />}
            {activeTab === 'video' && isProjectSelected && <VideoTool />}
        </div>
    );
}

export default function Home() {
    return (
        <ProjectProvider>
            <VideoProvider>
                <ImageContextProvider>
                    <ImageGenModalContextProvider>
                        <Suspense fallback={<div className={styles.container}>Loading...</div>}>
                            <HomeContent />
                        </Suspense>
                    </ImageGenModalContextProvider>
                </ImageContextProvider>
            </VideoProvider>
        </ProjectProvider>
    );
}

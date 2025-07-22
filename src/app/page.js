'use client';

import { Suspense, useMemo } from 'react';
import ImageTool from './tabs/ImageTool';
import VideoTool from './tabs/videoTool';
import Start from './tabs/Start';
import styles from './page.module.css';
import { VideoProvider } from '@/context/VideoContext';
import { ImageContextProvider } from '@/context/ImageContext';
import { ImageGenModalContextProvider } from '@/context/ImageGenModalContext';
import { ProjectProvider, useProjectContext } from '@/context/ProjectContext';
import { TabContextProvider, useTabContext } from '@/context/TabManager';

function HomeContent() {
    const { curProjectId } = useProjectContext();
    const { activeTab, handleTabChange } = useTabContext()

    const isProjectSelected = useMemo(() => curProjectId !== null, [curProjectId]);

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
            {activeTab === 'start' && <Start onRedirect={handleTabChange}/>}
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
                        <TabContextProvider>
                            <Suspense fallback={<div className={styles.container}>Loading...</div>}>
                                <HomeContent />
                            </Suspense>
                        </TabContextProvider>
                    </ImageGenModalContextProvider>
                </ImageContextProvider>
            </VideoProvider>
        </ProjectProvider>
    );
}

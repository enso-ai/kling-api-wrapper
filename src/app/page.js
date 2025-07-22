'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ImageTool from './tabs/ImageTool';
import VideoTool from './tabs/videoTool';
import Start from './tabs/Start';
import styles from './page.module.css';
import { VideoProvider } from '@/context/VideoContext';
import { ImageContextProvider } from '@/context/ImageContext';
import { ImageGenModalContextProvider } from '@/context/ImageGenModalContext';
import { ProjectProvider, useProjectContext } from '@/context/ProjectContext';

const VALID_TABS = ['start', 'video', 'image'];

function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { curProjectId, selectProject, isLoaded, isValidProjectId } = useProjectContext();

    const isProjectSelected = useMemo(() => curProjectId !== null, [curProjectId]);

    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        // Sync url -> internal state (tab, projectId)
        // url change could triggered by:
        // - initialization: given a url with tab &/or projectId
        // - browser navigation (e.g goback)
        if (!isLoaded ) return;

        const tabParam = searchParams.get('tab');
        const projectId = searchParams.get('pid');
        console.log("parsed from url:", projectId, tabParam)

        if (projectId && isValidProjectId(projectId)) {
            console.log("valid url found, set projectId")
            // project is a valid project, use URL to dicatate the curProject
            selectProject(projectId)
            setActiveTab(VALID_TABS.includes(tabParam) ? tabParam : 'start')
        } else {
            // without a valid project, redirect user to the start tab and strip any params
            setActiveTab('start')
            selectProject(null)
            // override bad url
            router.replace('/?tab=start')
        }
    }, [searchParams, isLoaded]);

    // Handle tab change with URL update and project validation & update
    // this function do not directly change the state but merely
    // validate the input with internal rules
    const handleTabChange = (tab, projectId=null) => {
        const validTab = VALID_TABS.includes(tab) ? tab : 'start'
        if (validTab === 'start') {
            // start tab is always accessible, but the pid will be stripped
            router.push('/?tab=start');
        } else if (isProjectSelected || projectId) {
            router.push(`/?tab=${tab}&&pid=${projectId || curProjectId}`);
        }
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
                        <Suspense fallback={<div className={styles.container}>Loading...</div>}>
                            <HomeContent />
                        </Suspense>
                    </ImageGenModalContextProvider>
                </ImageContextProvider>
            </VideoProvider>
        </ProjectProvider>
    );
}

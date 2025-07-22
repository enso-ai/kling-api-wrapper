import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjectContext } from '@/context/ProjectContext';

const TabContext = createContext();

const VALID_TABS = ['start', 'image', 'video']

export function TabContextProvider({ children }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { curProjectId, selectProject, isLoaded, isValidProjectId } = useProjectContext();

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
        } else if (curProjectId !== null || projectId) {
            router.push(`/?tab=${tab}&&pid=${projectId || curProjectId}`);
        }
    };

    const value = {
        activeTab,
        handleTabChange,
    };

    return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export const useTabContext = () => {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error('useTabContext must be used within a TabContextProvider');
    }
    return context;
};


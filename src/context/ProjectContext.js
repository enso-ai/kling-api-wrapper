import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    listProjects, 
    createProject as dbCreateProject, 
    getOrCreateDefaultProject 
} from '@/service/database';

const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [curProjectId, setCurProjectId] = useState(DEFAULT_PROJECT_ID);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load projects on initial mount
    useEffect(() => {
        const loadInitialProjects = async () => {
            try {
                // Ensure default project exists
                await getOrCreateDefaultProject();
                
                // Load all projects
                const projectList = await listProjects();
                setProjects(projectList);
                
                // Set current project to default if not already set
                if (!curProjectId || !projectList.find(p => p.id === curProjectId)) {
                    setCurProjectId(DEFAULT_PROJECT_ID);
                }
            } catch (error) {
                console.error('Failed to load projects:', error);
                // Still set as loaded even on error
            } finally {
                setIsLoaded(true);
            }
        };

        loadInitialProjects();
    }, []);

    // Method to create a new project
    const createProject = useCallback(async (projectName) => {
        try {
            const newProject = await dbCreateProject(projectName);
            setProjects(prev => [...prev, newProject]);
            return newProject;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }, []);

    // Method to select a project
    const selectProject = useCallback((projectId) => {
        // Validate that the project exists
        const projectExists = projects.find(p => p.id === projectId);
        if (projectExists) {
            setCurProjectId(projectId);
        } else {
            console.warn(`Project with id ${projectId} not found, keeping current selection`);
        }
    }, [projects]);

    // Method to get current project object
    const getCurrentProject = useCallback(() => {
        return projects.find(p => p.id === curProjectId);
    }, [projects, curProjectId]);

    const value = {
        projects,
        curProjectId,
        isLoaded,
        createProject,
        selectProject,
        getCurrentProject,
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
    listProjects, 
    createProject as dbCreateProject, 
    getOrCreateDefaultProject,
    deleteProjectCascade 
} from '@/service/database';
import Project, { DEFAULT_PROJECT_ID } from '@/models/Project';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [curProjectId, setCurProjectId] = useState(null);
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

                // Don't auto-select any project - user must explicitly choose
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
            const newProject = new Project({ project_name: projectName });
            const savedProject = await dbCreateProject(newProject);
            setProjects((prev) => [...prev, savedProject]);
            setCurProjectId(savedProject.id); // Auto-select new project
            return savedProject;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }, []);

    const isValidProjectId = (projectId) => (
        projects.find((p) => p.id === projectId)
    )

    const isDefaultProject = useMemo(() => curProjectId === DEFAULT_PROJECT_ID, [curProjectId]);

    // Method to select a project
    const selectProject = useCallback(
        (projectId) => {
            // Validate that the project exists
            if (isValidProjectId(projectId)) {
                setCurProjectId(projectId);
            } else {
                console.warn(`Project with id ${projectId} not found, reset projectId`);
                setCurProjectId(null)
            }
        },
        [projects]
    );

    // Method to delete a project
    const deleteProject = useCallback(async (projectId) => {
        try {
            await deleteProjectCascade(projectId);
            
            // Update local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
            
            // Handle if deleted project was currently selected
            if (curProjectId === projectId) {
                setCurProjectId(null);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }, [curProjectId]);

    // Method to get current project object
    const getCurrentProject = useCallback(() => {
        return projects.find((p) => p.id === curProjectId);
    }, [projects, curProjectId]);

    const value = {
        projects,
        curProjectId,
        isLoaded,
        createProject,
        selectProject,
        deleteProject,
        getCurrentProject,
        isValidProjectId,
        isDefaultProject,
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

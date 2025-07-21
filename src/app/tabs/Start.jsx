'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectContext } from '@/context/ProjectContext';
import styles from './Start.module.css';

export default function Start() {
    const router = useRouter();
    const { projects, isLoaded, createProject, selectProject, curProjectId } = useProjectContext();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const shouldNavigateAfterCreate = useRef(false);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setIsCreating(true);
        try {
            const newProject = await createProject(projectName.trim());
            setProjectName('');
            setShowCreateForm(false);
            // Auto-select the newly created project
            selectProject(newProject.id);
            // Flag that we should navigate after the project is selected
            shouldNavigateAfterCreate.current = true;
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectProject = (projectId) => {
        selectProject(projectId);
        router.push('/?tab=image');
    };

    // Handle navigation after project creation
    useEffect(() => {
        if (shouldNavigateAfterCreate.current && curProjectId) {
            shouldNavigateAfterCreate.current = false;
            router.push('/?tab=image');
        }
    }, [curProjectId, router]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isLoaded) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading projects...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Project Management</h1>
                <p>Create a new project or select an existing one to continue</p>
            </div>

            {/* Create Project Section */}
            <div className={styles.createSection}>
                {!showCreateForm ? (
                    <button 
                        className={styles.createButton}
                        onClick={() => setShowCreateForm(true)}
                    >
                        Create Project
                    </button>
                ) : (
                    <form onSubmit={handleCreateProject} className={styles.createForm}>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Enter project name"
                                className={styles.projectInput}
                                disabled={isCreating}
                                autoFocus
                            />
                            <div className={styles.formButtons}>
                                <button 
                                    type="submit" 
                                    className={styles.confirmButton}
                                    disabled={!projectName.trim() || isCreating}
                                >
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                                <button 
                                    type="button" 
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setProjectName('');
                                    }}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Project List Section */}
            <div className={styles.projectSection}>
                <h2>Load Existing Project</h2>
                {projects.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No projects found. Create your first project to get started.</p>
                    </div>
                ) : (
                    <div className={styles.projectTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.columnName}>Project Name</div>
                            <div className={styles.columnModified}>Modified</div>
                        </div>
                        <div className={styles.tableBody}>
                            {projects.map((project) => {
                                const payload = project.toPayload();
                                const isSelected = curProjectId === payload.id;
                                return (
                                    <div 
                                        key={payload.id} 
                                        className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''} ${styles.clickableRow}`}
                                        onClick={() => handleSelectProject(payload.id)}
                                    >
                                        <div className={styles.columnName}>
                                            <span className={styles.projectName}>
                                                {payload.projectName}
                                            </span>
                                            {isSelected && (
                                                <span className={styles.selectedBadge}>Current</span>
                                            )}
                                        </div>
                                        <div className={styles.columnModified}>
                                            {formatDate(payload.modified)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

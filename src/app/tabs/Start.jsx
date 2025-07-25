'use client';

import { useState } from 'react';
import { useProjectContext } from '@/context/ProjectContext';
import styles from './Start.module.css';

export default function Start({onRedirect}) {
    const { projects, isLoaded, createProject, deleteProject, curProjectId } = useProjectContext();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { projectId, projectName }
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setIsCreating(true);
        try {
            const newProject = await createProject(projectName.trim());
            setProjectName('');
            setShowCreateForm(false);
            onRedirect('image', newProject.id);
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectProject = (projectId) => {
        console.log("start to redirect to:", projectId, 'image')
        onRedirect('image', projectId)
    };

    const handleDeleteClick = (e, projectId, projectName) => {
        e.stopPropagation(); // Prevent row selection
        setDeleteConfirm({ projectId, projectName });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        
        setIsDeleting(true);
        try {
            await deleteProject(deleteConfirm.projectId);
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };

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
                            <div className={styles.columnActions}>Actions</div>
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
                                        <div className={styles.columnActions}>
                                            <button 
                                                className={styles.deleteButton}
                                                onClick={(e) => handleDeleteClick(e, payload.id, payload.projectName)}
                                                title="Delete project"
                                                disabled={(payload.projectName === 'Default Project')}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Delete Project</h3>
                        <p>
                            Are you sure you want to delete "{deleteConfirm.projectName}"?
                        </p>
                        <p className={styles.warningText}>
                            This will permanently delete the project and all related videos and images. This action cannot be undone.
                        </p>
                        <div className={styles.modalButtons}>
                            <button 
                                className={styles.deleteConfirmButton}
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import Dexie from "dexie";
import Project, { DEFAULT_PROJECT_ID } from "@/models/Project";
import ImageRecord from "@/models/ImageRecord";

export class VideoDB extends Dexie {
    constructor() {
        super("VideoDatabase");

        // Define database schema with video records table
        this.version(1).stores({
            videoRecords: "id, status, createdAt",
            // id will be the taskId
            // We index status and createdAt for faster queries
        });

        // Version 2: Add taskId and videoId fields for better ID management
        this.version(2).stores({
            videoRecords: "id, status, createdAt, taskId, videoId",
            // id: Primary key (backward compatibility with task ID)
            // taskId: Explicit task ID field
            // videoId: Actual video ID from API response for extensions
        });

        // Version 3: Add imageRecords table
        this.version(3).stores({
            videoRecords: "id, status, createdAt, taskId, videoId",
            imageRecords: "id, createdAt",
            // id: Primary key (unique identifier)
            // createdAt: For sorting (newest first)
        });

        // Version 4: Add projects table and projectId to existing tables
        this.version(4)
            .stores({
                projects: "id, project_name, created, modified",
                videoRecords:
                    "id, status, createdAt, taskId, videoId, projectId",
                imageRecords: "id, createdAt, projectId",
            })
            .upgrade(async (trans) => {
                // Migration logic for version 4
                console.log("Migrating database to version 4...");

                // Create default project
                const defaultProject = Project.createDefault();
                await trans.projects.put(defaultProject.toDatabase());
                console.log(
                    "Created default project:",
                    defaultProject.project_name
                );

                // Update all existing video records to reference default project
                const videoRecords = await trans.videoRecords.toArray();
                for (const record of videoRecords) {
                    if (!record.projectId) {
                        record.projectId = defaultProject.id;
                        await trans.videoRecords.put(record);
                    }
                }
                console.log(
                    `Updated ${videoRecords.length} video records with default project`
                );

                // Update all existing image records to reference default project
                const imageRecords = await trans.imageRecords.toArray();
                for (const record of imageRecords) {
                    if (!record.projectId) {
                        record.projectId = defaultProject.id;
                        await trans.imageRecords.put(record);
                    }
                }
                console.log(
                    `Updated ${imageRecords.length} image records with default project`
                );

                console.log(
                    "Database migration to version 4 completed successfully"
                );
            });
    }
}

// Create and export a singleton instance
export const db = new VideoDB();

// Load video records with pagination
export const loadVideoRecordsPage = async (page = 1, pageSize = 10) => {
    try {
        const offset = (page - 1) * pageSize;
        const records = await db.videoRecords
            .orderBy("createdAt")
            .reverse()
            .offset(offset)
            .limit(pageSize)
            .toArray();

        return records;
    } catch (error) {
        console.error("Failed to load video records page:", error);
        return [];
    }
};

// Get total count of video records
export const getTotalVideoRecordsCount = async () => {
    try {
        return await db.videoRecords.count();
    } catch (error) {
        console.error("Failed to get total video records count:", error);
        return 0;
    }
};

// Load image records with pagination
export const loadImageRecordsPage = async (page = 1, pageSize = 10) => {
    try {
        const offset = (page - 1) * pageSize;
        const records = await db.imageRecords
            .orderBy("createdAt")
            .reverse()
            .offset(offset)
            .limit(pageSize)
            .toArray();

        return records;
    } catch (error) {
        console.error("Failed to load image records page:", error);
        return [];
    }
};

// Get total count of image records
export const getTotalImageRecordsCount = async () => {
    try {
        return await db.imageRecords.count();
    } catch (error) {
        console.error("Failed to get total image records count:", error);
        return 0;
    }
};

// Clear image records from the database
export const clearImageRecords = async () => {
    return await db.imageRecords.clear();
};

// Clear all records from the database
export const clearDatabase = async () => {
    await db.videoRecords.clear();
    await db.imageRecords.clear();
};

// Export all records to a JSON file
export const exportDatabase = async () => {
    const records = await db.videoRecords.toArray();
    const blob = new Blob([JSON.stringify(records)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `video-records-export-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
};

// ========== Project Management Functions ==========

// Create a new project
export const createProject = async (project) => {
    try {
        await db.projects.put(project.toDatabase());
        return project;
    } catch (error) {
        console.error("Failed to create project:", error);
        throw error;
    }
};

// Get a project by ID
export const getProject = async (projectId) => {
    try {
        const data = await db.projects.get(projectId);
        return data ? Project.fromDatabase(data) : null;
    } catch (error) {
        console.error("Failed to get project:", error);
        return null;
    }
};

// List all projects, sorted by modified date (newest first)
export const listProjects = async () => {
    try {
        const projects = await db.projects
            .orderBy("modified")
            .reverse()
            .toArray();

        return projects.map((data) => Project.fromDatabase(data));
    } catch (error) {
        console.error("Failed to list projects:", error);
        return [];
    }
};

// Update project modified timestamp
export const updateProjectModified = async (projectId) => {
    try {
        const project = await getProject(projectId);
        if (project) {
            project.touch();
            await db.projects.put(project.toDatabase());
        }
    } catch (error) {
        console.error("Failed to update project modified time:", error);
    }
};

// Get or create default project
export const getOrCreateDefaultProject = async () => {
    try {
        let project = await getProject(DEFAULT_PROJECT_ID);

        if (!project) {
            project = Project.createDefault();
            await createProject(project);
        }

        return project;
    } catch (error) {
        console.error("Failed to get or create default project:", error);
        return Project.createDefault();
    }
};

// Delete project and all related records (cascade delete)
export const deleteProjectCascade = async (projectId) => {
    try {
        // Delete all video records for this project
        await db.videoRecords.where("projectId").equals(projectId).delete();

        // Delete all image records for this project
        await db.imageRecords.where("projectId").equals(projectId).delete();

        // Delete the project itself
        await db.projects.delete(projectId);

        console.log(
            `Successfully deleted project ${projectId} and all related records`
        );
    } catch (error) {
        console.error("Failed to delete project cascade:", error);
        throw error;
    }
};

// ========== Project-Filtered Video Functions ==========

// Load video records with pagination filtered by project
export const loadVideoRecordsPageByProject = async (
    projectId,
    page = 1,
    pageSize = 10
) => {
    try {
        const offset = (page - 1) * pageSize;
        const records = await db.videoRecords
            .where("projectId")
            .equals(projectId)
            .reverse()
            .sortBy("createdAt");

        return records.slice(offset, offset + pageSize);
    } catch (error) {
        console.error("Failed to load video records page by project:", error);
        return [];
    }
};

// Get total count of video records for a project
export const getTotalVideoRecordsCountByProject = async (projectId) => {
    try {
        return await db.videoRecords
            .where("projectId")
            .equals(projectId)
            .count();
    } catch (error) {
        console.error(
            "Failed to get total video records count by project:",
            error
        );
        return 0;
    }
};

// ========== Project-Filtered Image Functions ==========

// Load image records with pagination filtered by project
export const loadImageRecordsPageByProject = async (
    projectId,
    page = 1,
    pageSize = 10
) => {
    try {
        const offset = (page - 1) * pageSize;
        const records = await db.imageRecords
            .where("projectId")
            .equals(projectId)
            .reverse()
            .sortBy("createdAt");

        return records.slice(offset, offset + pageSize);
    } catch (error) {
        console.error("Failed to load image records page by project:", error);
        return [];
    }
};

// Get total count of image records for a project
export const getTotalImageRecordsCountByProject = async (projectId) => {
    try {
        return await db.imageRecords
            .where("projectId")
            .equals(projectId)
            .count();
    } catch (error) {
        console.error(
            "Failed to get total image records count by project:",
            error
        );
        return 0;
    }
};

// ========== Image Sharing Functions ==========

// Get bookmark by ID
export const getBookmarkById = async (bookmarkId) => {
    try {
        const data = await db.imageRecords.get(bookmarkId);
        if (!data) return null;

        const record = ImageRecord.fromDatabase(data);
        record.selectedImageIdx = 0;

        return record;
    } catch (error) {
        console.error("Failed to get bookmark by ID:", error);
        return null;
    }
};

// Create bookmark copy in default project
export const createBookmarkImage = async (originalImageId) => {
  return await db.transaction('rw', db.imageRecords, async () => {
    // Get original image
    const originalData = await db.imageRecords.get(originalImageId);
    if (!originalData) throw new Error('Original image not found');

    if (originalData.favoriteId) {
        const bookmark = await db.imageRecords.get(originalData.favoriteId)
        if (bookmark) {
            console.warn('book mark already exists');
            return bookmark;
        }
    }
    
    // Create bookmark in default project
    const bookmarkData = {
      ...originalData,
      id: crypto.randomUUID(),
      projectId: DEFAULT_PROJECT_ID, 
      favoriteId: null,
      createdAt: new Date().toLocaleString(),
      timestamp: Date.now()
    };
    
    // Update original with favorite reference
    originalData.favoriteId = bookmarkData.id;
    
    // Both operations in single transaction
    await db.imageRecords.put(bookmarkData);
    await db.imageRecords.put(originalData);
    
    return ImageRecord.fromDatabase(bookmarkData);
  });
};

// Create independent copy in target project from default project
export const importImageFromDefault = async (originalImageId, targetProjectId) => {
    try {
        const originalImage = await db.imageRecords.get(originalImageId)
        if (!originalImage) return null

        const copyData = {
            ...originalImage,
            id: crypto.randomUUID(),
            projectId: targetProjectId,
            favoriteId: null, // Independent copy
            createdAt: new Date().toLocaleString(),
            timestamp: Date.now(),
        };

        await db.imageRecords.put(copyData);

        const copy = ImageRecord.fromDatabase(copyData);
        copy.selectedImageIdx = 0;
        return copy;
    } catch (error) {
        console.error("Failed to create image copy:", error);
        throw error;
    }
};

// Remove bookmark and clear favorite reference
export const removeBookmarkImage = async (originalImageId) => {
    try {
        const originalData = await db.imageRecords.get(originalImageId);
        if (originalData && originalData.favoriteId) {
            await db.imageRecords.delete(originalData.favoriteId);
            // Remove bookmark from default project
            // (silently continue if not found)
            originalData.favoriteId = null;
            await db.imageRecords.put(originalData);
        }

        // Clear favorite reference from original image
    } catch (error) {
        console.error("Failed to remove bookmark and reference:", error);
        throw error;
    }
};

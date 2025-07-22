export const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

class Project {
    constructor(formData = {}) {
        this.id = formData.id || crypto.randomUUID(); // Generate a unique ID
        this.project_name = formData.project_name || 'Untitled Project';
        this.created = formData.created || new Date().toISOString();
        this.modified = formData.modified || new Date().toISOString();
    }

    // Update the modified timestamp
    touch() {
        this.modified = new Date().toISOString();
    }

    // Convert to the format expected by components
    toPayload() {
        return {
            id: this.id,
            projectName: this.project_name,
            created: this.created,
            modified: this.modified,
        };
    }

    // Serialize for database storage
    toDatabase() {
        return {
            id: this.id, // Primary key
            project_name: this.project_name,
            created: this.created,
            modified: this.modified,
        };
    }

    // Static method to recreate from database
    static fromDatabase(data) {
        const project = new Project();
        project.id = data.id;
        project.project_name = data.project_name;
        project.created = data.created;
        project.modified = data.modified;
        return project;
    }

    // Static method to create default project
    static createDefault() {
        return new Project({
            id: DEFAULT_PROJECT_ID,
            project_name: 'Default Project',
        });
    }
}

export default Project;

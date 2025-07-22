# Project-Based Organization Feature Implementation

## Context

The current application loads all generated videos and images into memory together, which is becoming a performance issue as the content grows. This feature introduces a **project-based organization system** that groups resources by projectId, allowing users to work with focused subsets of their content.

## Feature Requirements

### Core Functionality
- **Project Management**: Users can create and select projects to organize their content
- **Project Deletion**: Users can delete projects with cascade deletion of all associated content
- **Project-based Storage**: All resources (videos/images) are associated with a specific project
- **URL-based Navigation**: Project selection is reflected in URL parameters for direct linking
- **Backward Compatibility**: Existing content is preserved in a default project

### User Experience
1. **Project Selection Tab**: New primary tab for project management (before Image/Video tabs)
2. **Project Creation**: Modal interface for creating new projects with custom names
3. **Project Listing**: Display all projects sorted by last modified date
4. **Current Project Display**: Show active project name in the header
5. **Tab Locking**: Image/Video tabs are disabled until a project is selected

### Technical Specifications

#### Project Data Model
```javascript
{
  id: "uuid",           // Primary key
  project_name: "string", // Human-readable name
  created: "timestamp",   // Creation date
  modified: "timestamp"   // Last access/modification date
}
```

#### URL Structure
- Project selection: `/` (root)
- With project: `/?pid={projectId}&tab={image|video}`
- Invalid project: Redirect to root with error alert

#### Database Changes
- New `projects` table in Dexie
- Add `projectId` foreign key to `videoRecords` and `imageRecords`
- Migration logic for existing records
- Cascade deletion function for removing projects and all associated content

#### File Storage
- New uploads: `/{projectId}/filename.ext` in GCS
- Existing files: Remain at root level (no migration needed)

## Implementation Steps

### Phase 1: Database Foundation
1. **Update Database Schema**
   - Add `projects` table to Dexie schema
   - Add `projectId` field to `videoRecords` and `imageRecords` tables
   - Implement database migration logic

2. **Create Project Model**
   - `src/models/Project.js` - Project data model with CRUD methods
   - Include serialization methods for database storage

3. **Update Existing Models**
   - Add `projectId` field to `VideoRecord.js`
   - Add `projectId` field to `ImageRecord.js`
   - Update serialization methods

### Phase 2: Project Context Layer
4. **Create ProjectContext**
   - `src/context/ProjectContext.js` - Top-level project management
   - Project selection, creation, and validation logic
   - URL synchronization for project state

5. **Update Database Service**
   - Add project-specific query methods
   - Modify existing queries to filter by projectId
   - Add project CRUD operations

### Phase 3: UI Components
6. **Project Selection Interface**
   - `src/components/project/ProjectList.js` - Display all projects
   - `src/components/project/ProjectCard.js` - Individual project display
   - `src/components/project/CreateProjectModal.js` - Project creation modal

7. **Project Tab Component**
   - `src/app/tabs/ProjectTool.jsx` - Main project management interface
   - Integration with project creation and selection

### Phase 4: Context Integration
8. **Update VideoContext**
   - Consume projectId from ProjectContext
   - Filter database queries by projectId
   - Include projectId in new record creation

9. **Update ImageContext**
   - Consume projectId from ProjectContext
   - Filter database queries by projectId
   - Include projectId in new record creation

### Phase 5: Main Application Updates
10. **Update Main Page**
    - Add project tab as the first tab
    - Implement tab locking logic
    - Update URL routing for project parameters

11. **Update Header/Navigation**
    - Display current project name
    - Project context integration

### Phase 6: Project Deletion (New Feature)
12. **Cascade Deletion Implementation**
    - Add `deleteProjectCascade()` function to database service
    - Implement safe deletion preserving GCS assets
    - Add project deletion method to ProjectContext

13. **Delete UI Components**
    - Add delete buttons to project table with proper styling
    - Implement confirmation modal with project name display
    - Add loading states and error handling
    - Ensure proper event handling with stopPropagation()

### Phase 7: Backend Integration
14. **Update File Upload Services**
    - Modify GCS upload paths to include projectId
    - Update `src/utils/gcsUpload.js`
    - Update relevant API routes

15. **Migration and Setup**
    - Create default project for existing records
    - Database migration script
    - Testing and validation

## Todo Checklist

### Database Layer
- [x] Update Dexie schema to version 4 with projects table
- [x] Add projectId field to videoRecords and imageRecords tables
- [x] Create Project model class
- [x] Update VideoRecord model to include projectId
- [x] Update ImageRecord model to include projectId
- [x] Add project-specific database query methods
- [x] Implement migration logic for existing records
- [x] Add cascade deletion function (`deleteProjectCascade`)
- [x] Implement safe deletion preserving GCS assets

### Context Layer
- [x] Create ProjectContext with project management logic
- [x] Add project selection and creation methods
- [x] Implement URL synchronization for project state
- [x] Add project validation logic
- [x] Add project deletion methods with cascade deletion
- [x] Update VideoContext to consume projectId
- [x] Update ImageContext to consume projectId

### UI Components
- [x] Implement Start tab as project launcher (`src/app/tabs/Start.jsx`)
- [x] Add project listing with 3-column table layout
- [x] Add project creation modal integrated in Start tab
- [x] Add project deletion with confirmation modal
- [x] Add project tab to main page
- [x] Implement tab locking logic
- [x] Add current project display to header
- [x] Add delete buttons with proper event handling
- [x] Implement responsive design for mobile devices

### URL and Navigation
- [x] Update main page routing to handle pid parameter
- [x] Add project validation on URL load
- [x] Implement redirect logic for invalid projects
- [x] Update tab navigation to preserve project context
- [x] Implement URL synchronization for project state

### Backend Integration
- [ ] Update GCS upload paths to use projectId subfolders
- [ ] Modify relevant API routes for file operations
- [ ] Update file deletion logic to handle project paths

### Migration and Testing
- [ ] Create default project migration
- [ ] Test project creation and selection
- [ ] Test URL-based project loading
- [ ] Test cross-context project state sharing
- [ ] Validate existing record migration
- [ ] Test file upload to project-specific paths

## Implementation Status
**Current Phase**: Phase 6 - Project Deletion ✅
**Completed Phases**: 
- Phase 1: Database Foundation ✅
- Phase 2: Project Context Layer ✅  
- Phase 3: UI Components ✅
- Phase 4: Context Integration ✅
- Phase 5: Main Application Updates ✅
- Phase 6: Project Deletion ✅

**Next Step**: Backend Integration (GCS upload paths)

## Notes
- Existing GCS files remain at root level (no migration needed)
- **Project deletion implemented** with cascade deletion of all records while preserving GCS assets
- **Confirmation modal** ensures user safety with clear warnings about permanent deletion
- **Start tab** serves as the unified project launcher (not separate components)
- **3-column table layout** with responsive design for mobile devices
- **Event handling** uses stopPropagation() to prevent conflicts between row selection and delete actions
- No user collaboration features in this phase
- No project limits implemented
- Default project name: "Default Project"

## Key Files Modified
- `src/service/database.js` - Added `deleteProjectCascade()` function
- `src/context/ProjectContext.js` - Added `deleteProject()` method with state management
- `src/app/tabs/Start.jsx` - Implemented delete UI with confirmation modal
- `src/app/tabs/Start.module.css` - Added delete button and modal styling

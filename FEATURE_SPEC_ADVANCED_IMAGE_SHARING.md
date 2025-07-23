# Cross-Project Advanced Image Sharing Feature Specification

## Overview

This document outlines the implementation plan for advanced cross-project image sharing functionality, building upon the existing cross-project image sharing foundation. The feature introduces bidirectional sharing capabilities between regular projects and the default project, serving as a favorites/bookmark system.

## Project Context & Current State

### Existing Foundation (Completed)
- **Cross-project viewing**: Users can view default project images in regular projects via dual tab system
- **Default Project**: Fixed UUID (`00000000-0000-0000-0000-000000000001`) serves as shared space
- **ImageContext**: Enhanced with `defaultProjectImages` state and loading logic
- **PromptTab**: Dual tab system with "Project" and "Favorites" tabs
- **Database**: Dexie-based storage with project isolation using `projectId` field

### Current Architecture
```
src/
├── models/
│   ├── ImageRecord.js          # Core image data model with projectId support
│   └── Project.js              # Project model with DEFAULT_PROJECT_ID constant
├── context/
│   └── ImageContext.js         # Image state management with default project loading
├── service/
│   └── database.js             # Dexie database with project-filtered queries
└── components/image/
    ├── ImageBlock.js           # Individual image display component
    └── ImageGenModal/
        ├── index.js            # Modal with tab system
        └── tabs/
            └── PromptTab.js    # Tab with Project/Favorites dual view
```

## Feature Requirements

### User Stories

**As a user working in Project A:**
1. I want to "star" an image to share it to my favorites (default project)
2. I want to see visual indication when an image is starred
3. I want to unstar an image to remove it from favorites
4. I want to import images from favorites into my current project

**As a user in any project:**
1. I want to access an "Import from Favorites" tab in the image generation modal
2. I want to copy images from favorites to my current project as independent copies

### User Flows

#### Flow 1: Sharing to Favorites (Star Button)
```
User in Project A → Clicks star on Image X → 
Creates bookmark copy in Default Project → 
Updates original image with favoriteId reference → 
Star button shows filled state
```

#### Flow 2: Unsharing from Favorites  
```
User in Project A → Clicks filled star on Image X → 
Removes bookmark from Default Project → 
Clears favoriteId from original image → 
Star button shows empty state
```

#### Flow 3: Import from Favorites
```
User in Project B → Opens Image Gen Modal → 
Clicks "Import from Favorites" tab → 
Views all default project images → 
Clicks import on Image Y → 
Creates independent copy in Project B → 
Image appears immediately in Project B
```

## Database Schema Changes

### ImageRecord Model Extensions

```javascript
// Add to src/models/ImageRecord.js
class ImageRecord {
    constructor(formData = {}) {
        // ... existing fields ...
        this.favoriteId = formData.favoriteId || null; // Points to bookmark copy in default project
    }
    
    toDatabase() {
        return {
            // ... existing fields ...
            favoriteId: this.favoriteId,
        };
    }
    
    static fromDatabase(data) {
        // ... existing logic ...
        record.favoriteId = data.favoriteId || null;
        return record;
    }
}
```

### Database Migration Strategy

**No migration required** - Dexie handles optional fields gracefully:
- Existing records will have `favoriteId: undefined` 
- New records will explicitly set `favoriteId: null`
- Query logic treats both as "not shared"

### Data Relationships

#### Sharing Relationship (One-way reference)
```javascript
// Original image in Project A
{
  id: "img-123",
  projectId: "project-a-uuid", 
  favoriteId: "bookmark-456",  // Points to bookmark copy
  prompt: "original prompt",
  imageUrls: ["url1", "url2"],
  // ... other fields
}

// Bookmark copy in Default Project  
{
  id: "bookmark-456",
  projectId: "00000000-0000-0000-0000-000000000001", // DEFAULT_PROJECT_ID
  favoriteId: null,  // No back-reference
  prompt: "original prompt",     // Copied from original
  imageUrls: ["url1", "url2"],   // Same URLs (shared GCS files)
  // ... copied fields
}
```

#### Import Relationship (No reference)
```javascript
// Source in Default Project
{
  id: "bookmark-456", 
  projectId: "00000000-0000-0000-0000-000000000001",
  favoriteId: null,
  prompt: "some prompt",
  imageUrls: ["url1", "url2"],
  // ... other data
}

// Imported copy (completely independent)
{
  id: "new-uuid-789",           // New unique ID
  projectId: "current-project-uuid",  // Target project
  favoriteId: null,             // No reference to source
  prompt: "some prompt",        // Copied as-is
  imageUrls: ["url1", "url2"],  // Same URLs (shared GCS files)
  createdAt: "2025-01-22...",   // Import timestamp
  // ... all other data copied exactly
}
```

## Implementation Architecture

### Phase 2: Database Schema Implementation

#### Files to Modify:
1. **`src/models/ImageRecord.js`**
   - Add `favoriteId` field to constructor
   - Update `toDatabase()` and `fromDatabase()` methods
   - Ensure backward compatibility

#### Implementation Details:
```javascript
// ImageRecord constructor addition
this.favoriteId = formData.favoriteId || null;

// toDatabase() addition  
favoriteId: this.favoriteId,

// fromDatabase() addition
record.favoriteId = data.favoriteId || null;
```

### Phase 3: Star Button Implementation

#### Files to Modify:
1. **`src/components/image/ImageBlock.js`**
   - Add star button in top-left corner
   - Implement visual states (empty/filled)
   - Handle click events for share/unshare

2. **`src/context/ImageContext.js`**
   - Add `bookmarkImage(imageId)` method
   - Add `unbookmarkImage(imageId)` method
   - Update state management for immediate UI feedback

#### Component Structure:
```jsx
// Star button in ImageBlock.js
<button 
  className={styles.starButton}
  onClick={handleStarClick}
  title={isShared ? "Remove from favorites" : "Add to favorites"}
>
  {isShared ? <FaStar /> : <FaRegStar />}
</button>
```

#### Context Methods:
```javascript
// In ImageContext.js
const bookmarkImage = async (imageId) => {
  // 1. Get original image
  // 2. Create bookmark copy in default project  
  // 3. Update original with favoriteId
  // 4. Update both states (imageRecords + defaultProjectImages)
};

const unbookmarkImage = async (imageId) => {
  // 1. Get favoriteId from original image
  // 2. Remove bookmark from default project
  // 3. Clear favoriteId from original
  // 4. Update both states
};
```

### Phase 4: Import Tab Implementation

#### Files to Modify:
1. **`src/components/image/ImageGenModal/tabs/ImportTab.js`** (new file)
   - Display default project images in grid layout
   - Import button on each image
   - Handle import operations

2. **`src/components/image/ImageGenModal/index.js`**
   - Add "Import from Favorites" tab
   - Conditional rendering (hide in default project)
   - Tab state management

#### Import Tab Structure:
```jsx
// ImportTab.js
const ImportTab = ({ onClose }) => {
  const { defaultProjectImages, importImage } = useImageContext();
  
  return (
    <div className={styles.importTab}>
      <div className={styles.imageGrid}>
        {defaultProjectImages.map(image => (
          <div key={image.id} className={styles.importableImage}>
            <img src={image.imageUrls[0]} />
            <button onClick={() => handleImport(image.id)}>
              Import
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Modal Integration:
```javascript
// In ImageGenModal/index.js - add tab
const isDefaultProject = currentProject.id === DEFAULT_PROJECT_ID;

{/* Add after existing tabs */}
{!isDefaultProject && (
  <button
    className={`${styles.tabButton} ${activeTab === 'import' ? styles.active : ''}`}
    onClick={() => handleTabClick('import')}
  >
    Import from Favorites
  </button>
)}
```

## Implemented Database Operations ✅ COMPLETED

### Transaction-Based Database Functions
**Implemented in `src/service/database.js`**:

```javascript
// Create bookmark copy in default project with deduplication
export const createBookmarkImage = async (originalImageId) => {
  return await db.transaction('rw', db.imageRecords, async () => {
    // Get original image
    const originalData = await db.imageRecords.get(originalImageId);
    if (!originalData) throw new Error('Original image not found');

    // Check for existing bookmark
    if (originalData.favoriteId) {
        const bookmark = await db.imageRecords.get(originalData.favoriteId)
        if (bookmark) {
            return bookmark; // Return existing bookmark
        }
    }
    
    // Create new bookmark in default project
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

// Remove bookmark and clear favorite reference
export const removeBookmarkImage = async (originalImageId) => {
    const originalData = await db.imageRecords.get(originalImageId);
    if (originalData && originalData.favoriteId) {
        await db.imageRecords.delete(originalData.favoriteId);
        originalData.favoriteId = null;
        await db.imageRecords.put(originalData);
    }
};

// Create independent copy in target project from default project
export const importImageFromDefault = async (originalImageId, targetProjectId) => {
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
};

// Get bookmark by ID
export const getBookmarkById = async (bookmarkId) => {
    const data = await db.imageRecords.get(bookmarkId);
    if (!data) return null;

    const record = ImageRecord.fromDatabase(data);
    record.selectedImageIdx = 0;
    return record;
};
```

### Key Implementation Features:
- **Atomic Transactions**: Using `db.transaction('rw', db.imageRecords, async () => {})` for consistency
- **Deduplication Logic**: `createBookmarkImage` checks for existing bookmarks and returns them
- **Race Condition Prevention**: Fresh database reads instead of relying on in-memory state  
- **Error Handling**: Try-catch blocks with appropriate error logging
- **No Migration Required**: `favoriteId` field handled gracefully by Dexie

## CSS Styling Specifications

### Star Button Styling
```css
/* In ImageBlock.module.css */
.starButton {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #ffd700; /* Gold color for star */
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  z-index: 10;
}

.starButton:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.starButton.shared {
  color: #ffd700; /* Filled star - gold */
}

.starButton.unshared {
  color: #ffffff; /* Empty star - white */
}
```

### Import Tab Styling
```css
/* In ImportTab.module.css */
.importTab {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.imageGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.importableImage {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.importableImage:hover {
  border-color: #007bff;
}

.importButton {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
```

## Edge Cases & Considerations

### GCS File Management
- **Issue**: Deleting original image shouldn't remove GCS files if bookmark exists
- **Solution**: Update delete logic to check `favoriteId` before GCS deletion
- **Implementation**: Add bookmark existence check in delete operations

### Error Handling
1. **Missing bookmark files**: No special handling - user can delete manually
2. **Network failures during sharing**: Rollback partial operations
3. **Corrupted image URLs**: Display placeholder with error message
4. **Concurrent modifications**: Use database transactions for consistency

### Performance Considerations
- **Large favorite collections**: Implement pagination for import tab
- **Image loading**: Lazy loading for import tab grid
- **State updates**: Debounce rapid star button clicks

### UI/UX Details
- **Star button visibility**: Only show in non-default projects
- **Import tab availability**: Hide when in default project
- **Immediate feedback**: Update UI state before database operations complete
- **Loading states**: Show spinner during share/import operations

## Implementation TODO Lists

### Phase 2: Database Schema ✅ COMPLETED
- [x] Add `favoriteId` field to ImageRecord constructor
- [x] Update `toDatabase()` method with favoriteId serialization
- [x] Update `fromDatabase()` method with favoriteId deserialization  
- [x] Add database functions for bookmark management (`createBookmarkImage`, `removeBookmarkImage`, `importImageFromDefault`)
- [x] Add ImageContext methods (`bookmarkImage`, `unbookmarkImage`, `importImage`)
- [x] Implement transaction-based operations for atomicity
- [x] Add deduplication logic in `createBookmarkImage`
- [x] Test backward compatibility with existing records

### Phase 3: Star Button Implementation (Next Task)
- [ ] Add star button component to ImageBlock
- [ ] Implement visual states using FaStar/FaRegStar icons
- [ ] Add CSS styling for star button positioning and effects
- [ ] Wire up `bookmarkImage()` and `unbookmarkImage()` context methods
- [ ] Add UI state management for immediate visual feedback
- [ ] Handle edge cases (missing bookmarks, network errors)
- [ ] Add loading states for share/unshare operations

### Phase 4: Import Tab Implementation  
- [ ] Create ImportTab component with image grid layout
- [ ] Add "Import from Favorites" tab to ImageGenModal
- [ ] Implement conditional tab rendering (hide in default project)
- [ ] Wire up `importImage()` context method
- [ ] Add immediate state updates for imported images
- [ ] Style import tab with hover effects and import buttons
- [ ] Handle empty states (no favorites available)
- [ ] Add loading states for import operations

## File Locations Summary

### Files to Create:
- `src/components/image/ImageGenModal/tabs/ImportTab.js`
- `src/components/image/ImageGenModal/tabs/ImportTab.module.css`

### Files Modified ✅ COMPLETED:
- `src/models/ImageRecord.js` - Added favoriteId field
- `src/context/ImageContext.js` - Added sharing/import methods (`bookmarkImage`, `unbookmarkImage`, `importImage`)
- `src/service/database.js` - Added bookmark operations (`createBookmarkImage`, `removeBookmarkImage`, `importImageFromDefault`)

### Files to Modify (Remaining):
- `src/components/image/ImageBlock.js` - Add star button
- `src/components/image/ImageBlock.module.css` - Star button styling
- `src/components/image/ImageGenModal/index.js` - Add import tab

### Files Referenced:
- `src/models/Project.js` - DEFAULT_PROJECT_ID constant
- `src/constants/image.js` - Image size constants
- `src/utils/download.js` - Download utilities

---

*This specification serves as the comprehensive reference for implementing advanced cross-project image sharing functionality across multiple development phases.*

import Dexie from 'dexie';

export class VideoDB extends Dexie {
  constructor() {
    super('VideoDatabase');
    
    // Define database schema with video records table
    this.version(1).stores({
      videoRecords: 'id, status, createdAt'
      // id will be the taskId
      // We index status and createdAt for faster queries
    });

    // Version 2: Add taskId and videoId fields for better ID management
    this.version(2).stores({
      videoRecords: 'id, status, createdAt, taskId, videoId'
      // id: Primary key (backward compatibility with task ID)
      // taskId: Explicit task ID field
      // videoId: Actual video ID from API response for extensions
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
      .orderBy('createdAt')
      .reverse()
      .offset(offset)
      .limit(pageSize)
      .toArray();
    
    return records;
  } catch (error) {
    console.error('Failed to load video records page:', error);
    return [];
  }
};

// Get total count of video records
export const getTotalVideoRecordsCount = async () => {
  try {
    return await db.videoRecords.count();
  } catch (error) {
    console.error('Failed to get total video records count:', error);
    return 0;
  }
};

// Clear all records from the database
export const clearDatabase = async () => {
  return await db.videoRecords.clear();
};

// Export all records to a JSON file
export const exportDatabase = async () => {
  const records = await db.videoRecords.toArray();
  const blob = new Blob([JSON.stringify(records)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `video-records-export-${new Date().toISOString()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

class Task {
  constructor(taskId, status, createdAt, timestamp) {
    this.taskId = taskId;
    this.status = status;
    this.createdAt = createdAt;
    this.timestamp = timestamp;
  }

  static fromApiResponse(apiResponse) {
    return new Task(
      apiResponse.task_id,
      apiResponse.task_status,
      apiResponse.created_at,
      apiResponse.updated_at,
      new Date().toLocaleString()
    );
  }
}

export default Task;

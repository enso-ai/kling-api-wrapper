# Kling AI Video Extension API Documentation

## Overview

The Kling AI Video Extension API allows you to extend the duration of existing text-to-video or image-to-video results. This feature enables you to create longer videos by adding additional content to previously generated videos.

## Important Notes

### Note 1: Extension Capabilities
Video extension refers to extending the duration of text-to-video/image-to-video results. Each extension can add **4 to 5 seconds**, and the model and mode used cannot be selected; they must be the same as the source video.

### Note 2: Model Limitations
Video extension is currently **not supported** for videos generated by the **V1.5 model**.

### Note 3: Duration Limits
Videos that have been extended can be extended again, but the **total video duration cannot exceed 3 minutes**.

## API Endpoints

### Create Extension Task

**Endpoint**: `https://api.klingai.com/v1/videos/video-extend`

| Property | Value |
|----------|-------|
| Protocol | HTTPS |
| Method | POST |
| Request Format | application/json |
| Response Format | application/json |

### Request Headers

| Field | Value | Description |
|-------|-------|-------------|
| Content-Type | application/json | Data Exchange Format |
| Authorization | Bearer {token} | Authentication information, refer to API authentication |

### Request Body Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `video_id` | string | Required | None | Video ID<br/>• Supports video IDs generated by text-to-video, image-to-video and video extension interfaces<br/>• Cannot exceed 3 minutes<br/>• Videos are cleared 30 days after generation |
| `prompt` | string | Optional | None | Text Prompt<br/>• Cannot exceed 2500 characters |
| `negative_prompt` | string | Optional | null | Negative text prompt<br/>• Cannot exceed 2500 characters |
| `cfg_scale` | float | Optional | 0.5 | Flexibility in video generation<br/>• Higher value = lower model flexibility, stronger prompt relevance<br/>• Value range: [0, 1] |
| `callback_url` | string | Optional | None | Callback notification address for task results<br/>• Server will notify when task status changes<br/>• Refer to "Callback Protocol" for message schema |

### Request Example

```json
{
  "video_id": "existing-video-id-123",
  "prompt": "Continue the scene with more dramatic lighting",
  "negative_prompt": "blurry, low quality",
  "cfg_scale": 0.7,
  "callback_url": "https://your-domain.com/webhook"
}
```

### Response Body

```json
{
  "code": 0,
  "message": "string",
  "request_id": "string",
  "data": {
    "task_id": "string",
    "task_status": "string",
    "created_at": 1722769557708,
    "updated_at": 1722769557708
  }
}
```

#### Response Fields Description

| Field | Description |
|-------|-------------|
| `code` | Error codes (0 = success) |
| `message` | Error information |
| `request_id` | System-generated request ID for tracking |
| `task_id` | System-generated task ID |
| `task_status` | Task status: `submitted`, `processing`, `succeed`, `failed` |
| `created_at` | Task creation time (Unix timestamp in ms) |
| `updated_at` | Task update time (Unix timestamp in ms) |

## Query Tasks

### Query Single Task

**Endpoint**: `https://api.klingai.com/v1/videos/video-extend/{task_id}`

| Property | Value |
|----------|-------|
| Method | GET |
| Request Format | application/json |
| Response Format | application/json |

#### Path Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_id` | string | Required | Task ID for video extension |

#### Response Body

```json
{
  "code": 0,
  "message": "string",
  "request_id": "string",
  "data": {
    "task_id": "string",
    "task_status": "string",
    "task_status_msg": "string",
    "task_info": {
      "parent_video": {
        "id": "string",
        "url": "string",
        "duration": "string"
      }
    },
    "task_result": {
      "videos": [
        {
          "id": "string",
          "url": "string",
          "seed": "string",
          "duration": "string"
        }
      ]
    },
    "created_at": 1722769557708,
    "updated_at": 1722769557708
  }
}
```

#### Additional Response Fields

| Field | Description |
|-------|-------------|
| `task_status_msg` | Task status information, shows failure reason when task fails |
| `parent_video.id` | Video ID before extension |
| `parent_video.url` | URL of the original video |
| `parent_video.duration` | Duration of video before extension (in seconds) |
| `videos[].id` | Generated video ID (globally unique) |
| `videos[].url` | URL for generated video |
| `videos[].seed` | Random seed used for video generation |
| `videos[].duration` | Total video duration in seconds |

### Query Task List

**Endpoint**: `https://api.klingai.com/v1/videos/video-extend`

| Property | Value |
|----------|-------|
| Method | GET |
| Request Format | application/json |
| Response Format | application/json |

#### Query Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `pageNum` | int | Optional | 1 | [1, 1000] | Page number |
| `pageSize` | int | Optional | 30 | [1, 500] | Data volume per page |

#### Example URL
```
https://api.klingai.com/v1/videos/video-extend?pageNum=1&pageSize=30
```

#### Response Body

```json
{
  "code": 0,
  "message": "string",
  "request_id": "string",
  "data": [
    {
      "task_id": "string",
      "task_status": "string",
      "task_status_msg": "string",
      "task_info": {
        "parent_video": {
          "id": "string",
          "url": "string",
          "duration": "string"
        }
      },
      "task_result": {
        "videos": [
          {
            "id": "string",
            "url": "string",
            "seed": "string",
            "duration": "string"
          }
        ]
      },
      "created_at": 1722769557708,
      "updated_at": 1722769557708
    }
  ]
}
```

## Task Status Values

| Status | Description |
|--------|-------------|
| `submitted` | Task has been submitted |
| `processing` | Task is currently being processed |
| `succeed` | Task completed successfully |
| `failed` | Task failed to complete |

## Implementation Examples

### JavaScript Example

```javascript
class KlingVideoExtension {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.klingai.com/v1/videos/video-extend';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
    }

    async extendVideo(videoId, options = {}) {
        const payload = {
            video_id: videoId,
            cfg_scale: options.cfgScale || 0.5,
            ...options.prompt && { prompt: options.prompt },
            ...options.negativePrompt && { negative_prompt: options.negativePrompt }
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(payload)
        });

        return await response.json();
    }

    async checkTaskStatus(taskId) {
        const response = await fetch(`${this.baseUrl}/${taskId}`, {
            headers: this.headers
        });

        return await response.json();
    }

    async listTasks(pageNum = 1, pageSize = 30) {
        const url = new URL(this.baseUrl);
        url.searchParams.append('pageNum', pageNum);
        url.searchParams.append('pageSize', pageSize);

        const response = await fetch(url, {
            headers: this.headers
        });

        return await response.json();
    }
}

// Usage example
const api = new KlingVideoExtension('your-api-key');

// Extend a video
api.extendVideo('existing-video-id', {
    prompt: 'Continue with more dramatic effects',
    cfgScale: 0.8
}).then(result => {
    console.log('Extension task created:', result.data.task_id);
    
    // Check status after some time
    setTimeout(() => {
        api.checkTaskStatus(result.data.task_id)
            .then(status => console.log('Status:', status.data.task_status));
    }, 30000);
});
```

### cURL Example

```bash
# Create extension task
curl -X POST "https://api.klingai.com/v1/videos/video-extend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "video_id": "existing-video-id",
    "prompt": "Add more cinematic effects",
    "cfg_scale": 0.7
  }'

# Check task status
curl -X GET "https://api.klingai.com/v1/videos/video-extend/TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY"

# List tasks
curl -X GET "https://api.klingai.com/v1/videos/video-extend?pageNum=1&pageSize=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Best Practices

### Extension Strategy
1. **Plan Extensions**: Since each extension adds 4-5 seconds, plan your total video length accordingly
2. **Consistent Prompts**: Use prompts that naturally continue the narrative from the original video
3. **Monitor Duration**: Keep track of total duration to stay under the 3-minute limit
4. **Quality Considerations**: Multiple extensions may affect overall video quality

### Error Handling
- Always check the `code` field in responses (0 = success)
- Handle failed tasks by checking `task_status_msg` for detailed error information
- Implement retry logic for failed requests
- Monitor task status regularly using the query endpoints

### Data Management
- Videos are automatically cleared after 30 days
- Save important videos to your own storage immediately
- Keep track of video IDs for future extensions
- Use descriptive prompts to maintain video continuity

## Limitations and Considerations

### Model Compatibility
- **Not supported**: Videos generated by V1.5 model
- **Supported**: Videos from text-to-video, image-to-video, and previous extensions
- Model and mode settings are inherited from the original video

### Duration Constraints
- Maximum total duration: 3 minutes (180 seconds)
- Each extension adds: 4-5 seconds
- Maximum possible extensions: ~30-40 (depends on original video length)

### Content Policies
- Extensions must comply with Kling AI's content policies
- Inappropriate content may cause task failure
- Use negative prompts to avoid unwanted content

## Error Codes

Common error scenarios:
- Invalid video ID
- Video not found or expired
- Content policy violations
- Rate limit exceeded
- Authentication errors

For specific error code definitions, refer to the main API documentation error codes section.

---

*This documentation is based on the official Kling AI Video Extension API reference. For the most up-to-date information and additional details, please refer to the official Kling AI developer documentation.*
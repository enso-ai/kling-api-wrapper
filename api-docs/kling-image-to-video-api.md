# Kling AI - Image to Video API Documentation

## Overview

This API allows you to generate videos from images using Kling AI's machine learning models.

## API Endpoints

### Create Task

| Protocol | Request URL | Request Method | Request Format | Response Format |
|----------|-------------|----------------|----------------|-----------------|
| https | /v1/videos/image2video | POST | application/json | application/json |

#### Request Header

| Field | Value | Description |
|-------|-------|-------------|
| Content-Type | application/json | Data Exchange Format |
| Authorization | Authentication information | Refer to API authentication |

#### Example Request

```bash
curl --location --request POST 'https://api.klingai.com/v1/videos/image2video' \
--header 'Authorization: Bearer xxx' \
--header 'Content-Type: application/json' \
--data-raw '{
    "model_name": "kling-v1",
    "mode": "pro",
    "duration": "5",
    "image": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg",
    "prompt": "The astronaut stood up and walked away",
    "cfg_scale": 0.5,
    "static_mask": "https://h2.inkwai.com/bs2/upload-ylab-stunt/ai_portal/1732888177/cOLNrShrSO/static_mask.png",
    "dynamic_masks": [
      {
        "mask": "https://h2.inkwai.com/bs2/upload-ylab-stunt/ai_portal/1732888130/WU8spl23dA/dynamic_mask_1.png",
        "trajectories": [
          {"x":279,"y":219},{"x":417,"y":65}
        ]
      }
    ]
}'
```

#### Request Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| model_name | string | Optional | kling-v1 | Model Name. Enum values: kling-v1, kling-v1-5, kling-v1-6, kling-v2-master |
| image | string | Required | Null | Reference Image. Supports image Base64 encoding or image URL (ensure accessibility). Supported formats: .jpg/.jpeg/.png. Image size cannot exceed 10MB, dimensions not less than 300px, aspect ratio between 1:2.5 ~ 2.5:1 |
| image_tail | string | Optional | Null | Reference Image - End frame control. Same format requirements as the image field. |
| prompt | string | Optional | None | Positive text prompt. Cannot exceed 2500 characters |
| negative_prompt | string | Optional | Null | Negative text prompt. Cannot exceed 2500 characters |
| cfg_scale | float | Optional | 0.5 | Flexibility in video generation. Value range: [0, 1]. Higher value means lower flexibility and stronger relevance to prompt |
| mode | string | Optional | std | Video generation mode. Enum values: std (Standard, cost-effective), pro (Professional, higher quality) |
| static_mask | string | Optional | null | Static Brush Application Area. Same format requirements as the image field. |
| dynamic_masks | array | Optional | null | Dynamic Brush Configuration List. Up to 6 groups. |
| dynamic_masks.mask | string | Optional | null | Dynamic Brush Application Area. Same format requirements as the image field. |
| dynamic_masks.trajectories | array | Optional | null | Motion Trajectory Coordinate Sequence. For 5-second video, must have 2-77 coordinates. |
| dynamic_masks.trajectories.x | int | Optional | null | Horizontal coordinate (X-coordinate) of trajectory point |
| dynamic_masks.trajectories.y | int | Optional | null | Vertical coordinate (Y-coordinate) of trajectory point |
| camera_control | object | Optional | Null | Terms of controlling camera movement |
| camera_control.type | string | Optional | None | Predefined camera movements type. Enum values: "simple", "down_back", "forward_up", "right_turn_forward", "left_turn_forward" |
| camera_control.config | object | Optional | None | Camera movement configuration |
| config.horizontal | float | Optional | None | Camera movement along horizontal axis. Range: [-10, 10] |
| config.vertical | float | Optional | None | Camera movement along vertical axis. Range: [-10, 10] |
| config.pan | float | Optional | None | Camera rotation in vertical plane. Range: [-10, 10] |
| config.tilt | float | Optional | None | Camera rotation in horizontal plane. Range: [-10, 10] |
| config.roll | float | Optional | None | Camera rolling amount. Range: [-10, 10] |
| config.zoom | float | Optional | None | Camera focal length change. Range: [-10, 10] |
| duration | string | Optional | 5 | Video Length in seconds. Enum values: 5, 10 |
| callback_url | string | Optional | None | Callback notification address |
| external_task_id | string | Optional | None | Customized Task ID |

#### Response

```json
{
  "code": 0, 
  "message": "string", 
  "request_id": "string", 
  "data":{
    "task_id": "string",
    "task_status": "string", 
    "task_info":{ 
      "external_task_id": "string"
    },
    "created_at": 1722769557708,
    "updated_at": 1722769557708
  }
}
```

### Query Task (Single)

| Protocol | Request URL | Request Method | Request Format | Response Format |
|----------|-------------|----------------|----------------|-----------------|
| https | /v1/videos/image2video/{id} | GET | application/json | application/json |

#### Request Header

| Field | Value | Description |
|-------|-------|-------------|
| Content-Type | application/json | Data Exchange Format |
| Authorization | Authentication information | Refer to API authentication |

#### Path Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| task_id | string | Optional | None | Task ID for Image to Video |
| external_task_id | string | Optional | None | Customized Task ID for Image-to-Video |

#### Response

```json
{
  "code": 0,
  "message": "string",
  "request_id": "string",
  "data":{
    "task_id": "string",
    "task_status": "string",
    "task_status_msg": "string",
    "task_info":{
      "external_task_id": "string"
    },
    "created_at": 1722769557708,
    "updated_at": 1722769557708,
    "task_result":{
      "videos":[
        {
          "id": "string",
          "url": "string",
          "duration": "string"
        }
      ]
    }
  }
}
```

### Query Task (List)

| Protocol | Request URL | Request Method | Request Format | Response Format |
|----------|-------------|----------------|----------------|-----------------|
| https | /v1/videos/image2video | GET | application/json | application/json |

#### Request Header

| Field | Value | Description |
|-------|-------|-------------|
| Content-Type | application/json | Data Exchange Format |
| Authorization | Authentication information | Refer to API authentication |

#### Query Parameters

Example: `/v1/videos/image2video?pageNum=1&pageSize=30`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| pageNum | int | Optional | 1 | Page number. Range: [1,1000] |
| pageSize | int | Optional | 30 | Data volume per page. Range: [1,500] |

#### Response

```json
{
  "code": 0,
  "message": "string",
  "request_id": "string",
  "data":[
    {
      "task_id": "string",
      "task_status": "string",
      "task_status_msg": "string",
      "task_info":{
        "external_task_id": "string"
      },
      "created_at": 1722769557708,
      "updated_at": 1722769557708,
      "task_result":{
        "videos":[
          {
            "id": "string",
            "url": "string",
            "duration": "string"
          }
        ]
      }
    }
  ]
}
```

## Important Notes

1. When using Base64 encoding, provide only the Base64-encoded string portion without prefixes like `data:image/png;base64`.
2. At least one parameter should be filled in between parameter image and parameter image_tail - they cannot both be empty at the same time.
3. The parameters image+image_tail, dynamic_masks/static_mask, and camera_control cannot be used simultaneously.
4. The support range for different model versions and video modes varies. Refer to the "Capability Map" for details.
5. Generated images/videos will be cleared after 30 days for security purposes.

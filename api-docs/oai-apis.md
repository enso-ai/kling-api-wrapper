# OpenAI API Endpoints Documentation

This document describes the three OpenAI-powered API endpoints available in the application for image generation and manipulation.

## Overview

The application provides three OpenAI-based image processing endpoints:

1. **Text-to-Image Generation** (`/api/oai/gen_img`) - Generate images from text prompts
2. **Image Extension** (`/api/oai/extend`) - Extend existing images with additional content
3. **Image Inpainting** (`/api/oai/inpainting`) - Modify specific parts of images using masks

All endpoints use OpenAI's image generation capabilities and automatically upload results to Google Cloud Storage (GCS).

## Common Parameters

All endpoints share these common parameters:

- **`project_id`** (string, required) - Project identifier for organizing assets
- **`asset_type`** (string, required) - Type of asset for GCS folder organization
- **`n`** (number, optional) - Number of images to generate (1-10, default: 1)

### Valid Asset Types
The `asset_type` must be one of the valid types defined in `GCS_CONFIG.FOLDERS`. Check the configuration for current valid types.

## Endpoints

### 1. Text-to-Image Generation

**Endpoint:** `POST /api/oai/gen_img`

Generate images from text descriptions using OpenAI's image generation model.

#### Request Parameters

```json
{
  "prompt": "string (required) - Text description of the image to generate",
  "n": "number (optional) - Number of images to generate (1-10, default: 1)",
  "project_id": "string (required) - Project identifier",
  "asset_type": "string (required) - Asset type for GCS organization"
}
```

#### Example Request

```json
{
  "prompt": "A serene mountain landscape with a crystal clear lake",
  "n": 2,
  "project_id": "my-project-123",
  "asset_type": "generated_images"
}
```

#### Response Format

```json
{
  "success": true,
  "result": {
    "images": [
      {
        "imageUrl": "https://storage.googleapis.com/...",
        "revisedPrompt": "Enhanced prompt used by OpenAI"
      }
    ],
    "format": "png",
    "created": 1713833628
  }
}
```

### 2. Image Extension

**Endpoint:** `POST /api/oai/extend`

Extend existing images by adding new content based on the provided images and prompt.

#### Request Parameters

```json
{
  "image_urls": "array (required) - Array of image URLs to extend (max 10 images)",
  "prompt": "string (required) - Description of how to extend the images",
  "n": "number (optional) - Number of extended images to generate (1-10, default: 1)",
  "project_id": "string (required) - Project identifier",
  "asset_type": "string (required) - Asset type for GCS organization"
}
```

#### Example Request

```json
{
  "image_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "prompt": "Add a beautiful sunset sky to the background",
  "n": 1,
  "project_id": "my-project-123",
  "asset_type": "extended_images"
}
```

#### Response Format

```json
{
  "success": true,
  "result": {
    "images": [
      "https://storage.googleapis.com/extended-image-url"
    ],
    "format": "png",
    "created": 1713833628
  }
}
```

### 3. Image Inpainting

**Endpoint:** `POST /api/oai/inpainting`

Modify specific parts of an image using a mask to define the areas to be changed.

#### Request Parameters

```json
{
  "image_gcs_url": "string (required) - GCS URL of the image to modify",
  "mask": "string (required) - Mask defining areas to modify",
  "prompt": "string (required) - Description of the desired changes",
  "n": "number (optional) - Number of inpainted images to generate (1-10, default: 1)",
  "project_id": "string (required) - Project identifier",
  "asset_type": "string (required) - Asset type for GCS organization"
}
```

#### Example Request

```json
{
  "image_gcs_url": "https://storage.googleapis.com/bucket/original-image.jpg",
  "mask": "base64-encoded-mask-data",
  "prompt": "Replace the sky with a starry night",
  "n": 1,
  "project_id": "my-project-123",
  "asset_type": "inpainted_images"
}
```

#### Response Format

```json
{
  "success": true,
  "result": {
    "images": [
      "https://storage.googleapis.com/inpainted-image-url"
    ],
    "format": "png",
    "created": 1713833628
  }
}
```

## Error Handling

All endpoints handle the following error scenarios:

### Validation Errors (400)
- Missing required parameters
- Invalid parameter values
- Invalid `asset_type`
- Invalid `n` parameter (must be 1-10)
- Too many images in `image_urls` array (max 10)

### Content Moderation (403)
```json
{
  "error": "CONTENT_MODERATION_BLOCKED"
}
```

This error occurs when the content violates OpenAI's usage policies.

### Server Errors (500)
```json
{
  "error": "Error message describing the issue"
}
```

## Usage Notes

1. **Image Formats**: All generated images are returned in PNG format
2. **Storage**: Images are automatically uploaded to Google Cloud Storage
3. **Content Policy**: All requests are subject to OpenAI's content moderation policies
4. **Rate Limits**: Follow standard API rate limiting practices
5. **Timestamps**: The `created` field contains a Unix timestamp

## Integration

These endpoints are designed to work with the client-side utilities in `src/service/backend.js`. Use the provided utility functions for easier integration:

- `apiClient.generateImage(options)`
- `apiClient.extendImage(options)`
- `apiClient.inpaintImage(options)`

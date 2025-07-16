# Kling Client - AI Image & Video Generation Playground

A Next.js web application that provides a user-friendly interface for generating images and videos using Kling AI and OpenAI APIs. This playground app allows users to create, edit, and extend multimedia content through various AI-powered tools.

## Project Overview

This application serves as a comprehensive playground for AI-generated content, featuring:
- **Image Generation**: Create images using OpenAI's image API (gpt-image model)
- **Image Editing**: Inpainting and extension capabilities
- **Video Generation**: Create videos using Kling AI's video generation API
- **Video Extension**: Extend existing videos with additional content
- **Asset Management**: Google Cloud Storage integration for media files

## Folder Structure

```
kling-client/
├── api-docs/                          # API documentation files
│   ├── kling-general.md              # General Kling API documentation
│   ├── kling-image-to-video-api.md   # Kling video generation API docs
│   ├── kling_video_extension_docs.md # Video extension API docs
│   ├── kling-account-info-api.md     # Account management API docs
│   └── oai-apis.md                   # OpenAI API documentation
├── src/
│   ├── app/                          # Next.js App Router pages and API routes
│   │   ├── api/                      # Backend API endpoints
│   │   │   ├── account/              # User account management
│   │   │   ├── gcs/                  # Google Cloud Storage operations
│   │   │   ├── me/                   # User profile endpoints
│   │   │   ├── oai/                  # OpenAI API integrations
│   │   │   │   ├── gen_img/          # Image generation
│   │   │   │   ├── inpainting/       # Image inpainting
│   │   │   │   └── extend/           # Image extension
│   │   │   └── videos/               # Kling video operations
│   │   │       ├── [taskId]/         # Individual video task status
│   │   │       └── extension/        # Video extension endpoints
│   │   ├── tabs/                     # Main application tab components
│   │   │   ├── ImageTool.jsx         # Image generation interface
│   │   │   └── videoTool.jsx         # Video generation interface
│   │   ├── layout.js                 # Root layout component
│   │   ├── page.js                   # Home page
│   │   └── globals.css               # Global styles
│   ├── components/                   # Reusable React components
│   │   ├── common/                   # Shared UI components
│   │   │   └── Dropdown.js           # Generic dropdown component
│   │   ├── image/                    # Image-related components
│   │   │   ├── ImageGenModal/        # Image generation modal
│   │   │   ├── ImageGrid.js          # Grid display for images
│   │   │   ├── ImageBlock.js         # Individual image component
│   │   │   ├── InpaintingComposite.js # Image inpainting interface
│   │   │   └── ReferenceImageStack.js # Reference image management
│   │   └── video/                    # Video-related components
│   │       ├── VideoGrid.jsx         # Grid display for videos
│   │       ├── VideoPlayer.jsx       # Video playback component
│   │       ├── ModelSelector.jsx     # AI model selection
│   │       ├── DurationSelector.jsx  # Video duration controls
│   │       └── VideoExtensionModal.jsx # Video extension interface
│   ├── context/                      # React Context providers
│   │   ├── ImageContext.js           # Image state management
│   │   ├── VideoContext.js           # Video state management
│   │   └── ImageGenModalContext.js   # Modal state management
│   ├── hooks/                        # Custom React hooks
│   │   └── useImageDropAndPaste.js   # Drag & drop functionality
│   ├── models/                       # Data models and types
│   │   ├── ImageRecord.js            # Image data structure
│   │   ├── VideoRecord.js            # Video data structure
│   │   ├── Task.js                   # Task tracking model
│   │   ├── VideoOptions.js           # Video generation options
│   │   └── ExtensionRecord.js        # Extension tracking model
│   ├── service/                      # API service layers
│   │   ├── backend.js                # General backend utilities
│   │   ├── database.js               # Local database (Dexie)
│   │   ├── oai.js                    # OpenAI service integration
│   │   └── kling/                    # Kling API services
│   │       ├── index.js              # Main Kling service
│   │       └── keyManager.js         # API key management
│   ├── utils/                        # Utility functions
│   │   ├── image_gen.js              # Image generation helpers
│   │   ├── image.js                  # Image processing utilities
│   │   ├── gcsUpload.js              # Google Cloud Storage upload
│   │   ├── download.js               # File download utilities
│   │   └── inpainting_verification.js # Inpainting validation
│   └── constants/                    # Application constants
│       ├── image.js                  # Image-related constants
│       └── gcs.js                    # Google Cloud Storage config
├── jsconfig.json                     # JavaScript configuration (path aliases)
├── package.json                      # Node.js dependencies and scripts
├── deploy.sh                         # Deployment script for Google Cloud Run
└── README.md                         # This file
```

## Import Path Configuration

The project uses path aliases configured in `jsconfig.json` for cleaner imports:
- Use `@/` to reference files from the `src/` directory
- Example: `import { ImageContext } from '@/context/ImageContext.js'`

## Local Development Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm

### Environment Variables
Create a `.env.local` file (if you use direnv) in the root directory with the following variables:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Kling API Configuration
KLING_KEYS=your_kling_api_keys_here

# Additional environment variables as needed
```

### Google Service Account Setup
1. Obtain the `google-service-account.json` file from Google Cloud Platform:
   - Service account: `playground@pure-lantern-394915.iam.gserviceaccount.com`
   - Contact Jimmy if you need access to this file
2. Place the file in the project root directory
3. **Important**: This file is not included in the repository for security reasons

### Installation & Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will run in development mode with hot reloading enabled.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Web Application Features

### Image Tools
- **Text-to-Image Generation**: Create images from text prompts using OpenAI's image API
- **Image Inpainting**: Edit parts of existing images by painting over areas
- **Image Extension**: Extend images beyond their original boundaries
- **Reference Images**: Use existing images as references for new generations

### Video Tools
- **Text-to-Video**: Generate videos from text descriptions using Kling AI
- **Image-to-Video**: Convert static images into dynamic video content
- **Video Extension**: Extend existing videos with additional content
- **Duration Control**: Specify video length and other generation parameters

## API Endpoints

### OpenAI Integration (`/api/oai/`)
- `POST /api/oai/gen_img` - Generate images using OpenAI image API
- `POST /api/oai/inpainting` - Perform image inpainting
- `POST /api/oai/extend` - Extend images

### Kling Video API (`/api/videos/`)
- `POST /api/videos` - Generate new videos
- `GET /api/videos/[taskId]` - Check video generation status
- `POST /api/videos/extension/[videoId]` - Extend existing videos

### Asset Management (`/api/gcs/`)
- `POST /api/gcs/asset` - Upload assets to Google Cloud Storage

### User Management
- `GET /api/me` - Get current user information
- `GET /api/account` - Account management endpoints

## Deployment

### Production Environment
- **Platform**: Google Cloud Run
- **Service Name**: `kling-client-next`
- **Region**: `us-west1`
- **Domain**: [playground.v01s.com](https://playground.v01s.com) (AWS-hosted domain)

### Deployment Process

1. Use the deployment script:
```bash
./deploy.sh
```

2. Monitor the build process at:
[Google Cloud Build Console](https://console.cloud.google.com/cloud-build/builds?inv=1&invt=Ab273Q&project=pure-lantern-394915)

### Production Configuration
The deployment uses Google Cloud Platform secrets for environment variables:
- `OPENAI_API_KEY` → `playground-openai-secret:latest`
- `KLING_KEYS` → `kling-api-keys:latest`

Service accounts used:
- Build: `cloud-build@pure-lantern-394915.iam.gserviceaccount.com`
- Runtime: `playground@pure-lantern-394915.iam.gserviceaccount.com`

## Technology Stack

- **Frontend**: React 19, Next.js 15.3.2
- **Database**: Dexie (IndexedDB wrapper)
- **Cloud Storage**: Google Cloud Storage
- **AI APIs**: OpenAI (gpt-image model), Kling AI
- **Deployment**: Google Cloud Run
- **Build Tool**: Turbopack

## Development Notes

- The application uses Next.js App Router for routing and API endpoints
- Local data is stored using Dexie for offline capabilities
- All media files are stored in Google Cloud Storage
- The app supports drag-and-drop for image uploads
- Real-time status updates for long-running video generation tasks

## API Documentation

Detailed third party API documentation is available in the `api-docs/` directory:
- General guidelines and authentication
- Endpoint specifications
- Request/response examples
- Error handling information

These files serve as reference documentation for code agents to ensure they use the most current API specifications rather than relying on potentially outdated information in their training data or generating hallucinated API details.

For additional support or questions, contact the development team.

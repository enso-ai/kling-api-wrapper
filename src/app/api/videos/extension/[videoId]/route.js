import { NextResponse } from 'next/server';
import { klingClient } from '../../../../../service/kling';

export async function POST(request, { params }) {
    /** 
     * POST /api/videos/extension/[videoId]
     * Creates a video extension task for an existing video
     * 
     * Request Body (all fields optional except videoId from path):
     * {
     *   "prompt": "string (optional) - Text prompt to guide the extension, max 2500 characters",
     *   "negative_prompt": "string (optional) - Negative text prompt to avoid certain content, max 2500 characters", 
     *   "cfg_scale": "float (optional) - Flexibility in video generation, range [0, 1], default: 0.5",
     *   "callback_url": "string (optional) - Webhook URL for task status notifications"
     * }
     * 
     * Response:
     * {
     *   "code": 0,
     *   "message": "string",
     *   "request_id": "string", 
     *   "data": {
     *     "task_id": "string",
     *     "task_status": "submitted|processing|succeed|failed",
     *     "created_at": 1722769557708,
     *     "updated_at": 1722769557708
     *   }
     * }
     */
    try {
        const resolvedParams = await params;
        const videoId = resolvedParams.videoId;
        const body = await request.json();

        // Use the server-side utility function to extend a video
        const data = await klingClient.extendVideoOnKlingAPI(videoId, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error extending video:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request, { params }) {
    /**
     * Video Extension API Endpoints
     * 
     * 
     * GET /api/videos/extension/[videoId]?taskId={taskId}
     * Gets specific extension task status
     * 
     * GET /api/videos/extension/[videoId]?pageNum={pageNum}&pageSize={pageSize}
     * Lists extension tasks with pagination (default: pageNum=1, pageSize=30)
     * 
     * Notes:
     * - Each extension adds 4-5 seconds to the video
     * - Total video duration cannot exceed 3 minutes
     * - Extension not supported for V1.5 model videos
     * - Videos are cleared 30 days after generation
     */
    try {
        const resolvedParams = await params;
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');
        const pageNum = parseInt(searchParams.get('pageNum') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '30', 10);

        let data;

        if (taskId) {
            // Get specific extension task status
            data = await klingClient.getExtensionTaskByIdFromKlingAPI(taskId);
        } else {
            // List extension tasks with pagination
            data = await klingClient.listExtensionTasksFromKlingAPI(pageNum, pageSize);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting extension tasks:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';

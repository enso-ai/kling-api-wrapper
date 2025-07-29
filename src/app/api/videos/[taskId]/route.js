import { NextResponse } from 'next/server';
import { klingClient } from '@/service/kling';
import { reportVideoGeneration } from '@/utils/reportContentGeneration';
import { extractUserId } from '@/utils/userinfo';

export async function GET(request, { params }) {
  try {
      const resolvedParams = await params;
      const taskId = resolvedParams.taskId;

      // Get project_id from query parameters (shortened as 'pid')
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get('pid');

      // Use the server-side utility function to get task information
      const data = await klingClient.getTaskByIdFromKlingAPI(taskId);

      // Report video generation analytics when task is successful
      if (data.data.task_status === 'succeed' && data.data.task_result?.videos?.length > 0) {
          const videoUrl = data.data.task_result.videos[0].url;
          const userId = extractUserId(request);

          // Report video generation - BigQuery will handle uniqueness during queries
          reportVideoGeneration(
              userId,
              projectId,
              {}, // Empty input object as requested
              videoUrl
          );
      }

      return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting task:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { klingClient } from '../../../../service/kling';

export async function GET(request, { params }) {
  try {
    const taskId = params.taskId;
    
    // Use the server-side utility function to get task information
    const data = await klingClient.getTaskByIdFromKlingAPI(taskId);
    
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

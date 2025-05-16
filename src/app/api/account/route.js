import { klingClient } from '../../../service/kling';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get query parameters with defaults
  // Default start_time = 30 days ago, end_time = current time
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const startTime = searchParams.get('start_time') || thirtyDaysAgo;
  const endTime = searchParams.get('end_time') || now;
  const resourcePackName = searchParams.get('resource_pack_name');

  try {
    // Use the server-side utility function to get account information
    const data = await klingClient.getAccountInfoFromKlingAPI(
      startTime,
      endTime,
      resourcePackName
    );
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting account info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to call Kling API' },
      { status: 500 }
    );
  }
}

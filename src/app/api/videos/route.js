import { NextResponse } from 'next/server';
import { klingClient, KlingThrottleError } from '@/service/kling';

const MODEL_MAP = {
    v1: 'kling-v1-6',
    v2: 'kling-v2-1',
    'v2-advance': 'kling-v2-1-master'
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (MODEL_MAP[body.model_name])
            body.model_name = MODEL_MAP[body.model_name]
        else
            return NextResponse.json({ error: 'bad modelName' }, { status: 500 });

        // Use the server-side utility function to create a video
        const data = await klingClient.createVideoOnKlingAPI(body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating video:', error);

        // Check if this is a throttling error
        if (error instanceof KlingThrottleError) {
            return NextResponse.json({ error: error.message }, { status: 429 });
        }

        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

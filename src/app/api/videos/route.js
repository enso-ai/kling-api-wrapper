import { NextResponse } from 'next/server';
import { klingClient } from '@/service/kling';

const MODEL_MAP = {
    v1: 'kling-v1-6',
    v2: 'kling-v2-1',
    'v2-advance': 'kling-v2-1-master'
}

export async function POST(request) {
    try {
        const body = await request.json();

        // parse body model
        if (MODEL_MAP.get(body.modelName))
            body.modelName = MODEL_MAP[body.modelName]
        else
            return NextResponse.json({ error: 'bad modelName' }, { status: 500 });

        // Use the server-side utility function to create a video
        const data = await klingClient.createVideoOnKlingAPI(body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating video:', error);

        // Check if this is a throttling error
        const errorMessage = error.message || '';
        if (errorMessage.includes('parallel task over resource pack limit')) {
            return NextResponse.json({ error: errorMessage }, { status: 429 });
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';

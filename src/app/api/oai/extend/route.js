import { NextResponse } from 'next/server';
import { extendImage } from 'utils/image_gen.js';

export async function POST(request) {
    try {
        const body = await request.json();

        // Extract camelCase parameters from HTTP payload
        const { image_urls, prompt, n = 1 } = body;

        // Validate required parameter - image_urls array
        if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
            return NextResponse.json(
                { error: 'image_urls array is required and cannot be empty' },
                { status: 400 }
            );
        }

        // Validate image_urls array length (OpenAI limit)
        if (image_urls.length > 10) {
            return NextResponse.json(
                { error: 'image_urls array cannot contain more than 10 images' },
                { status: 400 }
            );
        }

        // Validate required parameter - prompt
        if (!prompt) {
            return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
        }

        // Validate n parameter
        if (n && (typeof n !== 'number' || n < 1 || n > 10)) {
            return NextResponse.json(
                { error: 'n must be a number between 1 and 10' },
                { status: 400 }
            );
        }

        // Call the extend function (send request to openAI)
        const images = await extendImage(image_urls, prompt, n);

        return NextResponse.json({
            success: true,
            result: {
                images,
                format: 'png',
                created: new Date().toISOString(),
            },
        });
    } catch (error) {
        if (error.message === 'CONTENT_MODERATION_BLOCKED') {
            return NextResponse.json({ error: 'CONTENT_MODERATION_BLOCKED' }, { status: 403 });
        } else {
            console.error('Error extending image:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}

export const dynamic = 'force-dynamic';

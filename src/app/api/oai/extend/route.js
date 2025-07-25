import { NextResponse } from 'next/server';
import { extendImage } from '@/utils/image_gen.js';
import { reportImageGeneration, IMAGE_GEN_METHOD_EXTEND } from '@/utils/reportContentGeneration';
import { extractUserId } from '@/utils/userinfo';

export async function POST(request) {
    try {
        const body = await request.json();

        // Extract parameters from HTTP payload - supporting new srcImages format
        const { images, prompt, size, n = 1 } = body;

        // Validate required parameter - images array (srcImages format)
        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: 'images array is required and cannot be empty' },
                { status: 400 }
            );
        }

        // Validate each image object has either url or base64 property
        for (const image of images) {
            if (!image.url && !image.base64) {
                return NextResponse.json(
                    { error: 'Each image must have either url or base64 property' },
                    { status: 400 }
                );
            }
            
            // Validate URL format if present
            if (image.url) {
                try {
                    new URL(image.url); // This will throw if the URL is invalid
                } catch (error) {
                    return NextResponse.json({ error: `Invalid image URL: ${image.url}` }, { status: 400 });
                }
            }
        }

        // Validate images array length (OpenAI limit)
        if (images.length > 10) {
            return NextResponse.json(
                { error: 'images array cannot contain more than 10 images' },
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

        // Call the extend function with srcImages format
        const extendedImages = await extendImage(images, prompt, size, n);

        // Extract user_id
        const user_id = extractUserId(request)

        // Analytics
        reportImageGeneration(
            user_id,
            IMAGE_GEN_METHOD_EXTEND,
            {
                prompt,
                input_img_urls: images.filter(img => img.url).map(img=>img.url),
                size,
            },
            extendedImages.map(img => img.imageUrl),
        )

        return NextResponse.json({
            success: true,
            data: {
                images: extendedImages,
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

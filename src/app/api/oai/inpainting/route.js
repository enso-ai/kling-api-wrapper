import { NextResponse } from 'next/server';
import { inpaintingImage } from '@/utils/image_gen.js';
import { reportImageGeneration, IMAGE_GEN_METHOD_INPAINTING } from '@/utils/reportContentGeneration';

export async function POST(request) {
    try {
        const body = await request.json();

        // Extract camelCase parameters from HTTP payload
        const { image_gcs_url, mask, prompt, size, n = 1 } = body;

        // Validate required parameter - image
        if (!image_gcs_url) {
            return NextResponse.json({ error: 'image is required' }, { status: 400 });
        }

        // Validate required parameter - mask
        if (!mask) {
            return NextResponse.json({ error: 'mask is required' }, { status: 400 });
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

        // Call the inpainting function
        const images = await inpaintingImage(image_gcs_url, mask, prompt, size, n);

        //[tood] extract user_id
        const user_id = 'anonymouse'

        // analytics
        reportImageGeneration(
            user_id,
            IMAGE_GEN_METHOD_INPAINTING,
            {
                prompt,
                // for inpainting, only one image is provided in payload
                input_img_urls: images[0].url,
                size,
            },
            images.map(img => img.imageUrl),
        )

        return NextResponse.json({
            success: true,
            data: {
                images,
                format: 'png',
                created: new Date().toISOString(),
            },
        });
    } catch (error) {
        if (error.message === 'CONTENT_MODERATION_BLOCKED') {
            return NextResponse.json({ error: 'CONTENT_MODERATION_BLOCKED' }, { status: 403 });
        } else {
            console.error('Error inpainting image:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}

export const dynamic = 'force-dynamic';

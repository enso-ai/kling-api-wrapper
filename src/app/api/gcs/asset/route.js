import { deleteGCSAssets, createSignedURL } from "@/utils/gcsUpload";

/**
 * Delete GCS assets in batch
 * DELETE /api/gcs/asset
 */
export async function DELETE(request) {
    try {
        const { urls } = await request.json();
        
        // Use the centralized deletion function
        const result = await deleteGCSAssets(urls);
        
        if (!result.success) {
            return Response.json(
                { 
                    error: result.error,
                    details: result.details,
                    results: result.results
                },
                { status: result.error.includes('non-empty array') ? 400 : 500 }
            );
        }

        return Response.json(result);

    } catch (error) {
        console.error('Error in GCS deletion endpoint:', error);
        return Response.json(
            { error: `Internal server error: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { project_id: projectId, image_type: imageType } = await request.json();

        // Create signed URL using the centralized GCS utility
        const result = await createSignedURL(projectId, imageType);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            signed_url: result.signed_url,
            public_url: result.public_url,
            image_id: result.image_id,
        });
    } catch (error) {
        console.error('Error in signed URL route:', error);
        return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
}

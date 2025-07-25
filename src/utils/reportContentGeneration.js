import { logGeneratedContent } from "@/service/pubsub";

export const IMAGE_GEN_METHOD_TEXT = 'text'
export const IMAGE_GEN_METHOD_EXTEND = 'extend'
export const IMAGE_GEN_METHOD_INPAINTING = 'inpainting'

const VALID_IMAGE_GEN_METHODS = [
    IMAGE_GEN_METHOD_TEXT,
    IMAGE_GEN_METHOD_EXTEND,
    IMAGE_GEN_METHOD_INPAINTING
]

export const reportImageGeneration = (user_id, method, input, gcs_urls) => {
    if (!VALID_IMAGE_GEN_METHODS.includes(method)) {
        console.error('Invalid method:', method)
        return
    }

    try {
        logGeneratedContent(
            'image',
            user_id,
            {
                method,
                input,
            },
            gcs_urls
        )
    } catch(ex) {
        // reportImageGeneration will never throw exception
        // as this is only for analytics, which should not
        // block main logic.
        console.error("Failed to emit Message:", ex)
    }
}

export const reportVideoGeneration = (user_id, input, video_url) => {
    try {
        logGeneratedContent(
            'video',
            user_id,
            input,
            [video_url],
        )
    } catch(ex) {
        // reportImageGeneration will never throw exception
        // as this is only for analytics, which should not
        // block main logic.
        console.error("Failed to emit Message:", ex)
    }
}
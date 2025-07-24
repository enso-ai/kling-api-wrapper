import { emitMessage } from "@/service/pubsub/eventEmitter";

const EVENT_NAME_IMAGE_GEN = "image_gen"
const IMAGE_GEN_METHOD_TEXT = 'text'
const IMAGE_GEN_METHOD_EXTEND = 'extend'
const IMAGE_GEN_METHOD_INPAINTING = 'inpainting'

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
        emitMessage(
            EVENT_NAME_IMAGE_GEN,
            user_id,
            {
                method,
                input,
                gcs_urls,
            }
        )
    } catch(ex) {
        // reportImageGeneration will never throw exception
        // as this is only for analytics, which should not
        // block main logic.
        console.error("Failed to emit Message:", ex)
    }
}
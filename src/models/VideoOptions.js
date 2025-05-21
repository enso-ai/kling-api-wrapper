class VideoOptions {
  constructor(modelName, mode, duration, image, imageTail, prompt, negativePrompt, cfgScale, staticMask, dynamicMasks, cameraControl, callbackUrl, externalTaskId) {
    this.modelName = modelName;
    this.mode = mode;
    this.duration = duration;
    this.image = image;
    this.imageTail = imageTail;
    this.prompt = prompt;
    this.negativePrompt = negativePrompt;
    this.cfgScale = cfgScale;
    this.staticMask = staticMask;
    this.dynamicMasks = dynamicMasks;
    this.cameraControl = cameraControl;
    this.callbackUrl = callbackUrl;
    this.externalTaskId = externalTaskId;
  }

  toApiRequest() {
    const requestBody = {
      model_name: this.modelName || "kling-v1",
      mode: this.mode || "std",
      duration: this.duration || "5",
      image: this.image,
      image_tail: this.imageTail,
      prompt: this.prompt || "",
      negative_prompt: this.negativePrompt,
      cfg_scale: this.cfgScale !== undefined ? this.cfgScale : 0.5,
      static_mask: this.staticMask,
      dynamic_masks: this.dynamicMasks,
      camera_control: this.cameraControl,
      callback_url: this.callbackUrl,
      external_task_id: this.externalTaskId,
    };

    // Remove undefined properties
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key]
    );

    if (requestBody.image_tail) {
        requestBody.mode = "pro";
    }


    return requestBody;
  }
}

export default VideoOptions;

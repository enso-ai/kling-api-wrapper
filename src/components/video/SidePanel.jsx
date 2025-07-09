import { useState, useEffect } from 'react';
import styles from './SidePanel.module.css';
import ModelSelector from './ModelSelector';
import ModeSelector from './ModeSelector';
import ImageUploader from './ImageUploader';
import PromptInput from './PromptInput';
import DurationSelector from './DurationSelector';
import GenerateButton from './GenerateButton';
import { convertImageToBase64 } from '@/utils/image';
import { useVideoContext } from '@/context/VideoContext';

export default function SidePanel() {
  const { createVideo, currentTemplate, clearTemplate } = useVideoContext();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('kling-v2-1');
  const [mode, setMode] = useState('std');
  const [firstImage, setFirstImage] = useState(null);
  const [lastImage, setLastImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState('5');

  // Effect to update form when template changes
  useEffect(() => {
    if (currentTemplate) {
      // Update form fields with template values
      setModel(currentTemplate.modelName || 'kling-v1-6');
      setMode(currentTemplate.mode || 'std');
      setPrompt(currentTemplate.prompt || '');
      setNegativePrompt(currentTemplate.negativePrompt || '');
      setDuration(currentTemplate.duration || '5');
      
      // For images, we need to convert from the stored format to data URLs
      if (currentTemplate.image) {
        // Create a data URL from the base64 image
        const firstImageDataUrl = `data:image/png;base64,${currentTemplate.image}`;
        setFirstImage(firstImageDataUrl);
      }
      
      if (currentTemplate.imageTail) {
        const lastImageDataUrl = `data:image/png;base64,${currentTemplate.imageTail}`;
        setLastImage(lastImageDataUrl);
      }
    }
  }, [currentTemplate]);

  const handleSubmit = async () => {
    if (loading) {
      console.warn('Already generating a video. Please wait.');
      return;
    }

    // Create a formatted payload based on our individual state variables
    const formattedPayload = {
      modelName: model,
      mode: mode,
      duration: duration,

      // Convert images from data URLs to Base64 format required by the API
      image: firstImage ? convertImageToBase64(firstImage) : null,

      // Only include imageTail if lastImage exists
      imageTail: lastImage ? convertImageToBase64(lastImage) : undefined,

      prompt: prompt,
      negativePrompt: negativePrompt || undefined
    };

    // Filter out undefined or null values if needed
    Object.keys(formattedPayload).forEach(
      key => (formattedPayload[key] === undefined || formattedPayload[key] === null) &&
        delete formattedPayload[key]
    );

    try {
      setLoading(true);
      // Use the createVideo method from VideoContext
      await createVideo(formattedPayload);
      // Clear the template after successful submission
      clearTemplate();
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sidePanel}>
      <ModelSelector
        value={model}
        onChange={setModel}
      />

      <ModeSelector
        value={mode}
        onChange={setMode}
      />

      <div className={styles.formGroup}>
        <label>Images</label>
        <div className={styles.imagesContainer}>
          <ImageUploader
            id="first-image"
            image={firstImage}
            onImageChange={setFirstImage}
            label="First Frame"
            isFirst={true}
          />

          <ImageUploader
            id="last-image"
            image={lastImage}
            onImageChange={setLastImage}
            label="Last Frame (Optional)"
            isFirst={false}
          />
        </div>
      </div>

      <PromptInput
        value={prompt}
        onChange={setPrompt}
        label="Prompt"
        id="prompt"
        placeholder="Enter your prompt here..."
      />

      <PromptInput
        value={negativePrompt}
        onChange={setNegativePrompt}
        label="Negative Prompt"
        id="negative-prompt"
        placeholder="Enter negative prompt here..."
      />

      <DurationSelector
        value={duration}
        onChange={setDuration}
      />

      <GenerateButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

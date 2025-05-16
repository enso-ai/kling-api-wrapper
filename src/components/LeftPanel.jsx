{/* app/components/LeftPanel.jsx */}
import React, { useState } from 'react';
import './LeftPanel.css';
import ModelSelector from './ModelSelector';
import ImageUploader from './ImageUploader';
import PromptInput from './PromptInput';
import DurationSelector from './DurationSelector';
import GenerateButton from './GenerateButton';
import { convertImageToBase64 } from '../utils/image';

export default function LeftPanel({ onGenerate }) {
  const [model, setModel] = useState('kling1.6');
  const [firstImage, setFirstImage] = useState(null);
  const [lastImage, setLastImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState('5');

  const handleSubmit = () => {
    // Create a formatted payload based on our individual state variables
    const formattedPayload = {
      modelName: model,
      mode: "std", // Default to standard mode
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
    
    // Pass the formatted payload to the parent component's handler
    onGenerate(formattedPayload);
  };

  return (
    <div className="left-panel">
      <h1>Video Generation</h1>
      
      <ModelSelector 
        value={model} 
        onChange={setModel} 
      />
      
      <ImageUploader 
        firstImage={firstImage}
        lastImage={lastImage}
        onFirstImageChange={setFirstImage}
        onLastImageChange={setLastImage}
      />
      
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
      
      <GenerateButton onClick={handleSubmit} />
    </div>
  );
}

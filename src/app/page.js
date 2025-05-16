'use client'

import React, { useState } from 'react';
import LeftPanel from '../components/LeftPanel';
import RightPanel from '../components/RightPanel';
import '../styles/kling-ui.css';
import { apiClient } from '../service/backend';
import Task from '../models/Task';
import VideoOptions from '../models/VideoOptions';

export default function Home() {
  const [results, setResults] = useState([]);
  
  const handleGenerate = async (formData) => {
    console.log('Generating with data:', formData);
    
    try {
      // Call the Kling API to create a video
      const options = new VideoOptions(
          formData.modelName,
          formData.mode,
          formData.duration,
          formData.image,
          formData.imageTail,
          formData.prompt,
          formData.negativePrompt,
          formData.cfgScale,
          formData.staticMask,
          formData.dynamicMasks,
          formData.cameraControl,
          formData.callbackUrl,
          formData.externalTaskId
      );

      const response = await apiClient.createVideo(options);
      
      // Create a new result object with task information
      const newResult = Task.fromApiResponse(response.data);
      
      // Update the results state
      setResults([newResult, ...results]);
    } catch (error) {
      console.error('Error generating video:', error);
      // Could add error handling UI in the future
    }
  };

  return (
    <div className="kling-container">
      <LeftPanel onGenerate={handleGenerate} />
      <RightPanel results={results} />
    </div>
  );
}

{/* app/components/ImageUploader.jsx */}
import React from 'react';
import './ImageUploader.css';

export default function ImageUploader({ 
  firstImage, 
  lastImage, 
  onFirstImageChange, 
  onLastImageChange 
}) {
  const handleFileSelect = (event, isFirst) => {
    console.log("File selected:", event.target.files);
    const file = event.target.files[0];
    console.log("Selected file:", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File loaded:", e.target.result);
        if (isFirst) {
          console.log("First image selected");
          onFirstImageChange(e.target.result);
        } else {
          console.log("Last image selected");
          onLastImageChange(e.target.result);
        }
      };
      reader.readAsDataURL(file);
      console.log("FileReader started");
    }
  };

  return (
    <div className="form-group">
      <label>Images</label>
      <div className="images-container">
        <div className="image-upload">
          <input 
            type="file" 
            accept="image/*" 
            id="first-image" 
            className="file-input" 
            onChange={(e) => handleFileSelect(e, true)}
            style={{ display: 'none' }}
          />
          <label htmlFor="first-image" className="image-preview">
            <div className="image-preview-content">
              {firstImage ? (
                <img src={firstImage} alt="First frame" />
              ) : (
                "First Frame"
              )}
            </div>
          </label>
        </div>
        
        <div className="image-upload">
          <input 
            type="file" 
            accept="image/*" 
            id="last-image" 
            className="file-input" 
            onChange={(e) => handleFileSelect(e, false)}
            style={{ display: 'none' }}
          />
          <label htmlFor="last-image" className="image-preview">
            <div className="image-preview-content">
              {lastImage ? (
                <img src={lastImage} alt="Last frame" />
              ) : (
                "Last Frame (Optional)"
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

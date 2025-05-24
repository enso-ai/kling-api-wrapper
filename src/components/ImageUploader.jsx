{/* app/components/ImageUploader.jsx */ }
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './ImageUploader.css';

export default function ImageUploader({
  id,
  image,
  onImageChange,
  label,
  isFirst
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Shared file processing logic
  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      console.log("Processing file:", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File loaded:");
        if (isFirst) {
          console.log("First image selected");
        } else {
          console.log("Last image selected");
        }
        onImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
      console.log("FileReader started");
    } else {
      console.warn("Invalid file type. Please select an image.");
    }
  };

  const handleFileSelect = (event) => {
    console.log("File selected:", event.target.files);
    const file = event.target.files[0];
    console.log("Selected file:", file);
    processFile(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("File dropped:", files[0]);
      processFile(files[0]);
    }
  };

  // Clear image handler
  const clearImage = (e) => {
    e.stopPropagation(); // Prevent triggering the file input
    onImageChange(null);
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        id={id}
        className="file-input"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <label 
        htmlFor={id} 
        className={`image-preview ${isDragOver ? 'drag-over' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="image-preview-content">
          {image ? (
            <>
              <img src={image} alt={label} />
              <button
                className="clear-image-btn"
                onClick={clearImage}
                aria-label="Remove image"
              >
                <FaTimes size={18} />
              </button>
            </>
          ) : (
            <div className="upload-placeholder">
              <div>{label}</div>
              <div className="upload-hint">Click to select or drag and drop image</div>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

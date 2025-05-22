{/* app/components/ImageUploader.jsx */ }
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './ImageUploader.css';

export default function ImageUploader({
  id,
  image,
  onImageChange,
  label,
  isFirst
}) {
  const handleFileSelect = (event) => {
    console.log("File selected:", event.target.files);
    const file = event.target.files[0];
    console.log("Selected file:", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File loaded:", e.target.result);
        if (isFirst) {
          console.log("First image selected");
        } else {
          console.log("Last image selected");
        }
        onImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
      console.log("FileReader started");
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
      <label htmlFor={id} className="image-preview">
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
            label
          )}
        </div>
      </label>
    </div>
  );
}

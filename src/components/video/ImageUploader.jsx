import React, { useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useImageDropAndPaste } from '../../hooks/useImageDropAndPaste';
import styles from './ImageUploader.module.css';

export default function ImageUploader({
  id,
  image,
  onImageChange,
  label,
  isFirst
}) {
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
      reader.onerror = (error) => {
        console.error("Failed to read file:", error);
      };
      reader.readAsDataURL(file);
      console.log("FileReader started");
    } else {
      console.warn("Invalid file type. Please select an image.");
    }
  };

  // Use the shared hook for drag & drop and paste functionality
  const {
    isDragOver,
    isFocused,
    isHovered,
    elementRef,
    dragHandlers,
    pasteHandlers,
    focusHandlers
  } = useImageDropAndPaste({
    onFileProcessed: processFile,
    disabled: false,
    enablePaste: true,
    enableDrop: true,
    multiple: false, // Single image only for ImageUploader
    convertToPng: false // Keep conversion disabled for speed
  });

  const handleFileSelect = (event) => {
    console.log("File selected:", event.target.files);
    const file = event.target.files[0];
    console.log("Selected file:", file);
    processFile(file);
  };

  // Clear image handler
  const clearImage = (e) => {
    e.preventDefault(); // Prevent default label behavior
    e.stopPropagation(); // Prevent triggering the file input
    onImageChange(null);
  };

  return (
    <div className={styles.imageUpload}>
      <input
        type="file"
        accept="image/*"
        id={id}
        className={styles.fileInput}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <label 
        htmlFor={id} 
        ref={elementRef}
        tabIndex={0}
        className={`${styles.imagePreview} ${isDragOver ? styles.dragOver : ''} ${isFocused ? styles.focused : ''} ${isHovered ? styles.hovered : ''}`}
        {...dragHandlers}
        {...pasteHandlers}
        {...focusHandlers}
      >
        <div className={styles.imagePreviewContent}>
          {image ? (
            <>
              <img src={image} alt={label} />
              <button
                className={styles.clearImageBtn}
                onClick={clearImage}
                aria-label="Remove image"
              >
                <FaTimes size={18} />
              </button>
            </>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <div>{label}</div>
              <div className={styles.uploadHint}>
                {isHovered ? "Ready to paste! Press Ctrl+V" : "Click, drag, or hover and paste image"}
              </div>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

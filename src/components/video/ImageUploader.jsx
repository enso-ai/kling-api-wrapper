import React, { useState, useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './ImageUploader.module.css';

export default function ImageUploader({
  id,
  image,
  onImageChange,
  label,
  isFirst
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const uploadAreaRef = useRef(null);

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
    e.preventDefault(); // Prevent default label behavior
    e.stopPropagation(); // Prevent triggering the file input
    onImageChange(null);
  };

  // Paste event handler - no browser permission prompts
  const handlePaste = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Paste event detected");

    // Get clipboard items from the event
    const items = e.clipboardData?.items;
    if (!items) {
      console.log("No clipboard items found in paste event");
      return;
    }

    // Look for image data in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log("Clipboard item type:", item.type);
      
      // Check if the item is an image
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          console.log("Image pasted from clipboard event:", file);
          processFile(file);
          return;
        }
      }
    }
    console.log("No image found in clipboard items");
  };

  // Mouse enter/leave handlers for better hover detection
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Auto-focus when hovering to enable paste events
    if (uploadAreaRef.current && !isFocused) {
      uploadAreaRef.current.focus();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Don't blur immediately to allow paste to work
  };

  // Global keyboard event handler - simplified without modern Clipboard API
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Only handle paste when hovering over this upload area
      if (isHovered && (e.ctrlKey || e.metaKey) && e.key === 'v') {
        console.log("Global paste shortcut detected while hovering");
        
        // Ensure the element is focused to receive paste event
        if (uploadAreaRef.current) {
          uploadAreaRef.current.focus();
        }
        
        // The paste event will be triggered automatically and handled by handlePaste
      }
    };

    const handleGlobalPaste = (e) => {
      // Only handle global paste when hovering over this upload area
      if (isHovered) {
        console.log("Global paste event detected while hovering");
        handlePaste(e);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('paste', handleGlobalPaste);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [isHovered]);

  // Focus handlers
  const handleFocus = () => {
    setIsFocused(true);
    console.log("Upload area focused");
  };

  const handleBlur = () => {
    // Delay blur to allow paste events to complete
    setTimeout(() => {
      if (!isHovered) {
        setIsFocused(false);
        console.log("Upload area blurred");
      }
    }, 100);
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
        ref={uploadAreaRef}
        tabIndex={0}
        className={`${styles.imagePreview} ${isDragOver ? styles.dragOver : ''} ${isFocused ? styles.focused : ''} ${isHovered ? styles.hovered : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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

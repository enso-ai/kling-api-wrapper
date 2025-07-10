import React, { useEffect, useState } from 'react';
import styles from './InpaintingComposite.module.css';

// Component to show reference image and mask side by side
export default function InpaintingComposite({ referenceImageUrl, maskBase64 }) {
    const [processedMaskUrl, setProcessedMaskUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!maskBase64) {
            setError('No mask data available');
            return;
        }

        const processMask = async () => {
            try {
                // Create mask data URL
                let dataUrl;
                if (maskBase64.startsWith('data:')) {
                    dataUrl = maskBase64;
                } else {
                    dataUrl = `data:image/png;base64,${maskBase64}`;
                }
                
                // Load the mask image
                const maskImg = new Image();
                maskImg.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    maskImg.onload = resolve;
                    maskImg.onerror = reject;
                    maskImg.src = dataUrl;
                });

                // Create canvas to process the mask
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = maskImg.width;
                canvas.height = maskImg.height;

                // Draw the mask to get image data
                ctx.drawImage(maskImg, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Process the mask: invert alpha channel
                // Transparent areas (alpha = 0) become white (inpainted areas)
                // Opaque areas (alpha > 0) become transparent (preserved areas)
                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3];
                    
                    if (alpha === 0) {
                        // Transparent area = was inpainted, make it white
                        data[i] = 255;     // R
                        data[i + 1] = 255; // G
                        data[i + 2] = 255; // B
                        data[i + 3] = 255; // A - fully opaque
                    } else {
                        // Opaque area = was preserved, make it transparent
                        data[i] = 0;       // R
                        data[i + 1] = 0;   // G
                        data[i + 2] = 0;   // B
                        data[i + 3] = 0;   // A - fully transparent
                    }
                }

                // Put the processed data back
                ctx.putImageData(imageData, 0, 0);
                
                // Create URLs for display
                const processedUrl = canvas.toDataURL('image/png');
                setProcessedMaskUrl(processedUrl);
                setError(null);
                
            } catch (err) {
                console.error('Error processing mask data:', err);
                setError('Failed to process mask data');
            }
        };

        processMask();
    }, [maskBase64]);

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
            </div>
        );
    }

    if (!processedMaskUrl) {
        return null;
    }

    return (
        <div className={styles.overlayContainer}>
            <img
                src={referenceImageUrl}
                alt="Reference image"
                className={styles.overlayBaseImage}
            />
            <img
                src={processedMaskUrl}
                alt="Mask overlay"
                className={styles.overlayMask}
            />
        </div>
    );
}

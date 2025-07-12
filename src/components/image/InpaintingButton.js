import React from 'react';
import { useImageGenModalContext } from '@/context/ImageGenModalContext';
import { FaPaintBrush } from 'react-icons/fa';

export default function InpaintingButton({ imageRecord, className, title = "Brush tool" }) {
    const { openImageGenModal } = useImageGenModalContext();

    const handleBrushClick = (e) => {
        e.stopPropagation();
        
        // Get current image URL
        const currentIdx = imageRecord.selectedImageIdx || 0;
        const currentImageUrl = imageRecord.imageUrls[currentIdx];
        
        // Create minimal prefill data for fresh inpainting
        const prefillData = {
            initialTab: 'inpainting',
            srcImages: [{ url: currentImageUrl }],
            // Intentionally leave prompt and mask empty for fresh start
            prompt: '',
            mask: null,
            size: imageRecord.size,
            sourceRecordId: imageRecord.id // For reference only
        };
        
        // Open modal with minimal prefill data
        openImageGenModal(prefillData);
    };

    return (
        <button
            className={className}
            onClick={handleBrushClick}
            title={title}
        >
            <FaPaintBrush />
        </button>
    );
}

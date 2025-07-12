import React from 'react';
import { useImageGenModalContext } from '@/context/ImageGenModalContext';
import { FaPencilAlt } from 'react-icons/fa';

export default function EditButton({ imageRecord, className, title = "Edit image" }) {
    const { openImageGenModal } = useImageGenModalContext();

    const handleEditClick = (e) => {
        e.stopPropagation();
        
        // Create prefill data based on imageRecord
        const prefillData = {
            initialTab: imageRecord.mask ? 'inpainting' : 'prompt',
            prompt: imageRecord.prompt,
            srcImages: imageRecord.srcImages,
            mask: imageRecord.mask,
            size: imageRecord.size,
            sourceRecordId: imageRecord.id
        };
        
        // Open modal with prefill data
        openImageGenModal(prefillData);
    };

    return (
        <button
            className={className}
            onClick={handleEditClick}
            title={title}
        >
            <FaPencilAlt />
        </button>
    );
}

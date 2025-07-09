import { useState } from 'react';
import ImageGenModal from '@/components/image/ImageGenModal'
import ImageGrid from '@/components/image/ImageGrid';

export default function ImageTool() {
  const [openModal, setOpenModal] = useState(false)
  
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  
  return (
    <>
      <ImageGrid onOpenModal={handleOpenModal} />
      <ImageGenModal
        isOpen={openModal}
        onClose={handleCloseModal}
      />
    </>
  );
}

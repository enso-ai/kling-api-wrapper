import React, { useEffect, useRef, useCallback } from 'react';
import styles from './ImageGrid.module.css';
import { useImageContext } from '@/context/ImageContext';
import AddImageBlock from './AddImageBlock';
import ImageBlock from './ImageBlock';
import PendingBlock from './PendingBlock';

export default function ImageGrid({ onOpenModal }) {
    const { 
        imageRecords, 
        pendingGenerations,
        isLoaded, 
        loadMoreImages, 
        hasMoreImages, 
        isLoadingMore,
        totalImages 
    } = useImageContext();
    
    const gridRef = useRef(null);
    const loadingRef = useRef(null);

    // Handle opening the image generation modal
    const handleOpenModal = useCallback(() => {
        if (onOpenModal) {
            onOpenModal();
        }
    }, [onOpenModal]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!loadingRef.current || !hasMoreImages || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreImages();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px',
            }
        );

        observer.observe(loadingRef.current);

        return () => {
            if (loadingRef.current) {
                observer.unobserve(loadingRef.current);
            }
        };
    }, [loadMoreImages, hasMoreImages, isLoadingMore]);

    // Scroll event handler as fallback
    const handleScroll = useCallback(() => {
        if (!gridRef.current || !hasMoreImages || isLoadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = gridRef.current;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Trigger loading when 80% scrolled
        if (scrollPercentage > 0.8) {
            loadMoreImages();
        }
    }, [loadMoreImages, hasMoreImages, isLoadingMore]);

    // Add scroll event listener
    useEffect(() => {
        const gridElement = gridRef.current;
        if (!gridElement) return;

        gridElement.addEventListener('scroll', handleScroll);
        return () => {
            gridElement.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className={styles.gridContainer}>
            <div className={styles.imageGrid} ref={gridRef}>
                {!isLoaded ? (
                    <div className={styles.loading}>Loading image history...</div>
                ) : (
                    <>
                        {/* 1. Add Image Block - Plus sign button */}
                        <div className={styles.gridItem}>
                            <AddImageBlock onOpenModal={handleOpenModal} />
                        </div>

                        {/* 2. Pending Generation Blocks */}
                        {pendingGenerations.map((pendingGeneration) => (
                            <div key={pendingGeneration.id} className={styles.gridItem}>
                                <PendingBlock pendingGeneration={pendingGeneration} />
                            </div>
                        ))}

                        {/* 3. Existing Image Blocks */}
                        {imageRecords.map((imageRecord) => (
                            <div key={imageRecord.id} className={styles.gridItem}>
                                <ImageBlock imageRecord={imageRecord} />
                            </div>
                        ))}

                        {/* 4. Lazy Loading Trigger (Hidden) */}
                        {hasMoreImages && (
                            <div ref={loadingRef} className={styles.loadingTrigger} />
                        )}

                        {/* Loading indicator for lazy loading */}
                        {hasMoreImages && (
                            <div className={styles.loadMoreContainer}>
                                {isLoadingMore ? (
                                    <div className={styles.loading}>Loading more images...</div>
                                ) : (
                                    <button 
                                        className={styles.loadMoreButton} 
                                        onClick={loadMoreImages}
                                        disabled={isLoadingMore}
                                    >
                                        Load More Images ({imageRecords.length} of {totalImages})
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* End of list indicator */}
                        {!hasMoreImages && (imageRecords.length > 0 || pendingGenerations.length > 0) && (
                            <div className={styles.endOfList}>
                                All images loaded ({imageRecords.length} total)
                            </div>
                        )}

                        {/* No results state */}
                        {imageRecords.length === 0 && pendingGenerations.length === 0 && (
                            <div className={styles.noResults}>
                                No images generated yet.<br />
                                Click the + button to create your first image!
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
}

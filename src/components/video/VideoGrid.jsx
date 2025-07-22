import React, { useEffect, useRef, useCallback } from 'react';
import styles from './VideoGrid.module.css';
import VideoPlayer from './VideoPlayer';
import { useVideoContext } from '@/context/VideoContext';

export default function VideoGrid() {
    const { 
        videoRecords, 
        isLoaded, 
        loadMoreVideos, 
        hasMoreVideos, 
        isLoadingMore,
        totalVideos 
    } = useVideoContext();
    
    const gridRef = useRef(null);
    const loadingRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!loadingRef.current || !hasMoreVideos || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreVideos();
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
    }, [loadMoreVideos, hasMoreVideos, isLoadingMore]);

    // Scroll event handler as fallback
    const handleScroll = useCallback(() => {
        if (!gridRef.current || !hasMoreVideos || isLoadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = gridRef.current;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Trigger loading when 80% scrolled
        if (scrollPercentage > 0.8) {
            loadMoreVideos();
        }
    }, [loadMoreVideos, hasMoreVideos, isLoadingMore]);

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
            <div className={styles.gridHeader}>
                <div className={styles.gridHeaderTitle}>Results</div>
            </div>
            <div className={styles.videoGrid} ref={gridRef}>
                {!isLoaded ? (
                    <div className={styles.loading}>Loading video history...</div>
                ) : videoRecords.length > 0 ? (
                    <>
                        {videoRecords.map((videoRecord) => (
                            <VideoPlayer
                                key={videoRecord.id}
                                payload={videoRecord.toPayload()}
                            />
                        ))}
                        
                        {/* Loading indicator for lazy loading */}
                        {hasMoreVideos && (
                            <div ref={loadingRef} className={styles.loadMoreContainer}>
                                {isLoadingMore ? (
                                    <div className={styles.loading}>Loading more videos...</div>
                                ) : (
                                    <button 
                                        className={styles.loadMoreButton} 
                                        onClick={loadMoreVideos}
                                        disabled={isLoadingMore}
                                    >
                                        Load More Videos ({videoRecords.length} of {totalVideos})
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* End of list indicator */}
                        {!hasMoreVideos && videoRecords.length > 0 && (
                            <div className={styles.endOfList}>
                                All videos loaded ({videoRecords.length} total)
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.noResults}>No videos generated yet</div>
                )}
            </div>
        </div>
    );
}

{/* app/components/VideoGrid.jsx */ }
import React, { useEffect, useRef, useCallback } from 'react';
import './VideoGrid.css';
import VideoPlayer from './VideoPlayer';
import { useVideoContext } from '../context/VideoContext';

export default function VideoGrid() {
    const { 
        videoRecords, 
        isLoaded, 
        accountInfo, 
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
        <div className="grid-container">
            <div className="grid-header">
                <div className="grid-header-title">Results</div>
                {accountInfo && (
                    <div className="account-info-indicator">
                        Remaining Credits: {accountInfo.remaining_quantity}/{accountInfo.total_quantity}
                    </div>
                )}
            </div>
            <div className="video-grid" ref={gridRef}>
                {!isLoaded ? (
                    <div className="loading">Loading video history...</div>
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
                            <div ref={loadingRef} className="load-more-container">
                                {isLoadingMore ? (
                                    <div className="loading">Loading more videos...</div>
                                ) : (
                                    <button 
                                        className="load-more-button" 
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
                            <div className="end-of-list">
                                All videos loaded ({videoRecords.length} total)
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-results">No videos generated yet</div>
                )}
            </div>
        </div>
    );
}

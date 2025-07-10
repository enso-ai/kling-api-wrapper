import SidePanel from '@/components/video/SidePanel';
import VideoGrid from '@/components/video/VideoGrid';
import styles from './videoTool.module.css';

export default function VideoTool() {
    return (
        <div className={styles.Container}>
            <SidePanel />
            <VideoGrid />
        </div>
    );
}

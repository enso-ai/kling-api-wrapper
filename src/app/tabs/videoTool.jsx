import EditorPanel from '@/components/video/EditorPanel';
import VideoGrid from '@/components/video/VideoGrid';
import styles from './videoTool.module.css';

export default function VideoTool() {
    return (
        <div className={styles.Container}>
            <EditorPanel />
            <VideoGrid />
        </div>
    );
}

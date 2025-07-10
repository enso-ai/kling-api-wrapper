import { useState } from 'react';
import styles from './VideoExtensionModal.module.css';

export default function VideoExtensionModal({ onSubmit, onCancel, isProcessing, error }) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [cfgScale, setCfgScale] = useState(0.5);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const extensionOptions = {
      prompt: prompt.trim() || undefined,
      negative_prompt: negativePrompt.trim() || undefined,
      cfg_scale: cfgScale,
    };

    onSubmit(extensionOptions);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Extend Video</h3>
          <button className={styles.modalClose} onClick={onCancel} disabled={isProcessing}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.extensionForm}>
          <div className={styles.formGroup}>
            <label htmlFor="prompt">
              Prompt (Optional)
              <span className={styles.charCount}>{prompt.length}/2500</span>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want the video to continue..."
              maxLength={2500}
              rows={3}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="negativePrompt">
              Negative Prompt (Optional)
              <span className={styles.charCount}>{negativePrompt.length}/2500</span>
            </label>
            <textarea
              id="negativePrompt"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Describe what you don't want in the extension..."
              maxLength={2500}
              rows={2}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cfgScale">
              CFG Scale: {cfgScale}
              <span className={styles.helpText}>Controls how closely the AI follows the prompt (0-1)</span>
            </label>
            <input
              type="range"
              id="cfgScale"
              min="0"
              max="1"
              step="0.1"
              value={cfgScale}
              onChange={(e) => setCfgScale(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className={styles.btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={styles.btnPrimary}
            >
              {isProcessing ? 'Processing...' : 'Extend Video'}
            </button>
          </div>
        </form>

        <div className={styles.extensionInfo}>
          <p><strong>Extension Info:</strong></p>
          <ul>
            <li>Extensions add 4-5 seconds to your video</li>
            <li>Maximum total duration: 3 minutes</li>
            <li>Processing may take a few minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ========================================
   PRELOADER  |  KF Monogram Draw & Terminal Boot Sequence
   ======================================== */

import React, { useEffect, useState } from 'react';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsFinished(true);
      setIsHidden(true);
      if (onComplete) onComplete();
      return;
    }

    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    const duration = 2200;
    let animationFrameId;

    const update = (now) => {
      const elapsed = now - startTime;
      const current = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(current);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        setIsFinished(true);
        document.body.style.overflow = '';
        if (onComplete) onComplete();
        setTimeout(() => {
          setIsHidden(true);
        }, 1600);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (isHidden) return null;

  return (
    <div className={`preloader-overlay ${isFinished ? 'finished' : ''}`} id="preloaderOverlay">
      <div className="preloader-curtain-left"></div>
      <div className="preloader-curtain-right"></div>
      <div className="preloader-content" id="preloaderContent">
        <svg viewBox="0 0 200 120" className="preloader-svg" aria-label="KF monogram">
          {/* 'K' monogram stroke */}
          <path className="path-k" d="M 10,110 L 10,15 M 10,62 L 75,15 M 10,62 L 75,110" />
          {/* 'F' monogram stroke */}
          <path className="path-f" d="M 120,110 L 120,15 L 190,15 M 120,62 L 175,62" />
        </svg>

        <div className="preloader-boot-log">
          <div className="boot-row boot-row-1">
            <span className="boot-prompt">&gt;</span> <span className="boot-key">user:</span> <span className="boot-val">kurt.farinas</span>
          </div>
          <div className="boot-row boot-row-2">
            <span className="boot-prompt">&gt;</span> <span className="boot-key">role:</span> <span className="boot-val">junior_fullstack_dev</span>
          </div>
          <div className="boot-row boot-row-3">
            <span className="boot-prompt">&gt;</span> <span className="boot-key">sys:</span> <span className="boot-val boot-ready">ready</span>
          </div>
        </div>

        <div className="preloader-progress-wrap">
          <div className="preloader-progress-bar">
            <div className="preloader-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="preloader-percentage">{progress}%</p>
        </div>
      </div>
    </div>
  );
}

/* ========================================
   HERO COMPONENT  |  Terminal Splitting Headline & Action Pill
   ======================================== */

import React, { useEffect, useRef } from 'react';
import { useModal } from '../../context/ModalContext';
import WaveBackground from '../common/WaveBackground';

export default function Hero() {
  const { openResumeModal, copyEmail } = useModal();
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const availabilityRef = useRef(null);
  const controlsRef = useRef(null);
  const heroWrapRef = useRef(null);
  const bgWrapperRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const maxScroll = 440;
          const progress = Math.min(1, Math.max(0, scrolled / maxScroll));
          // Smoothstep Hermite interpolation for natural cinematic easing
          const ease = progress * progress * (3 - 2 * progress);

          // 1. Overall Hero Wrapper pointer events
          if (heroWrapRef.current) {
            heroWrapRef.current.style.pointerEvents = progress > 0.85 ? 'none' : 'auto';
          }

          // 2. Headline with optical depth blur & subtle letter drift
          const titleOpacity = Math.max(0, 1 - Math.pow(progress, 1.1) * 1.15);
          const titleBlur = ease * 7;
          const titleLift = -(scrolled * 0.22);
          const titleScale = 1 - ease * 0.05;
          const splitFactor = ease * 26;

          if (line1Ref.current) {
            line1Ref.current.style.transform = `translateX(-${splitFactor}px) translateY(${titleLift}px) scale(${titleScale})`;
            line1Ref.current.style.opacity = titleOpacity;
            line1Ref.current.style.filter = titleBlur > 0.1 ? `blur(${titleBlur}px)` : 'none';
          }
          if (line2Ref.current) {
            line2Ref.current.style.transform = `translateX(${splitFactor}px) translateY(${titleLift}px) scale(${titleScale})`;
            line2Ref.current.style.opacity = titleOpacity;
            line2Ref.current.style.filter = titleBlur > 0.1 ? `blur(${titleBlur}px)` : 'none';
          }

          if (availabilityRef.current) {
            availabilityRef.current.style.opacity = Math.max(0, 1 - ease * 1.25);
            availabilityRef.current.style.transform = `translateY(${-(scrolled * 0.18)}px)`;
            availabilityRef.current.style.filter = titleBlur > 0.1 ? `blur(${titleBlur}px)` : 'none';
          }

          // 3. Subtitle with optical dissipation
          if (subtitleRef.current) {
            const subOpacity = Math.max(0, 1 - ease * 1.35);
            const subBlur = ease * 8;
            const subLift = -(scrolled * 0.15);
            subtitleRef.current.style.opacity = subOpacity;
            subtitleRef.current.style.transform = `translateY(${subLift}px)`;
            subtitleRef.current.style.filter = subBlur > 0.1 ? `blur(${subBlur}px)` : 'none';
          }

          // 4. Social Controls Pill with soft settling sink & scale
          if (controlsRef.current) {
            const ctrlOpacity = Math.max(0, 1 - ease * 1.25);
            const ctrlBlur = ease * 5;
            const ctrlSink = scrolled * 0.10;
            const ctrlScale = 1 - ease * 0.08;
            controlsRef.current.style.opacity = ctrlOpacity;
            controlsRef.current.style.transform = `translateY(${ctrlSink}px) scale(${ctrlScale})`;
            controlsRef.current.style.filter = ctrlBlur > 0.1 ? `blur(${ctrlBlur}px)` : 'none';
          }

          // 5. Harmonic Wave Canvas Background with depth expansion & ambient soft focus
          if (bgWrapperRef.current) {
            const bgOpacity = Math.max(0, 1 - progress * 0.95);
            const bgBlur = ease * 9;
            const bgScale = 1 + ease * 0.07;
            bgWrapperRef.current.style.opacity = bgOpacity;
            bgWrapperRef.current.style.transform = `scale(${bgScale})`;
            bgWrapperRef.current.style.filter = bgBlur > 0.1 ? `blur(${bgBlur}px)` : 'none';
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="hero hero-avery entered" id="hero">
      <div
        ref={bgWrapperRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          willChange: 'opacity, transform, filter',
          transformOrigin: 'center center'
        }}
      >
        <WaveBackground />
      </div>
      <div ref={heroWrapRef} className="wrap hero-wrap">
        <div className="hero-center-content">
          <h1 id="heroH1" className="hero-title">
            <span
              ref={line1Ref}
              className="title-line line-1"
              style={{ willChange: 'opacity, transform, filter', display: 'inline-block' }}
            >
              HI, I AM KURT
            </span>
            <span
              ref={line2Ref}
              className="title-line line-2"
              style={{ willChange: 'opacity, transform, filter', display: 'inline-block' }}
            >
              JUNIOR FULL-STACK DEVELOPER
            </span>
          </h1>
          <div
            ref={availabilityRef}
            className="hero-availability font-mono"
            aria-label="Currently looking for junior full-stack developer opportunities"
            style={{ willChange: 'opacity, transform, filter' }}
          >
            <span className="hero-availability-dot" aria-hidden="true"></span>
            <span>OPEN TO WORK</span>
            <span className="hero-availability-divider" aria-hidden="true">/</span>
            <span>JUNIOR FULL-STACK ROLES</span>
          </div>
        </div>

        <div
          ref={controlsRef}
          className="hero-bottom-controls hero-slide-up"
          style={{ willChange: 'opacity, transform, filter' }}
        >
          <div className="hero-social-pill">
            <a
              href="https://github.com/kurt-farinas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/kurt-vincent-fari%C3%B1as-315ab1367"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75-1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
              </svg>
            </a>
            <button type="button" onClick={copyEmail} aria-label="Email Me">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </button>
            <button type="button" onClick={openResumeModal} aria-label="Preview Resume PDF" title="Preview Resume PDF">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

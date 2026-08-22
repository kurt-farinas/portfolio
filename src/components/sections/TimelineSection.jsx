/* ========================================
   TIMELINE SECTION  |  Career & Education Milestones
   Features vertical dynamic scroll-progress line filler
   ======================================== */

import React, { useEffect, useRef } from 'react';
import { timelineData } from '../../data/projectData';

export default function TimelineSection() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    const items = container.querySelectorAll('.timeline-item');
    let ticking = false;

    const updateTimeline = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerHeight = rect.height;

      // Calculate scroll progress through the timeline container
      const triggerOffset = windowHeight * 0.5;
      const scrolledDistance = triggerOffset - rect.top;

      let percentage = (scrolledDistance / containerHeight) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      line.style.height = `${percentage}%`;
      const lineTipPx = (percentage / 100) * containerHeight;

      items.forEach((item) => {
        const icon = item.querySelector('.timeline-icon');
        // Circle's actual vertical center relative to the timeline container
        const circleCenter = item.offsetTop + (icon ? icon.offsetTop + icon.offsetHeight / 2 : 14);

        // Only turn white/active when the descending line tip physically reaches the circle center
        if (percentage > 0 && lineTipPx >= circleCenter) {
          item.classList.add('is-visible', 'show', 'in-view-glow');
        } else {
          item.classList.remove('is-visible', 'show', 'in-view-glow');
        }
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateTimeline);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateTimeline();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="section timeline-section" id="timeline">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">Career &amp; Education</h2>
          <p className="profile-header-sub">
            Education, internship work, and project milestones.
          </p>
        </div>

        <div className="timeline-container" ref={containerRef}>
          <div className="timeline-progress-line" ref={lineRef} id="timeline-progress-line"></div>

          {timelineData.map((item) => (
            <div
              key={item.id}
              className={`timeline-item ${item.isFeatured ? 'timeline-item-featured' : ''}`}
            >
              <div className="timeline-icon">{item.id}</div>
              <div className="timeline-content">
                <div className="timeline-date">{item.date}</div>
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-desc">{item.desc}</div>
                {item.badge && (
                  <span className="timeline-badge">
                    {item.badgeType ? (
                      <span className={item.badgeType}>{item.badge}</span>
                    ) : (
                      item.badge
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

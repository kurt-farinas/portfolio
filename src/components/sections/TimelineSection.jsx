import React from 'react';
import { timelineData } from '../../data/projectData';
import SectionHeading from '../common/SectionHeading';

export default function TimelineSection() {
  return (
    <section className="studio-section studio-experience" id="timeline">
      <div className="studio-container">
        <SectionHeading title="Career & Education" />
        <ol className="studio-timeline">
          {timelineData.map((item) => (
            <li key={item.id} className={`studio-timeline-item ${item.isFeatured ? 'is-featured' : ''}`}>
              <div className="studio-timeline-meta"><p>{item.date}</p></div>
              <div className="studio-timeline-copy">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                {item.badge && <span className="studio-proof font-mono">{item.badge}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

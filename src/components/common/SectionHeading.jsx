import React from 'react';

export default function SectionHeading({ title, description }) {
  return (
    <div className="studio-section-heading">
      <div className="studio-section-heading-copy">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

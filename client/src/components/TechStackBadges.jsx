import React from 'react';

export default function TechStackBadges({ techStack = [] }) {
  if (!techStack || techStack.length === 0) return null;

  return (
    <section className="tech-stack-section shell" aria-label="Detected Technology Footprint">
      <div className="tech-stack-title">DETECTED INFRASTRUCTURE &amp; TECHNOLOGY STACK</div>
      <div className="tech-stack-badges">
        {techStack.map((tech, idx) => (
          <div key={idx} className="tech-badge">
            <span className="tech-badge-category">{tech.category || 'Tech'}:</span>
            <span className="tech-badge-name">{tech.name || tech}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

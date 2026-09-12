import React from 'react';

export default function RemediationPlan({ priorities = [], consultation = null }) {
  if (!priorities || priorities.length === 0) return null;

  return (
    <section className="remediation-plan-section shell" aria-label="Remediation Priority Plan">
      <div className="section-head">
        <div>
          <span className="section-tag">SPRINT ACTION PLAN</span>
          <h3 className="section-heading">PRIORITIZED REMEDIATION ROADMAP</h3>
        </div>
        <div className="section-note">SECTION 82 OF WEBARG PLAYBOOK · WHAT TO FIX FIRST</div>
      </div>

      {consultation?.executivePitch && (
        <div className="consultation-card">
          <div className="consultation-card-header">
            <span className="consultation-badge mono">
              {consultation.isAiGenerated ? '✦ AI CLIENT TALKING POINTS' : '✦ DIAGNOSTIC CONSULTATION BRIEF'}
            </span>
            <span className="consultation-provider mono">{consultation.aiProvider}</span>
          </div>
          <p className="consultation-pitch">{consultation.executivePitch}</p>
        </div>
      )}

      <div className="remediation-list">
        {priorities.map((item, idx) => {
          const isP1 = item.priority.includes('Priority 1');
          return (
            <div key={idx} className={`remediation-card ${isP1 ? 'p1' : 'p2'}`}>
              <div className="remediation-card-rank">#{item.rank}</div>
              <div className="remediation-card-content">
                <div className="remediation-card-header">
                  <span className={`remediation-priority-tag ${isP1 ? 'tag-p1' : 'tag-p2'}`}>
                    {item.priority}
                  </span>
                  <span className="remediation-effort mono">
                    Estimated Effort: <strong>{item.effort || 'Low'}</strong>
                  </span>
                </div>
                <h4 className="remediation-card-title">{item.title}</h4>
                <p className="remediation-card-action">
                  <strong>Action:</strong> {item.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

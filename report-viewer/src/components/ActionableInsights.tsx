import type { Insights, InsightItem } from '../types/report';
import EmptyState from './EmptyState';

const InsightCard = ({ item, type }: { item: InsightItem; type: 'critical' | 'warning' }) => (
  <div className={`insight-card ${type}`}>
    <p className="insight-card-issue">{item.issue}</p>
    <p className="insight-card-impact">{item.impact}</p>
    <div className={`recommendation-box ${type}`}>
      <p className="recommendation-label">Recommendation</p>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.recommendation}</p>
    </div>
  </div>
);

export const ActionableInsights = ({ insights }: { insights: Insights }) => {
  if (!insights || (insights.critical_errors?.length === 0 && insights.warnings?.length === 0)) {
    return (
      <section id="insights" className="card">
        <EmptyState title="All Clear" message="No SEO issues found on this page." />
      </section>
    );
  }

  return (
    <section id="insights" className="card">
      <div className="card-header">
        <div>
          <p className="card-title">SEO Diagnosis</p>
          <p className="card-heading">Actionable Insights</p>
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          background: 'var(--cream)',
          border: '1px solid var(--border)',
          padding: '0.3rem 0.8rem',
          borderRadius: '9999px',
        }}>
          {insights.critical_errors.length + insights.warnings.length} issues
        </span>
      </div>

      {insights.critical_errors?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p className="insight-group-label" style={{ color: 'var(--critical)' }}>
            🔴 Critical Errors — {insights.critical_errors.length}
          </p>
          {insights.critical_errors.map((err, i) => (
            <InsightCard key={i} item={err} type="critical" />
          ))}
        </div>
      )}

      {insights.warnings?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p className="insight-group-label" style={{ color: 'var(--warning)' }}>
            🟡 Warnings — {insights.warnings.length}
          </p>
          {insights.warnings.map((warn, i) => (
            <InsightCard key={i} item={warn} type="warning" />
          ))}
        </div>
      )}

      {insights.passed_checks?.length > 0 && (
        <div>
          <p className="insight-group-label" style={{ color: 'var(--success)' }}>
            ✅ Passed Checks — {insights.passed_checks.length}
          </p>
          <ul className="passed-checks-list">
            {insights.passed_checks.map((check, i) => (
              <li key={i}>
                <span>✓</span>
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ActionableInsights;

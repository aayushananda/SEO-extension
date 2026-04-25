import EmptyState from './EmptyState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CoreWebVitalsCard = ({ vitals }: { vitals: any | string | null }) => {
  if (!vitals || typeof vitals === 'string') {
    return (
      <section id="vitals" className="card">
        <div className="card-header">
          <div>
            <p className="card-title">Performance</p>
            <p className="card-heading">Core Web Vitals</p>
          </div>
        </div>
        <EmptyState
          title={typeof vitals === 'string' ? 'Not Tested' : 'No Data'}
          message={typeof vitals === 'string' ? vitals : 'Configure a PageSpeed API key to enable Core Web Vitals testing.'}
        />
      </section>
    );
  }

  const overallScore = vitals.overall_performance_score
    ? Math.round(vitals.overall_performance_score * 100)
    : null;

  const getScoreColor = (s: number | null) => {
    if (s === null) return 'var(--text-muted)';
    if (s >= 90) return 'var(--success)';
    if (s >= 50) return 'var(--warning)';
    return 'var(--critical)';
  };

  const metrics = [
    { label: 'Performance Score', value: overallScore !== null ? `${overallScore}` : '—', sub: overallScore !== null ? (overallScore >= 90 ? 'Good' : 'Needs work') : '' },
    { label: 'LCP', value: vitals.lcp ?? '—', sub: 'Largest Contentful Paint' },
    { label: 'CLS', value: vitals.cls ?? '—', sub: 'Cumulative Layout Shift' },
    { label: 'Speed Index', value: vitals.speed_index ?? '—', sub: 'Visual stability' },
  ];

  return (
    <section id="vitals" className="card">
      <div className="card-header">
        <div>
          <p className="card-title">Performance</p>
          <p className="card-heading">Core Web Vitals</p>
        </div>
        {overallScore !== null && (
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: getScoreColor(overallScore),
          }}>{overallScore}</span>
        )}
      </div>
      <div className="stats-grid">
        {metrics.map(m => (
          <div key={m.label} className="stat-card">
            <span className="stat-label">{m.label}</span>
            <span className="stat-value">{m.value}</span>
            {m.sub && <span className="stat-sub">{m.sub}</span>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreWebVitalsCard;

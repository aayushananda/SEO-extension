import type { TrafficData } from '../types/report';
import EmptyState from './EmptyState';

export const TrafficAnalysis = ({ trafficData }: { trafficData: TrafficData }) => {
  if (!trafficData) return <EmptyState message="No traffic data available." />;

  const { rank, visits, top_keywords, traffic_sources } = trafficData;
  const hasKeywords = top_keywords?.length > 0;
  const hasSources = traffic_sources && Object.keys(traffic_sources).length > 0;

  const sortedSources = hasSources
    ? Object.entries(traffic_sources).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <section id="traffic" className="card">
      <div className="card-header">
        <div>
          <p className="card-title">Analytics</p>
          <p className="card-heading">Traffic Analysis</p>
        </div>
      </div>

      {/* Top-level stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <span className="stat-label">Global Rank</span>
          <span className="stat-value">#{rank ? rank.toLocaleString() : '—'}</span>
          <span className="stat-sub">{rank > 1_000_000 ? 'Low visibility' : 'Visible'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Est. Visits</span>
          <span className="stat-value">{visits ? visits.toLocaleString() : '—'}</span>
          <span className="stat-sub">per month</span>
        </div>
      </div>

      <div className="traffic-grid">
        {/* Keywords */}
        {hasKeywords && (
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Top Keywords
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Volume</th>
                  <th>CPC</th>
                </tr>
              </thead>
              <tbody>
                {top_keywords.map((kw, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{kw.Name}</td>
                    <td style={{ textAlign: 'right' }}>{kw.Volume.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {kw.Cpc !== null ? `$${kw.Cpc.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Traffic Sources */}
        {hasSources && (
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Traffic Sources
            </p>
            {sortedSources.map(([source, pct]) => (
              <div key={source} className="source-bar-row">
                <div className="source-bar-header">
                  <span className="source-bar-name">{source}</span>
                  <span className="source-bar-pct">{(pct * 100).toFixed(1)}%</span>
                </div>
                <div className="source-bar-track">
                  <div className="source-bar-fill" style={{ width: `${pct * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasKeywords && !hasSources && (
        <EmptyState message="No traffic data available for this domain." />
      )}
    </section>
  );
};

export default TrafficAnalysis;

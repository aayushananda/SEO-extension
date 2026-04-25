import type { RawOnPageSEO } from '../types/report';
import EmptyState from './EmptyState';

const chip = (label: string, value: string | number | boolean, status: 'good' | 'bad' | 'warn' | 'neutral') => (
  <div key={label} className={`seo-metric-chip ${status}`}>
    <span className="seo-chip-label">{label}</span>
    <span className="seo-chip-value">{String(value)}</span>
  </div>
);

export const RawDataView = ({ rawData, isUnlocked }: { rawData: RawOnPageSEO; isUnlocked: boolean }) => {
  if (!isUnlocked) {
    return (
      <section id="raw" className="card">
        <EmptyState
          title="Pro Feature"
          message="Raw data view is available on the Pro plan."
          actionText="Upgrade"
          onAction={() => alert('Upgrade flow...')}
        />
      </section>
    );
  }

  const d = rawData;

  const chips = [
    chip('H1 Tags',          d.h1Count,          d.h1Count === 1 ? 'good' : d.h1Count === 0 ? 'bad' : 'warn'),
    chip('H2 Tags',          d.h2Count,          d.h2Count > 0 ? 'good' : 'warn'),
    chip('H3 Tags',          d.h3Count,          'neutral'),
    chip('Word Count',       d.wordCount,        d.wordCount >= 300 ? 'good' : 'warn'),
    chip('Images',           d.imageCount,       'neutral'),
    chip('No-Alt Images',    d.imagesWithoutAlt, d.imagesWithoutAlt === 0 ? 'good' : 'bad'),
    chip('Internal Links',   d.internalLinks,    d.internalLinks > 5 ? 'good' : 'warn'),
    chip('External Links',   d.externalLinks,    'neutral'),
    chip('Total Links',      d.totalLinks,       'neutral'),
    chip('Nofollow Links',   d.nofollowLinks,    'neutral'),
    chip('Schema.org',       d.hasSchema ? 'Yes' : 'No', d.hasSchema ? 'good' : 'warn'),
    chip('OG Image',         d.ogImage,          d.ogImage !== 'Missing' ? 'good' : 'bad'),
    chip('Keywords',         d.keywords,         d.keywords !== 'Missing' ? 'good' : 'warn'),
    chip('Suspicious Links', d.suspiciousSocialLinks, d.suspiciousSocialLinks === 0 ? 'good' : 'warn'),
    chip('Load Time',        `${(d.pageLoadTimeMs / 1000).toFixed(2)}s`, d.pageLoadTimeMs < 2000 ? 'good' : d.pageLoadTimeMs < 4000 ? 'warn' : 'bad'),
  ];

  return (
    <section id="raw" className="card">
      <div className="card-header">
        <div>
          <p className="card-title">Developer View</p>
          <p className="card-heading">On-Page SEO Metrics</p>
        </div>
      </div>

      {/* Canonical + Description */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Canonical URL</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{d.canonical}</p>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Meta Description</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.description || '—'}</p>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Title Tag</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.title}</p>
        </div>
        {d.emailsFound?.length > 0 && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Emails Found</p>
            {d.emailsFound.map(e => (
              <p key={e} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{e}</p>
            ))}
          </div>
        )}
      </div>

      {/* Metric chips */}
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Metric Breakdown
      </p>
      <div className="seo-metrics-grid" style={{ marginBottom: '2rem' }}>
        {chips}
      </div>

      {/* Raw JSON */}
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Raw JSON
      </p>
      <pre className="raw-data-pre">{JSON.stringify(d, null, 2)}</pre>
    </section>
  );
};

export default RawDataView;

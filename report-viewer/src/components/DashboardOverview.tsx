import type { SeoReport } from '../types/report';

const getVerdictClass = (verdict: string) => {
  if (verdict === 'Trustworthy') return 'verdict-trustworthy';
  if (verdict === 'Suspicious') return 'verdict-suspicious';
  return 'verdict-moderate';
};

const TrustRing = ({ score }: { score: number }) => {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score > 80 ? 'var(--success)' : score > 50 ? 'var(--warning)' : 'var(--critical)';

  return (
    <div className="trust-score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--warm-tan)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="trust-score-ring-text">
        <span className="trust-score-number">{score.toFixed(1)}</span>
        <span className="trust-score-label">/ 100</span>
      </div>
    </div>
  );
};

export const DashboardOverview = ({ report }: { report: SeoReport }) => {
  const { trust_score, fake_probability, verdict, confidence, risk_factors } = report.trust_and_safety;
  const { h1Count, wordCount, pageLoadTimeMs } = report.raw_on_page_seo;
  const critCount = report.insights.critical_errors.length;
  const warnCount = report.insights.warnings.length;
  const passCount = report.insights.passed_checks.length;

  return (
    <section id="overview" className="card">
      <div className="card-header">
        <div>
          <p className="card-title">Executive Summary</p>
          <p className="card-heading">Site Health Overview</p>
        </div>
        <span className={`verdict-badge ${getVerdictClass(verdict)}`}>
          {verdict}
        </span>
      </div>

      {/* Trust Score + Meta */}
      <div className="trust-score-display" style={{ marginBottom: '1.75rem' }}>
        <TrustRing score={trust_score} />
        <div className="trust-score-meta">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            Trust Score
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.25rem' }}>
            {trust_score.toFixed(1)}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / 100</span>
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Fake Probability: <strong style={{ color: fake_probability > 20 ? 'var(--critical)' : 'var(--success)' }}>{fake_probability.toFixed(1)}%</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp;Confidence: <strong style={{ color: 'var(--text-primary)' }}>{confidence}</strong>
          </p>
        </div>
      </div>

      {/* Insight tally */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--critical)' }}>
          <span className="stat-label">Critical</span>
          <span className="stat-value" style={{ color: 'var(--critical)' }}>{critCount}</span>
          <span className="stat-sub">errors to fix</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <span className="stat-label">Warnings</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{warnCount}</span>
          <span className="stat-sub">to review</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <span className="stat-label">Passed</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{passCount}</span>
          <span className="stat-sub">checks</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warm-brown)' }}>
          <span className="stat-label">Load Time</span>
          <span className="stat-value">{(pageLoadTimeMs / 1000).toFixed(1)}s</span>
          <span className="stat-sub">{pageLoadTimeMs > 3000 ? 'Too slow' : 'Good'}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warm-brown)' }}>
          <span className="stat-label">H1 Tags</span>
          <span className="stat-value" style={{ color: h1Count === 0 ? 'var(--critical)' : h1Count === 1 ? 'var(--success)' : 'var(--warning)' }}>{h1Count}</span>
          <span className="stat-sub">{h1Count === 0 ? 'missing!' : h1Count === 1 ? 'perfect' : 'too many'}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warm-brown)' }}>
          <span className="stat-label">Word Count</span>
          <span className="stat-value" style={{ color: wordCount < 300 ? 'var(--warning)' : 'var(--success)' }}>{wordCount}</span>
          <span className="stat-sub">{wordCount < 300 ? 'thin content' : 'good'}</span>
        </div>
      </div>

      {/* Risk Factors */}
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Risk Factor Analysis
      </p>
      <ul className="risk-factors-list">
        {risk_factors.map((factor, i) => (
          <li key={i} className="risk-factor-item">{factor}</li>
        ))}
      </ul>
    </section>
  );
};

export default DashboardOverview;

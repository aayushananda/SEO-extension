import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchReport } from '../services/api';
import EmptyState from './EmptyState';
import { ErrorBoundary } from './ErrorBoundary';

const DashboardOverview = React.lazy(() => import('./DashboardOverview'));
const ActionableInsights = React.lazy(() => import('./ActionableInsights'));
const TrafficAnalysis = React.lazy(() => import('./TrafficAnalysis'));
const CoreWebVitalsCard = React.lazy(() => import('./CoreWebVitalsCard'));
const RawDataView = React.lazy(() => import('./RawDataView'));

const Logo = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, fill: 'none', stroke: 'var(--cream)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',       color: 'var(--warm-brown)' },
  { id: 'insights',  label: 'Insights',        color: 'var(--critical)'   },
  { id: 'traffic',   label: 'Traffic',         color: 'var(--warning)'    },
  { id: 'vitals',    label: 'Core Web Vitals', color: 'var(--success)'    },
  { id: 'raw',       label: 'Raw Data',        color: 'var(--text-muted)' },
];

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem' }}>
    {[200, 350, 280].map((h, i) => (
      <div key={i} className="skeleton skeleton-card" style={{ height: h }} />
    ))}
  </div>
);

export const ReportContainer = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const { data, error, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => fetchReport(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  if (!reportId) {
    return <EmptyState title="No Report ID" message="Please provide a valid report ID in the URL." />;
  }

  if (isLoading) {
    return (
      <div className="report-layout">
        <div className="report-topbar">
          <div className="topbar-brand">
            <div className="topbar-logo"><Logo /></div>
            <span className="topbar-title">Trust Validator</span>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Loading report…
          </span>
        </div>
        <aside className="report-sidebar" />
        <main className="report-main"><SkeletonLoader /></main>
      </div>
    );
  }

  if (error) {
    const msg = (error as Error).message;
    const configs: Record<string, { title: string; message: string; action?: string }> = {
      UNAUTHORIZED:    { title: 'Access Denied',    message: 'You need to authenticate to view this report.',  action: 'Log In' },
      REPORT_NOT_FOUND:{ title: 'Report Not Found', message: 'No report exists for this ID. Run a new scan.',  action: 'Go Home' },
      REPORT_EXPIRED:  { title: 'Report Expired',   message: 'This report has exceeded its TTL and is no longer available.', action: 'Go Home' },
    };
    const cfg = configs[msg] ?? { title: 'Error', message: `Failed to load: ${msg}` };
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <EmptyState
          title={cfg.title}
          message={cfg.message}
          actionText={cfg.action}
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  if (!data?.data) {
    return <EmptyState title="Empty Report" message="The report data is malformed or empty." />;
  }

  const report = data.data;
  const generatedAt = new Date(report.generated_at).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="report-layout">

      {/* ── Top Bar ─────────────────────────────── */}
      <header className="report-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo"><Logo /></div>
          <span className="topbar-title">Trust Validator</span>
        </div>

        <div className="topbar-url">
          <span>🔗</span>
          <a href={report.target_url} target="_blank" rel="noreferrer">
            {report.target_url.replace(/^https?:\/\//, '')}
          </a>
        </div>

        <span className="topbar-date">{generatedAt}</span>
      </header>

      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="report-sidebar">
        <p className="sidebar-section-label">Report Sections</p>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className="sidebar-nav-item"
            onClick={() => scrollTo(item.id)}
          >
            <span className="sidebar-nav-dot" style={{ background: item.color }} />
            {item.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            Report ID
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
            {reportId}
          </p>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="report-main">
        <ErrorBoundary fallbackMessage="Overview section failed to load.">
          <React.Suspense fallback={<div className="skeleton skeleton-card" />}>
            <DashboardOverview report={report} />
          </React.Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Insights section failed to load.">
          <React.Suspense fallback={<div className="skeleton skeleton-card" />}>
            <ActionableInsights insights={report.insights} />
          </React.Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Traffic section failed to load.">
          <React.Suspense fallback={<div className="skeleton skeleton-card" />}>
            <TrafficAnalysis trafficData={report.traffic_data} />
          </React.Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Core Web Vitals section failed to load.">
          <React.Suspense fallback={<div className="skeleton skeleton-card" />}>
            <CoreWebVitalsCard vitals={report.core_web_vitals} />
          </React.Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Raw data section failed to load.">
          <React.Suspense fallback={<div className="skeleton skeleton-card" />}>
            <RawDataView rawData={report.raw_on_page_seo} isUnlocked={true} />
          </React.Suspense>
        </ErrorBoundary>

        <footer style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Digital Trust &amp; Authority Validator · Report generated {generatedAt}
        </footer>
      </main>
    </div>
  );
};

export default ReportContainer;

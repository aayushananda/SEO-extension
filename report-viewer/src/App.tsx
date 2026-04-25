// React is injected automatically by the JSX transform
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportContainer from './components/ReportContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Logo = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const Landing = () => (
  <div className="landing-page">
    <div className="landing-logo"><Logo /></div>
    <h1 className="landing-headline">Digital Trust &amp; Authority Validator</h1>
    <p className="landing-sub">
      Run a scan from the browser extension to generate an SEO &amp; trust report.
      Your full analysis will appear here instantly.
    </p>
    <div className="landing-hint">
      <span>→</span>
      <Link to="/report/096a4846-a896-4489-9888-42aab5de5360">
        View Demo Report
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/report/:reportId" element={<ReportContainer />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

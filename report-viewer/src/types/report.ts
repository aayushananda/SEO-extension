export interface InsightItem {
  issue: string;
  impact: string;
  recommendation: string;
}

export interface Insights {
  critical_errors: InsightItem[];
  warnings: InsightItem[];
  passed_checks: string[];
}

export interface TopKeyword {
  Name: string;
  EstimatedValue: number;
  Volume: number;
  Cpc: number | null;
}

export interface TrafficData {
  rank: number;
  visits: number;
  top_keywords: TopKeyword[];
  traffic_sources: Record<string, number>;
  competitors: unknown[];
}

export interface TrustAndSafety {
  trust_score: number;
  fake_probability: number;
  verdict: string;
  confidence: string;
  risk_factors: string[];
}

export interface RawOnPageSEO {
  canonical: string;
  description: string;
  emailsFound: string[];
  externalLinks: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  hasSchema: boolean;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  keywords: string;
  nofollowLinks: number;
  ogImage: string;
  ogTitle: string;
  pageLoadTimeMs: number;
  robots: string;
  suspiciousSocialLinks: number;
  title: string;
  totalLinks: number;
  viewport: string;
  wordCount: number;
}

export interface SeoReport {
  target_url: string;
  generated_at: string;
  insights: Insights;
  core_web_vitals: any | string | null; 
  traffic_data: TrafficData;
  trust_and_safety: TrustAndSafety;
  raw_on_page_seo: RawOnPageSEO;
}

export interface ReportEndpointResponse {
  report_id: string;
  data: SeoReport;
  created_at: string;
  expires_at: string | null;
}

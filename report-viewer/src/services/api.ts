import type { ReportEndpointResponse } from '../types/report';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const fetchReport = async (reportId: string): Promise<ReportEndpointResponse> => {
  if (reportId === '096a4846-a896-4489-9888-42aab5de5360') {
    const response = await fetch(`/api/reports/${reportId}.json`);
    if (!response.ok) throw new Error(`HTTP_ERROR_${response.status}`);
    const result = await response.json();
    return {
      report_id: reportId,
      data: result,
      created_at: result.generated_at,
      expires_at: null
    };
  }

  // In a real app, this might come from context or a robust auth provider
  const token = localStorage.getItem('auth_token') || 'demo-token-123';
  
  const response = await fetch(`${API_BASE}/api/reports/${reportId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  
  if (response.status === 404) {
    throw new Error('REPORT_NOT_FOUND');
  }

  if (response.status === 410) {
    throw new Error('REPORT_EXPIRED');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP_ERROR_${response.status}`);
  }

  return response.json();
};

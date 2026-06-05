import { useState } from 'react';
import { apiHeaders } from '@openimis/fe-core';
import { ACCOUNT_REPORT_URL } from '../constants';

/**
 * Downloads the account-creation report. Carries the auth token via apiHeaders
 * (the endpoint is a token-authenticated GET, so window.open would 401).
 * scope = { type: 'province'|'agency', id }.
 */
export default function useAccountReportDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const download = async ({ benefitPlanId, scope }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ benefit_plan_id: benefitPlanId });
      params.set(scope.type === 'agency' ? 'payment_agency_id' : 'province_id', scope.id);
      const url = `${window.location.origin}${ACCOUNT_REPORT_URL}/?${params.toString()}`;
      const resp = await fetch(url, { headers: { ...apiHeaders } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const link = document.createElement('a');
      const cd = resp.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/);
      link.href = URL.createObjectURL(blob);
      link.download = match ? match[1] : 'comptes_finbank.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      return true;
    } catch (e) {
      setError(e.message || 'download failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { download, loading, error };
}

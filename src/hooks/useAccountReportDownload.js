import { useState } from 'react';
import { apiHeaders } from '@openimis/fe-core';
import { ACCOUNT_REPORT_URL } from '../constants';

/**
 * Requests the account-creation report. Carries the auth token via apiHeaders
 * (the endpoint is a token-authenticated GET, so window.open would 401).
 *
 * The endpoint is hybrid:
 *  - small scope  -> 200 + xlsx stream: we download the blob immediately.
 *  - large scope  -> 202 + JSON: the build was queued; the user is notified
 *    (in-app + email) with a link when ready. We surface the message instead.
 *
 * scope = { type: 'province'|'agency', id }.
 * Resolves to { ok, async, message } — never throws.
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
      const resp = await fetch(url, { headers: { ...apiHeaders() } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // Async path: queued build, returns JSON with a message.
      const contentType = resp.headers.get('Content-Type') || '';
      if (resp.status === 202 || contentType.includes('application/json')) {
        const data = await resp.json().catch(() => ({}));
        return { ok: true, async: true, message: data.message || '' };
      }

      // Sync path: stream the xlsx blob to a download.
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
      return { ok: true, async: false };
    } catch (e) {
      setError(e.message || 'download failed');
      return { ok: false, async: false };
    } finally {
      setLoading(false);
    }
  };

  return { download, loading, error };
}

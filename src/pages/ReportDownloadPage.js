import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, CircularProgress, Button, Box,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { injectIntl } from 'react-intl';
import { apiHeaders, formatMessage, historyPush } from '@openimis/fe-core';
import { connect } from 'react-redux';
import { MODULE_NAME, ACCOUNT_REPORT_DOWNLOAD_URL } from '../constants';

/**
 * Landing page for the report-ready notification/email link
 * (/front/reports/download/:filename). Auto-fetches the async-generated report
 * from the auth-gated API and saves it. Works for both the in-app bell and the
 * email link because the SPA carries the user's token.
 */
function ReportDownloadPage({ intl, match, modulesManager, history }) {
  const filename = match?.params?.filename;
  const [status, setStatus] = useState('loading'); // loading | done | error

  const fetchAndSave = async () => {
    setStatus('loading');
    try {
      const url = `${window.location.origin}${ACCOUNT_REPORT_DOWNLOAD_URL}/${encodeURIComponent(filename)}`;
      const resp = await fetch(url, { headers: { ...apiHeaders } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setStatus('done');
    } catch (e) {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (filename) fetchAndSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename]);

  return (
    <Box display="flex" justifyContent="center" p={4}>
      <Paper style={{ padding: 32, maxWidth: 520, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {formatMessage(intl, MODULE_NAME, 'report.accountCreation.download.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {filename}
        </Typography>
        <Box mt={3}>
          {status === 'loading' && <CircularProgress />}
          {status === 'done' && (
            <Typography variant="body1">
              {formatMessage(intl, MODULE_NAME, 'report.accountCreation.download.done')}
            </Typography>
          )}
          {status === 'error' && (
            <Typography variant="body1" color="error">
              {formatMessage(intl, MODULE_NAME, 'report.accountCreation.download.error')}
            </Typography>
          )}
        </Box>
        {(status === 'done' || status === 'error') && (
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppIcon />}
              onClick={fetchAndSave}
            >
              {formatMessage(intl, MODULE_NAME, 'report.accountCreation.download.retry')}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

const mapStateToProps = (state) => ({
  user: state.core?.user,
});

export default connect(mapStateToProps)(injectIntl(ReportDownloadPage));

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
  Snackbar,
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { formatMessage, decodeId } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import ScopeSelector from './ScopeSelector';
import useAccountReportDownload from '../../hooks/useAccountReportDownload';

/**
 * Dialog to download the Finbank account-creation report.
 * The host page supplies lockedScope ({type:'province'|'agency', id, label});
 * the operator only picks the program.
 */
function AccountReportDialog({ intl, open, onClose, lockedScope }) {
  const [value, setValue] = useState({ benefitPlanId: null });
  const { download, loading, error } = useAccountReportDownload();
  const [snack, setSnack] = useState(false);

  const canSubmit = !!value.benefitPlanId && !!lockedScope && !!lockedScope.id && !loading;

  const handleDownload = async () => {
    // The picker stores the relay-encoded benefit plan id; the REST endpoint
    // filters a UUID column, so decode to the raw UUID before sending.
    const benefitPlanId = decodeId(value.benefitPlanId);
    const ok = await download({ benefitPlanId, scope: lockedScope });
    if (ok) onClose();
    else setSnack(true);
  };

  return (
    <>
      <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {formatMessage(intl, MODULE_NAME, 'report.accountCreation.dialog.title')}
        </DialogTitle>
        <DialogContent>
          <ScopeSelector value={value} onChange={setValue} lockedScope={lockedScope} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {formatMessage(intl, MODULE_NAME, 'report.accountCreation.cancel')}
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleDownload}
            disabled={!canSubmit}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {formatMessage(intl, MODULE_NAME, 'report.accountCreation.download')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snack}
        autoHideDuration={6000}
        onClose={() => setSnack(false)}
        message={`${formatMessage(intl, MODULE_NAME, 'report.accountCreation.error')}${error ? `: ${error}` : ''}`}
      />
    </>
  );
}

export default injectIntl(AccountReportDialog);

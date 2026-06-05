import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { formatMessage } from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_ACCOUNT_REPORT } from '../../constants';
import AccountReportDialog from './AccountReportDialog';

/**
 * Contextual button to export the Finbank account-creation report.
 * Host passes scope = { type: 'province'|'agency', id, label }.
 * Renders only if the user holds RIGHT_ACCOUNT_REPORT.
 */
function AccountReportButton({
  intl, rights, scope, size = 'small', variant = 'outlined',
}) {
  const [open, setOpen] = useState(false);
  if (!rights || !rights.includes(RIGHT_ACCOUNT_REPORT)) return null;
  if (!scope || !scope.id) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={<AssessmentIcon />}
        onClick={() => setOpen(true)}
      >
        {formatMessage(intl, MODULE_NAME, 'report.accountCreation.button')}
      </Button>
      <AccountReportDialog open={open} onClose={() => setOpen(false)} lockedScope={scope} />
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user
    ? state.core.user.i_user.rights : [],
});

export default connect(mapStateToProps)(injectIntl(AccountReportButton));

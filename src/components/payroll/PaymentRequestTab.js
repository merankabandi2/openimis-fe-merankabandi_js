/* eslint-disable max-len */
import React, { useState } from 'react';
import { Paper, Grid } from '@material-ui/core';
import {
  Contributions,
  useModulesManager,
  useTranslations,
  apiHeaders,
  baseApiUrl,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import {
  ALL_PAYMENT_REQUEST_LIST_TAB_VALUE,
  PAYMENTREQUEST_TABS_LABEL_CONTRIBUTION_KEY,
  PAYMENTREQUEST_TABS_PANEL_CONTRIBUTION_KEY,
  PAYROLL_STATUS,
  PAYROLL_MODULE_NAME,
} from '../../constants';
import PayrollPaymentDataUploadDialog from './dialogs/PayrollPaymentDataUploadDialog';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: {
    display: 'flex',
    alignItems: 'center',
  },
  selectedTab: {
    borderBottom: '4px solid white',
  },
  unselectedTab: {
    borderBottom: '4px solid transparent',
  },
  button: {
    marginLeft: 'auto',
    padding: theme.spacing(1),
    fontSize: '0.875rem',
    textTransform: 'none',
  },
}));

function downloadPayroll(payrollId, payrollFileName, blank = true) {
  const url = new URL(
    `${window.location.origin}${baseApiUrl}/payroll/csv_reconciliation/`,
  );
  url.searchParams.append('payroll_id', payrollId);
  url.searchParams.append('blank', blank);
  url.searchParams.append('payroll_file_name', payrollFileName);

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = blank ? `reconciliation_${payrollFileName}.csv` : payrollFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Export failed, reason: ', error);
    });
}

function PaymentRequestTab({
  rights, setConfirmedAction, payrollUuid, isInTask, payroll, isPayrollFromFailedInvoices,
}) {
  const classes = useStyles();

  const [activeTab, setActiveTab] = useState(ALL_PAYMENT_REQUEST_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(PAYROLL_MODULE_NAME, modulesManager);

  const downloadPayrollData = (payrollUuid, payrollName) => {
    downloadPayroll(payrollUuid, payrollName);
  };

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        <div style={{ width: '100%' }}>
          <div style={{ float: 'left' }}>
            <Contributions
              contributionKey={PAYMENTREQUEST_TABS_LABEL_CONTRIBUTION_KEY}
              rights={rights}
              value={activeTab}
              onChange={handleChange}
              isSelected={isSelected}
              tabStyle={tabStyle}
              payrollUuid={payrollUuid}
              isInTask={isInTask}
              isPayrollFromFailedInvoices={isPayrollFromFailedInvoices}
            />
          </div>
          <div style={{ float: 'right', paddingRight: '16px' }}>
            {payrollUuid && !isPayrollFromFailedInvoices && (
            <Button
              onClick={() => downloadPayrollData(payrollUuid, payroll.name)}
              color="#DFEDEF"
              className={classes.button}
              style={{
                border: '0px',
                marginTop: '6px',
                textTransform: 'uppercase',
              }}
            >
              {formatMessage('payroll.summary.download')}
            </Button>
            )}
            {payrollUuid && payroll?.status === PAYROLL_STATUS.APPROVE_FOR_PAYMENT && payroll.paymentMethod === 'StrategyOfflinePayment' &&
                (
                <PayrollPaymentDataUploadDialog
                  payrollUuid={payrollUuid}
                />
                )}
          </div>
        </div>
      </Grid>
      <Contributions
        contributionKey={PAYMENTREQUEST_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        setConfirmedAction={setConfirmedAction}
        isInTask={isInTask}
      />
    </Paper>
  );
}

export default PaymentRequestTab;

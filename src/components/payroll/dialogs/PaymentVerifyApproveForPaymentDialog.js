/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  useModulesManager,
  useTranslations,
  baseApiUrl,
} from '@openimis/fe-core';
import {
  Paper,
  Grid,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  PAYROLL_MODULE_NAME,
  RIGHT_PAYROLL_SEARCH,
  PAYROLL_STATUS,
  APPROVED,
} from '../../../constants';
import { fetchTask, resolveTask } from '../../../actions';
import { closePayroll, fetchPayroll, rejectPayroll } from '../../../payroll-actions';
import { mutationLabel, formatFrenchThousands } from '../../../utils/string-utils';

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

function PaymentVerifyApproveForPaymentDialog({
  classes,
  payroll,
  task,
  user,
  rejectPayroll,
  payrollDetail,
  fetchPayroll,
  resolveTask,
  rights,
}) {
  const modulesManager = useModulesManager();
  const [payrollUuid] = useState(payrollDetail?.id ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);

  const handleOpen = () => {
    if (payrollUuid) {
      fetchPayroll(modulesManager, [`id: "${payrollUuid}"`]);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const { formatMessage, formatMessageWithValues } = useTranslations(PAYROLL_MODULE_NAME, modulesManager);

  useEffect(() => {
    if (isOpen && Object.keys(payroll).length > 0) {
      const total = payroll.benefitConsumption.length;

      setTotalBeneficiaries(total);

      let totalAmount = 0;
      if (payroll && payroll.benefitConsumption) {
        payroll.benefitConsumption.forEach((benefit) => {
          if (benefit.benefitAttachment && benefit.benefitAttachment.length > 0) {
            benefit.benefitAttachment.forEach((attachment) => {
              if (attachment.bill && attachment.bill.amountTotal) {
                totalAmount += parseFloat(attachment.bill.amountTotal);
              }
            });
          }
        });
      }
      setTotalBillAmount(totalAmount);
    }
  }, [isOpen, payroll]);

  const rejectPayrollCallback = () => {
    handleClose();
    rejectPayroll(
      payrollDetail,
      formatMessageWithValues('payroll.mutation.closeLabel', mutationLabel(payrollDetail)),
    );
  };

  const resolveTaskCallback = (task, user) => {
    handleClose();
    resolveTask(task, 'Résolution de la tâche', user, APPROVED);
    window.location.reload();
  };

  const downloadPayrollData = (payrollUuid, payrollName) => {
    downloadPayroll(payrollUuid, payrollName);
  };

  return (
    <>
      {rights.includes(RIGHT_PAYROLL_SEARCH) &&
        [PAYROLL_STATUS.PENDING_VERIFICATION, PAYROLL_STATUS.PENDING_APPROVAL].includes(payroll?.status) &&
        (
        <Button
          type="button"
          onClick={handleOpen}
          variant="contained"
          color="primary"
          className={classes.button}
        >
          {formatMessage((payroll.status === PAYROLL_STATUS.PENDING_VERIFICATION) ? 'payroll.verify' : 'payroll.approve')}
        </Button>
        )}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '75%',
            maxWidth: '75%',
          },
        }}
      >
        <DialogTitle
          style={{
            marginTop: '10px',
          }}
        >
          { payrollDetail.name }
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h6" gutterBottom>
                  {formatMessage('payroll.summary.beneficiaries')}
                </Typography>
                <Typography variant="h1">
                  { formatFrenchThousands(totalBeneficiaries) }
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h6" gutterBottom>
                  {formatMessage('payroll.summary.totalAmountForInvoice')}
                </Typography>
                <Typography variant="h1">
                  {formatFrenchThousands(totalBillAmount)}
                  BIF
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          style={{
            display: 'inline',
            paddingLeft: '10px',
            marginTop: '25px',
            marginBottom: '15px',
            width: '100%',
          }}
        >
          <div style={{ maxWidth: '3000px' }}>
            <div style={{ float: 'left' }}>
              <Button
                onClick={() => downloadPayrollData(payrollDetail.id, payrollDetail.name)}
                variant="contained"
                color="primary"
                style={{
                  margin: '0 16px',
                  marginBottom: '15px',
                }}
              >
                {formatMessage('payroll.summary.download')}
              </Button>
              <Button
                onClick={() => rejectPayrollCallback(payrollDetail)}
                variant="contained"
                color="secondary"
                style={{
                  margin: '0 16px',
                  marginBottom: '15px',
                }}
              >
                {formatMessage('payroll.summary.reject')}
              </Button>
            </div>
            <div style={{
              float: 'right',
              paddingRight: '16px',
            }}
            >
              {rights.includes(RIGHT_PAYROLL_SEARCH) &&
                task &&
                user &&
                [PAYROLL_STATUS.PENDING_VERIFICATION, PAYROLL_STATUS.PENDING_APPROVAL].includes(payroll?.status) &&
                (
                  <Button
                    onClick={() => resolveTaskCallback(task, user)}
                    variant="contained"
                    color="primary"
                    style={{
                      margin: '0 16px',
                    }}
                  >
                    {formatMessage('payroll.verifyapprove.validate')}
                  </Button>
                )}
              <Button
                onClick={handleClose}
                variant="outlined"
                autoFocus
                style={{ margin: '0 16px' }}
              >
                {formatMessage('payroll.summary.close')}
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  user: state.core?.user ?? null,
  task: state.merankabandi?.task ?? null,
  confirmed: state.core.confirmed,
  payroll: state.payroll.payroll,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  closePayroll,
  rejectPayroll,
  fetchPayroll,
  resolveTask,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PaymentVerifyApproveForPaymentDialog);

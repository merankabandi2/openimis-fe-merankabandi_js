import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { deleteProvincePaymentPoint } from '../../../actions';
import { MODULE_NAME } from '../../../constants';

function DeleteProvincePaymentPointDialog({
  open,
  paymentPoint,
  onClose,
  onConfirm,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleConfirm = async () => {
    if (!paymentPoint?.id) return;
    setLoading(true);
    setError(false);
    try {
      await dispatch(deleteProvincePaymentPoint(
        paymentPoint.id,
        formatMessage('provincePaymentPoint.mutation.deleteLabel'),
      ));
      if (onConfirm) onConfirm();
    } catch (err) {
      console.error('Error deleting payment point:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!paymentPoint) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-payment-point-dialog-title"
    >
      <DialogTitle id="delete-payment-point-dialog-title">
        {formatMessage('provincePaymentPoint.dialog.delete.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessageWithValues('provincePaymentPoint.dialog.delete.message', {
            provinceName: paymentPoint?.province?.name || '',
            paymentPointName: paymentPoint?.paymentPoint?.name || '',
            planName: paymentPoint?.paymentPlan?.benefitPlan?.name || formatMessage('provincePaymentPoint.allPlans'),
          })}
        </DialogContentText>
        {error && (
          <DialogContentText color="error">
            {formatMessage('provincePaymentPoint.dialog.delete.error')}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={loading}>
          {formatMessage('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {formatMessage('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteProvincePaymentPointDialog;

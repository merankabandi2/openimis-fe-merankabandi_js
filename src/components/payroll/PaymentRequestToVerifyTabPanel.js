import { PaymentRequestTabLabel, PaymentRequestTabPanel } from './PaymentRequestTabPanel';

function PaymentRequestToVerifyTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  return PaymentRequestTabLabel({
    onChange, tabStyle, isSelected, modulesManager, paymentRequestStatus: 'PENDING_VERIFICATION',
  });
}

function PaymentRequestToVerifyTabPanel({
  value, rights,
}) {
  return PaymentRequestTabPanel({
    value, rights, paymentRequestStatus: 'PENDING_VERIFICATION',
  });
}

export { PaymentRequestToVerifyTabLabel, PaymentRequestToVerifyTabPanel };

import { PaymentRequestTabLabel, PaymentRequestTabPanel } from './PaymentRequestTabPanel';

function PaymentRequestRejectedTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  return PaymentRequestTabLabel({
    onChange, tabStyle, isSelected, modulesManager, paymentRequestStatus: 'REJECTED',
  });
}

function PaymentRequestRejectedTabPanel({
  value, rights,
}) {
  return PaymentRequestTabPanel({
    value, rights, paymentRequestStatus: 'REJECTED',
  });
}

export { PaymentRequestRejectedTabLabel, PaymentRequestRejectedTabPanel };

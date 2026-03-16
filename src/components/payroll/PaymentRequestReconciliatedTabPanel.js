import { PaymentRequestTabLabel, PaymentRequestTabPanel } from './PaymentRequestTabPanel';

function PaymentRequestReconciliatedTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  return PaymentRequestTabLabel({
    onChange, tabStyle, isSelected, modulesManager, paymentRequestStatus: 'RECONCILED',
  });
}

function PaymentRequestReconciliatedTabPanel({
  value, rights,
}) {
  return PaymentRequestTabPanel({
    value, rights, paymentRequestStatus: 'RECONCILED',
  });
}

export { PaymentRequestReconciliatedTabLabel, PaymentRequestReconciliatedTabPanel };

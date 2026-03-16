import { PaymentRequestTabLabel, PaymentRequestTabPanel } from './PaymentRequestTabPanel';

function PaymentRequestToValidateTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  return PaymentRequestTabLabel({
    onChange, tabStyle, isSelected, modulesManager, paymentRequestStatus: 'PENDING_APPROVAL',
  });
}

function PaymentRequestToValidateTabPanel({
  value, rights,
}) {
  return PaymentRequestTabPanel({
    value, rights, paymentRequestStatus: 'PENDING_APPROVAL',
  });
}

export { PaymentRequestToValidateTabLabel, PaymentRequestToValidateTabPanel };

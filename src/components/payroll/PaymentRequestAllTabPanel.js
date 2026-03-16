import { PaymentRequestTabLabel, PaymentRequestTabPanel } from './PaymentRequestTabPanel';

function PaymentRequestAllTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  return PaymentRequestTabLabel({
    onChange, tabStyle, isSelected, modulesManager, paymentRequestStatus: 'ALL',
  });
}

function PaymentRequestAllTabPanel({
  value, rights,
}) {
  return PaymentRequestTabPanel({
    value, rights,
  });
}

export { PaymentRequestAllTabLabel, PaymentRequestAllTabPanel };

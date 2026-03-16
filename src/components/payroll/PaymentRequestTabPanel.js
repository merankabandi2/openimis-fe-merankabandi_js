import React from 'react';
import { Tab } from '@material-ui/core';
import { PublishedComponent, useTranslations } from '@openimis/fe-core';
import {
  PAYROLL_MODULE_NAME,
  RIGHT_PAYROLL_SEARCH,
} from '../../constants';
import MerankabandiPayrollSearcher from './MerankabandiPayrollSearcher';

function PaymentRequestTabLabel({
  onChange, tabStyle, isSelected, modulesManager, paymentRequestStatus,
}) {
  const { formatMessage } = useTranslations(PAYROLL_MODULE_NAME, modulesManager);
  const PAYMENT_REQUEST_LIST_TAB_VALUE = `paymentRequestTab-${paymentRequestStatus}`;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(PAYMENT_REQUEST_LIST_TAB_VALUE)}
      selected={isSelected(PAYMENT_REQUEST_LIST_TAB_VALUE)}
      value={PAYMENT_REQUEST_LIST_TAB_VALUE}
      label={formatMessage(`paymentRequest-${paymentRequestStatus}.label`)}
    />
  );
}

function PaymentRequestTabPanel({
  value, rights, paymentRequestStatus,
}) {
  const status = (paymentRequestStatus) || 'ALL';
  const PAYMENT_REQUEST_LIST_TAB_VALUE = `paymentRequestTab-${status}`;
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="payroll"
      index={PAYMENT_REQUEST_LIST_TAB_VALUE}
      value={value}
    >
      {
        rights.includes(RIGHT_PAYROLL_SEARCH) && (
        <MerankabandiPayrollSearcher
          rights={rights}
          paymentRequestStatus={paymentRequestStatus}
        />
        )
      }
    </PublishedComponent>
  );
}

export { PaymentRequestTabLabel, PaymentRequestTabPanel };

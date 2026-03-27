import React from 'react';
import MerankabandiPayrollPage from '../../pages/MerankabandiPayrollPage';

const EMPTY_STRING = '';

const PayrollVerificationTaskTableHeaders = () => [
  EMPTY_STRING,
];

const PayrollVerificationTaskItemFormatters = () => [
  (payroll) => <MerankabandiPayrollPage taskPayrollUuid={payroll?.id} />,
];

export { PayrollVerificationTaskTableHeaders, PayrollVerificationTaskItemFormatters };

/**
 * Payroll actions replicated locally to avoid cross-module src/ imports.
 * These dispatch into the payroll module's reducer (state.payroll).
 */
import {
  decodeId,
  formatGQLString,
  formatMutation,
  formatPageQueryWithCount,
  formatQuery,
  graphql,
} from '@openimis/fe-core';

const REQUEST = (actionType) => `${actionType}_REQ`;
const SUCCESS = (actionType) => `${actionType}_RESP`;
const ERROR = (actionType) => `${actionType}_ERR`;

const CLEAR = (actionType) => `${actionType}_CLEAR`;

// Action types (must match payroll reducer's ACTION_TYPE)
const PAYROLL_ACTION_TYPE = {
  MUTATION: 'PAYROLL_MUTATION',
  SEARCH_PAYROLLS: 'PAYROLL_PAYROLLS',
  GET_PAYROLL: 'PAYROLL_GET_PAYROLL',
  GET_PAYMENT_METHODS: 'PAYROLL_PAYMENT_METHODS',
  CREATE_PAYROLL: 'PAYROLL_MUTATION_CREATE_PAYROLL',
  DELETE_PAYROLL: 'PAYROLL_MUTATION_DELETE_PAYROLL',
  RETRIGGER_PAYROLL: 'PAYROLL_MUTATION_RETRIGGER_PAYROLL',
  CLOSE_PAYROLL: 'PAYROLL_MUTATION_CLOSE_PAYROLL',
  REJECT_PAYROLL: 'PAYROLL_MUTATION_REJECT_PAYROLL',
  REJECT_BENEFIT_CONSUMPTION: 'BENEFIT_CONSUMPTION_MUTATION_REJECT_BENEFIT_CONSUMPTION',
  MAKE_PAYMENT_PAYROLL: 'PAYROLL_MUTATION_MAKE_PAYMENT_PAYROLL',
  GET_BENEFIT_CONSUMPTION: 'PAYROLL_BENEFIT_CONSUMPTION',
  GET_PAYROLL_BENEFIT_CONSUMPTION: 'PAYROLL_PAYROLL_BENEFIT_CONSUMPTION',
  GET_BENEFIT_ATTACHMENT: 'PAYROLL_BENEFIT_ATTACHMENT',
  GET_PAYROLL_PAYMENT_FILES: 'GET_PAYROLL_PAYMENT_FILES',
  BENEFITS_SUMMARY: 'PAYROLL_BENEFITS_SUMMARY',
  DELETE_BENEFIT_CONSUMPTION: 'BENEFIT_CONSUMPTION_MUTATION_DELETE_BENEFIT_CONSUMPTION',
  RESOLVE_TASK: 'PAYROLL_TASK_MANAGEMENT_RESOLVE_TASK',
};

// Mutation service names (must match payroll reducer's MUTATION_SERVICE)
const PAYROLL_MUTATION_SERVICE = {
  CREATE: 'createPayroll',
  DELETE: 'deletePayroll',
  RETRIGGER: 'retriggerBenefitCreation',
  CLOSE: 'closePayroll',
  REJECT: 'rejectPayroll',
  MAKE_PAYMENT: 'makePaymentForPayroll',
  BENEFIT_CONSUMPTION_DELETE: 'deleteBenefitConsumption',
  TASK_RESOLVE: 'resolveTask',
};

const PAYROLL_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  GENERATING: 'GENERATING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVE_FOR_PAYMENT: 'APPROVE_FOR_PAYMENT',
  REJECTED: 'REJECTED',
  RECONCILED: 'RECONCILED',
  FAILED: 'FAILED',
};

function isBase64Encoded(str) {
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

export const PAYMENT_POINT_PROJECTION = (modulesManager) => [
  'id',
  'name',
  'isDeleted',
  `location ${modulesManager.getProjection('location.Location.FlatProjection')}`,
  `ppm ${modulesManager.getProjection('admin.UserPicker.projection')}`,
  'jsonExt',
];

const PAYROLL_PROJECTION = (modulesManager) => [
  'id',
  'name',
  'paymentMethod',
  'paymentPlan { code, id, name, benefitPlan }',
  `paymentPoint { ${PAYMENT_POINT_PROJECTION(modulesManager).join(' ')} }`,
  'paymentCycle { code, startDate, endDate }',
  'benefitConsumption{status, benefitAttachment{bill{amountTotal}}}',
  'jsonExt',
  'status',
  'dateValidFrom',
  'dateValidTo',
  'isDeleted',
];

const PAYROLL_SEARCHER_PROJECTION = (modulesManager) => [
  'id',
  'name',
  'paymentMethod',
  'paymentPlan { code, id, name, benefitPlan }',
  `paymentPoint { ${PAYMENT_POINT_PROJECTION(modulesManager).join(' ')} }`,
  'paymentCycle { code, startDate, endDate }',
  'jsonExt',
  'status',
  'dateValidFrom',
  'dateValidTo',
  'isDeleted',
];

const PERFORM_MUTATION = (mutationType, mutationInput, ACTION, clientMutationLabel) => {
  const mutation = formatMutation(mutationType, mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(PAYROLL_ACTION_TYPE.MUTATION), SUCCESS(ACTION), ERROR(PAYROLL_ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
};

const PAYMENT_METHOD_PROJECTION = () => [
  'paymentMethods {name}',
];

export function fetchPaymentMethods(params) {
  const payload = formatQuery('paymentMethods', params, PAYMENT_METHOD_PROJECTION());
  return graphql(payload, PAYROLL_ACTION_TYPE.GET_PAYMENT_METHODS);
}

export function fetchPayrolls(modulesManager, params) {
  const payload = formatPageQueryWithCount('payroll', params, PAYROLL_SEARCHER_PROJECTION(modulesManager));
  return graphql(payload, PAYROLL_ACTION_TYPE.SEARCH_PAYROLLS);
}

export function fetchPayroll(modulesManager, params) {
  const payload = formatPageQueryWithCount('payroll', params, PAYROLL_PROJECTION(modulesManager));
  return graphql(payload, PAYROLL_ACTION_TYPE.GET_PAYROLL);
}

export function deletePayrolls(payroll, clientMutationLabel) {
  const uuid = isBase64Encoded(payroll.id) ? decodeId(payroll?.id) : payroll?.id;
  const payrollUuids = `ids: ["${uuid}"]`;
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.DELETE,
    payrollUuids,
    PAYROLL_ACTION_TYPE.DELETE_PAYROLL,
    clientMutationLabel,
  );
}

export function closePayroll(payroll, clientMutationLabel) {
  const payrollUuids = `ids: ["${payroll?.id}"]`;
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.CLOSE,
    payrollUuids,
    PAYROLL_ACTION_TYPE.CLOSE_PAYROLL,
    clientMutationLabel,
  );
}

export function rejectPayroll(payroll, clientMutationLabel) {
  const payrollUuids = `ids: ["${payroll?.id}"]`;
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.REJECT,
    payrollUuids,
    PAYROLL_ACTION_TYPE.REJECT_PAYROLL,
    clientMutationLabel,
  );
}

export function rejectBenefitConsumption(ids, clientMutationLabel) {
  const idsStr = ids.map((id) => `"${id}"`).join(', ');
  return PERFORM_MUTATION(
    'rejectBenefitConsumption',
    `ids: [${idsStr}]`,
    PAYROLL_ACTION_TYPE.REJECT_BENEFIT_CONSUMPTION,
    clientMutationLabel,
  );
}

const formatPayrollGQL = (payroll) => `
  ${payroll?.id ? `id: "${payroll.id}"` : ''}
  ${payroll?.name ? `name: "${formatGQLString(payroll.name)}"` : ''}
  ${payroll?.paymentPoint ? `paymentPointId: "${decodeId(payroll.paymentPoint.id)}"` : ''}
  ${payroll?.paymentPlan ? `paymentPlanId: "${decodeId(payroll.paymentPlan.id)}"` : ''}
  ${payroll?.paymentCycle ? `paymentCycleId: "${decodeId(payroll.paymentCycle.id)}"` : ''}
  ${payroll?.paymentMethod ? `paymentMethod: "${payroll.paymentMethod}"` : ''}
  ${`status: ${PAYROLL_STATUS.GENERATING}`}
  ${(() => {
    const ext = typeof payroll?.jsonExt === 'string' ? JSON.parse(payroll.jsonExt || '{}') : (payroll?.jsonExt || {});
    if (payroll?.location) {
      ext.location_id = decodeId(payroll.location.id);
      ext.location_uuid = payroll.location.uuid;
    }
    const extStr = JSON.stringify(ext);
    return extStr !== '{}' ? `jsonExt: "${extStr.replace(/"/g, '\\"')}"` : '';
  })()}
  ${payroll?.dateValidFrom ? `dateValidFrom: "${payroll.dateValidFrom}"` : ''}
  ${payroll?.dateValidTo ? `dateValidTo: "${payroll.dateValidTo}"` : ''}
  ${payroll?.fromFailedInvoicesPayrollId
    ? `fromFailedInvoicesPayrollId: "${payroll.fromFailedInvoicesPayrollId}"`
    : ''
  }
`;

export function createPayroll(payroll, clientMutationLabel) {
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.CREATE,
    formatPayrollGQL(payroll),
    PAYROLL_ACTION_TYPE.CREATE_PAYROLL,
    clientMutationLabel,
  );
}

export function retriggerPayroll(payroll, clientMutationLabel) {
  const uuid = isBase64Encoded(payroll.id) ? decodeId(payroll?.id) : payroll?.id;
  const mutationInput = `id: "${uuid}"`;
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.RETRIGGER,
    mutationInput,
    PAYROLL_ACTION_TYPE.RETRIGGER_PAYROLL,
    clientMutationLabel,
  );
}

export const clearPayroll = () => (dispatch) => {
  dispatch({
    type: CLEAR(PAYROLL_ACTION_TYPE.GET_PAYROLL),
  });
};

const BENEFIT_CONSUMPTION_PROJECTION = () => [
  'id',
  'isDeleted',
  'jsonExt',
  'dateCreated',
  'dateUpdated',
  'dateValidFrom',
  'dateValidTo',
  'id',
  'code',
  'individual {firstName, lastName}',
  'benefitAttachment {bill {id, code, terms, datePayed}}',
  'receipt',
  'photo',
  'amount',
  'type',
  'status',
  'dateDue',
];

const PAYROLL_BENEFIT_CONSUMPTION_PROJECTION = () => [
  'id',
  // eslint-disable-next-line max-len
  'benefit{id,isDeleted,jsonExt,dateCreated,dateUpdated,dateValidFrom,dateValidTo,id,code,individual {firstName, lastName},benefitAttachment {bill {id, code, terms, datePayed}},receipt,photo,amount,type,status,dateDue}',
  'payroll {id, name, status, paymentCycle {code, startDate, endDate}, paymentMethod, benefitPlanNameCode}',
];

const BENEFIT_CONSUMPTION_SUMMARY_PROJECTION = () => [
  'totalAmountReceived', 'totalAmountDue',
];

const BENEFIT_ATTACHMENT_PROJECTION = () => [
  'benefit{id, status, code, dateDue, receipt, individual {firstName, lastName}, jsonExt, type, status, amount, receipt}',
  'bill{id, code, terms, amountTotal, datePayed}',
];

const CSV_RECONCILIATION_PROJECTION = () => [
  'fileName',
  'status',
  'error',
  'jsonExt',
];

export function fetchBenefitConsumptions(modulesManager, params) {
  const payload = formatPageQueryWithCount('benefitConsumptionByPayroll', params, BENEFIT_CONSUMPTION_PROJECTION());
  return graphql(payload, PAYROLL_ACTION_TYPE.GET_BENEFIT_CONSUMPTION);
}

export function fetchBenefitAttachments(modulesManager, params) {
  const payload = formatPageQueryWithCount('benefitAttachmentByPayroll', params, BENEFIT_ATTACHMENT_PROJECTION());
  return graphql(payload, PAYROLL_ACTION_TYPE.GET_BENEFIT_ATTACHMENT);
}

export function fetchPayrollBenefitConsumptions(modulesManager, params) {
  const payload = formatPageQueryWithCount('payrollBenefitConsumption', params, PAYROLL_BENEFIT_CONSUMPTION_PROJECTION());
  return graphql(payload, PAYROLL_ACTION_TYPE.GET_PAYROLL_BENEFIT_CONSUMPTION);
}

export function fetchBenefitsSummary(params) {
  const payload = formatQuery(
    'benefitsSummary',
    params,
    BENEFIT_CONSUMPTION_SUMMARY_PROJECTION(),
  );
  return graphql(payload, PAYROLL_ACTION_TYPE.BENEFITS_SUMMARY);
}

export function fetchPayrollPaymentFiles(modulesManager, params) {
  const payload = formatPageQueryWithCount('csvReconciliationUpload', params, CSV_RECONCILIATION_PROJECTION());
  return graphql(payload, PAYROLL_ACTION_TYPE.GET_PAYROLL_PAYMENT_FILES);
}

export function deleteBenefitConsumption(benefit, clientMutationLabel) {
  const uuid = isBase64Encoded(benefit.id) ? decodeId(benefit?.id) : benefit?.id;
  const benefitUuids = `ids: ["${uuid}"]`;
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.BENEFIT_CONSUMPTION_DELETE,
    benefitUuids,
    PAYROLL_ACTION_TYPE.DELETE_BENEFIT_CONSUMPTION,
    clientMutationLabel,
  );
}

export function makePaymentForPayroll(payroll, clientMutationLabel) {
  const payrollUuids = `ids: ["${payroll?.id}"]`;
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.MAKE_PAYMENT,
    payrollUuids,
    PAYROLL_ACTION_TYPE.MAKE_PAYMENT_PAYROLL,
    clientMutationLabel,
  );
}

export const clearPayrollBills = () => (dispatch) => {
  dispatch({
    type: CLEAR(PAYROLL_ACTION_TYPE.GET_BENEFIT_CONSUMPTION),
  });
};

export const formatTaskResolveGQL = (task, user, approveOrFail, additionalData) => `
  ${task?.id ? `id: "${task.id}"` : ''}
  ${user && approveOrFail ? `businessStatus: "{\\"${user.id}\\": \\"${approveOrFail}\\"}"` : ''}
  ${additionalData ? `additionalData: "${additionalData}"` : ''}
  `;

export function resolveTask(task, clientMutationLabel, user, approveOrFail, additionalData = null) {
  return PERFORM_MUTATION(
    PAYROLL_MUTATION_SERVICE.TASK_RESOLVE,
    formatTaskResolveGQL(task, user, approveOrFail, additionalData),
    PAYROLL_ACTION_TYPE.RESOLVE_TASK,
    clientMutationLabel,
  );
}

export { PAYROLL_STATUS };

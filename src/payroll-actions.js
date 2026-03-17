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

// Action types (must match payroll reducer's ACTION_TYPE)
const PAYROLL_ACTION_TYPE = {
  MUTATION: 'PAYROLL_MUTATION',
  SEARCH_PAYROLLS: 'PAYROLL_PAYROLLS',
  GET_PAYROLL: 'PAYROLL_GET_PAYROLL',
  GET_PAYMENT_METHODS: 'PAYROLL_PAYMENT_METHODS',
  DELETE_PAYROLL: 'PAYROLL_MUTATION_DELETE_PAYROLL',
  CLOSE_PAYROLL: 'PAYROLL_MUTATION_CLOSE_PAYROLL',
  REJECT_PAYROLL: 'PAYROLL_MUTATION_REJECT_PAYROLL',
  REJECT_BENEFIT_CONSUMPTION: 'BENEFIT_CONSUMPTION_MUTATION_REJECT_BENEFIT_CONSUMPTION',
};

// Mutation service names (must match payroll reducer's MUTATION_SERVICE)
const PAYROLL_MUTATION_SERVICE = {
  DELETE: 'deletePayroll',
  CLOSE: 'closePayroll',
  REJECT: 'rejectPayroll',
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
];

const PAYROLL_PROJECTION = (modulesManager) => [
  'id',
  'name',
  'paymentMethod',
  'paymentPlan { code, id, name, benefitPlan }',
  `paymentPoint { ${PAYMENT_POINT_PROJECTION(modulesManager).join(' ')} }`,
  'paymentCycle { code, startDate, endDate }',
  'benefitConsumption{id, status, code, dateDue, receipt, individual {firstName, lastName}, benefitAttachment{bill{id, code, terms, amountTotal}}}',
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

/**
 * Social protection actions replicated locally to avoid cross-module src/ imports.
 * These dispatch into the socialProtection module's reducer (state.socialProtection).
 */
import {
  formatMutation,
  formatPageQueryWithCount,
  graphql,
} from '@openimis/fe-core';

const REQUEST = (actionType) => `${actionType}_REQ`;
const SUCCESS = (actionType) => `${actionType}_RESP`;
const ERROR = (actionType) => `${actionType}_ERR`;

// Action types (must match socialProtection reducer's ACTION_TYPE)
const SP_ACTION_TYPE = {
  SEARCH_BENEFIT_PLANS: 'BENEFIT_PLAN_BENEFIT_PLANS',
  MUTATION: 'SOCIAL_PROTECTION_MUTATION',
  DELETE_BENEFIT_PLAN: 'SOCIAL_PROTECTION_MUTATION_DELETE_BENEFIT_PLAN',
};

const BENEFIT_PLAN_FULL_PROJECTION = [
  'uuid',
  'id',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'version',
  'dateValidFrom',
  'dateValidTo',
  'description',
  'replacementUuid',
  'code',
  'name',
  'type',
  'maxBeneficiaries',
  'ceilingPerBeneficiary',
  'beneficiaryDataSchema',
  'jsonExt',
  'institution',
  'version',
  'userUpdated {username}',
  'hasPaymentPlans',
];

export function fetchBenefitPlans(params) {
  const payload = formatPageQueryWithCount('benefitPlan', params, BENEFIT_PLAN_FULL_PROJECTION);
  return graphql(payload, SP_ACTION_TYPE.SEARCH_BENEFIT_PLANS);
}

export function deleteBenefitPlan(benefitPlan, clientMutationLabel) {
  const benefitPlanUuids = `ids: ["${benefitPlan?.id}"]`;
  const mutation = formatMutation('deleteBenefitPlan', benefitPlanUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(SP_ACTION_TYPE.MUTATION), SUCCESS(SP_ACTION_TYPE.DELETE_BENEFIT_PLAN), ERROR(SP_ACTION_TYPE.MUTATION)],
    {
      actionType: SP_ACTION_TYPE.DELETE_BENEFIT_PLAN,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

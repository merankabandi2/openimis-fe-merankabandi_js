import { graphql, formatMutation } from '@openimis/fe-core';

export const WIZARD_ACTION_TYPE = {
  IMPORT_SURVEY: 'MERANKABANDI_IMPORT_SURVEY',
  TRIGGER_PMT: 'MERANKABANDI_TRIGGER_PMT',
  BULK_UPDATE_STATUS: 'MERANKABANDI_BULK_UPDATE_STATUS',
  ENROLL_BENEFICIARIES: 'MERANKABANDI_ENROLL_BENEFICIARIES',
  APPLY_QUOTA_SELECTION: 'MERANKABANDI_APPLY_QUOTA_SELECTION',
  APPLY_CRITERIA_SELECTION: 'MERANKABANDI_APPLY_CRITERIA_SELECTION',
  SELECT_ALL: 'MERANKABANDI_SELECT_ALL',
  PROMOTE_TO_BENEFICIARY: 'MERANKABANDI_PROMOTE_TO_BENEFICIARY',
  PROMOTE_FROM_WAITING_LIST: 'MERANKABANDI_PROMOTE_FROM_WAITING_LIST',
};

export function importSurveyData(benefitPlanId, csvPath) {
  const mutation = formatMutation(
    'importSurveyData',
    `benefitPlanId: "${benefitPlanId}", csvPath: "${csvPath}"`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.IMPORT_SURVEY, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function triggerPmtCalculation(benefitPlanId) {
  const mutation = formatMutation(
    'triggerPmtCalculation',
    `benefitPlanId: "${benefitPlanId}"`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.TRIGGER_PMT, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function bulkUpdateBeneficiaryStatus(benefitPlanId, ids, status, jsonExtUpdate) {
  const idsStr = ids.map((id) => `"${id}"`).join(', ');
  let params = `benefitPlanId: "${benefitPlanId}", ids: [${idsStr}], status: "${status}"`;
  if (jsonExtUpdate) {
    params += `, jsonExtUpdate: ${JSON.stringify(JSON.stringify(jsonExtUpdate))}`;
  }
  const mutation = formatMutation(
    'bulkUpdateGroupBeneficiaryStatus',
    params,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.BULK_UPDATE_STATUS, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function applyQuotaSelection(benefitPlanId, targetingRound = 1) {
  const mutation = formatMutation(
    'applyQuotaSelection',
    `benefitPlanId: "${benefitPlanId}", targetingRound: ${targetingRound}`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.APPLY_QUOTA_SELECTION, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function applyCriteriaSelection(benefitPlanId) {
  const mutation = formatMutation(
    'applyCriteriaSelection',
    `benefitPlanId: "${benefitPlanId}"`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.APPLY_CRITERIA_SELECTION, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function selectAll(benefitPlanId) {
  const mutation = formatMutation(
    'selectAll',
    `benefitPlanId: "${benefitPlanId}"`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.SELECT_ALL, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function promoteToBeneficiary(benefitPlanId) {
  const mutation = formatMutation(
    'promoteToBeneficiary',
    `benefitPlanId: "${benefitPlanId}"`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.PROMOTE_TO_BENEFICIARY, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function promoteFromWaitingList(benefitPlanId, collineId, count) {
  const mutation = formatMutation(
    'promoteFromWaitingList',
    `benefitPlanId: "${benefitPlanId}", collineId: ${collineId}, count: ${count}`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.PROMOTE_FROM_WAITING_LIST, {
    clientMutationId: mutation.clientMutationId,
  });
}

export function enrollValidatedBeneficiaries(benefitPlanId) {
  const mutation = formatMutation(
    'bulkUpdateGroupBeneficiaryStatus',
    `benefitPlanId: "${benefitPlanId}", status: "ACTIVE", currentStatus: "VALIDATED"`,
    ['clientMutationId'],
  );
  return graphql(mutation.payload, WIZARD_ACTION_TYPE.ENROLL_BENEFICIARIES, {
    clientMutationId: mutation.clientMutationId,
  });
}

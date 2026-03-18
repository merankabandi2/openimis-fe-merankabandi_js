import { graphql, formatMutation } from '@openimis/fe-core';

export const WIZARD_ACTION_TYPE = {
  IMPORT_SURVEY: 'MERANKABANDI_IMPORT_SURVEY',
  TRIGGER_PMT: 'MERANKABANDI_TRIGGER_PMT',
  BULK_UPDATE_STATUS: 'MERANKABANDI_BULK_UPDATE_STATUS',
  ENROLL_BENEFICIARIES: 'MERANKABANDI_ENROLL_BENEFICIARIES',
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

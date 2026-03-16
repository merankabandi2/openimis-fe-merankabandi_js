import { graphql, formatMutation } from '@openimis/fe-core';

const WIZARD_ACTION_TYPE = {
  IMPORT_SURVEY: 'MERANKABANDI_IMPORT_SURVEY',
  TRIGGER_PMT: 'MERANKABANDI_TRIGGER_PMT',
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

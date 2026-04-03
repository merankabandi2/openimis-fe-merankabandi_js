import { graphql, formatMutation, formatGQLString } from '@openimis/fe-core';

// Action types
export const PAYMENT_SCHEDULE_COMMUNE_STATUS_REQ = 'PAYMENT_SCHEDULE_COMMUNE_STATUS_REQ';
export const PAYMENT_SCHEDULE_COMMUNE_STATUS_RESP = 'PAYMENT_SCHEDULE_COMMUNE_STATUS_RESP';
export const PAYMENT_SCHEDULE_COMMUNE_STATUS_ERR = 'PAYMENT_SCHEDULE_COMMUNE_STATUS_ERR';

export const PAYMENT_SCHEDULE_EVOLUTION_REQ = 'PAYMENT_SCHEDULE_EVOLUTION_REQ';
export const PAYMENT_SCHEDULE_EVOLUTION_RESP = 'PAYMENT_SCHEDULE_EVOLUTION_RESP';
export const PAYMENT_SCHEDULE_EVOLUTION_ERR = 'PAYMENT_SCHEDULE_EVOLUTION_ERR';

export const PAYMENT_SCHEDULE_VALIDATE_REQ = 'PAYMENT_SCHEDULE_VALIDATE_REQ';
export const PAYMENT_SCHEDULE_VALIDATE_RESP = 'PAYMENT_SCHEDULE_VALIDATE_RESP';
export const PAYMENT_SCHEDULE_VALIDATE_ERR = 'PAYMENT_SCHEDULE_VALIDATE_ERR';

export const PAYMENT_SCHEDULE_CREATE_ROUND = 'PAYMENT_SCHEDULE_CREATE_ROUND';
export const PAYMENT_SCHEDULE_CREATE_RETRY = 'PAYMENT_SCHEDULE_CREATE_RETRY';
export const PAYMENT_SCHEDULE_SYNC = 'PAYMENT_SCHEDULE_SYNC';

// ─── Queries ────────────────────────────────────────────────────

export function fetchCommunePaymentStatus(mm, benefitPlanId, communeId) {
  const query = `{
    communePaymentStatus(benefitPlanId: "${benefitPlanId}", communeId: "${communeId}") {
      communeId totalRounds reconciledRounds remainingRounds
      currentRound currentRoundStatus canCreateNext retryCount
      rounds {
        roundNumber status statusDisplay totalBeneficiaries
        reconciledCount failedCount totalAmount amountPerBeneficiary
        createdAt payrollId
      }
    }
  }`;
  return graphql(query, PAYMENT_SCHEDULE_COMMUNE_STATUS_REQ, PAYMENT_SCHEDULE_COMMUNE_STATUS_RESP, PAYMENT_SCHEDULE_COMMUNE_STATUS_ERR);
}

export function fetchPaymentEvolution(mm, benefitPlanId) {
  const query = `{
    paymentEvolution(benefitPlanId: "${benefitPlanId}") {
      communeUuid communeName totalRounds reconciledRounds
      totalBeneficiaries totalAmount progressPercent
    }
  }`;
  return graphql(query, PAYMENT_SCHEDULE_EVOLUTION_REQ, PAYMENT_SCHEDULE_EVOLUTION_RESP, PAYMENT_SCHEDULE_EVOLUTION_ERR);
}

export function validatePaymentRound(mm, benefitPlanId, communeId) {
  const query = `{
    validatePaymentRound(benefitPlanId: "${benefitPlanId}", communeId: "${communeId}") {
      valid nextRound errors
    }
  }`;
  return graphql(query, PAYMENT_SCHEDULE_VALIDATE_REQ, PAYMENT_SCHEDULE_VALIDATE_RESP, PAYMENT_SCHEDULE_VALIDATE_ERR);
}

// ─── Mutations ──────────────────────────────────────────────────

export function createCommunePaymentRound(mm, data, clientMutationLabel) {
  const mutation = formatMutation(
    'createCommunePaymentRound',
    `
      benefitPlanId: "${data.benefitPlanId}"
      communeId: "${data.communeId}"
      paymentPlanId: "${data.paymentPlanId}"
      ${data.paymentPointId ? `paymentPointId: "${data.paymentPointId}"` : ''}
      ${data.paymentCycleId ? `paymentCycleId: "${data.paymentCycleId}"` : ''}
      ${data.paymentMethod ? `paymentMethod: "${data.paymentMethod}"` : ''}
      ${data.amountPerBeneficiary ? `amountPerBeneficiary: "${data.amountPerBeneficiary}"` : ''}
    `,
    clientMutationLabel,
  );
  return graphql(mutation.payload, PAYMENT_SCHEDULE_CREATE_ROUND);
}

export function createRetryPaymentRound(mm, data, clientMutationLabel) {
  const mutation = formatMutation(
    'createRetryPaymentRound',
    `
      benefitPlanId: "${data.benefitPlanId}"
      communeId: "${data.communeId}"
      sourceRoundNumber: ${data.sourceRoundNumber}
      paymentPlanId: "${data.paymentPlanId}"
      ${data.paymentPointId ? `paymentPointId: "${data.paymentPointId}"` : ''}
      ${data.paymentCycleId ? `paymentCycleId: "${data.paymentCycleId}"` : ''}
      ${data.paymentMethod ? `paymentMethod: "${data.paymentMethod}"` : ''}
    `,
    clientMutationLabel,
  );
  return graphql(mutation.payload, PAYMENT_SCHEDULE_CREATE_RETRY);
}

export function syncPaymentSchedule(mm, payrollId, clientMutationLabel) {
  const mutation = formatMutation(
    'syncPaymentSchedule',
    `payrollId: "${payrollId}"`,
    clientMutationLabel,
  );
  return graphql(mutation.payload, PAYMENT_SCHEDULE_SYNC);
}

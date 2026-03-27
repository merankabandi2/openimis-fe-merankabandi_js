import {
  decodeId,
  formatGQLString,
  formatMutation,
  formatPageQuery,
  formatPageQueryWithCount,
  formatQuery,
  graphql,
} from '@openimis/fe-core';

const REQUEST = (actionType) => `${actionType}_REQ`;
const SUCCESS = (actionType) => `${actionType}_RESP`;
const ERROR = (actionType) => `${actionType}_ERR`;
const CLEAR = (actionType) => `${actionType}_CLEAR`;

export const ACTION_TYPE = {
  // Task
  GET_TASK: 'MERANKABANDI_TASK_MANAGEMENT_TASK',
  RESOLVE_TASK: 'MERANKABANDI_TASK_MANAGEMENT_RESOLVE_TASK',

  // Province / Payroll
  SEARCH_BENEFIT_PLAN_PROVINCES: 'MERANKABANDI_BENEFIT_PLAN_PROVINCES',
  GENERATE_PROVINCE_PAYROLL: 'MERANKABANDI_GENERATE_PROVINCE_PAYROLL',
  ADD_PROVINCE_PAYMENT_POINT: 'MERANKABANDI_ADD_PROVINCE_PAYMENT_POINT',
  DELETE_PROVINCE_PAYMENT_POINT: 'MERANKABANDI_DELETE_PROVINCE_PAYMENT_POINT',

  // M&E Activities
  SEARCH_SENSITIZATION_TRAININGS: 'MERANKABANDI_SENSITIZATION_TRAININGS',
  SEARCH_BEHAVIOR_CHANGE_PROMOTIONS: 'MERANKABANDI_BEHAVIOR_CHANGE_PROMOTIONS',
  SEARCH_MICRO_PROJECTS: 'MERANKABANDI_MICRO_PROJECTS',

  // Monetary Transfers
  SEARCH_MONETARY_TRANSFERS: 'MERANKABANDI_MONETARY_TRANSFERS',
  GET_MONETARY_TRANSFER: 'MERANKABANDI_MONETARY_TRANSFER',
  CREATE_MONETARY_TRANSFER: 'MERANKABANDI_CREATE_MONETARY_TRANSFER',
  UPDATE_MONETARY_TRANSFER: 'MERANKABANDI_UPDATE_MONETARY_TRANSFER',
  DELETE_MONETARY_TRANSFER: 'MERANKABANDI_DELETE_MONETARY_TRANSFER',

  // Indicators
  SEARCH_INDICATORS: 'MERANKABANDI_SEARCH_INDICATORS',
  GET_INDICATOR: 'MERANKABANDI_GET_INDICATOR',
  CLEAR_INDICATOR: 'MERANKABANDI_CLEAR_INDICATOR',
  CREATE_INDICATOR: 'MERANKABANDI_CREATE_INDICATOR',
  UPDATE_INDICATOR: 'MERANKABANDI_UPDATE_INDICATOR',
  DELETE_INDICATOR: 'MERANKABANDI_DELETE_INDICATOR',

  // Sections
  SEARCH_SECTIONS: 'MERANKABANDI_SEARCH_SECTIONS',
  GET_SECTION: 'MERANKABANDI_GET_SECTION',
  SECTION: 'MERANKABANDI_SECTION',
  CREATE_SECTION: 'MERANKABANDI_CREATE_SECTION',
  UPDATE_SECTION: 'MERANKABANDI_UPDATE_SECTION',
  DELETE_SECTION: 'MERANKABANDI_DELETE_SECTION',

  // Indicator Achievements
  SEARCH_INDICATOR_ACHIEVEMENTS: 'MERANKABANDI_SEARCH_INDICATOR_ACHIEVEMENTS',
  CREATE_INDICATOR_ACHIEVEMENT: 'MERANKABANDI_CREATE_INDICATOR_ACHIEVEMENT',
  UPDATE_INDICATOR_ACHIEVEMENT: 'MERANKABANDI_UPDATE_INDICATOR_ACHIEVEMENT',
  DELETE_INDICATOR_ACHIEVEMENT: 'MERANKABANDI_DELETE_INDICATOR_ACHIEVEMENT',

  // Workflows
  GET_WORKFLOWS: 'MERANKABANDI_GET_WORKFLOWS',

  // PMT Formulas
  SEARCH_PMT_FORMULAS: 'MERANKABANDI_SEARCH_PMT_FORMULAS',
  GET_PMT_FORMULA: 'MERANKABANDI_GET_PMT_FORMULA',
  PMT_FORMULA: 'MERANKABANDI_PMT_FORMULA',
  CREATE_PMT_FORMULA: 'MERANKABANDI_CREATE_PMT_FORMULA',
  UPDATE_PMT_FORMULA: 'MERANKABANDI_UPDATE_PMT_FORMULA',
  DELETE_PMT_FORMULA: 'MERANKABANDI_DELETE_PMT_FORMULA',

  // Mutation
  MUTATION: 'MERANKABANDI_MUTATION',

  // Grievance config (dispatches into grievanceSocialProtection reducer)
  GET_GRIEVANCE_CONFIGURATION: 'GET_GRIEVANCE_CONFIGURATION',
};

export const MUTATION_SERVICE = {
  TASK: {
    RESOLVE: 'resolveTask',
  },
  PAYROLL: {
    GENERATE_PROVINCE: 'generateProvincePayroll',
    ADD_PROVINCE_PAYMENT_POINT: 'addProvincePaymentPoint',
    DELETE_PROVINCE_PAYMENT_POINT: 'deleteProvincePaymentPoint',
  },
  MONETARY_TRANSFER: {
    CREATE: 'createMonetaryTransfer',
    UPDATE: 'updateMonetaryTransfer',
    DELETE: 'deleteMonetaryTransfer',
  },
  SECTION: {
    CREATE: 'createSection',
    UPDATE: 'updateSection',
    DELETE: 'deleteSection',
  },
  INDICATOR: {
    CREATE: 'createIndicator',
    UPDATE: 'updateIndicator',
    DELETE: 'deleteIndicator',
  },
  INDICATOR_ACHIEVEMENT: {
    CREATE: 'createIndicatorAchievement',
    UPDATE: 'updateIndicatorAchievement',
    DELETE: 'deleteIndicatorAchievement',
  },
  PMT_FORMULA: {
    CREATE: 'createPmtFormula',
    UPDATE: 'updatePmtFormula',
    DELETE: 'deletePmtFormula',
  },
};

// ─── Projections ───────────────────────────────────────────────────────────────

const TASK_PROJECTION = () => [
  'id',
  'businessStatus',
];

const SENSITIZATION_TRAINING_FULL_PROJECTION = (modulesManager) => [
  'id',
  'sensitizationDate',
  `location ${modulesManager.getProjection('location.Location.FlatProjection')}`,
  'category',
  'modules',
  'facilitator',
  'maleParticipants',
  'femaleParticipants',
  'twaParticipants',
  'observations',
  'validationStatus',
  'validatedBy {username}',
  'validationDate',
  'validationComment',
];

const BEHAVIOR_CHANGE_PROMOTION_FULL_PROJECTION = (modulesManager) => [
  'id',
  'reportDate',
  `location ${modulesManager.getProjection('location.Location.FlatProjection')}`,
  'maleParticipants',
  'femaleParticipants',
  'twaParticipants',
  'comments',
  'validationStatus',
  'validatedBy {username}',
  'validationDate',
  'validationComment',
];

const MICRO_PROJECT_FULL_PROJECTION = (modulesManager) => [
  'id',
  'reportDate',
  `location ${modulesManager.getProjection('location.Location.FlatProjection')}`,
  'maleParticipants',
  'femaleParticipants',
  'twaParticipants',
  'agricultureBeneficiaries',
  'livestockBeneficiaries',
  'livestockGoatBeneficiaries',
  'livestockPigBeneficiaries',
  'livestockRabbitBeneficiaries',
  'livestockPoultryBeneficiaries',
  'livestockCattleBeneficiaries',
  'commerceServicesBeneficiaries',
  'validationStatus',
  'validatedBy {username}',
  'validationDate',
  'validationComment',
];

export const MONETARY_TRANSFER_PROJECTION = (modulesManager) => [
  'id',
  'transferDate',
  `location ${modulesManager.getProjection('location.Location.FlatProjection')}`,
  'programme {id, code, name}',
  'paymentAgency {id, name}',
  'plannedWomen',
  'plannedMen',
  'plannedTwa',
  'paidWomen',
  'paidMen',
  'paidTwa',
  'plannedAmount',
  'transferredAmount',
];

const INDICATOR_FULL_PROJECTION = () => [
  'id',
  'section {id, name}',
  'name',
  'pbc',
  'baseline',
  'target',
  'observation',
];

const SECTION_FULL_PROJECTION = () => [
  'id',
  'name',
];

const INDICATOR_ACHIEVEMENT_FULL_PROJECTION = () => [
  'id',
  'indicator {id, name}',
  'achieved',
  'date',
  'comment',
];

const WORKFLOWS_FULL_PROJECTION = () => [
  'name',
  'group',
];

// ─── Mutation helper ───────────────────────────────────────────────────────────

const PERFORM_MUTATION = (mutationType, mutationInput, ACTION, clientMutationLabel) => {
  const mutation = formatMutation(mutationType, mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
};

// ─── Task actions ──────────────────────────────────────────────────────────────

export function fetchTask(modulesManager, params) {
  const payload = formatPageQueryWithCount('task', params, TASK_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_TASK);
}

export const formatTaskResolveGQL = (task, user, approveOrFail, additionalData) => `
  ${task?.id ? `id: "${task.id}"` : ''}
  ${user && approveOrFail ? `businessStatus: "{\\"${user.id}\\": \\"${approveOrFail}\\"}"` : ''}
  ${additionalData ? `additionalData: "${additionalData}"` : ''}
  `;

export function resolveTask(task, clientMutationLabel, user, approveOrFail, additionalData = null) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.TASK.RESOLVE,
    formatTaskResolveGQL(task, user, approveOrFail, additionalData),
    ACTION_TYPE.RESOLVE_TASK,
    clientMutationLabel,
  );
}

// ─── Benefit Plan Provinces ────────────────────────────────────────────────────

export function fetchBenefitPlanProvinces(modulesManager, params) {
  const payload = formatPageQueryWithCount('locationByBenefitPlan', params, [
    'id, uuid, code, name, type, parent{id,uuid,code,name,type,parent{id,uuid,code,name,type}}',
    'countSelected',
    'countSuspended',
    'countActive',
  ]);
  return graphql(payload, ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES);
}

const formatProvincePayrollGQL = (params) => `
  ${params?.provinceId ? `provinceId: "${params.provinceId}"` : ''}
  ${params?.paymentDate ? `paymentDate: "${params.paymentDate}"` : ''}
  ${params?.paymentPlanId ? `paymentPlanId: "${decodeId(params.paymentPlanId)}"` : ''}
`;

export function generateProvincePayroll(params, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PAYROLL.GENERATE_PROVINCE,
    formatProvincePayrollGQL(params),
    ACTION_TYPE.GENERATE_PROVINCE_PAYROLL,
    clientMutationLabel,
  );
}

const formatProvincePaymentPointGQL = (params) => `
  ${params?.id ? `id: "${params.id}"` : ''}
  ${params?.provinceId ? `provinceId: "${params.provinceId}"` : ''}
  ${params?.paymentPointId ? `paymentPointId: "${decodeId(params.paymentPointId)}"` : ''}
  ${params?.paymentPlanId ? `paymentPlanId: "${decodeId(params.paymentPlanId)}"` : ''}
  ${params?.isActive !== undefined ? `isActive: ${params.isActive}` : ''}
`;

export function addProvincePaymentPoint(params, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PAYROLL.ADD_PROVINCE_PAYMENT_POINT,
    formatProvincePaymentPointGQL(params),
    ACTION_TYPE.ADD_PROVINCE_PAYMENT_POINT,
    clientMutationLabel,
  );
}

export function deleteProvincePaymentPoint(provincePaymentPointId, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PAYROLL.DELETE_PROVINCE_PAYMENT_POINT,
    `ids: ["${provincePaymentPointId}"]`,
    ACTION_TYPE.DELETE_PROVINCE_PAYMENT_POINT,
    clientMutationLabel,
  );
}

// ─── M&E Activity fetches ──────────────────────────────────────────────────────

export function fetchSensitizationTrainings(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'sensitizationTraining',
    params,
    SENSITIZATION_TRAINING_FULL_PROJECTION(modulesManager),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS);
}

export function fetchBehaviorChangePromotions(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'behaviorChangePromotion',
    params,
    BEHAVIOR_CHANGE_PROMOTION_FULL_PROJECTION(modulesManager),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS);
}

export function fetchMicroProjects(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'microProject',
    params,
    MICRO_PROJECT_FULL_PROJECTION(modulesManager),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_MICRO_PROJECTS);
}

// ─── Monetary Transfer actions ─────────────────────────────────────────────────

export function fetchMonetaryTransfers(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'monetaryTransfer',
    params,
    MONETARY_TRANSFER_PROJECTION(modulesManager),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_MONETARY_TRANSFERS);
}

export function fetchMonetaryTransfer(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'monetaryTransfer',
    params,
    MONETARY_TRANSFER_PROJECTION(modulesManager),
  );
  return graphql(payload, ACTION_TYPE.GET_MONETARY_TRANSFER);
}

const formatMonetaryTransferGQL = (monetaryTransfer) => `
  ${monetaryTransfer?.id ? `id: "${monetaryTransfer.id}"` : ''}
  ${monetaryTransfer?.transferDate ? `transferDate: "${monetaryTransfer.transferDate}"` : ''}
  ${monetaryTransfer?.location ? `locationId: ${decodeId(monetaryTransfer.location.id)}` : ''}
  ${monetaryTransfer?.programme ? `programmeId: "${decodeId(monetaryTransfer.programme.id)}"` : ''}
  ${monetaryTransfer?.paymentAgency ? `paymentAgencyId: "${decodeId(monetaryTransfer.paymentAgency.id)}"` : ''}
  ${monetaryTransfer?.plannedWomen ? `plannedWomen: ${monetaryTransfer.plannedWomen}` : ''}
  ${monetaryTransfer?.plannedMen ? `plannedMen: ${monetaryTransfer.plannedMen}` : ''}
  ${monetaryTransfer?.plannedTwa ? `plannedTwa: ${monetaryTransfer.plannedTwa}` : ''}
  ${monetaryTransfer?.paidWomen ? `paidWomen: ${monetaryTransfer.paidWomen}` : ''}
  ${monetaryTransfer?.paidMen ? `paidMen: ${monetaryTransfer.paidMen}` : ''}
  ${monetaryTransfer?.paidTwa ? `paidTwa: ${monetaryTransfer.paidTwa}` : ''}
  ${monetaryTransfer?.plannedAmount ? `plannedAmount: "${monetaryTransfer.plannedAmount}"` : ''}
  ${monetaryTransfer?.transferredAmount ? `transferredAmount: "${monetaryTransfer.transferredAmount}"` : ''}
`;

export function createMonetaryTransfer(monetaryTransfer, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.MONETARY_TRANSFER.CREATE,
    formatMonetaryTransferGQL(monetaryTransfer),
    ACTION_TYPE.CREATE_MONETARY_TRANSFER,
    clientMutationLabel,
  );
}

export function updateMonetaryTransfer(monetaryTransfer, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.MONETARY_TRANSFER.UPDATE,
    formatMonetaryTransferGQL(monetaryTransfer),
    ACTION_TYPE.UPDATE_MONETARY_TRANSFER,
    clientMutationLabel,
  );
}

export function deleteMonetaryTransfer(monetaryTransfer, clientMutationLabel) {
  const monetaryTransferUuids = `ids: ["${monetaryTransfer?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.MONETARY_TRANSFER.DELETE,
    monetaryTransferUuids,
    ACTION_TYPE.DELETE_MONETARY_TRANSFER,
    clientMutationLabel,
  );
}

export const clearMonetaryTransfer = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.GET_MONETARY_TRANSFER) });
};

// ─── Indicator actions ─────────────────────────────────────────────────────────

export function fetchIndicators(params) {
  const payload = formatPageQueryWithCount('indicator', params, INDICATOR_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_INDICATORS);
}

export function fetchIndicator(params) {
  const payload = formatPageQuery('indicator', params, INDICATOR_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_INDICATOR);
}

export function clearIndicator() {
  return (dispatch) => {
    dispatch({ type: ACTION_TYPE.CLEAR_INDICATOR });
  };
}

const formatIndicatorGQL = (indicator) => `
  ${indicator?.id ? `id: ${indicator.id}` : ''}
  ${indicator?.name ? `name: "${formatGQLString(indicator.name)}"` : ''}
  ${indicator?.section?.id ? `sectionId: ${decodeId(indicator.section.id)}` : ''}
  ${indicator?.pbc ? `pbc: "${formatGQLString(indicator.pbc)}"` : ''}
  ${indicator?.baseline !== undefined ? `baseline: "${indicator.baseline}"` : ''}
  ${indicator?.target !== undefined ? `target: "${indicator.target}"` : ''}
  ${indicator?.observation ? `observation: "${formatGQLString(indicator.observation)}"` : ''}
`;

export function createIndicator(indicator, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR.CREATE,
    formatIndicatorGQL(indicator),
    ACTION_TYPE.CREATE_INDICATOR,
    clientMutationLabel,
  );
}

export function updateIndicator(indicator, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR.UPDATE,
    formatIndicatorGQL(indicator),
    ACTION_TYPE.UPDATE_INDICATOR,
    clientMutationLabel,
  );
}

export function deleteIndicator(indicator, clientMutationLabel) {
  const indicatorUuids = `ids: [${indicator?.id}]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR.DELETE,
    indicatorUuids,
    ACTION_TYPE.DELETE_INDICATOR,
    clientMutationLabel,
  );
}

// ─── Section actions ───────────────────────────────────────────────────────────

export function fetchSections(params) {
  const payload = formatPageQueryWithCount('section', params, SECTION_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_SECTIONS);
}

export function fetchSection(params) {
  const payload = formatPageQuery('section', params, SECTION_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_SECTION);
}

export function clearSection() {
  return (dispatch) => {
    dispatch({ type: CLEAR(ACTION_TYPE.SECTION) });
  };
}

const formatSectionGQL = (section) => `
  ${section?.id ? `id: ${section.id}` : ''}
  ${section?.name ? `name: "${formatGQLString(section.name)}"` : ''}
`;

export function createSection(section, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SECTION.CREATE,
    formatSectionGQL(section),
    ACTION_TYPE.CREATE_SECTION,
    clientMutationLabel,
  );
}

export function updateSection(section, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SECTION.UPDATE,
    formatSectionGQL(section),
    ACTION_TYPE.UPDATE_SECTION,
    clientMutationLabel,
  );
}

export function deleteSection(section, clientMutationLabel) {
  const sectionUuids = `ids: ["${section?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SECTION.DELETE,
    sectionUuids,
    ACTION_TYPE.DELETE_SECTION,
    clientMutationLabel,
  );
}

// ─── Indicator Achievement actions ─────────────────────────────────────────────

export function fetchIndicatorAchievements(params) {
  const payload = formatPageQueryWithCount(
    'indicatorAchievement',
    params,
    INDICATOR_ACHIEVEMENT_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS);
}

const formatIndicatorAchievementGQL = (achievement) => `
  ${achievement?.id ? `id: "${achievement.id}"` : ''}
  ${achievement?.indicator?.id ? `indicatorId: ${achievement.indicator.id}` : ''}
  ${achievement?.achieved !== undefined && achievement?.achieved !== null ? `achieved: "${achievement.achieved}"` : ''}
  ${achievement?.date ? `date: "${achievement.date}"` : ''}
  ${achievement?.comment ? `comment: "${formatGQLString(achievement.comment)}"` : ''}
`;

export function createIndicatorAchievement(achievement, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.CREATE,
    formatIndicatorAchievementGQL(achievement),
    ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT,
    clientMutationLabel,
  );
}

export function updateIndicatorAchievement(achievement, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.UPDATE,
    formatIndicatorAchievementGQL(achievement),
    ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT,
    clientMutationLabel,
  );
}

export function deleteIndicatorAchievement(achievement, clientMutationLabel) {
  const achievementUuids = `ids: ["${achievement?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.DELETE,
    achievementUuids,
    ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT,
    clientMutationLabel,
  );
}

// ─── Workflow actions ──────────────────────────────────────────────────────────

export function fetchWorkflows() {
  const payload = formatQuery(
    'workflow',
    ['group: "socialProtection"'],
    WORKFLOWS_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_WORKFLOWS);
}

// ─── PMT Formula actions ──────────────────────────────────────────────────────

const PMT_FORMULA_FULL_PROJECTION = () => [
  'id',
  'name',
  'description',
  'baseScoreUrban',
  'baseScoreRural',
  'variables',
  'geographicAdjustments',
  'isActive',
];

export function fetchPmtFormulas(params) {
  const payload = formatPageQueryWithCount('pmtFormula', params, PMT_FORMULA_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_PMT_FORMULAS);
}

export function fetchPmtFormula(params) {
  const payload = formatPageQuery('pmtFormula', params, PMT_FORMULA_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_PMT_FORMULA);
}

export function clearPmtFormula() {
  return (dispatch) => {
    dispatch({ type: CLEAR(ACTION_TYPE.PMT_FORMULA) });
  };
}

const formatPmtFormulaGQL = (formula) => `
  ${formula?.id ? `id: ${formula.id}` : ''}
  ${formula?.name ? `name: "${formatGQLString(formula.name)}"` : ''}
  ${formula?.description ? `description: "${formatGQLString(formula.description)}"` : ''}
  ${formula?.baseScoreUrban != null ? `baseScoreUrban: "${formula.baseScoreUrban}"` : ''}
  ${formula?.baseScoreRural != null ? `baseScoreRural: "${formula.baseScoreRural}"` : ''}
  ${formula?.variables ? `variables: ${JSON.stringify(JSON.stringify(formula.variables))}` : ''}
  ${formula?.geographicAdjustments ? `geographicAdjustments: ${JSON.stringify(JSON.stringify(formula.geographicAdjustments))}` : ''}
  ${formula?.isActive != null ? `isActive: ${formula.isActive}` : ''}
`;

export function createPmtFormula(formula, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PMT_FORMULA.CREATE,
    formatPmtFormulaGQL(formula),
    ACTION_TYPE.CREATE_PMT_FORMULA,
    clientMutationLabel,
  );
}

export function updatePmtFormula(formula, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PMT_FORMULA.UPDATE,
    formatPmtFormulaGQL(formula),
    ACTION_TYPE.UPDATE_PMT_FORMULA,
    clientMutationLabel,
  );
}

export function deletePmtFormula(formula, clientMutationLabel) {
  const formulaUuids = `ids: ["${formula?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PMT_FORMULA.DELETE,
    formulaUuids,
    ACTION_TYPE.DELETE_PMT_FORMULA,
    clientMutationLabel,
  );
}

// Grievance configuration (dispatches into grievanceSocialProtection reducer)
const GRIEVANCE_CONFIGURATION_PROJECTION = () => [
  'grievanceTypes',
  'grievanceFlags',
  'grievanceChannels',
  'grievanceDefaultResolutionsByCategory{category, resolutionTime}',
  'grievanceCategoriesHierarchical{name, fullName, priority, permissions, defaultFlags, children{name, fullName, priority, permissions, defaultFlags, children{name, fullName, priority, permissions, defaultFlags}}}',
  'grievanceFlagsDetailed{name, priority, permissions}',
  'accessibleCategories',
  'accessibleFlags',
];

export function fetchGrievanceConfiguration(params) {
  const payload = formatQuery('grievanceConfig', params, GRIEVANCE_CONFIGURATION_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION);
}

/* eslint-disable default-param-last */
import {
  parseData,
  pageInfo,
  formatGraphQLError,
  formatServerError,
  decodeId,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
} from '@openimis/fe-core';
import { ACTION_TYPE, MUTATION_SERVICE } from './actions';
import {
  RESULT_FRAMEWORK_SNAPSHOTS_REQ,
  RESULT_FRAMEWORK_SNAPSHOTS_RESP,
  RESULT_FRAMEWORK_SNAPSHOTS_ERR,
  CALCULATE_INDICATOR_VALUE_REQ,
  CALCULATE_INDICATOR_VALUE_RESP,
  CALCULATE_INDICATOR_VALUE_ERR,
  CREATE_SNAPSHOT_REQ,
  CREATE_SNAPSHOT_RESP,
  CREATE_SNAPSHOT_ERR,
  GENERATE_DOCUMENT_REQ,
  GENERATE_DOCUMENT_RESP,
  GENERATE_DOCUMENT_ERR,
  FINALIZE_SNAPSHOT_REQ,
  FINALIZE_SNAPSHOT_RESP,
  FINALIZE_SNAPSHOT_ERR,
} from './actions/resultFramework';

const REQUEST = (actionType) => `${actionType}_REQ`;
const SUCCESS = (actionType) => `${actionType}_RESP`;
const ERROR = (actionType) => `${actionType}_ERR`;
const CLEAR = (actionType) => `${actionType}_CLEAR`;

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},

  // Task state
  fetchingTask: false,
  fetchedTask: false,
  errorTask: null,
  task: null,

  // Benefit plan provinces state
  fetchingBenefitPlanProvinces: false,
  fetchedBenefitPlanProvinces: false,
  errorBenefitPlanProvinces: null,
  benefitPlanProvinces: [],
  benefitPlanProvincesPageInfo: {},
  benefitPlanProvincesTotalCount: 0,

  // Province payment point mutation state
  addingProvincePaymentPoint: false,
  addedProvincePaymentPoint: false,
  errorProvincePaymentPoint: null,

  // M&E Activities
  fetchingSensitizationTrainings: false,
  fetchedSensitizationTrainings: false,
  sensitizationTrainings: [],
  sensitizationTrainingsPageInfo: {},
  sensitizationTrainingsTotalCount: 0,
  errorSensitizationTrainings: null,

  fetchingBehaviorChangePromotions: false,
  fetchedBehaviorChangePromotions: false,
  behaviorChangePromotions: [],
  behaviorChangePromotionsPageInfo: {},
  behaviorChangePromotionsTotalCount: 0,
  errorBehaviorChangePromotions: null,

  fetchingMicroProjects: false,
  fetchedMicroProjects: false,
  microProjects: [],
  microProjectsPageInfo: {},
  microProjectsTotalCount: 0,
  errorMicroProjects: null,

  // Monetary Transfers
  fetchingMonetaryTransfers: false,
  fetchedMonetaryTransfers: false,
  monetaryTransfers: [],
  monetaryTransfersPageInfo: {},
  monetaryTransfersTotalCount: 0,
  errorMonetaryTransfers: null,

  fetchingMonetaryTransfer: false,
  fetchedMonetaryTransfer: false,
  monetaryTransfer: null,
  errorMonetaryTransfer: null,

  // Indicators
  fetchingIndicators: false,
  fetchedIndicators: false,
  indicators: [],
  indicatorsPageInfo: {},
  indicatorsTotalCount: 0,
  errorIndicators: null,

  fetchingIndicator: false,
  fetchedIndicator: false,
  indicator: null,
  errorIndicator: null,

  // Sections
  fetchingSections: false,
  fetchedSections: false,
  sections: [],
  sectionsPageInfo: {},
  sectionsTotalCount: 0,
  errorSections: null,

  fetchingSection: false,
  fetchedSection: false,
  section: null,
  errorSection: null,

  // Indicator Achievements
  fetchingIndicatorAchievements: false,
  fetchedIndicatorAchievements: false,
  indicatorAchievements: [],
  indicatorAchievementsPageInfo: {},
  indicatorAchievementsTotalCount: 0,
  errorIndicatorAchievements: null,

  // Workflows
  fetchingWorkflows: false,
  fetchedWorkflows: false,
  workflows: [],
  errorWorkflows: null,

  // PMT Formulas
  fetchingPmtFormulas: false,
  fetchedPmtFormulas: false,
  pmtFormulas: [],
  pmtFormulasPageInfo: {},
  pmtFormulasTotalCount: 0,
  errorPmtFormulas: null,

  fetchingPmtFormula: false,
  fetchedPmtFormula: false,
  pmtFormula: null,
  errorPmtFormula: null,

  // Result Framework
  fetchingResultFrameworkSnapshots: false,
  fetchedResultFrameworkSnapshots: false,
  resultFrameworkSnapshots: [],
  resultFrameworkSnapshotsPageInfo: {},
  resultFrameworkSnapshotsTotalCount: 0,
  errorResultFrameworkSnapshots: null,
  calculatingIndicatorValue: false,
  calculatedIndicatorValue: null,
  errorCalculateIndicatorValue: null,
};

function reducer(state = STORE_STATE, action) {
  switch (action.type) {
    // ─── Task ──────────────────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.GET_TASK):
      return {
        ...state,
        fetchingTask: true,
        fetchedTask: false,
        errorTask: null,
        task: null,
      };
    case SUCCESS(ACTION_TYPE.GET_TASK): {
      const tasks = action.payload?.data?.task?.edges ?? [];
      return {
        ...state,
        fetchingTask: false,
        fetchedTask: true,
        task: tasks.length > 0 ? tasks[0].node : null,
      };
    }
    case ERROR(ACTION_TYPE.GET_TASK):
      return {
        ...state,
        fetchingTask: false,
        errorTask: action.payload,
      };
    case CLEAR(ACTION_TYPE.GET_TASK):
      return {
        ...state,
        fetchingTask: false,
        fetchedTask: false,
        errorTask: null,
        task: null,
      };

    // ─── Benefit Plan Provinces ────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES):
      return {
        ...state,
        fetchingBenefitPlanProvinces: true,
        fetchedBenefitPlanProvinces: false,
        benefitPlanProvinces: [],
        benefitPlanProvincesPageInfo: {},
        benefitPlanProvincesTotalCount: 0,
        errorBenefitPlanProvinces: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES):
      return {
        ...state,
        fetchingBenefitPlanProvinces: false,
        fetchedBenefitPlanProvinces: true,
        benefitPlanProvinces: parseData(action.payload.data.locationByBenefitPlan)?.map((province) => ({
          ...province,
          id: decodeId(province.id),
        })),
        benefitPlanProvincesPageInfo: pageInfo(action.payload.data.locationByBenefitPlan),
        benefitPlanProvincesTotalCount: action.payload.data.locationByBenefitPlan?.totalCount ?? 0,
        errorBenefitPlanProvinces: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES):
      return {
        ...state,
        fetchingBenefitPlanProvinces: false,
        errorBenefitPlanProvinces: formatServerError(action.payload),
      };

    // ─── Province Payment Point ────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.ADD_PROVINCE_PAYMENT_POINT):
      return {
        ...state,
        addingProvincePaymentPoint: true,
        addedProvincePaymentPoint: false,
        errorProvincePaymentPoint: null,
      };
    case SUCCESS(ACTION_TYPE.ADD_PROVINCE_PAYMENT_POINT):
      return {
        ...state,
        addingProvincePaymentPoint: false,
        addedProvincePaymentPoint: true,
      };
    case ERROR(ACTION_TYPE.ADD_PROVINCE_PAYMENT_POINT):
      return {
        ...state,
        addingProvincePaymentPoint: false,
        errorProvincePaymentPoint: formatServerError(action.payload),
      };

    // ─── Province Payroll Mutation ─────────────────────────────────────────────
    case SUCCESS(ACTION_TYPE.GENERATE_PROVINCE_PAYROLL):
      return dispatchMutationResp(state, 'generateProvincePayroll', action);

    // ─── Sensitization Trainings ───────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS):
      return {
        ...state,
        fetchingSensitizationTrainings: true,
        fetchedSensitizationTrainings: false,
        sensitizationTrainings: [],
        sensitizationTrainingsPageInfo: {},
        sensitizationTrainingsTotalCount: 0,
        errorSensitizationTrainings: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS):
      return {
        ...state,
        fetchingSensitizationTrainings: false,
        fetchedSensitizationTrainings: true,
        sensitizationTrainings: parseData(action.payload.data.sensitizationTraining)?.map((training) => ({
          ...training,
          id: decodeId(training.id),
        })),
        sensitizationTrainingsPageInfo: pageInfo(action.payload.data.sensitizationTraining),
        sensitizationTrainingsTotalCount: action.payload.data.sensitizationTraining?.totalCount ?? 0,
        errorSensitizationTrainings: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS):
      return {
        ...state,
        fetchingSensitizationTrainings: false,
        errorSensitizationTrainings: formatServerError(action.payload),
      };

    // ─── Behavior Change Promotions ────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS):
      return {
        ...state,
        fetchingBehaviorChangePromotions: true,
        fetchedBehaviorChangePromotions: false,
        behaviorChangePromotions: [],
        behaviorChangePromotionsPageInfo: {},
        behaviorChangePromotionsTotalCount: 0,
        errorBehaviorChangePromotions: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS):
      return {
        ...state,
        fetchingBehaviorChangePromotions: false,
        fetchedBehaviorChangePromotions: true,
        behaviorChangePromotions: parseData(action.payload.data.behaviorChangePromotion)?.map((promotion) => ({
          ...promotion,
          id: decodeId(promotion.id),
        })),
        behaviorChangePromotionsPageInfo: pageInfo(action.payload.data.behaviorChangePromotion),
        behaviorChangePromotionsTotalCount: action.payload.data.behaviorChangePromotion?.totalCount ?? 0,
        errorBehaviorChangePromotions: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS):
      return {
        ...state,
        fetchingBehaviorChangePromotions: false,
        errorBehaviorChangePromotions: formatServerError(action.payload),
      };

    // ─── Micro Projects ────────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_MICRO_PROJECTS):
      return {
        ...state,
        fetchingMicroProjects: true,
        fetchedMicroProjects: false,
        microProjects: [],
        microProjectsPageInfo: {},
        microProjectsTotalCount: 0,
        errorMicroProjects: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_MICRO_PROJECTS):
      return {
        ...state,
        fetchingMicroProjects: false,
        fetchedMicroProjects: true,
        microProjects: parseData(action.payload.data.microProject)?.map((project) => ({
          ...project,
          id: decodeId(project.id),
        })),
        microProjectsPageInfo: pageInfo(action.payload.data.microProject),
        microProjectsTotalCount: action.payload.data.microProject?.totalCount ?? 0,
        errorMicroProjects: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_MICRO_PROJECTS):
      return {
        ...state,
        fetchingMicroProjects: false,
        errorMicroProjects: formatServerError(action.payload),
      };

    // ─── Monetary Transfers ────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_MONETARY_TRANSFERS):
      return {
        ...state,
        fetchingMonetaryTransfers: true,
        fetchedMonetaryTransfers: false,
        monetaryTransfers: [],
        errorMonetaryTransfers: null,
        monetaryTransfersPageInfo: {},
        monetaryTransfersTotalCount: 0,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_MONETARY_TRANSFERS):
      return {
        ...state,
        monetaryTransfers: parseData(action.payload.data.monetaryTransfer)?.map((mt) => ({
          ...mt,
          id: decodeId(mt.id),
        })),
        fetchingMonetaryTransfers: false,
        fetchedMonetaryTransfers: true,
        errorMonetaryTransfers: formatGraphQLError(action.payload),
        monetaryTransfersPageInfo: pageInfo(action.payload.data.monetaryTransfer),
        monetaryTransfersTotalCount: action.payload.data.monetaryTransfer?.totalCount ?? 0,
      };
    case ERROR(ACTION_TYPE.SEARCH_MONETARY_TRANSFERS):
      return {
        ...state,
        fetchingMonetaryTransfers: false,
        errorMonetaryTransfers: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: true,
        fetchedMonetaryTransfer: false,
        monetaryTransfer: null,
        errorMonetaryTransfer: null,
      };
    case SUCCESS(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: false,
        fetchedMonetaryTransfer: true,
        monetaryTransfer: parseData(action.payload.data.monetaryTransfer)?.map((mt) => ({
          ...mt,
          id: decodeId(mt.id),
        }))?.[0],
        errorMonetaryTransfer: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: false,
        errorMonetaryTransfer: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: false,
        fetchedMonetaryTransfer: false,
        monetaryTransfer: null,
        errorMonetaryTransfer: null,
      };

    // Monetary Transfer mutations
    case REQUEST(ACTION_TYPE.CREATE_MONETARY_TRANSFER):
    case REQUEST(ACTION_TYPE.UPDATE_MONETARY_TRANSFER):
    case REQUEST(ACTION_TYPE.DELETE_MONETARY_TRANSFER):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_MONETARY_TRANSFER):
    case ERROR(ACTION_TYPE.UPDATE_MONETARY_TRANSFER):
    case ERROR(ACTION_TYPE.DELETE_MONETARY_TRANSFER):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_MONETARY_TRANSFER):
      return dispatchMutationResp(state, MUTATION_SERVICE.MONETARY_TRANSFER.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_MONETARY_TRANSFER):
      return dispatchMutationResp(state, MUTATION_SERVICE.MONETARY_TRANSFER.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_MONETARY_TRANSFER):
      return dispatchMutationResp(state, MUTATION_SERVICE.MONETARY_TRANSFER.DELETE, action);

    // ─── Indicators ────────────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: true,
        fetchedIndicators: false,
        indicators: [],
        indicatorsPageInfo: {},
        indicatorsTotalCount: 0,
        errorIndicators: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: false,
        fetchedIndicators: true,
        indicators: parseData(action.payload.data.indicator)?.map((ind) => ({
          ...ind,
          id: decodeId(ind.id),
        })),
        indicatorsPageInfo: pageInfo(action.payload.data.indicator),
        indicatorsTotalCount: action.payload.data.indicator?.totalCount ?? 0,
        errorIndicators: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: false,
        errorIndicators: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_INDICATOR):
      return {
        ...state,
        fetchingIndicator: true,
        fetchedIndicator: false,
        indicator: null,
        errorIndicator: null,
      };
    case SUCCESS(ACTION_TYPE.GET_INDICATOR):
      return {
        ...state,
        fetchingIndicator: false,
        fetchedIndicator: true,
        indicator: parseData(action.payload.data.indicator)?.map((ind) => ({
          ...ind,
          id: decodeId(ind.id),
        }))?.[0] || null,
        errorIndicator: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_INDICATOR):
      return {
        ...state,
        fetchingIndicator: false,
        errorIndicator: formatServerError(action.payload),
      };
    case ACTION_TYPE.CLEAR_INDICATOR:
      return {
        ...state,
        fetchingIndicator: false,
        fetchedIndicator: false,
        indicator: null,
        errorIndicator: null,
      };

    // Indicator mutations
    case REQUEST(ACTION_TYPE.CREATE_INDICATOR):
    case REQUEST(ACTION_TYPE.UPDATE_INDICATOR):
    case REQUEST(ACTION_TYPE.DELETE_INDICATOR):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_INDICATOR):
    case ERROR(ACTION_TYPE.UPDATE_INDICATOR):
    case ERROR(ACTION_TYPE.DELETE_INDICATOR):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.DELETE, action);

    // ─── Sections ──────────────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_SECTIONS):
      return {
        ...state,
        fetchingSections: true,
        fetchedSections: false,
        sections: [],
        sectionsPageInfo: {},
        sectionsTotalCount: 0,
        errorSections: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_SECTIONS):
      return {
        ...state,
        fetchingSections: false,
        fetchedSections: true,
        sections: parseData(action.payload.data.section)?.map((s) => ({
          ...s,
          id: decodeId(s.id),
        })),
        sectionsPageInfo: pageInfo(action.payload.data.section),
        sectionsTotalCount: action.payload.data.section?.totalCount ?? 0,
        errorSections: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_SECTIONS):
      return {
        ...state,
        fetchingSections: false,
        errorSections: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_SECTION):
      return {
        ...state,
        fetchingSection: true,
        fetchedSection: false,
        section: null,
        errorSection: null,
      };
    case SUCCESS(ACTION_TYPE.GET_SECTION): {
      const sections = parseData(action.payload.data.section);
      return {
        ...state,
        fetchingSection: false,
        fetchedSection: true,
        section: sections?.length > 0
          ? { ...sections[0], id: decodeId(sections[0].id) }
          : null,
        errorSection: formatGraphQLError(action.payload),
      };
    }
    case ERROR(ACTION_TYPE.GET_SECTION):
      return {
        ...state,
        fetchingSection: false,
        errorSection: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.SECTION):
      return {
        ...state,
        fetchingSection: false,
        fetchedSection: false,
        section: null,
        errorSection: null,
      };

    // Section mutations
    case REQUEST(ACTION_TYPE.CREATE_SECTION):
    case REQUEST(ACTION_TYPE.UPDATE_SECTION):
    case REQUEST(ACTION_TYPE.DELETE_SECTION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_SECTION):
    case ERROR(ACTION_TYPE.UPDATE_SECTION):
    case ERROR(ACTION_TYPE.DELETE_SECTION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_SECTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.SECTION.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_SECTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.SECTION.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_SECTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.SECTION.DELETE, action);

    // ─── Indicator Achievements ────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS):
      return {
        ...state,
        fetchingIndicatorAchievements: true,
        fetchedIndicatorAchievements: false,
        indicatorAchievements: [],
        indicatorAchievementsPageInfo: {},
        indicatorAchievementsTotalCount: 0,
        errorIndicatorAchievements: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS):
      return {
        ...state,
        fetchingIndicatorAchievements: false,
        fetchedIndicatorAchievements: true,
        indicatorAchievements: parseData(action.payload.data.indicatorAchievement)?.map((achievement) => ({
          ...achievement,
          id: decodeId(achievement.id),
          indicator: achievement.indicator
            ? {
                ...achievement.indicator,
                id: decodeId(achievement.indicator.id),
              }
            : null,
        })),
        indicatorAchievementsPageInfo: pageInfo(action.payload.data.indicatorAchievement),
        indicatorAchievementsTotalCount: action.payload.data.indicatorAchievement?.totalCount ?? 0,
        errorIndicatorAchievements: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS):
      return {
        ...state,
        fetchingIndicatorAchievements: false,
        errorIndicatorAchievements: formatServerError(action.payload),
      };

    // Indicator Achievement mutations
    case REQUEST(ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT):
    case REQUEST(ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT):
    case REQUEST(ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT):
    case ERROR(ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT):
    case ERROR(ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.DELETE, action);

    // ─── PMT Formulas ────────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.SEARCH_PMT_FORMULAS):
      return {
        ...state,
        fetchingPmtFormulas: true,
        fetchedPmtFormulas: false,
        pmtFormulas: [],
        pmtFormulasPageInfo: {},
        pmtFormulasTotalCount: 0,
        errorPmtFormulas: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_PMT_FORMULAS):
      return {
        ...state,
        fetchingPmtFormulas: false,
        fetchedPmtFormulas: true,
        pmtFormulas: parseData(action.payload.data.pmtFormula)?.map((f) => ({
          ...f,
          id: decodeId(f.id),
        })),
        pmtFormulasPageInfo: pageInfo(action.payload.data.pmtFormula),
        pmtFormulasTotalCount: action.payload.data.pmtFormula?.totalCount ?? 0,
        errorPmtFormulas: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_PMT_FORMULAS):
      return {
        ...state,
        fetchingPmtFormulas: false,
        errorPmtFormulas: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_PMT_FORMULA):
      return {
        ...state,
        fetchingPmtFormula: true,
        fetchedPmtFormula: false,
        pmtFormula: null,
        errorPmtFormula: null,
      };
    case SUCCESS(ACTION_TYPE.GET_PMT_FORMULA): {
      const formulas = parseData(action.payload.data.pmtFormula);
      return {
        ...state,
        fetchingPmtFormula: false,
        fetchedPmtFormula: true,
        pmtFormula: formulas?.length > 0
          ? { ...formulas[0], id: decodeId(formulas[0].id) }
          : null,
        errorPmtFormula: formatGraphQLError(action.payload),
      };
    }
    case ERROR(ACTION_TYPE.GET_PMT_FORMULA):
      return {
        ...state,
        fetchingPmtFormula: false,
        errorPmtFormula: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.PMT_FORMULA):
      return {
        ...state,
        fetchingPmtFormula: false,
        fetchedPmtFormula: false,
        pmtFormula: null,
        errorPmtFormula: null,
      };

    // PMT Formula mutations
    case REQUEST(ACTION_TYPE.CREATE_PMT_FORMULA):
    case REQUEST(ACTION_TYPE.UPDATE_PMT_FORMULA):
    case REQUEST(ACTION_TYPE.DELETE_PMT_FORMULA):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_PMT_FORMULA):
    case ERROR(ACTION_TYPE.UPDATE_PMT_FORMULA):
    case ERROR(ACTION_TYPE.DELETE_PMT_FORMULA):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_PMT_FORMULA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PMT_FORMULA.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_PMT_FORMULA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PMT_FORMULA.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_PMT_FORMULA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PMT_FORMULA.DELETE, action);

    // ─── Workflows ─────────────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.GET_WORKFLOWS):
      return {
        ...state,
        fetchingWorkflows: true,
        fetchedWorkflows: false,
        workflows: [],
        errorWorkflows: null,
      };
    case SUCCESS(ACTION_TYPE.GET_WORKFLOWS):
      return {
        ...state,
        fetchingWorkflows: false,
        fetchedWorkflows: true,
        workflows: action.payload.data.workflow || [],
        errorWorkflows: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_WORKFLOWS):
      return {
        ...state,
        fetchingWorkflows: false,
        errorWorkflows: formatServerError(action.payload),
      };

    // ─── Result Framework ──────────────────────────────────────────────────────
    case RESULT_FRAMEWORK_SNAPSHOTS_REQ:
      return {
        ...state,
        fetchingResultFrameworkSnapshots: true,
        fetchedResultFrameworkSnapshots: false,
        errorResultFrameworkSnapshots: null,
      };
    case RESULT_FRAMEWORK_SNAPSHOTS_RESP:
      return {
        ...state,
        fetchingResultFrameworkSnapshots: false,
        fetchedResultFrameworkSnapshots: true,
        resultFrameworkSnapshots: parseData(action.payload?.data?.resultFrameworkSnapshot),
        resultFrameworkSnapshotsPageInfo: pageInfo(action.payload?.data?.resultFrameworkSnapshot),
        resultFrameworkSnapshotsTotalCount: action.payload?.data?.resultFrameworkSnapshot?.totalCount || 0,
        errorResultFrameworkSnapshots: null,
      };
    case RESULT_FRAMEWORK_SNAPSHOTS_ERR:
      return {
        ...state,
        fetchingResultFrameworkSnapshots: false,
        errorResultFrameworkSnapshots: formatGraphQLError(action.payload),
      };
    case CALCULATE_INDICATOR_VALUE_REQ:
      return {
        ...state,
        calculatingIndicatorValue: true,
        calculatedIndicatorValue: null,
        errorCalculateIndicatorValue: null,
      };
    case CALCULATE_INDICATOR_VALUE_RESP:
      return {
        ...state,
        calculatingIndicatorValue: false,
        calculatedIndicatorValue: action.payload.data.calculateIndicatorValue,
        errorCalculateIndicatorValue: null,
      };
    case CALCULATE_INDICATOR_VALUE_ERR:
      return {
        ...state,
        calculatingIndicatorValue: false,
        errorCalculateIndicatorValue: formatGraphQLError(action.payload),
      };
    case CREATE_SNAPSHOT_REQ:
    case GENERATE_DOCUMENT_REQ:
    case FINALIZE_SNAPSHOT_REQ:
      return dispatchMutationReq(state, action);
    case CREATE_SNAPSHOT_ERR:
    case GENERATE_DOCUMENT_ERR:
    case FINALIZE_SNAPSHOT_ERR:
      return dispatchMutationErr(state, action);
    case CREATE_SNAPSHOT_RESP:
      return dispatchMutationResp(state, 'createResultFrameworkSnapshot', action);
    case GENERATE_DOCUMENT_RESP:
      return {
        ...state,
        submittingMutation: false,
        mutation: action.payload.data.generateResultFrameworkDocument,
      };
    case FINALIZE_SNAPSHOT_RESP:
      return dispatchMutationResp(state, 'finalizeSnapshot', action);

    // ─── Generic Mutations ─────────────────────────────────────────────────────
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.RESOLVE_TASK):
      return dispatchMutationResp(state, 'resolveTask', action);

    default:
      return state;
  }
}

export default reducer;

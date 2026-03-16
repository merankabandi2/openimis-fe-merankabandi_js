export const MODULE_NAME = 'merankabandi';

// Burundi location hierarchy
export const BURUNDI_LOC_TYPE_PROVINCE = 'D';
export const BURUNDI_LOC_TYPE_COMMUNE = 'W';
export const BURUNDI_LOC_TYPE_COLLINE = 'V';
export const BURUNDI_LOC_LEVELS = 3;

// Beneficiary photo API
export const BENEFICIARY_PHOTO_URL = '/api/merankabandi/beneficiary-photo/photo';

// Card generation API
export const CARD_GENERATION_URL = '/api/merankabandi/location';

// Head panel contribution keys (requires upstream PR to Individual module)
export const INDIVIDUAL_HEAD_PANEL_CONTRIBUTION_KEY = 'individual.Individual.headPanel';
export const GROUP_HEAD_PANEL_CONTRIBUTION_KEY = 'group.Group.headPanel';

// Payroll / Payment Request
export const PAYROLL_MODULE_NAME = 'payroll';
export const ROUTE_PAYMENT_REQUEST = 'paymentrequest';
export const ROUTE_PAYMENT_NEW_PAYMENT = 'payroll/payroll';
export const PAYROLL_PAYROLL_ROUTE = 'payroll.route.payroll';
export const ALL_PAYMENT_REQUEST_LIST_TAB_VALUE = 'paymentRequestTab-ALL';
export const PAYMENTREQUEST_TABS_LABEL_CONTRIBUTION_KEY = 'paymentRequest.TabPanel.label';
export const PAYMENTREQUEST_TABS_PANEL_CONTRIBUTION_KEY = 'paymentRequest.TabPanel.panel';
export const PAYMENT_MAIN_MENU_CONTRIBUTION_KEY = 'payment.MainMenu';

export const RIGHT_PAYROLL_SEARCH = 202001;
export const RIGHT_PAYROLL_CREATE = 202002;

export const PAYROLL_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVE_FOR_PAYMENT: 'APPROVE_FOR_PAYMENT',
  REJECTED: 'REJECTED',
  RECONCILED: 'RECONCILED',
};

export const APPROVED = 'APPROVED';

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_DEBOUNCE_TIME = 500;
export const CONTAINS_LOOKUP = 'Icontains';
export const CLEARED_STATE_FILTER = {
  field: '', filter: '', type: '', value: '',
};

export const BENEFIT_PLAN_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  GROUP: 'GROUP',
  EVERY_TYPE: 'EVERY_TYPE',
};

// Benefit Plan Provinces tab
export const BENEFIT_PLAN_PROVINCES_TAB_VALUE = 'BenefitPlanProvincesTab';

// --- M&E Menu ---
export const ME_MAIN_MENU_CONTRIBUTION_KEY = 'me.MainMenu';
export const SOCIAL_PROTECTION_MAIN_MENU_CONTRIBUTION_KEY = 'socialProtection.MainMenu';

// --- M&E Routes ---
export const ROUTE_ME_INDICATORS = 'me/indicators';
export const ROUTE_ME_RESULT_FRAMEWORK = 'me/result-framework';
export const ROUTE_ME_MONETARY_TRANSFERS = 'me/monetary-transfers';
export const ROUTE_ME_MONETARY_TRANSFER = 'me/monetary-transfers/monetary-transfer';
export const ROUTE_ME_DASHBOARD = 'me/dashboard';
export const ROUTE_RESULTS_FRAMEWORK_DASHBOARD = 'me/results-framework-dashboard';
export const ROUTE_ACTIVITIES_DASHBOARD = 'me/activities-dashboard';
export const ROUTE_RESULTS_FRAMEWORK_INDICATORS_LIST = 'me/rf/indicators';
export const ROUTE_RESULTS_FRAMEWORK_INDICATOR = 'me/rf/indicators/indicator';
export const ROUTE_RESULTS_FRAMEWORK_SECTIONS_LIST = 'me/rf/sections';
export const ROUTE_RESULTS_FRAMEWORK_SECTION = 'me/rf/sections/section';
export const ROUTE_KOBO_ETL_ADMIN = 'me/kobo-etl-admin';
export const ROUTE_ME_MONETARY_TRANSFERS_LIST = 'me/monetary-transfers-list';
export const ROUTE_ME_MONETARY_TRANSFERS_DASHBOARD = 'me/monetary-transfers-dashboard';

// Route ref keys (used by contributions)
export const SENSITIZATION_TRAINING_ROUTE = 'merankabandi.route.sensitizationTraining';
export const MICRO_PROJECT_ROUTE = 'merankabandi.route.microProject';
export const BEHAVIOR_CHANGE_PROMOTION_ROUTE = 'merankabandi.route.behaviorChangePromotion';
export const MONETARY_TRANSFER_ROUTE = 'merankabandi.route.monetaryTransfer';
export const SECTION_ROUTE = 'merankabandi.route.section';
export const INDICATOR_ROUTE = 'merankabandi.route.indicator';

// --- Rights (shared with social protection) ---
export const RIGHT_BENEFIT_PLAN_SEARCH = 160001;

// --- M&E Rights ---
// TODO: All three activity types share the same right code 190901 — assign distinct codes
export const RIGHT_SENSITIZATION_TRAINING_SEARCH = 190901;
export const RIGHT_MICRO_PROJECT_SEARCH = 190901;
export const RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH = 190901;

// TODO: Same code as RIGHT_BENEFIT_PLAN_SEARCH (160001) — verify if intentional
export const RIGHT_MONETARY_TRANSFER_SEARCH = 160001;
export const RIGHT_MONETARY_TRANSFER_CREATE = 160002;
export const RIGHT_MONETARY_TRANSFER_UPDATE = 160003;
export const RIGHT_MONETARY_TRANSFER_DELETE = 160004;

export const RIGHT_SECTION_SEARCH = 160005;
export const RIGHT_SECTION_CREATE = 160006;
export const RIGHT_SECTION_UPDATE = 160007;
export const RIGHT_SECTION_DELETE = 160008;

export const RIGHT_INDICATOR_SEARCH = 160009;
export const RIGHT_INDICATOR_CREATE = 160010;
export const RIGHT_INDICATOR_UPDATE = 160011;
export const RIGHT_INDICATOR_DELETE = 160012;

export const RIGHT_INDICATOR_ACHIEVEMENT_SEARCH = 160013;
export const RIGHT_INDICATOR_ACHIEVEMENT_CREATE = 160014;
export const RIGHT_INDICATOR_ACHIEVEMENT_UPDATE = 160015;
export const RIGHT_INDICATOR_ACHIEVEMENT_DELETE = 160016;

export const RIGHT_KOBO_ETL_VIEW = '180001';
export const RIGHT_KOBO_ETL_RUN = '180002';

// --- M&E Tab Values ---
export const MICRO_PROJECT_LIST_TAB_VALUE = 'microProjectIndicatorsListTab';
export const SENSITIZATION_TRAINING_LIST_TAB_VALUE = 'sensitizationTrainingIndicatorsListTab';
export const BEHAVIOR_CHANGE_PROMOTION_LIST_TAB_VALUE = 'behaviorChangePromotionIndicatorsListTab';
export const DEVELOPMENT_INDICATORS_LIST_TAB_VALUE = 'developmentIndicatorsListTab';
export const INTERMEDIATE_INDICATORS_LIST_TAB_VALUE = 'intermediateIndicatorsListTab';
export const RESULTS_FRAMEWORK_TAB_VALUE = 'resultsFrameworkTab';

// --- M&E Contribution Keys ---
export const ME_INDICATORS_TABS_LABEL_CONTRIBUTION_KEY = 'meIndicators.TabPanel.label';
export const ME_INDICATORS_TABS_PANEL_CONTRIBUTION_KEY = 'meIndicators.TabPanel.panel';
export const ME_RESULT_FRAMEWORK_TABS_LABEL_CONTRIBUTION_KEY = 'meResultFrameWork.TabPanel.label';
export const ME_RESULT_FRAMEWORK_TABS_PANEL_CONTRIBUTION_KEY = 'meResultFrameWork.TabPanel.panel';

// --- Helper ---
export const locationAtLevel = (lowestLevelLoc, level) => {
  let location = lowestLevelLoc;
  let levelDiff = level;
  while (levelDiff > 0 && location) {
    location = location.parent;
    levelDiff -= 1;
  }
  return location ? location.name : '';
};

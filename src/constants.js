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
export const ROUTE_PAYMENT_NEW_PAYMENT = 'paymentrequest/paymentrequest';
export const ROUTE_PAYROLLS_APPROVED = 'payrollsApproved';
export const ROUTE_PAYROLLS_PENDING = 'payrollsPending';
export const ROUTE_PAYROLLS_RECONCILED = 'payrollsReconciled';
export const PAYROLL_PAYROLL_ROUTE = 'payroll.route.payroll';
export const ALL_PAYMENT_REQUEST_LIST_TAB_VALUE = 'paymentRequestTab-ALL';
export const PAYMENTREQUEST_TABS_LABEL_CONTRIBUTION_KEY = 'paymentRequest.TabPanel.label';
export const PAYMENTREQUEST_TABS_PANEL_CONTRIBUTION_KEY = 'paymentRequest.TabPanel.panel';
export const PAYMENT_MAIN_MENU_CONTRIBUTION_KEY = 'payment.MainMenu';
export const BENEFIT_CONSUMPTION_LIST_TAB_VALUE = 'payrollTab-BenefitConsumptions';
export const PAYROLL_TABS_LABEL_CONTRIBUTION_KEY = 'payroll.TabPanel.label';
export const PAYROLL_TABS_PANEL_CONTRIBUTION_KEY = 'payroll.TabPanel.panel';

export const RIGHT_PAYROLL_SEARCH = 202001;
export const RIGHT_PAYROLL_CREATE = 202002;

export const EMPTY_STRING = '';

export const PAYROLL_FROM_FAILED_INVOICES_URL_PARAM = 'createPayrollFromFailedInvoices';

export const PAYROLL_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  GENERATING: 'GENERATING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVE_FOR_PAYMENT: 'APPROVE_FOR_PAYMENT',
  REJECTED: 'REJECTED',
  RECONCILED: 'RECONCILED',
  FAILED: 'FAILED',
};

export const PAYROLL_STATUS_LIST = [
  PAYROLL_STATUS.PENDING_VERIFICATION,
  PAYROLL_STATUS.PENDING_APPROVAL,
  PAYROLL_STATUS.APPROVE_FOR_PAYMENT,
  PAYROLL_STATUS.REJECTED,
  PAYROLL_STATUS.RECONCILED,
];

export const APPROVED = 'APPROVED';

export const PAYROLL_TASK_TAB_VALUE = 'payrollTaskTab';
export const PAYROLL_PAYMENT_FILES_TAB_VALUE = 'payrollPaymentFilesTab';

export const BENEFIT_CONSUMPTION_STATUS = {
  ACCEPTED: 'ACCEPTED',
  CREATED: 'CREATED',
  APPROVE_FOR_PAYMENT: 'APPROVE_FOR_PAYMENT',
  REJECTED: 'REJECTED',
  DUPLICATE: 'DUPLICATE',
  RECONCILED: 'RECONCILED',
};

export const BENEFIT_CONSUMPTION_STATUS_LIST = [
  'ACCEPTED', 'CREATED', 'APPROVE_FOR_PAYMENT', 'REJECTED', 'DUPLICATE', 'RECONCILED',
];

export const PAYROLL_PAYMENT_FILE_STATUS = {
  TRIGGERED: 'TRIGGERED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
  WAITING_FOR_VERIFICATION: 'WAITING_FOR_VERIFICATION',
  FAIL: 'FAIL',
};

export const PAYROLL_PAYMENT_FILE_STATUS_LIST = [
  'TRIGGERED', 'IN_PROGRESS', 'SUCCESS', 'WAITING_FOR_VERIFICATION', 'FAIL',
];

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_DEBOUNCE_TIME = 500;
export const CONTAINS_LOOKUP = 'Icontains';
export const CLEARED_STATE_FILTER = {
  field: '', filter: '', type: '', value: '',
};
export const BENEFIT_PLAN = 'BenefitPlan';
export const INTEGER = 'integer';
export const STRING = 'string';
export const BOOLEAN = 'boolean';
export const DATE = 'date';
export const BOOL_OPTIONS = [
  { value: 'True', label: 'True' },
  { value: 'False', label: 'False' },
];

export const BENEFIT_PLAN_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  GROUP: 'GROUP',
  EVERY_TYPE: 'EVERY_TYPE',
};

// Benefit Plan Provinces tab
export const BENEFIT_PLAN_PROVINCES_TAB_VALUE = 'BenefitPlanProvincesTab';

// Beneficiary Selection Wizard
export const ROUTE_BENEFICIARY_SELECTION_WIZARD = 'benefitPlans/selectionWizard';

// PMT Formula admin
export const ROUTE_PMT_FORMULAS = 'configurations/pmt-formulas';
export const ROUTE_PMT_FORMULA = 'configurations/pmt-formulas/formula';

// Payment Agency admin
export const ROUTE_PAYMENT_AGENCIES = 'configurations/payment-agencies';
export const ROUTE_PAYMENT_AGENCY = 'configurations/payment-agencies/agency';

// Selection status values (mirrors Group.json_ext.selection_status)
export const SELECTION_STATUS = {
  SURVEYED: 'SURVEYED',
  PMT_SCORED: 'PMT_SCORED',
  SELECTED: 'SELECTED',
  WAITING_LIST: 'WAITING_LIST',
  NOT_SELECTED: 'NOT_SELECTED',
  COMMUNITY_VALIDATED: 'COMMUNITY_VALIDATED',
  COMMUNITY_REJECTED: 'COMMUNITY_REJECTED',
};

// Geography
export const ROUTE_GEOGRAPHY_PROVINCES = 'geography/provinces';
export const ROUTE_GEOGRAPHY_PROVINCE = 'geography/province';
export const ROUTE_GEOGRAPHY_COMMUNE = 'geography/commune';
export const ROUTE_GEOGRAPHY_COLLINE = 'geography/colline';

// --- M&E Menu ---
export const ME_MAIN_MENU_CONTRIBUTION_KEY = 'me.MainMenu';
export const SOCIAL_PROTECTION_MAIN_MENU_CONTRIBUTION_KEY = 'socialProtection.MainMenu';
export const GRIEVANCE_MAIN_MENU_CONTRIBUTION_KEY = 'grievance.MainMenu';

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
export const RIGHT_BENEFIT_PLAN_CREATE = 160002;

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

// M&E menu-level rights (distinct from entity CRUD rights above)
export const RIGHT_ME_DASHBOARD = 160013;
export const RIGHT_ME_INDICATORS = 160014;
export const RIGHT_ME_MONETARY_TRANSFERS = 160015;
export const RIGHT_ME_RESULT_FRAMEWORK = 160016;

export const RIGHT_KOBO_ETL_VIEW = 180001;
export const RIGHT_KOBO_ETL_RUN = 180002;

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

// --- Grievance Routes ---
export const ROUTE_GRIEVANCE_DASHBOARD = 'grievance/dashboard';
export const ROUTE_GRIEVANCE_DETAIL = 'grievance/detail';
export const ROUTE_GRIEVANCE_TICKETS = 'grievance/tickets';
export const ROUTE_GRIEVANCE_NEW_TICKET = 'grievance/newTicket';
export const ROUTE_GRIEVANCE_EDIT_TICKET = 'grievance/ticket';
export const ROUTE_GRIEVANCE_MY_TASKS = 'grievance/my-tasks';
export const ROUTE_GRIEVANCE_WORKFLOW_TEMPLATES = 'grievance/workflow-templates';
export const ROUTE_GRIEVANCE_WORKFLOW_TEMPLATE = 'grievance/workflow-templates/template';
export const ROUTE_GRIEVANCE_ROLE_ASSIGNMENTS = 'grievance/role-assignments';
export const ROUTE_GRIEVANCE_ROLE_ASSIGNMENT = 'grievance/role-assignments/assignment';

// --- Grievance Workflow Rights ---
export const RIGHT_GRIEVANCE_TASK_VIEW = 160017;
export const RIGHT_GRIEVANCE_WORKFLOW_ADMIN = 160018;

// --- Payment Schedule ---
export const ROUTE_PAYMENT_SCHEDULE = 'payment-schedule';
export const MAX_PAYMENT_ROUNDS = 12;
export const STANDARD_TRANSFER_AMOUNT = 72000;

export const PAYMENT_SCHEDULE_STATUS = {
  PENDING: 'PENDING',
  GENERATING: 'GENERATING',
  APPROVED: 'APPROVED',
  IN_PAYMENT: 'IN_PAYMENT',
  RECONCILED: 'RECONCILED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
};

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

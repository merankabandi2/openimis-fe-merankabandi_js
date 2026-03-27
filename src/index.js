/* eslint-disable camelcase */
import React from 'react';
import { Dashboard, Event, AttachMoney, Assessment, Sync, ListAlt, AddCircleOutline, MonetizationOn } from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';

// Grievance pickers (override upstream defaults with Burundi-specific implementations)
import CascadingCategoryPicker from './components/grievance/CascadingCategoryPicker';
import HierarchicalCategoryPicker from './components/grievance/HierarchicalCategoryPicker';
import DynamicHierarchicalCategoryPicker from './components/grievance/DynamicHierarchicalCategoryPicker';
import MultiCategoryPicker from './components/grievance/MultiCategoryPicker';
import CategoryPicker from './components/grievance/CategoryPicker';

// Channel and flag pickers
import ChannelPicker from './pickers/ChannelPicker';
import MultiChannelPicker from './pickers/MultiChannelPicker';
import FlagPicker from './pickers/FlagPicker';

// Individual module extensions
import BeneficiaryPhotoPanel from './components/individual/BeneficiaryPhotoPanel';

// AppBar contribution (centered title in header)
import AppBarTitle from './components/AppBarTitle';

// Social protection extensions (Benefit Plan Provinces tab)
import {
  BenefitPlanProvincesTabLabel,
  BenefitPlanProvincesTabPanel,
} from './components/social-protection/BenefitPlanProvincesTab';
import BurundiLocationHierarchyPanel from './components/social-protection/BurundiLocationHierarchyPanel';
import BurundiLocationFilter from './components/BurundiLocationFilter';
import WizardLaunchButton from './components/social-protection/WizardLaunchButton';
import MerankabaniBenefitPlanSearcher from './components/social-protection/MerankabaniBenefitPlanSearcher';

// Payroll / Payment Request extensions
import PaymentMainMenu from './menu/PaymentMainMenu';
import PaymentRequestPage from './pages/PaymentRequestPage';
import MerankabandiPayrollSearcher from './components/payroll/MerankabandiPayrollSearcher';
import {
  PaymentRequestAllTabLabel,
  PaymentRequestAllTabPanel,
} from './components/payroll/PaymentRequestAllTabPanel';
import {
  PaymentRequestToVerifyTabLabel,
  PaymentRequestToVerifyTabPanel,
} from './components/payroll/PaymentRequestToVerifyTabPanel';
import {
  PaymentRequestToValidateTabLabel,
  PaymentRequestToValidateTabPanel,
} from './components/payroll/PaymentRequestToValidateTabPanel';
import {
  PaymentRequestReconciliatedTabLabel,
  PaymentRequestReconciliatedTabPanel,
} from './components/payroll/PaymentRequestReconciliatedTabPanel';
import {
  PaymentRequestRejectedTabLabel,
  PaymentRequestRejectedTabPanel,
} from './components/payroll/PaymentRequestRejectedTabPanel';

// M&E Pickers
import ActivityPicker from './pickers/ActivityPicker';
import SectionPicker from './pickers/SectionPicker';
import WorkflowsPicker from './pickers/WorkflowsPicker';

// M&E Menus
import MEMainMenu from './menu/MEMainMenu';

// M&E Dashboard
import HomePageContainer from './components/dashboard/HomePageContainer';
import MEDashboard from './components/dashboard/MEDashboard';
import OptimizedMEDashboard from './components/dashboard/OptimizedMEDashboard';
import ResultsFrameworkDashboard from './components/dashboard/ResultsFrameworkDashboard';
import ActivitiesDashboard from './components/dashboard/ActivitiesDashboard';

// M&E Dashboard hooks
import {
  useOptimizedDashboard,
  useDashboardSystem,
  useOptimizedDashboardComponent,
} from './hooks/useOptimizedDashboard';

// M&E Activity tab panels
import {
  MicroProjectTabLabel,
  MicroProjectTabPanel,
} from './components/me/MicroProjectTabPanel';
import {
  SensitizationTrainingTabLabel,
  SensitizationTrainingTabPanel,
} from './components/me/SensitizationTrainingTabPanel';
import {
  BehaviorChangePromotionTabLabel,
  BehaviorChangePromotionTabPanel,
} from './components/me/BehaviorChangePromotionTabPanel';

// M&E Indicator tab panels (Results Framework)
import {
  DevelopmentIndicatorsTabLabel,
  DevelopmentIndicatorsTabPanel,
} from './components/me/DevelopmentIndicatorsTabPanel';
import {
  IntermediateIndicatorsTabLabel,
  IntermediateIndicatorsTabPanel,
} from './components/me/IntermediateIndicatorsTabPanel';

// M&E Pages
import MEIndicatorsPage from './pages/MEIndicatorsPage';
import MEResultFrameworkPage from './pages/MEResultFrameworkPage';
import IndicatorsPage from './pages/IndicatorsPage';
import IndicatorPage from './pages/IndicatorPage';
import SectionsPage from './pages/SectionsPage';
import SectionPage from './pages/SectionPage';
import MonetaryTransfersPage from './pages/MonetaryTransfersPage';
import MonetaryTransfersListPage from './pages/MonetaryTransfersListPage';
import MonetaryTransfersDashboardPage from './pages/MonetaryTransfersDashboardPage';
import MonetaryTransferPage from './pages/MonetaryTransferPage';
import KoboETLAdminPage from './pages/KoboETLAdminPage';
import BeneficiarySelectionWizardPage from './pages/BeneficiarySelectionWizardPage';
import PmtFormulasPage from './pages/PmtFormulasPage';
import PmtFormulaPage from './pages/PmtFormulaPage';
import MerankabandiPayrollPage from './pages/MerankabandiPayrollPage';
import ApprovedPayrollsPage from './pages/ApprovedPayrollsPage';
import PendingPayrollsPage from './pages/PendingPayrollsPage';
import ReconciledPayrollsPage from './pages/ReconciledPayrollsPage';

// Payroll tab panel contributions
import {
  BenefitConsumptionsTabLabel,
  BenefitConsumptionsTabPanel,
} from './components/payroll/BenefitConsumptionTabPanel';
import {
  PayrollPaymentFilesTabLabel,
  PayrollPaymentFilesTabPanel,
} from './components/payroll/PayrollPaymentFilesTab';
import {
  PayrollTaskTabLabel,
  PayrollTaskTabPanel,
} from './components/payroll/PayrollTaskTabPanel';

// Payroll benefit consumption searcher (for individual/group detail pages)
import BenefitConsumptionPayrollSearcher from './components/payroll/BenefitConsumptionPayrollSearcher';

// Payroll verification task (Burundi-specific task source)
import {
  PayrollVerificationTaskTableHeaders,
  PayrollVerificationTaskItemFormatters,
} from './components/payroll/PayrollVerificationTask';

// Constants
import {
  ROUTE_PAYMENT_REQUEST,
  ROUTE_PAYMENT_NEW_PAYMENT,
  RIGHT_PAYROLL_SEARCH,
  RIGHT_PAYROLL_CREATE,
  RIGHT_BENEFIT_PLAN_SEARCH,
  RIGHT_MONETARY_TRANSFER_SEARCH,
  RIGHT_KOBO_ETL_VIEW,
  RIGHT_ME_DASHBOARD,
  RIGHT_ME_INDICATORS,
  RIGHT_ME_MONETARY_TRANSFERS,
  RIGHT_ME_RESULT_FRAMEWORK,
  ROUTE_ME_INDICATORS,
  ROUTE_ME_RESULT_FRAMEWORK,
  ROUTE_ME_MONETARY_TRANSFERS,
  ROUTE_ME_MONETARY_TRANSFER,
  ROUTE_ME_DASHBOARD,
  ROUTE_RESULTS_FRAMEWORK_DASHBOARD,
  ROUTE_ACTIVITIES_DASHBOARD,
  ROUTE_RESULTS_FRAMEWORK_INDICATORS_LIST,
  ROUTE_RESULTS_FRAMEWORK_INDICATOR,
  ROUTE_RESULTS_FRAMEWORK_SECTIONS_LIST,
  ROUTE_RESULTS_FRAMEWORK_SECTION,
  ROUTE_KOBO_ETL_ADMIN,
  ROUTE_ME_MONETARY_TRANSFERS_LIST,
  ROUTE_ME_MONETARY_TRANSFERS_DASHBOARD,
  ROUTE_BENEFICIARY_SELECTION_WIZARD,
  ROUTE_PMT_FORMULAS,
  ROUTE_PMT_FORMULA,
} from './constants';

// Route constants for status-filtered payroll pages
const ROUTE_PAYROLLS_APPROVED = 'payrollsApproved';
const ROUTE_PAYROLLS_PENDING = 'payrollsPending';
const ROUTE_PAYROLLS_RECONCILED = 'payrollsReconciled';

// Reducer
import reducer from './reducer';

// Translations
import messages_en from './translations/en.json';
import messages_fr from './translations/fr.json';

const DEFAULT_CONFIG = {
  translations: [
    { key: 'en', messages: messages_en },
    { key: 'fr', messages: messages_fr },
  ],

  reducers: [{ key: 'merankabandi', reducer }],

  // Head panel contribution for beneficiary photo.
  // Requires upstream PR: activate headPanelContributionsKey in IndividualPage.jsx
  'individual.Individual.headPanel': [BeneficiaryPhotoPanel],

  // Centered app title in the header bar
  'core.AppBar': [AppBarTitle],

  // Custom home page dashboard
  'home.HomePage.customDashboard': HomePageContainer,

  // Wizard launch button on benefit plan detail page (Bénéficiaires tab action bar)
  'deduplication.deduplicationFieldSelectionDialog': [WizardLaunchButton],

  // Benefit plan provinces tab (Burundi location hierarchy with card generation & payroll)
  'benefitPlan.TabPanel.label': [BenefitPlanProvincesTabLabel],
  'benefitPlan.TabPanel.panel': [BenefitPlanProvincesTabPanel],

  // Payment Request tab panels (Merankabandi verification/approval workflow)
  'paymentRequest.TabPanel.label': [
    PaymentRequestAllTabLabel,
    PaymentRequestToVerifyTabLabel,
    PaymentRequestToValidateTabLabel,
    PaymentRequestReconciliatedTabLabel,
    PaymentRequestRejectedTabLabel,
  ],
  'paymentRequest.TabPanel.panel': [
    PaymentRequestAllTabPanel,
    PaymentRequestToVerifyTabPanel,
    PaymentRequestToValidateTabPanel,
    PaymentRequestReconciliatedTabPanel,
    PaymentRequestRejectedTabPanel,
  ],

  // Payroll detail page tab panels (benefit consumptions, tasks, payment files)
  'payroll.TabPanel.label': [BenefitConsumptionsTabLabel, PayrollTaskTabLabel, PayrollPaymentFilesTabLabel],
  'payroll.TabPanel.panel': [BenefitConsumptionsTabPanel, PayrollTaskTabPanel, PayrollPaymentFilesTabPanel],

  // Payroll verification task (Burundi-specific: verification step before approval)
  'tasksManagement.tasks': [{
    text: <FormattedMessage module="payroll" id="payroll.tasks.verify.title" />,
    tableHeaders: PayrollVerificationTaskTableHeaders,
    itemFormatters: PayrollVerificationTaskItemFormatters,
    taskSource: ['payroll_verification'],
  }],

  // M&E Activity tab panels (Activities page)
  'meIndicators.TabPanel.label': [
    MicroProjectTabLabel,
    SensitizationTrainingTabLabel,
    BehaviorChangePromotionTabLabel,
  ],
  'meIndicators.TabPanel.panel': [
    MicroProjectTabPanel,
    SensitizationTrainingTabPanel,
    BehaviorChangePromotionTabPanel,
  ],

  // M&E Results Framework tab panels
  'meResultFrameWork.TabPanel.label': [
    DevelopmentIndicatorsTabLabel,
    IntermediateIndicatorsTabLabel,
  ],
  'meResultFrameWork.TabPanel.panel': [
    DevelopmentIndicatorsTabPanel,
    IntermediateIndicatorsTabPanel,
  ],

  // Main menus
  'core.MainMenu': [
    { name: 'PaymentMainMenu', component: PaymentMainMenu },
    { name: 'MEMainMenu', component: MEMainMenu },
  ],

  // Routes
  'core.Router': [
    { path: ROUTE_PAYMENT_REQUEST, component: PaymentRequestPage },
    { path: ROUTE_RESULTS_FRAMEWORK_INDICATORS_LIST, component: IndicatorsPage },
    { path: `${ROUTE_RESULTS_FRAMEWORK_INDICATOR}/:indicator_id?`, component: IndicatorPage },
    { path: ROUTE_RESULTS_FRAMEWORK_SECTIONS_LIST, component: SectionsPage },
    { path: `${ROUTE_RESULTS_FRAMEWORK_SECTION}/:section_id?`, component: SectionPage },
    { path: ROUTE_ME_MONETARY_TRANSFERS, component: MonetaryTransfersPage },
    { path: ROUTE_ME_MONETARY_TRANSFERS_LIST, component: MonetaryTransfersListPage },
    { path: ROUTE_ME_MONETARY_TRANSFERS_DASHBOARD, component: MonetaryTransfersDashboardPage },
    { path: ROUTE_ME_RESULT_FRAMEWORK, component: MEResultFrameworkPage },
    { path: `${ROUTE_ME_MONETARY_TRANSFER}/:monetary_transfer_uuid?`, component: MonetaryTransferPage },
    { path: ROUTE_ME_DASHBOARD, component: MEDashboard },
    { path: ROUTE_RESULTS_FRAMEWORK_DASHBOARD, component: ResultsFrameworkDashboard },
    { path: ROUTE_ME_INDICATORS, component: MEIndicatorsPage },
    { path: ROUTE_ACTIVITIES_DASHBOARD, component: ActivitiesDashboard },
    { path: ROUTE_KOBO_ETL_ADMIN, component: KoboETLAdminPage },
    { path: `${ROUTE_BENEFICIARY_SELECTION_WIZARD}/:benefit_plan_uuid?`, component: BeneficiarySelectionWizardPage },
    { path: ROUTE_PMT_FORMULAS, component: PmtFormulasPage },
    { path: `${ROUTE_PMT_FORMULA}/:formula_id?`, component: PmtFormulaPage },
    { path: ROUTE_PAYROLLS_APPROVED, component: ApprovedPayrollsPage },
    { path: ROUTE_PAYROLLS_PENDING, component: PendingPayrollsPage },
    { path: ROUTE_PAYROLLS_RECONCILED, component: ReconciledPayrollsPage },
  ],


  // Payment menu items (contributed to PaymentMainMenu via 'payment.MainMenu' key
  // so they appear in getMenuEntries() for DB menu config matching)
  'payment.MainMenu': [
    {
      text: <FormattedMessage module="payroll" id="menu.payment.payments" />,
      icon: <ListAlt />,
      route: `/${ROUTE_PAYMENT_REQUEST}`,
      filter: (rights) => rights.includes(RIGHT_PAYROLL_SEARCH),
      id: 'mainMenuPayment.paymentrequests',
    },
    {
      text: <FormattedMessage module="payroll" id="menu.paymentrequest.add" />,
      icon: <AddCircleOutline />,
      route: `/${ROUTE_PAYMENT_NEW_PAYMENT}`,
      filter: (rights) => rights.includes(RIGHT_PAYROLL_CREATE),
      id: 'mainMenuPayment.paymentrequest.add',
    },
    {
      text: <FormattedMessage module="payroll" id="payroll.route.payrollsPending" />,
      icon: <MonetizationOn />,
      route: `/${ROUTE_PAYROLLS_PENDING}`,
      filter: (rights) => rights.includes(RIGHT_PAYROLL_SEARCH),
      id: 'legalAndFinance.payrollsPending',
    },
    {
      text: <FormattedMessage module="payroll" id="payroll.route.payrollsApproved" />,
      icon: <MonetizationOn />,
      route: `/${ROUTE_PAYROLLS_APPROVED}`,
      filter: (rights) => rights.includes(RIGHT_PAYROLL_SEARCH),
      id: 'legalAndFinance.payrollsApproved',
    },
    {
      text: <FormattedMessage module="payroll" id="payroll.route.payrollsReconciled" />,
      icon: <MonetizationOn />,
      route: `/${ROUTE_PAYROLLS_RECONCILED}`,
      filter: (rights) => rights.includes(RIGHT_PAYROLL_SEARCH),
      id: 'legalAndFinance.payrollsReconciled',
    },
  ],

  // M&E Menu items
  'me.MainMenu': [
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.dashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_ME_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_ME_DASHBOARD),
      id: 'merankabandi.me.dashboard',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.activities" />,
      icon: <Event />,
      route: `/${ROUTE_ME_INDICATORS}`,
      filter: (rights) => rights.includes(RIGHT_ME_INDICATORS),
      id: 'merankabandi.me.activities',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.monetaryTransfers" />,
      icon: <AttachMoney />,
      route: `/${ROUTE_ME_MONETARY_TRANSFERS}`,
      filter: (rights) => rights.includes(RIGHT_ME_MONETARY_TRANSFERS),
      id: 'merankabandi.me.monetaryTransfers',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.resultsFramework" />,
      icon: <Assessment />,
      route: `/${ROUTE_ME_RESULT_FRAMEWORK}`,
      filter: (rights) => rights.includes(RIGHT_ME_RESULT_FRAMEWORK),
      id: 'merankabandi.me.resultsFramework',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.resultsFrameworkDashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_RESULTS_FRAMEWORK_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_ME_RESULT_FRAMEWORK),
      id: 'merankabandi.me.resultsFrameworkDashboard',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.activitiesDashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_ACTIVITIES_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_ME_INDICATORS),
      id: 'merankabandi.me.activitiesDashboard',
    },
  ],

  // Items contributed to social protection menu
  'socialProtection.MainMenu': [
    {
      text: <FormattedMessage module="merankabandi" id="menu.socialProtection.pmtFormulas" />,
      icon: <Assessment />,
      route: `/${ROUTE_PMT_FORMULAS}`,
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'merankabandi.pmtFormulas',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.socialProtection.koboETLAdmin" />,
      icon: <Sync />,
      route: `/${ROUTE_KOBO_ETL_ADMIN}`,
      filter: (rights) => rights.includes(RIGHT_KOBO_ETL_VIEW),
      id: 'merankabandi.koboETLAdmin',
    },
  ],

  refs: [
    // Grievance picker overrides (same keys as upstream grievance module)
    { key: 'grievanceSocialProtection.DropDownCategoryPicker', ref: CategoryPicker },
    { key: 'grievanceSocialProtection.CategoryPicker', ref: CategoryPicker },
    { key: 'grievanceSocialProtection.MultiCategoryPicker', ref: MultiCategoryPicker },
    { key: 'grievanceSocialProtection.CascadingCategoryPicker', ref: CascadingCategoryPicker },
    { key: 'grievanceSocialProtection.HierarchicalCategoryPicker', ref: HierarchicalCategoryPicker },
    { key: 'grievanceSocialProtection.DynamicHierarchicalCategoryPicker', ref: DynamicHierarchicalCategoryPicker },
    { key: 'grievanceSocialProtection.ChannelPicker', ref: ChannelPicker },
    { key: 'grievanceSocialProtection.MultiChannelPicker', ref: MultiChannelPicker },
    { key: 'grievanceSocialProtection.FlagPicker', ref: FlagPicker },

    // Location hierarchy override: Burundi uses 3 levels (Province/Commune/Colline)
    { key: 'location.Location.MaxLevels', ref: '3' },
    { key: 'location.DetailedLocationFilter', ref: BurundiLocationFilter },
    { key: 'merankabandi.BurundiLocationHierarchyPanel', ref: BurundiLocationHierarchyPanel },

    // BenefitPlanSearcher override (adds wizard launch icon per row)
    { key: 'socialProtection.BenefitPlanSearcher', ref: MerankabaniBenefitPlanSearcher },

    // PayrollPage override (Burundi-specific: location-based, auto-generated name, task workflow)
    { key: 'payroll.PayrollPage', ref: MerankabandiPayrollPage },

    // Status-filtered payroll page route refs
    { key: 'payroll.route.payrollsApproved', ref: ROUTE_PAYROLLS_APPROVED },
    { key: 'payroll.route.payrollsPending', ref: ROUTE_PAYROLLS_PENDING },
    { key: 'payroll.route.payrollsReconciled', ref: ROUTE_PAYROLLS_RECONCILED },

    // Payroll searcher override (adds paymentRequestStatus filtering, status formatting)
    { key: 'payroll.benefitConsumptionPayrollSearcher', ref: MerankabandiPayrollSearcher },

    // M&E Pickers
    { key: 'socialProtection.SectionPicker', ref: SectionPicker },
    { key: 'merankabandi.ActivityPicker', ref: ActivityPicker },
    { key: 'merankabandi.SectionPicker', ref: SectionPicker },
    { key: 'merankabandi.WorkflowsPicker', ref: WorkflowsPicker },

    // M&E Route refs
    { key: 'socialProtection.route.monetaryTransfers', ref: ROUTE_ME_MONETARY_TRANSFERS },
    { key: 'socialProtection.monetaryTransfers', ref: ROUTE_ME_MONETARY_TRANSFERS_LIST },
    { key: 'socialProtection.route.monetaryTransfer', ref: ROUTE_ME_MONETARY_TRANSFER },
    { key: 'socialProtection.route.resultFramework', ref: ROUTE_ME_RESULT_FRAMEWORK },
    { key: 'socialProtection.route.indicators', ref: ROUTE_RESULTS_FRAMEWORK_INDICATORS_LIST },
    { key: 'socialProtection.route.indicator', ref: ROUTE_RESULTS_FRAMEWORK_INDICATOR },
    { key: 'socialProtection.route.sections', ref: ROUTE_RESULTS_FRAMEWORK_SECTIONS_LIST },
    { key: 'socialProtection.route.section', ref: ROUTE_RESULTS_FRAMEWORK_SECTION },
    { key: 'socialProtection.route.meDashboard', ref: ROUTE_ME_DASHBOARD },
    { key: 'socialProtection.route.resultsFrameworkDashboard', ref: ROUTE_RESULTS_FRAMEWORK_DASHBOARD },
    { key: 'socialProtection.route.activitiesDashboard', ref: ROUTE_ACTIVITIES_DASHBOARD },
    { key: 'socialProtection.route.activities', ref: ROUTE_ME_INDICATORS },
    { key: 'socialProtection.route.koboETLAdmin', ref: ROUTE_KOBO_ETL_ADMIN },

    // M&E Dashboard component refs
    { key: 'socialProtection.MEDashboard', ref: MEDashboard },
    { key: 'socialProtection.OptimizedMEDashboard', ref: OptimizedMEDashboard },
    { key: 'socialProtection.ResultsFrameworkDashboard', ref: ResultsFrameworkDashboard },

    // M&E Dashboard hook refs
    { key: 'socialProtection.useOptimizedDashboard', ref: useOptimizedDashboard },
    { key: 'socialProtection.useDashboardSystem', ref: useDashboardSystem },
    { key: 'socialProtection.useOptimizedDashboardComponent', ref: useOptimizedDashboardComponent },

    // Merankabandi-specific refs
    { key: 'merankabandi.CascadingCategoryPicker', ref: CascadingCategoryPicker },
    { key: 'merankabandi.HierarchicalCategoryPicker', ref: HierarchicalCategoryPicker },
    { key: 'merankabandi.MultiChannelPicker', ref: MultiChannelPicker },
    { key: 'merankabandi.BeneficiaryPhotoPanel', ref: BeneficiaryPhotoPanel },
    { key: 'merankabandi.MerankabandiPayrollSearcher', ref: MerankabandiPayrollSearcher },
    { key: 'merankabandi.route.selectionWizard', ref: ROUTE_BENEFICIARY_SELECTION_WIZARD },
    { key: 'merankabandi.route.indicator', ref: ROUTE_RESULTS_FRAMEWORK_INDICATOR },
    { key: 'merankabandi.route.indicators', ref: ROUTE_RESULTS_FRAMEWORK_INDICATORS_LIST },
    { key: 'merankabandi.route.section', ref: ROUTE_RESULTS_FRAMEWORK_SECTION },
    { key: 'merankabandi.route.sections', ref: ROUTE_RESULTS_FRAMEWORK_SECTIONS_LIST },
    { key: 'merankabandi.route.monetaryTransfer', ref: ROUTE_ME_MONETARY_TRANSFER },
    { key: 'merankabandi.route.sensitizationTraining', ref: ROUTE_ME_INDICATORS },
    { key: 'merankabandi.route.microProject', ref: ROUTE_ME_INDICATORS },
    { key: 'merankabandi.route.behaviorChangePromotion', ref: ROUTE_ME_INDICATORS },
  ],
};

export const MerankabandiModule = (cfg) => ({
  ...DEFAULT_CONFIG,
  ...((cfg && cfg['fe-merankabandi']) || {}),
});

export default MerankabandiModule;

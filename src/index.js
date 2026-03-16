/* eslint-disable camelcase */
import React from 'react';
import { Dashboard, Event, AttachMoney, Assessment, Sync } from '@material-ui/icons';
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

// Social protection extensions (Benefit Plan Provinces tab)
import {
  BenefitPlanProvincesTabLabel,
  BenefitPlanProvincesTabPanel,
} from './components/social-protection/BenefitPlanProvincesTab';

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
import {
  PayrollTaskTableHeaders,
  PayrollTaskItemFormatters,
} from '@openimis/fe-payroll/src/components/tasks/PayrollTasks';

// M&E Pickers
import ActivityPicker from './pickers/ActivityPicker';
import SectionPicker from './pickers/SectionPicker';
import WorkflowsPicker from './pickers/WorkflowsPicker';

// M&E Menus
import MEMainMenu from './menus/MEMainMenu';

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

// Constants
import {
  ROUTE_PAYMENT_REQUEST,
  RIGHT_PAYROLL_SEARCH,
  RIGHT_BENEFIT_PLAN_SEARCH,
  RIGHT_MONETARY_TRANSFER_SEARCH,
  RIGHT_KOBO_ETL_VIEW,
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
} from './constants';

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

  // Custom home page dashboard
  'home.HomePage.customDashboard': HomePageContainer,

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
  ],

  // Payroll verification task source
  'tasksManagement.tasks': [{
    text: <FormattedMessage module="payroll" id="payroll.tasks.verify.title" />,
    tableHeaders: PayrollTaskTableHeaders,
    itemFormatters: PayrollTaskItemFormatters,
    taskSource: ['payroll_verification'],
  }],

  // M&E Menu items
  'me.MainMenu': [
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.dashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_ME_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'merankabandi.me.dashboard',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.activities" />,
      icon: <Event />,
      route: `/${ROUTE_ME_INDICATORS}`,
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'merankabandi.me.activities',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.monetaryTransfers" />,
      icon: <AttachMoney />,
      route: `/${ROUTE_ME_MONETARY_TRANSFERS}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.monetaryTransfers',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.resultsFramework" />,
      icon: <Assessment />,
      route: `/${ROUTE_ME_RESULT_FRAMEWORK}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.resultsFramework',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.resultsFrameworkDashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_RESULTS_FRAMEWORK_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.resultsFrameworkDashboard',
    },
    {
      text: <FormattedMessage module="merankabandi" id="menu.me.activitiesDashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_ACTIVITIES_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.activitiesDashboard',
    },
  ],

  // KoboETL admin menu item (contributed to social protection menu)
  'socialProtection.MainMenu': [
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
  ],
};

export const MerankabandiModule = (cfg) => ({
  ...DEFAULT_CONFIG,
  ...((cfg && cfg['fe-merankabandi']) || {}),
});

export default MerankabandiModule;

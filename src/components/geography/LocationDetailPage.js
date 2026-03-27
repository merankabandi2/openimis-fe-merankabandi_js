import React, { useState, useMemo } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import PaymentIcon from '@material-ui/icons/Payment';
import {
  useModulesManager,
  useTranslations,
  useHistory,
  useGraphqlQuery,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  ROUTE_GEOGRAPHY_PROVINCES,
  ROUTE_GEOGRAPHY_PROVINCE,
  ROUTE_GEOGRAPHY_COMMUNE,
  ROUTE_GEOGRAPHY_COLLINE,
  ROUTE_PAYMENT_NEW_PAYMENT,
  BURUNDI_LOC_TYPE_PROVINCE,
  BURUNDI_LOC_TYPE_COMMUNE,
  BURUNDI_LOC_TYPE_COLLINE,
} from '../../constants';
import { useGeographyLocationDetail } from '../../hooks/useGeographyData';
import HouseholdSummaryTable from './HouseholdSummaryTable';
import ProvincePaymentPointChips from '../social-protection/ProvincePaymentPointChips';
import AddProvincePaymentPointDialog from '../social-protection/dialogs/AddProvincePaymentPointDialog';

const BENEFIT_PLANS_QUERY = `
  query BenefitPlans {
    benefitPlan {
      edges {
        node {
          id
          code
          name
        }
      }
    }
  }
`;

const LOCATION_BY_UUID_QUERY = `
  query LocationByUuid($uuid: String!) {
    location(uuid: $uuid) {
      edges {
        node {
          id
          uuid
          code
          name
          type
          parent {
            id
            uuid
            name
            type
          }
        }
      }
    }
  }
`;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  breadcrumbs: {
    marginBottom: theme.spacing(2),
  },
  breadcrumbLink: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1, 2),
  },
  formControl: {
    minWidth: 200,
  },
  kpiGrid: {
    marginBottom: theme.spacing(2),
  },
  kpiCard: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  kpiLabel: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  paymentPointSection: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  paymentPointHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  tabsContainer: {
    marginBottom: theme.spacing(2),
  },
  headerCell: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  clickableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(6),
  },
  inheritedLabel: {
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
}));

function LocationDetailPage({ locationUuid }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();

  const [benefitPlanId, setBenefitPlanId] = useState(null);
  const [year, setYear] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshPaymentPoints, setRefreshPaymentPoints] = useState(false);

  // Step 1: resolve UUID to location ID
  const { data: locationLookupData, isLoading: locationLookupLoading } = useGraphqlQuery(
    LOCATION_BY_UUID_QUERY,
    { uuid: locationUuid },
    { skip: !locationUuid },
  );

  const resolvedLocation = useMemo(() => {
    const edges = locationLookupData?.location?.edges;
    if (edges && edges.length > 0) return edges[0].node;
    return null;
  }, [locationLookupData]);

  const locationId = resolvedLocation?.id ? atob(resolvedLocation.id).split(':')[1] : null;

  // Step 2: fetch full geography detail using the numeric ID
  const {
    detail,
    location,
    children,
    activePrograms,
    paymentHistory,
    paymentPoints,
    households,
    isLoading: detailLoading,
  } = useGeographyLocationDetail(locationId, benefitPlanId, year);

  // Benefit plans for filter
  const { data: benefitPlansData } = useGraphqlQuery(
    BENEFIT_PLANS_QUERY,
    {},
    { skip: false },
  );
  const benefitPlans = useMemo(
    () => (benefitPlansData?.benefitPlan?.edges || []).map(({ node }) => node),
    [benefitPlansData],
  );

  const isLoading = locationLookupLoading || detailLoading;
  const locationType = location?.type || resolvedLocation?.type || '';

  // ---------------------------------------------------------------------------
  // Breadcrumb builder
  // ---------------------------------------------------------------------------
  const buildBreadcrumbs = () => {
    const crumbs = [
      { label: formatMessage('geography.breadcrumb.root'), route: `/${ROUTE_GEOGRAPHY_PROVINCES}` },
    ];

    if (!location) return crumbs;

    // Build parent chain
    const chain = [];
    let current = location;
    while (current) {
      chain.unshift(current);
      current = current.parent;
    }

    chain.forEach((loc) => {
      let route = null;
      if (loc.type === BURUNDI_LOC_TYPE_PROVINCE) route = `/${ROUTE_GEOGRAPHY_PROVINCE}/${loc.uuid}`;
      else if (loc.type === BURUNDI_LOC_TYPE_COMMUNE) route = `/${ROUTE_GEOGRAPHY_COMMUNE}/${loc.uuid}`;
      else if (loc.type === BURUNDI_LOC_TYPE_COLLINE) route = `/${ROUTE_GEOGRAPHY_COLLINE}/${loc.uuid}`;
      crumbs.push({ label: loc.name, route });
    });

    return crumbs;
  };

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------
  const navigateToChild = (child) => {
    if (child.type === BURUNDI_LOC_TYPE_COMMUNE) {
      history.push(`/${ROUTE_GEOGRAPHY_COMMUNE}/${child.uuid}`);
    } else if (child.type === BURUNDI_LOC_TYPE_COLLINE) {
      history.push(`/${ROUTE_GEOGRAPHY_COLLINE}/${child.uuid}`);
    }
  };

  const navigateToPayroll = (communeId) => {
    const params = new URLSearchParams();
    params.set('commune', communeId || locationId);
    if (benefitPlanId) params.set('benefitPlan', benefitPlanId);
    history.push(`/${ROUTE_PAYMENT_NEW_PAYMENT}?${params.toString()}`);
  };

  const navigateToHousehold = (groupUuid) => {
    history.push(`/groups/group/${groupUuid}`);
  };

  // ---------------------------------------------------------------------------
  // Formatting helpers
  // ---------------------------------------------------------------------------
  const formatNumber = (value) => {
    if (value == null) return '-';
    return Number(value).toLocaleString('fr-FR');
  };

  const formatCurrency = (value) => {
    if (value == null) return '-';
    return `${Number(value).toLocaleString('fr-FR')} BIF`;
  };

  const formatPercent = (value) => {
    if (value == null) return '-';
    return `${Number(value).toFixed(1)} %`;
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('fr-FR');
  };

  // ---------------------------------------------------------------------------
  // Tab configuration
  // ---------------------------------------------------------------------------
  const getTabConfig = () => {
    if (locationType === BURUNDI_LOC_TYPE_PROVINCE) {
      return [
        { label: formatMessage('geography.detail.tabs.communes'), key: 'children' },
        { label: formatMessage('geography.detail.tabs.activePrograms'), key: 'programs' },
        { label: formatMessage('geography.detail.tabs.paymentHistory'), key: 'payments' },
      ];
    }
    if (locationType === BURUNDI_LOC_TYPE_COMMUNE) {
      return [
        { label: formatMessage('geography.detail.tabs.collines'), key: 'children' },
        { label: formatMessage('geography.detail.tabs.activePrograms'), key: 'programs' },
        { label: formatMessage('geography.detail.tabs.paymentHistory'), key: 'payments' },
      ];
    }
    // Colline
    return [
      { label: formatMessage('geography.detail.tabs.households'), key: 'households' },
      { label: formatMessage('geography.detail.tabs.paymentHistory'), key: 'payments' },
    ];
  };

  const tabConfig = getTabConfig();

  // ---------------------------------------------------------------------------
  // Province name for inherited payment point label
  // ---------------------------------------------------------------------------
  const getProvinceName = () => {
    if (!location) return '';
    if (location.type === BURUNDI_LOC_TYPE_COMMUNE) return location.parent?.name || '';
    if (location.type === BURUNDI_LOC_TYPE_COLLINE) return location.parent?.parent?.name || '';
    return '';
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderChildrenTable = () => {
    const isProvince = locationType === BURUNDI_LOC_TYPE_PROVINCE;
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>
                {formatMessage('geography.detail.childTable.name')}
              </TableCell>
              <TableCell className={classes.headerCell} align="right">
                {formatMessage('geography.detail.childTable.households')}
              </TableCell>
              <TableCell className={classes.headerCell} align="right">
                {formatMessage('geography.detail.childTable.beneficiaries')}
              </TableCell>
              <TableCell className={classes.headerCell} align="right">
                {formatMessage('geography.detail.childTable.amountDisbursed')}
              </TableCell>
              <TableCell className={classes.headerCell} align="right">
                {formatMessage('geography.detail.childTable.paymentRate')}
              </TableCell>
              {isProvince && (
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('geography.detail.childTable.collines')}
                </TableCell>
              )}
              {locationType === BURUNDI_LOC_TYPE_PROVINCE && (
                <TableCell className={classes.headerCell} align="center" />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {children.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isProvince ? 7 : 5} align="center">
                  <Typography color="textSecondary">{formatMessage('geography.noData')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              children.map((child) => (
                <TableRow
                  key={child.uuid || child.id}
                  className={classes.clickableRow}
                  onClick={() => navigateToChild(child)}
                >
                  <TableCell>{child.name}</TableCell>
                  <TableCell align="right">{formatNumber(child.totalHouseholds)}</TableCell>
                  <TableCell align="right">{formatNumber(child.totalBeneficiaries)}</TableCell>
                  <TableCell align="right">{formatCurrency(child.totalAmountDisbursed)}</TableCell>
                  <TableCell align="right">{formatPercent(child.paymentRate)}</TableCell>
                  {isProvince && (
                    <TableCell align="right">{formatNumber(child.childCount)}</TableCell>
                  )}
                  {locationType === BURUNDI_LOC_TYPE_PROVINCE && (
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<PaymentIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToPayroll(child.id);
                        }}
                      >
                        {formatMessage('geography.detail.action.initiatePayment')}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderProgramsTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headerCell}>
              {formatMessage('geography.detail.programs.program')}
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              {formatMessage('geography.detail.programs.beneficiaries')}
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              {formatMessage('geography.detail.programs.households')}
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              {formatMessage('geography.detail.programs.amountDisbursed')}
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              {formatMessage('geography.detail.programs.cycles')}
            </TableCell>
            <TableCell className={classes.headerCell}>
              {formatMessage('geography.detail.programs.status')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activePrograms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="textSecondary">{formatMessage('geography.noData')}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            activePrograms.map((prog) => (
              <TableRow key={prog.id}>
                <TableCell>{prog.name}</TableCell>
                <TableCell align="right">{formatNumber(prog.beneficiaryCount)}</TableCell>
                <TableCell align="right">{formatNumber(prog.householdCount)}</TableCell>
                <TableCell align="right">{formatCurrency(prog.amountDisbursed)}</TableCell>
                <TableCell align="right">{formatNumber(prog.cycleCount)}</TableCell>
                <TableCell>{prog.status || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderPaymentHistoryTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headerCell}>
              {formatMessage('geography.detail.paymentHistory.cycle')}
            </TableCell>
            <TableCell className={classes.headerCell}>
              {formatMessage('geography.detail.paymentHistory.date')}
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              {formatMessage('geography.detail.paymentHistory.amountPaid')}
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              {formatMessage('geography.detail.paymentHistory.beneficiaries')}
            </TableCell>
            <TableCell className={classes.headerCell}>
              {formatMessage('geography.detail.paymentHistory.source')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paymentHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="textSecondary">{formatMessage('geography.noData')}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            paymentHistory.map((entry, idx) => (
              <TableRow key={`${entry.cycleName}-${idx}`}>
                <TableCell>{entry.cycleName || '-'}</TableCell>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell align="right">{formatCurrency(entry.amountPaid)}</TableCell>
                <TableCell align="right">{formatNumber(entry.beneficiaryCount)}</TableCell>
                <TableCell>{entry.paymentSource || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTabContent = () => {
    const currentTab = tabConfig[activeTab];
    if (!currentTab) return null;

    switch (currentTab.key) {
      case 'children':
        return renderChildrenTable();
      case 'programs':
        return renderProgramsTable();
      case 'payments':
        return renderPaymentHistoryTable();
      case 'households':
        return (
          <HouseholdSummaryTable
            households={households}
            onHouseholdClick={navigateToHousehold}
          />
        );
      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
        <Typography style={{ marginTop: 16 }} color="textSecondary">
          {formatMessage('geography.loading')}
        </Typography>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className={classes.root}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        className={classes.breadcrumbs}
      >
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          if (isLast) {
            return (
              <Typography key={idx} color="textPrimary">
                {crumb.label}
              </Typography>
            );
          }
          return (
            <Link
              key={idx}
              className={classes.breadcrumbLink}
              color="inherit"
              onClick={() => history.push(crumb.route)}
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Header */}
      <Box className={classes.header}>
        <Typography variant="h4">
          {location?.name || resolvedLocation?.name || ''}{' '}
          {(location?.code || resolvedLocation?.code) && (
            <Typography component="span" variant="h6" color="textSecondary">
              ({location?.code || resolvedLocation?.code})
            </Typography>
          )}
        </Typography>
        {locationType === BURUNDI_LOC_TYPE_COMMUNE && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            onClick={() => navigateToPayroll()}
          >
            {formatMessage('geography.detail.action.initiatePayment')}
          </Button>
        )}
      </Box>

      {/* Filter bar */}
      <Paper elevation={1} className={classes.filterBar}>
        <FormControl className={classes.formControl} size="small" variant="outlined">
          <InputLabel id="geo-detail-bp-label">
            {formatMessage('geography.filter.program')}
          </InputLabel>
          <Select
            labelId="geo-detail-bp-label"
            value={benefitPlanId || ''}
            onChange={(e) => setBenefitPlanId(e.target.value || null)}
            label={formatMessage('geography.filter.program')}
          >
            <MenuItem value="">
              {formatMessage('geography.filter.allPrograms')}
            </MenuItem>
            {benefitPlans.map((bp) => (
              <MenuItem key={bp.id} value={bp.id}>
                {bp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl} size="small" variant="outlined">
          <InputLabel id="geo-detail-year-label">
            {formatMessage('geography.filter.year')}
          </InputLabel>
          <Select
            labelId="geo-detail-year-label"
            value={year || ''}
            onChange={(e) => setYear(e.target.value || null)}
            label={formatMessage('geography.filter.year')}
          >
            <MenuItem value="">-</MenuItem>
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* KPI Cards */}
      {detail && (
        <Grid container spacing={2} className={classes.kpiGrid}>
          <Grid item xs={12} sm={6} md={2}>
            <Paper className={classes.kpiCard} elevation={1}>
              <Typography className={classes.kpiValue}>{formatNumber(detail.totalHouseholds)}</Typography>
              <Typography className={classes.kpiLabel}>{formatMessage('geography.detail.kpi.households')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper className={classes.kpiCard} elevation={1}>
              <Typography className={classes.kpiValue}>{formatNumber(detail.totalIndividuals)}</Typography>
              <Typography className={classes.kpiLabel}>{formatMessage('geography.detail.kpi.individuals')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper className={classes.kpiCard} elevation={1}>
              <Typography className={classes.kpiValue}>{formatNumber(detail.totalBeneficiaries)}</Typography>
              <Typography className={classes.kpiLabel}>{formatMessage('geography.detail.kpi.beneficiaries')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper className={classes.kpiCard} elevation={1}>
              <Typography className={classes.kpiValue}>{formatCurrency(detail.totalAmountDisbursed)}</Typography>
              <Typography className={classes.kpiLabel}>{formatMessage('geography.detail.kpi.amountDisbursed')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper className={classes.kpiCard} elevation={1}>
              <Typography className={classes.kpiValue}>{formatNumber(detail.paymentCycleCount)}</Typography>
              <Typography className={classes.kpiLabel}>{formatMessage('geography.detail.kpi.paymentCycles')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper className={classes.kpiCard} elevation={1}>
              <Typography className={classes.kpiValue}>{formatPercent(detail.paymentRate)}</Typography>
              <Typography className={classes.kpiLabel}>{formatMessage('geography.detail.kpi.paymentRate')}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Payment Point section */}
      <Paper className={classes.paymentPointSection} elevation={1}>
        {locationType === BURUNDI_LOC_TYPE_PROVINCE ? (
          <>
            <Box className={classes.paymentPointHeader}>
              <Typography variant="subtitle1">
                {formatMessage('geography.detail.paymentPoint.allPlans')}
              </Typography>
              <AddProvincePaymentPointDialog
                location={{ id: locationId, benefitPlanId }}
                buttonLabel={formatMessage('geography.detail.paymentPoint.assign')}
              />
            </Box>
            <ProvincePaymentPointChips
              location={{ id: locationId }}
              refresh={refreshPaymentPoints}
            />
          </>
        ) : (
          <>
            <Typography className={classes.inheritedLabel}>
              {formatMessageWithValues('geography.detail.paymentPoint.inherited', {
                provinceName: getProvinceName(),
              })}
            </Typography>
            {paymentPoints && paymentPoints.length > 0 ? (
              <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
                {paymentPoints.map((pp) => (
                  <Paper key={pp.id} variant="outlined" style={{ padding: '4px 12px' }}>
                    <Typography variant="body2">
                      {pp.paymentPointName}
                      {pp.benefitPlanName ? ` (${pp.benefitPlanName})` : ''}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary" variant="body2">
                {formatMessage('geography.noData')}
              </Typography>
            )}
          </>
        )}
      </Paper>

      {/* Tabs */}
      <Paper className={classes.tabsContainer} elevation={1}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabConfig.map((tab, idx) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab content */}
      {renderTabContent()}
    </div>
  );
}

export default LocationDetailPage;

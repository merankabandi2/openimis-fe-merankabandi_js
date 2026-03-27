import React, { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Box,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import { decodeId, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import RefreshIcon from '@material-ui/icons/Refresh';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import GetAppIcon from '@material-ui/icons/GetApp';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import WcIcon from '@material-ui/icons/Wc';
import PeopleIcon from '@material-ui/icons/People';
import ReactApexChart from 'react-apexcharts';
import MonetaryTransferChart from './MonetaryTransferChart';
import BenefitConsumptionByProvinces from './BenefitConsumptionByProvinces';
import { useMonetaryTransfersDashboard } from '../../hooks/useMonetaryTransfersDashboard';
import { useOptimizedDashboard } from '../../hooks/useOptimizedDashboard';
import { usePaymentByLocation, usePaymentByProgram, usePaymentTrends } from '../../hooks/usePaymentReporting';
import ModernDashboardFilters from '../filters/ModernDashboardFilters';

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#5a8dee',
    },
    secondary: {
      main: '#ff8f00',
    },
    success: {
      main: '#00d0bd',
    },
    error: {
      main: '#ff5c75',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Custom styles
const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    paddingTop: theme.spacing(3),
  },
  contentArea: {
    padding: theme.spacing(2),
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: theme.spacing(2),
    },
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  titleIcon: {
    fontSize: '2.5rem',
    color: theme.palette.primary.main,
  },
  box: {
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
    height: '100%',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 5px 25px rgba(0,0,0,.1)',
    },
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
    },
  },
  summaryTitle: {
    fontSize: '1rem',
    fontWeight: 500,
    opacity: 0.9,
    marginBottom: theme.spacing(1),
  },
  summaryValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  summarySubtitle: {
    fontSize: '0.875rem',
    opacity: 0.8,
    marginTop: theme.spacing(1),
  },
  statIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 'fit-content',
  },
  refreshButton: {
    color: theme.palette.primary.main,
  },
  vulnerableGroupCard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
    height: '100%',
  },
  exportButton: {
    marginLeft: theme.spacing(1),
  },
  tabsContainer: {
    marginTop: theme.spacing(3),
  },
  tabsPaper: {
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
  },
  tabContent: {
    padding: theme.spacing(3),
  },
  tableContainer: {
    overflowX: 'auto',
  },
  tableHeader: {
    backgroundColor: '#f5f7fa',
  },
  tableHeaderCell: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f5f7fa',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(6),
  },
  noDataMessage: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  viewExternalButton: {
    marginLeft: theme.spacing(1),
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
  },
}));

// Tab panel component
function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box className={useStyles().tabContent}>{children}</Box>;
}

// Dashboard component
function TransfertDashboard() {
  const intl = useIntl();
  const classes = useStyles();
  const [filters, setFilters] = useState({
    provinces: [],
    communes: [],
    collines: [],
    benefitPlan: null,
    year: null,
    dateRange: { start: null, end: null },
  });
  const [activeTab, setActiveTab] = useState(0);

  // Convert filters to optimized dashboard format
  const optimizedFilters = useMemo(() => ({
    provinceId: Array.isArray(filters.provinces) && filters.provinces.length > 0 ? parseInt(decodeId(filters.provinces[0])) : undefined,
    communeId: Array.isArray(filters.communes) && filters.communes.length > 0 ? parseInt(decodeId(filters.communes[0])) : undefined,
    collineId: Array.isArray(filters.collines) && filters.collines.length > 0 ? parseInt(decodeId(filters.collines[0])) : undefined,
    year: filters.year ? parseInt(filters.year) : undefined,
    benefitPlanId: filters.benefitPlan ? decodeId(filters.benefitPlan) : undefined,
  }), [filters]);

  // Use optimized dashboard hook for performance metrics
  const {
    performance,
    summary,
    breakdown,
    isLoading: performanceLoading,
    refetchAll,
  } = useOptimizedDashboard(optimizedFilters, {
    includeTransfers: true,
  });

  // Legacy monetary transfers hook for KPIs
  const legacyFilters = useMemo(() => ({
    locationId: filters.provinces?.length > 0 ? filters.provinces[0] : '',
    benefitPlanId: filters.benefitPlan || '',
    year: filters.year || '',
  }), [filters]);

  const {
    totalBeneficiaries,
    totalPayments,
    totalAmount,
    totalAmountReceived,
    totalHouseholds,
    totalIndividuals,
    monetaryTransferData,
    externalPlannedAmount,
    externalTransferredAmount,
    internalAmount,
    isLoading: legacyLoading,
  } = useMonetaryTransfersDashboard(legacyFilters);

  // Payment reporting hooks for tabs
  const reportingFilters = useMemo(() => ({
    provinceId: optimizedFilters.provinceId,
    communeId: optimizedFilters.communeId,
    year: optimizedFilters.year,
    benefitPlanId: optimizedFilters.benefitPlanId,
  }), [optimizedFilters]);

  const {
    locations: locationData,
    isLoading: locationLoading,
  } = usePaymentByLocation('province', reportingFilters);

  const {
    programs: programData,
    isLoading: programLoading,
  } = usePaymentByProgram(reportingFilters);

  const {
    trends: trendsData,
    isLoading: trendsLoading,
  } = usePaymentTrends('quarter', reportingFilters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = async () => {
    await refetchAll();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const isLoading = performanceLoading || legacyLoading;

  // Helper function to format numbers
  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('fr-FR');
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0 BIF';
    return `${formatNumber(amount)} BIF`;
  };

  // Export dashboard data as JSON
  const handleExport = () => {
    const exportData = {
      summary: displayData,
      genderBreakdown: breakdown?.genderBreakdown,
      communityBreakdown: summary?.communityBreakdown,
      transferPerformance: performance?.overallMetrics,
      exportDate: new Date().toISOString(),
      filters,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transfers-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Use optimized data as primary source, fallback to legacy data
  const optimizedMetrics = performance?.overallMetrics || {};
  const summaryData = summary?.summary || {};

  const displayData = {
    totalBeneficiaries: optimizedMetrics.totalBeneficiaries || summaryData.totalBeneficiaries || totalBeneficiaries || 0,
    totalPayments: optimizedMetrics.totalPaymentCycles || totalPayments || 0,
    totalAmount: optimizedMetrics.totalAmount || summaryData.totalAmount || totalAmount || 0,
    totalAmountReceived: optimizedMetrics.totalAmountPaid || summaryData.totalAmountReceived || totalAmountReceived || 0,
    totalHouseholds: optimizedMetrics.totalHouseholds || totalHouseholds || 0,
    totalIndividuals: optimizedMetrics.totalIndividuals || totalIndividuals || 0,
  };

  // Calculate payment rate
  const paymentRate = displayData.totalAmount > 0
    ? Math.round((displayData.totalAmountReceived / displayData.totalAmount) * 100)
    : 0;

  // Payment source breakdown for pie chart
  const sourceBreakdownSeries = useMemo(() => {
    const internal = internalAmount || 0;
    const external = externalTransferredAmount || 0;
    if (internal === 0 && external === 0) return [];
    return [internal, external];
  }, [internalAmount, externalTransferredAmount]);

  const sourceBreakdownLabels = useMemo(() => [
    formatMessage(intl, MODULE_NAME, 'dashboard.transfers.source.internal'),
    formatMessage(intl, MODULE_NAME, 'dashboard.transfers.source.external'),
  ], [intl]);

  // Trends chart data
  const trendsChartData = useMemo(() => {
    if (!trendsData || trendsData.length === 0) return { categories: [], amountSeries: [], beneficiarySeries: [] };
    return {
      categories: trendsData.map((t) => t.period),
      amountSeries: trendsData.map((t) => parseFloat(t.paymentAmount || 0)),
      beneficiarySeries: trendsData.map((t) => parseInt(t.beneficiaryCount || 0, 10)),
    };
  }, [trendsData]);

  // Render location table
  const renderLocationTable = () => {
    if (locationLoading) {
      return (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      );
    }
    if (!locationData || locationData.length === 0) {
      return (
        <Box className={classes.noDataMessage}>
          <Typography>{formatMessage(intl, MODULE_NAME, 'dashboard.transfers.noData')}</Typography>
        </Box>
      );
    }
    return (
      <Box className={classes.tableContainer}>
        <Table>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell className={classes.tableHeaderCell}>
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.province')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.payments')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.amount')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.beneficiaries')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.femalePercent')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.twaPercent')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locationData.map((loc) => (
              <TableRow key={loc.provinceId || loc.provinceName} className={classes.tableRow}>
                <TableCell>{loc.provinceName}</TableCell>
                <TableCell align="right">{formatNumber(loc.paymentCount)}</TableCell>
                <TableCell align="right">{formatCurrency(loc.paymentAmount)}</TableCell>
                <TableCell align="right">{formatNumber(loc.beneficiaryCount)}</TableCell>
                <TableCell align="right">
                  {loc.femalePercentage != null ? `${Math.round(loc.femalePercentage)}%` : '-'}
                </TableCell>
                <TableCell align="right">
                  {loc.twaPercentage != null ? `${Math.round(loc.twaPercentage)}%` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  // Render program table
  const renderProgramTable = () => {
    if (programLoading) {
      return (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      );
    }
    if (!programData || programData.length === 0) {
      return (
        <Box className={classes.noDataMessage}>
          <Typography>{formatMessage(intl, MODULE_NAME, 'dashboard.transfers.noData')}</Typography>
        </Box>
      );
    }
    return (
      <Box className={classes.tableContainer}>
        <Table>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell className={classes.tableHeaderCell}>
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.program')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.payments')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.amount')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.beneficiaries')}
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="right">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.table.coverage')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programData.map((prog) => (
              <TableRow key={prog.benefitPlanId || prog.benefitPlanName} className={classes.tableRow}>
                <TableCell>{prog.benefitPlanName}</TableCell>
                <TableCell align="right">{formatNumber(prog.paymentCount)}</TableCell>
                <TableCell align="right">{formatCurrency(prog.paymentAmount)}</TableCell>
                <TableCell align="right">{formatNumber(prog.beneficiaryCount)}</TableCell>
                <TableCell align="right">
                  {prog.provincesCovered != null ? `${prog.provincesCovered}` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  // Render trends chart
  const renderTrendsChart = () => {
    if (trendsLoading) {
      return (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      );
    }
    if (trendsChartData.categories.length === 0) {
      return (
        <Box className={classes.noDataMessage}>
          <Typography>{formatMessage(intl, MODULE_NAME, 'dashboard.transfers.noData')}</Typography>
        </Box>
      );
    }
    return (
      <ReactApexChart
        options={{
          chart: { type: 'line', toolbar: { show: true } },
          xaxis: {
            categories: trendsChartData.categories,
            title: { text: formatMessage(intl, MODULE_NAME, 'dashboard.transfers.trends.period') },
          },
          yaxis: [
            {
              title: { text: formatMessage(intl, MODULE_NAME, 'dashboard.transfers.trends.amount') },
              labels: {
                formatter: (val) => `${Number(val).toLocaleString('fr-FR')}`,
              },
            },
            {
              opposite: true,
              title: { text: formatMessage(intl, MODULE_NAME, 'dashboard.transfers.trends.beneficiaries') },
              labels: {
                formatter: (val) => `${Number(val).toLocaleString('fr-FR')}`,
              },
            },
          ],
          stroke: { curve: 'smooth', width: [3, 3] },
          colors: ['#5a8dee', '#ff8f00'],
          legend: { position: 'top' },
          tooltip: {
            shared: true,
            intersect: false,
          },
          markers: { size: 4 },
        }}
        series={[
          {
            name: formatMessage(intl, MODULE_NAME, 'dashboard.transfers.trends.amount'),
            type: 'line',
            data: trendsChartData.amountSeries,
          },
          {
            name: formatMessage(intl, MODULE_NAME, 'dashboard.transfers.trends.beneficiaries'),
            type: 'line',
            data: trendsChartData.beneficiarySeries,
          },
        ]}
        type="line"
        height={400}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <AccountBalanceIcon className={classes.titleIcon} />
              {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.title')}
            </Typography>
            <Box display="flex" alignItems="center">
              <Tooltip title={formatMessage(intl, MODULE_NAME, 'dashboard.transfers.export')}>
                <IconButton
                  className={classes.exportButton}
                  onClick={handleExport}
                  disabled={isLoading}
                >
                  <GetAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={formatMessage(intl, MODULE_NAME, 'dashboard.transfers.refresh')}>
                <IconButton
                  className={classes.refreshButton}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </div>

          {/* Modern Dashboard Filters */}
          <ModernDashboardFilters
            onFiltersChange={handleFilterChange}
            defaultFilters={filters}
            filterTypes={['location', 'benefitPlan', 'year']}
          />

          {/* KPI Cards Row */}
          <Fade in={!isLoading}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.summaryCard}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.totalBeneficiaries')}
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {formatNumber(displayData.totalBeneficiaries)}
                      </Typography>
                      <Typography className={classes.summarySubtitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.registeredHouseholds')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.totalAmount')}
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {formatCurrency(displayData.totalAmount)}
                      </Typography>
                      <Typography className={classes.summarySubtitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.toDistribute')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.distributedAmount')}
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {formatCurrency(displayData.totalAmountReceived)}
                      </Typography>
                      <Typography className={classes.summarySubtitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.alreadyPaid')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.paymentRate')}
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {paymentRate}%
                      </Typography>
                      <div className={classes.statIndicator}>
                        <TrendingUpIcon fontSize="small" />
                        <Typography variant="caption">
                          {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.stat.inProgress')}
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Fade>

          {/* Demographics Row */}
          {breakdown?.genderBreakdown && (
            <Grid container spacing={2} style={{ marginTop: 16, marginBottom: 16 }}>
              <Grid item xs={12} sm={4}>
                <div className={classes.vulnerableGroupCard}>
                  <Avatar style={{ backgroundColor: '#ff8f00' }}>
                    <AccessibilityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {breakdown.genderBreakdown.twaBeneficiaries || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.demo.twaBeneficiaries')}
                    </Typography>
                  </Box>
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <div className={classes.vulnerableGroupCard}>
                  <Avatar style={{ backgroundColor: '#e91e63' }}>
                    <WcIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {breakdown.genderBreakdown.femalePercentage
                        ? `${Math.round(breakdown.genderBreakdown.femalePercentage)}%`
                        : '0%'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.demo.femalePercentage')}
                    </Typography>
                  </Box>
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <div className={classes.vulnerableGroupCard}>
                  <Avatar style={{ backgroundColor: '#5a8dee' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {breakdown.genderBreakdown.twaPercentage
                        ? `${Math.round(breakdown.genderBreakdown.twaPercentage)}%`
                        : '0%'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.demo.twaInclusionRate')}
                    </Typography>
                  </Box>
                </div>
              </Grid>
            </Grid>
          )}

          {/* Tabs Section */}
          <Box className={classes.tabsContainer}>
            <Paper className={classes.tabsPaper}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label={formatMessage(intl, MODULE_NAME, 'dashboard.transfers.tabs.overview')} />
                <Tab label={formatMessage(intl, MODULE_NAME, 'dashboard.transfers.tabs.byLocation')} />
                <Tab label={formatMessage(intl, MODULE_NAME, 'dashboard.transfers.tabs.byProgram')} />
                <Tab label={formatMessage(intl, MODULE_NAME, 'dashboard.transfers.tabs.trends')} />
              </Tabs>

              {/* Overview Tab */}
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  {/* Payment source breakdown pie chart */}
                  {sourceBreakdownSeries.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper className={classes.box}>
                        <Typography variant="h6" gutterBottom>
                          {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.chart.sourceBreakdown')}
                        </Typography>
                        <ReactApexChart
                          options={{
                            chart: { type: 'pie' },
                            labels: sourceBreakdownLabels,
                            colors: ['#5a8dee', '#ff8f00'],
                            legend: { position: 'bottom' },
                            dataLabels: {
                              enabled: true,
                              formatter: (val) => `${val.toFixed(1)}%`,
                            },
                            tooltip: {
                              y: {
                                formatter: (val) => formatCurrency(val),
                              },
                            },
                          }}
                          series={sourceBreakdownSeries}
                          type="pie"
                          height={350}
                        />
                      </Paper>
                    </Grid>
                  )}

                  {/* Gender distribution donut chart */}
                  {breakdown?.genderBreakdown && (
                    <Grid item xs={12} md={6}>
                      <Paper className={classes.box}>
                        <Typography variant="h6" gutterBottom>
                          {formatMessage(intl, MODULE_NAME, 'dashboard.transfers.chart.genderDistribution')}
                        </Typography>
                        <ReactApexChart
                          options={{
                            chart: { type: 'donut' },
                            labels: [
                              formatMessage(intl, MODULE_NAME, 'dashboard.transfers.chart.men'),
                              formatMessage(intl, MODULE_NAME, 'dashboard.transfers.chart.women'),
                              formatMessage(intl, MODULE_NAME, 'dashboard.transfers.chart.twa'),
                            ],
                            colors: ['#5a8dee', '#e91e63', '#ff8f00'],
                            legend: { position: 'bottom' },
                            plotOptions: {
                              pie: {
                                donut: {
                                  size: '65%',
                                  labels: {
                                    show: true,
                                    total: { show: true, showAlways: true, fontSize: '16px', fontWeight: 600 },
                                  },
                                },
                              },
                            },
                            dataLabels: {
                              enabled: true,
                              formatter(val) { return `${val.toFixed(1)}%`; },
                            },
                          }}
                          series={[
                            breakdown.genderBreakdown.maleBeneficiaries || 0,
                            breakdown.genderBreakdown.femaleBeneficiaries || 0,
                            breakdown.genderBreakdown.twaBeneficiaries || 0,
                          ]}
                          type="donut"
                          height={350}
                        />
                      </Paper>
                    </Grid>
                  )}

                  {/* Quarterly amounts bar chart */}
                  <Grid item xs={12} md={6}>
                    <Paper className={classes.box}>
                      <MonetaryTransferChart filters={legacyFilters} />
                    </Paper>
                  </Grid>

                  {/* Beneficiaries by Province */}
                  <Grid item xs={12} md={6}>
                    <Paper className={classes.box}>
                      <BenefitConsumptionByProvinces
                        filters={legacyFilters}
                        optimizedData={breakdown?.locationBreakdown}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* By Location Tab */}
              <TabPanel value={activeTab} index={1}>
                {renderLocationTable()}
              </TabPanel>

              {/* By Program Tab */}
              <TabPanel value={activeTab} index={2}>
                {renderProgramTable()}
              </TabPanel>

              {/* Trends Tab */}
              <TabPanel value={activeTab} index={3}>
                {renderTrendsChart()}
              </TabPanel>
            </Paper>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default TransfertDashboard;

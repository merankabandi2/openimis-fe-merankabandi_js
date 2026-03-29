import React, { useState, useEffect } from 'react';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import {
  Typography, Paper, CircularProgress, Box, Chip,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import ReactApexChart from 'react-apexcharts';

const styles = (theme) => ({
  paper: {
    marginBottom: theme.spacing(0),
    padding: theme.spacing(0),
    background: 'transparent',
    boxShadow: 'none',
  },
  cardHeader: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statsContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[2],
    },
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    textAlign: 'center',
  },
  noDataMessage: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
});

function TransfersChart({ classes, theme, filters = {}, compact = false, header = true }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTransfersData = async () => {
    setLoading(true);
    try {
      const optimizedFilters = {};
      if (filters.year) optimizedFilters.year = filters.year;
      if (filters.provinces && filters.provinces.length > 0) {
        optimizedFilters.provinceId = parseInt(decodeId(filters.provinces[0]));
      }
      if (filters.communes && filters.communes.length > 0) {
        optimizedFilters.communeId = parseInt(decodeId(filters.communes[0]));
      }
      if (filters.collines && filters.collines.length > 0) {
        optimizedFilters.collineId = parseInt(decodeId(filters.collines[0]));
      }
      if (filters.benefitPlan) optimizedFilters.benefitPlanId = decodeId(filters.benefitPlan);

      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: apiHeaders(),
        body: JSON.stringify({
          query: `query OptimizedMonetaryTransferBeneficiaryData($filters: DashboardFiltersInput) {
            optimizedMonetaryTransferBeneficiaryData(filters: $filters) {
              transferType
              malePaid
              maleUnpaid
              femalePaid
              femaleUnpaid
              totalPaid
              totalUnpaid
            }
          }`,
          variables: { filters: optimizedFilters },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch transfers data');
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0]?.message);

      const transferData = result.data?.optimizedMonetaryTransferBeneficiaryData;
      setData(transferData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading transfers data:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfersData();
  }, [filters]);

  // Aggregate all transfer types
  const stats = (data || []).reduce(
    (acc, item) => {
      acc.malePaid += item.malePaid || 0;
      acc.maleUnpaid += item.maleUnpaid || 0;
      acc.femalePaid += item.femalePaid || 0;
      acc.femaleUnpaid += item.femaleUnpaid || 0;
      return acc;
    },
    { malePaid: 0, maleUnpaid: 0, femalePaid: 0, femaleUnpaid: 0 },
  );

  const totalPaid = stats.malePaid + stats.femalePaid;
  const totalUnpaid = stats.maleUnpaid + stats.femaleUnpaid;
  const total = totalPaid + totalUnpaid;
  const paidRate = total > 0 ? ((totalPaid / total) * 100).toFixed(1) : 0;
  const maleTotal = stats.malePaid + stats.maleUnpaid;
  const femaleTotal = stats.femalePaid + stats.femaleUnpaid;
  const malePct = total > 0 ? Math.round((maleTotal / total) * 100) : 0;
  const femalePct = total > 0 ? Math.round((femaleTotal / total) * 100) : 0;

  // Donut chart: Paid vs Pending
  const donutOptions = {
    chart: {
      type: 'donut',
      fontFamily: '"Titillium Web", "Roboto", sans-serif',
    },
    labels: ['Effectués', 'En Attente'],
    colors: ['#00E396', '#FF4560'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px' },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: 700,
              formatter: (val) => Number(val).toLocaleString('fr-FR'),
            },
            total: {
              show: true,
              label: 'Taux',
              fontSize: '13px',
              formatter: () => `${paidRate}%`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2 },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString('fr-FR')} paiements`,
      },
    },
  };

  // Horizontal bar: gender breakdown (paid vs pending per gender)
  const genderBarOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      stackType: '100%',
      toolbar: { show: false },
      fontFamily: '"Titillium Web", "Roboto", sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        borderRadius: 4,
      },
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', fontWeight: 600 },
      },
    },
    grid: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: { fontSize: '11px', fontWeight: 600 },
    },
    colors: ['#00E396', '#FF4560'],
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString('fr-FR')} paiements`,
      },
    },
  };

  const genderBarSeries = [
    { name: 'Effectués', data: [stats.femalePaid, stats.malePaid] },
    { name: 'En Attente', data: [stats.femaleUnpaid, stats.maleUnpaid] },
  ];

  const genderBarCategories = [
    `Femmes (${femalePct}%)`,
    `Hommes (${malePct}%)`,
  ];

  return (
    <Paper className={classes.paper}>
      {header && (
        <div className={classes.cardHeader}>
          <Typography variant="h6">Enregistrements de Paiements</Typography>
        </div>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box my={2}>
          <Typography color="error" align="center">
            Erreur: {error.message}
          </Typography>
        </Box>
      )}

      {!loading && !error && total > 0 && (
        <>
          {/* Summary cards */}
          <div className={classes.statsContainer}>
            <div className={classes.statCard}>
              <Typography className={classes.statValue}>
                {total.toLocaleString('fr-FR')}
              </Typography>
              <Typography className={classes.statLabel}>Total Paiements</Typography>
            </div>
            <div className={classes.statCard} style={{ borderColor: '#00E396' }}>
              <Typography className={classes.statValue} style={{ color: '#00E396' }}>
                {totalPaid.toLocaleString('fr-FR')}
              </Typography>
              <Typography className={classes.statLabel}>
                Effectués ({paidRate}%)
              </Typography>
            </div>
            <div className={classes.statCard} style={{ borderColor: '#FF4560' }}>
              <Typography className={classes.statValue} style={{ color: '#FF4560' }}>
                {totalUnpaid.toLocaleString('fr-FR')}
              </Typography>
              <Typography className={classes.statLabel}>En Attente</Typography>
            </div>
          </div>

          {/* Donut: paid rate */}
          <ReactApexChart
            options={donutOptions}
            series={[totalPaid, totalUnpaid]}
            type="donut"
            height={compact ? 200 : 240}
          />

          {/* Gender breakdown bar */}
          <Box mt={1}>
            <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, marginLeft: 8 }}>
              Répartition par genre
            </Typography>
            <ReactApexChart
              options={{ ...genderBarOptions, xaxis: { ...genderBarOptions.xaxis, categories: genderBarCategories } }}
              series={genderBarSeries}
              type="bar"
              height={100}
            />
          </Box>

          {/* Per transfer-type breakdown */}
          {(data || []).filter((d) => (d.malePaid + d.maleUnpaid + d.femalePaid + d.femaleUnpaid) > 0).map((item, i) => {
            const itemTotal = item.malePaid + item.maleUnpaid + item.femalePaid + item.femaleUnpaid;
            const itemPaid = item.malePaid + item.femalePaid;
            const itemRate = itemTotal > 0 ? ((itemPaid / itemTotal) * 100).toFixed(1) : 0;
            return (
              <Box key={i} mx={1} mb={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  {item.transferType}
                </Typography>
                <Chip
                  size="small"
                  label={`${itemRate}% effectué`}
                  style={{
                    backgroundColor: parseFloat(itemRate) > 80 ? '#e8f5e9' : '#ffebee',
                    color: parseFloat(itemRate) > 80 ? '#2e7d32' : '#c62828',
                    fontWeight: 600,
                  }}
                />
              </Box>
            );
          })}
        </>
      )}

      {!loading && !error && total === 0 && (
        <Box className={classes.noDataMessage}>
          <Typography variant="body2" color="textSecondary">
            Aucune donnée disponible
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default withTheme(withStyles(styles)(TransfersChart));

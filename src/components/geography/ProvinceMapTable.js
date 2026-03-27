import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  IconButton,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  useModulesManager,
  useTranslations,
  useGraphqlQuery,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import MapComponent from '../dashboard/MapComponent';

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

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  mapSection: {
    height: 400,
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
  tableContainer: {
    maxHeight: 500,
  },
  clickableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  headerCell: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
}));

function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] ?? 0;
  const valB = b[orderBy] ?? 0;
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function ProvinceMapTable({
  provinces,
  isLoading,
  benefitPlanId,
  year,
  onBenefitPlanChange,
  onYearChange,
  onProvinceClick,
  onRefresh,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const { data: benefitPlansData } = useGraphqlQuery(
    BENEFIT_PLANS_QUERY,
    {},
    { skip: false },
  );

  const benefitPlans = useMemo(
    () => (benefitPlansData?.benefitPlan?.edges || []).map(({ node }) => node),
    [benefitPlansData],
  );

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const sortedProvinces = useMemo(() => {
    if (!provinces) return [];
    return [...provinces].sort(getComparator(sortDirection, sortBy));
  }, [provinces, sortBy, sortDirection]);

  const mapFilters = useMemo(() => {
    const f = {};
    if (benefitPlanId) f.benefitPlan = benefitPlanId;
    if (year) f.year = year;
    return f;
  }, [benefitPlanId, year]);

  const columns = [
    { id: 'name', labelKey: 'geography.provinces.table.province', numeric: false },
    { id: 'totalHouseholds', labelKey: 'geography.provinces.table.households', numeric: true },
    { id: 'totalIndividuals', labelKey: 'geography.provinces.table.individuals', numeric: true },
    { id: 'totalBeneficiaries', labelKey: 'geography.provinces.table.beneficiaries', numeric: true },
    { id: 'totalAmountDisbursed', labelKey: 'geography.provinces.table.amountDisbursed', numeric: true },
    { id: 'paymentCycleCount', labelKey: 'geography.provinces.table.paymentCycles', numeric: true },
    { id: 'paymentRate', labelKey: 'geography.provinces.table.paymentRate', numeric: true },
    { id: 'agencyCount', labelKey: 'geography.provinces.table.agencies', numeric: true },
  ];

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

  const formatCellValue = (column, value) => {
    if (column === 'totalAmountDisbursed') return formatCurrency(value);
    if (column === 'paymentRate') return formatPercent(value);
    if (column === 'name') return value || '-';
    return formatNumber(value);
  };

  return (
    <div className={classes.root}>
      {/* Map section */}
      <Paper elevation={1}>
        <Box className={classes.mapSection}>
          <MapComponent
            filters={mapFilters}
            isLoading={isLoading}
            onFeatureClick={(provinceName) => {
              const province = provinces.find((p) => p.name === provinceName);
              if (province && province.uuid) {
                onProvinceClick(province.uuid);
              }
            }}
          />
        </Box>
      </Paper>

      {/* Filter bar */}
      <Paper elevation={1} className={classes.filterBar}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControl className={classes.formControl} size="small" variant="outlined">
              <InputLabel id="geography-benefit-plan-label">
                {formatMessage('geography.filter.program')}
              </InputLabel>
              <Select
                labelId="geography-benefit-plan-label"
                value={benefitPlanId || ''}
                onChange={(e) => onBenefitPlanChange(e.target.value || null)}
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
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl} size="small" variant="outlined">
              <InputLabel id="geography-year-label">
                {formatMessage('geography.filter.year')}
              </InputLabel>
              <Select
                labelId="geography-year-label"
                value={year || ''}
                onChange={(e) => onYearChange(e.target.value || null)}
                label={formatMessage('geography.filter.year')}
              >
                <MenuItem value="">-</MenuItem>
                {YEAR_OPTIONS.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Province table */}
      {isLoading ? (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.numeric ? 'right' : 'left'}
                    className={classes.headerCell}
                    sortDirection={sortBy === col.id ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {formatMessage(col.labelKey)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProvinces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    <Typography color="textSecondary">
                      {formatMessage('geography.noData')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedProvinces.map((province) => (
                  <TableRow
                    key={province.uuid || province.id}
                    className={classes.clickableRow}
                    onClick={() => onProvinceClick(province.uuid)}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.numeric ? 'right' : 'left'}
                      >
                        {formatCellValue(col.id, province[col.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default ProvinceMapTable;

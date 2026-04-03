import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Grid, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Box, Tooltip,
  Select, MenuItem, FormControl, InputLabel, IconButton, LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import ReplayIcon from '@material-ui/icons/Replay';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import BlockIcon from '@material-ui/icons/Block';
import { useModulesManager, useTranslations, Helmet } from '@openimis/fe-core';
import {
  fetchPaymentEvolution,
  fetchCommunePaymentStatus,
} from '../payment-schedule-actions';
import {
  MAX_PAYMENT_ROUNDS,
  PAYMENT_SCHEDULE_STATUS,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  page: { margin: theme.spacing(2) },
  paper: { padding: theme.spacing(2), marginBottom: theme.spacing(2) },
  title: { marginBottom: theme.spacing(2), fontWeight: 600 },
  statusChip: { fontWeight: 500, minWidth: 100 },
  roundCell: {
    textAlign: 'center',
    padding: theme.spacing(0.5),
    minWidth: 60,
  },
  progressBar: { height: 8, borderRadius: 4 },
  headerRow: { backgroundColor: theme.palette.primary.main },
  headerCell: { color: '#fff', fontWeight: 600, fontSize: '0.85rem' },
  communeRow: { '&:hover': { backgroundColor: theme.palette.action.hover, cursor: 'pointer' } },
  summaryBox: {
    display: 'flex', gap: theme.spacing(3), marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  kpiCard: {
    padding: theme.spacing(2), minWidth: 150, textAlign: 'center',
    borderRadius: 8, border: `1px solid ${theme.palette.divider}`,
  },
  kpiValue: { fontSize: '1.8rem', fontWeight: 700, color: theme.palette.primary.main },
  kpiLabel: { fontSize: '0.8rem', color: theme.palette.text.secondary },
}));

const STATUS_CONFIG = {
  [PAYMENT_SCHEDULE_STATUS.RECONCILED]: { color: '#4caf50', icon: CheckCircleIcon, label: 'Clôturé' },
  [PAYMENT_SCHEDULE_STATUS.FAILED]: { color: '#f44336', icon: ErrorIcon, label: 'Échoué' },
  [PAYMENT_SCHEDULE_STATUS.REJECTED]: { color: '#ff9800', icon: BlockIcon, label: 'Rejeté' },
  [PAYMENT_SCHEDULE_STATUS.PENDING]: { color: '#2196f3', icon: HourglassEmptyIcon, label: 'En attente' },
  [PAYMENT_SCHEDULE_STATUS.GENERATING]: { color: '#9c27b0', icon: HourglassEmptyIcon, label: 'Génération' },
  [PAYMENT_SCHEDULE_STATUS.APPROVED]: { color: '#00bcd4', icon: CheckCircleIcon, label: 'Approuvé' },
  [PAYMENT_SCHEDULE_STATUS.IN_PAYMENT]: { color: '#ff5722', icon: HourglassEmptyIcon, label: 'En paiement' },
};

function RoundStatusCell({ status }) {
  if (!status) {
    return (
      <Box
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '2px dashed #ccc', margin: '0 auto',
        }}
      />
    );
  }
  const cfg = STATUS_CONFIG[status] || { color: '#999', label: status };
  const Icon = cfg.icon || HourglassEmptyIcon;
  return (
    <Tooltip title={cfg.label}>
      <Icon style={{ color: cfg.color, fontSize: 24 }} />
    </Tooltip>
  );
}

export default function PaymentSchedulePage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const mm = useModulesManager();

  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [evolution, setEvolution] = useState([]);

  // Fetch benefit plans for the selector
  const benefitPlans = useSelector((state) => state.merankabandi?.benefitPlans || []);

  const loadEvolution = useCallback(() => {
    if (!selectedPlan) return;
    setLoading(true);
    dispatch(fetchPaymentEvolution(mm, selectedPlan)).then((action) => {
      if (action?.payload?.data?.paymentEvolution) {
        setEvolution(action.payload.data.paymentEvolution);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedPlan, dispatch, mm]);

  useEffect(() => {
    loadEvolution();
  }, [selectedPlan, loadEvolution]);

  // Summary KPIs
  const totalCommunes = evolution.length;
  const totalReconciled = evolution.reduce((s, c) => s + (c.reconciledRounds || 0), 0);
  const totalBeneficiaries = evolution.reduce((s, c) => s + (c.totalBeneficiaries || 0), 0);
  const totalAmount = evolution.reduce((s, c) => s + parseFloat(c.totalAmount || 0), 0);
  const overallProgress = totalCommunes > 0
    ? Math.round((totalReconciled / (totalCommunes * MAX_PAYMENT_ROUNDS)) * 100)
    : 0;

  return (
    <div className={classes.page}>
      <Helmet title="Calendrier de Paiement" />

      <Paper className={classes.paper}>
        <Typography variant="h5" className={classes.title}>
          Calendrier de Paiement par Commune
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Suivi des {MAX_PAYMENT_ROUNDS} tranches de paiement bimestrielles par commune.
          Chaque tranche doit être clôturée (réconciliée) avant de pouvoir créer la suivante.
        </Typography>

        <Grid container spacing={2} alignItems="center" style={{ marginTop: 16 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Programme</InputLabel>
              <Select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                label="Programme"
              >
                <MenuItem value="">Sélectionner un programme</MenuItem>
                {benefitPlans.map((bp) => (
                  <MenuItem key={bp.id} value={bp.id}>
                    {bp.code} — {bp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <IconButton onClick={loadEvolution} disabled={!selectedPlan || loading}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {selectedPlan && (
        <>
          {/* KPI Summary */}
          <Box className={classes.summaryBox}>
            <Paper className={classes.kpiCard}>
              <Typography className={classes.kpiValue}>{totalCommunes}</Typography>
              <Typography className={classes.kpiLabel}>Communes</Typography>
            </Paper>
            <Paper className={classes.kpiCard}>
              <Typography className={classes.kpiValue}>{totalReconciled}</Typography>
              <Typography className={classes.kpiLabel}>Tranches clôturées</Typography>
            </Paper>
            <Paper className={classes.kpiCard}>
              <Typography className={classes.kpiValue}>{totalBeneficiaries.toLocaleString()}</Typography>
              <Typography className={classes.kpiLabel}>Bénéficiaires</Typography>
            </Paper>
            <Paper className={classes.kpiCard}>
              <Typography className={classes.kpiValue}>{(totalAmount / 1000000).toFixed(1)}M</Typography>
              <Typography className={classes.kpiLabel}>Montant total (BIF)</Typography>
            </Paper>
            <Paper className={classes.kpiCard}>
              <Typography className={classes.kpiValue}>{overallProgress}%</Typography>
              <Typography className={classes.kpiLabel}>Progression globale</Typography>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                className={classes.progressBar}
                style={{ marginTop: 8 }}
              />
            </Paper>
          </Box>

          {/* Payment Grid */}
          <Paper className={classes.paper}>
            {loading ? (
              <Box textAlign="center" py={4}><CircularProgress /></Box>
            ) : evolution.length === 0 ? (
              <Typography color="textSecondary" align="center">
                Aucune donnée de paiement pour ce programme.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow className={classes.headerRow}>
                      <TableCell className={classes.headerCell}>Commune</TableCell>
                      <TableCell className={classes.headerCell} align="right">Bénéficiaires</TableCell>
                      {Array.from({ length: MAX_PAYMENT_ROUNDS }, (_, i) => (
                        <TableCell key={i} className={classes.headerCell} align="center">
                          T{i + 1}
                        </TableCell>
                      ))}
                      <TableCell className={classes.headerCell} align="center">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evolution.map((commune) => (
                      <TableRow key={commune.communeUuid} className={classes.communeRow}>
                        <TableCell>{commune.communeName}</TableCell>
                        <TableCell align="right">
                          {(commune.totalBeneficiaries || 0).toLocaleString()}
                        </TableCell>
                        {Array.from({ length: MAX_PAYMENT_ROUNDS }, (_, i) => {
                          const roundNum = i + 1;
                          const isCompleted = roundNum <= (commune.reconciledRounds || 0);
                          return (
                            <TableCell key={i} className={classes.roundCell}>
                              <RoundStatusCell
                                status={isCompleted ? PAYMENT_SCHEDULE_STATUS.RECONCILED : null}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${commune.progressPercent || 0}%`}
                            style={{
                              backgroundColor: commune.progressPercent >= 100 ? '#4caf50'
                                : commune.progressPercent >= 50 ? '#ff9800' : '#f44336',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </div>
  );
}

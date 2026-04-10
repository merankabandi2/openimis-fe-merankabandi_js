import React, { useEffect, useState, useCallback } from 'react';
import { injectIntl } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Checkbox, Chip, TextField,
  FormControlLabel, Switch, CircularProgress,
} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SaveIcon from '@material-ui/icons/Save';
import {
  withModulesManager, formatMessage, useGraphqlQuery,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const VAGUE_PROVINCES = {
  1: ['Kirundo', 'Gitega', 'Karuzi', 'Ruyigi'],
  2: ['Ngozi', 'Muyinga', 'Muramvya', 'Mwaro'],
  3: ['Bujumbura Mairie', 'Bubanza', 'Cibitoke', 'Rumonge'],
  4: ['Kayanza', 'Bujumbura Rural', 'Makamba', 'Cankuzo', 'Bururi', 'Rutana'],
};

const styles = (theme) => ({
  paper: { padding: theme.spacing(2), marginTop: theme.spacing(1) },
  title: { fontWeight: 'bold', color: theme.palette.primary.main, marginBottom: theme.spacing(1) },
  configSection: { marginBottom: theme.spacing(2), padding: theme.spacing(2), backgroundColor: '#f5f5f5', borderRadius: 4 },
  headerCell: { fontWeight: 'bold', backgroundColor: theme.palette.primary.main, color: '#fff', padding: '8px 12px' },
  cell: { padding: '6px 12px' },
  vagueChip: { margin: theme.spacing(0.5), cursor: 'pointer' },
  vagueChipSelected: { margin: theme.spacing(0.5), cursor: 'pointer', backgroundColor: theme.palette.primary.main, color: '#fff' },
  provinceChip: { margin: theme.spacing(0.25), fontSize: '0.75rem' },
  provinceChipSelected: { margin: theme.spacing(0.25), fontSize: '0.75rem', backgroundColor: theme.palette.primary.light, color: '#fff' },
  summaryBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(1), marginTop: theme.spacing(1) },
  blocked: { color: theme.palette.error.main, fontWeight: 'bold' },
  topupInput: { width: 120 },
  actionButtons: { display: 'flex', gap: theme.spacing(1), alignItems: 'center' },
  emptyTable: { padding: theme.spacing(3), textAlign: 'center', color: theme.palette.text.secondary },
});

function CycleWorkspacePanel({ classes, intl, edited: paymentCycle }) {
  const cycleId = paymentCycle?.id || paymentCycle?.uuid;
  const [selectedVagues, setSelectedVagues] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [topupActive, setTopupActive] = useState(false);
  const [topupAmount, setTopupAmount] = useState(0);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load commune schedules linked to this cycle
  const scheduleQuery = `
    query($cycleId: ID!) {
      communePaymentSchedule(paymentCycle_Id: $cycleId, first: 200) {
        edges {
          node {
            id uuid roundNumber status dateValidFrom
            topupAmount totalBeneficiaries amountPerBeneficiary
            commune { id uuid name parent { id uuid name } }
            payroll { id uuid name status }
          }
        }
      }
    }
  `;
  const { data: scheduleData, refetch } = useGraphqlQuery(
    scheduleQuery,
    { cycleId: cycleId || '' },
    { skip: !cycleId },
  );

  useEffect(() => {
    if (scheduleData?.communePaymentSchedule?.edges) {
      setCommunes(scheduleData.communePaymentSchedule.edges.map((e) => {
        const n = e.node;
        return {
          id: n.uuid,
          commune: n.commune?.name || '',
          communeId: n.commune?.uuid,
          province: n.commune?.parent?.name || '',
          roundNumber: n.roundNumber,
          status: n.status,
          dateValidFrom: n.dateValidFrom || '',
          topupAmount: parseFloat(n.topupAmount) || 0,
          beneficiaries: n.totalBeneficiaries || 0,
          payrollStatus: n.payroll?.status,
          selected: true,
        };
      }));
    }
  }, [scheduleData]);

  // Load cycle json_ext config
  useEffect(() => {
    if (paymentCycle?.jsonExt) {
      try {
        const ext = typeof paymentCycle.jsonExt === 'string'
          ? JSON.parse(paymentCycle.jsonExt)
          : paymentCycle.jsonExt;
        setTopupActive(ext.topup_active || false);
        setTopupAmount(ext.topup_amount || 0);
        if (ext.vagues) setSelectedVagues(ext.vagues);
      } catch { /* ignore */ }
    }
  }, [paymentCycle]);

  // Derive provinces from selected vagues
  useEffect(() => {
    const provinces = [];
    selectedVagues.forEach((v) => {
      (VAGUE_PROVINCES[v] || []).forEach((p) => {
        if (!provinces.includes(p)) provinces.push(p);
      });
    });
    setSelectedProvinces(provinces);
  }, [selectedVagues]);

  const toggleVague = useCallback((v) => {
    setSelectedVagues((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }, []);

  const toggleProvince = useCallback((p) => {
    setSelectedProvinces((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }, []);

  const gqlFetch = useCallback(async (query, variables) => {
    const resp = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    return resp.json();
  }, []);

  const initializeCommunes = useCallback(async () => {
    if (!cycleId || selectedProvinces.length === 0) return;
    setLoading(true);

    // Resolve province UUIDs from names
    const provResult = await gqlFetch(
      `query($names: [String]!) {
        location(name_In: $names, type: "D", first: 20) {
          edges { node { uuid name } }
        }
      }`,
      { names: selectedProvinces },
    );
    const provIds = (provResult?.data?.location?.edges || []).map((e) => e.node.uuid);

    // Find benefit plan 1.2
    const bpResult = await gqlFetch(
      `query { benefitPlan(code: "1.2", isDeleted: false, first: 1) { edges { node { uuid } } } }`,
      {},
    );
    const bpId = bpResult?.data?.benefitPlan?.edges?.[0]?.node?.uuid;

    if (!bpId || provIds.length === 0) {
      setLoading(false);
      return;
    }

    await gqlFetch(
      `mutation($input: InitializeCycleCommunesMutationInput!) {
        initializeCycleCommunes(input: $input) { clientMutationId }
      }`,
      {
        input: {
          paymentCycleId: cycleId,
          benefitPlanId: bpId,
          provinceIds: provIds,
          topupActive: topupActive,
          topupAmount: topupActive ? topupAmount : 0,
          clientMutationId: `init-${Date.now()}`,
        },
      },
    );

    // Wait for async mutation then refetch
    setTimeout(() => { refetch(); setLoading(false); }, 2000);
  }, [cycleId, selectedProvinces, topupActive, topupAmount, gqlFetch, refetch]);

  const generatePayrolls = useCallback(async () => {
    if (!cycleId) return;
    setLoading(true);

    // Find payment plan for 1.2
    const ppResult = await gqlFetch(
      `query { paymentPlan(benefitPlan_Code: "1.2", isDeleted: false, first: 1) { edges { node { id } } } }`,
      {},
    );
    const ppId = ppResult?.data?.paymentPlan?.edges?.[0]?.node?.id;

    await gqlFetch(
      `mutation($input: BatchGeneratePayrollsMutationInput!) {
        batchGeneratePayrolls(input: $input) { clientMutationId }
      }`,
      {
        input: {
          paymentCycleId: cycleId,
          paymentPlanId: ppId || cycleId,
          clientMutationId: `gen-${Date.now()}`,
        },
      },
    );

    setTimeout(() => { refetch(); setLoading(false); }, 3000);
  }, [cycleId, gqlFetch, refetch]);

  // Filter communes by selected province
  const filteredCommunes = communes.filter((c) =>
    selectedProvinces.length === 0 || selectedProvinces.includes(c.province)
  );

  // Build preview table from selected provinces (before Initialize)
  const previewCommunes = selectedProvinces.length > 0 && communes.length === 0;

  const eligibleCount = filteredCommunes.filter((c) => c.status === 'PLANNING').length;
  const blockedCount = filteredCommunes.filter((c) =>
    c.status !== 'PLANNING' && c.status !== 'RECONCILED'
  ).length;

  // Cycle date for display
  const cycleStartDate = paymentCycle?.startDate || paymentCycle?.start_date || '';

  if (!cycleId) return null;

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6" className={classes.title}>
        {formatMessage(intl, MODULE_NAME, 'cycleWorkspace.title')}
      </Typography>

      {/* Config section */}
      <div className={classes.configSection}>
        <Grid container spacing={2} alignItems="center">
          {/* Vague selector */}
          <Grid item xs={12}>
            <Typography variant="subtitle2">Vagues</Typography>
            {[1, 2, 3, 4].map((v) => (
              <Chip
                key={v}
                label={`V${v}`}
                onClick={() => toggleVague(v)}
                className={selectedVagues.includes(v) ? classes.vagueChipSelected : classes.vagueChip}
                color={selectedVagues.includes(v) ? 'primary' : 'default'}
              />
            ))}
          </Grid>

          {/* Province chips */}
          <Grid item xs={12}>
            <Typography variant="subtitle2">Provinces</Typography>
            {Object.values(VAGUE_PROVINCES).flat().map((p) => (
              <Chip
                key={p}
                label={p}
                size="small"
                onClick={() => toggleProvince(p)}
                className={selectedProvinces.includes(p) ? classes.provinceChipSelected : classes.provinceChip}
                variant={selectedProvinces.includes(p) ? 'default' : 'outlined'}
              />
            ))}
          </Grid>

          {/* Top-up config + Initialize button */}
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={topupActive}
                  onChange={(e) => setTopupActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Top-up actif"
            />
          </Grid>
          {topupActive && (
            <Grid item xs={3}>
              <TextField
                label="Montant top-up (BIF)"
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
                size="small"
                className={classes.topupInput}
              />
            </Grid>
          )}
          <Grid item xs={topupActive ? 6 : 9}>
            <div className={classes.actionButtons}>
              {loading && <CircularProgress size={20} />}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SaveIcon />}
                onClick={initializeCommunes}
                disabled={loading || selectedProvinces.length === 0}
              >
                Initialiser les communes
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>

      {/* Commune table — show when we have data OR when provinces are selected */}
      {(communes.length > 0 || previewCommunes) ? (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerCell} padding="checkbox">
                  <Checkbox size="small" style={{ color: '#fff' }} />
                </TableCell>
                <TableCell className={classes.headerCell}>Province</TableCell>
                <TableCell className={classes.headerCell}>Commune</TableCell>
                <TableCell className={classes.headerCell}>Tranche</TableCell>
                <TableCell className={classes.headerCell}>Bénéf.</TableCell>
                <TableCell className={classes.headerCell}>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {communes.length > 0 ? (
                filteredCommunes.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell className={classes.cell} padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={c.selected}
                        onChange={() => setCommunes((prev) =>
                          prev.map((x) => x.id === c.id ? { ...x, selected: !x.selected } : x)
                        )}
                        disabled={c.status !== 'PLANNING'}
                      />
                    </TableCell>
                    <TableCell className={classes.cell}>{c.province}</TableCell>
                    <TableCell className={classes.cell}>{c.commune}</TableCell>
                    <TableCell className={classes.cell}>T{c.roundNumber}</TableCell>
                    <TableCell className={classes.cell}>{c.beneficiaries}</TableCell>
                    <TableCell className={classes.cell}>
                      <Chip
                        label={c.status}
                        size="small"
                        color={
                          c.status === 'RECONCILED' ? 'primary'
                            : c.status === 'PLANNING' ? 'default'
                              : 'secondary'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className={classes.emptyTable}>
                    {selectedProvinces.length} province(s) sélectionnée(s).
                    Cliquez "Initialiser les communes" pour créer les entrées de planification.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Summary bar */}
          {communes.length > 0 && (
            <div className={classes.summaryBar}>
              <Typography variant="body2">
                {eligibleCount}/{filteredCommunes.length} éligibles
                {blockedCount > 0 && <span className={classes.blocked}> · {blockedCount} bloquées</span>}
                {cycleStartDate && ` · Date début cycle: ${cycleStartDate}`}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={generatePayrolls}
                disabled={loading || eligibleCount === 0}
              >
                Générer les payrolls ({eligibleCount})
              </Button>
            </div>
          )}
        </>
      ) : (
        <Typography color="textSecondary" align="center" style={{ padding: 24 }}>
          Sélectionnez des vagues/provinces et cliquez "Initialiser les communes".
        </Typography>
      )}
    </Paper>
  );
}

export default withModulesManager(injectIntl(withStyles(styles)(CycleWorkspacePanel)));

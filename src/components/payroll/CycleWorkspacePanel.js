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
  withModulesManager, formatMessage, useGraphqlQuery, PublishedComponent, decodeId, useHistory,
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
  const history = useHistory();
  const [selectedVagues, setSelectedVagues] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [topupActive, setTopupActive] = useState(false);
  const [topupAmount, setTopupAmount] = useState(0);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);

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
          dateValidFrom: n.dateValidFrom || paymentCycle?.startDate || paymentCycle?.start_date || '',
          topupAmount: parseFloat(n.topupAmount) || 0,
          beneficiaries: n.totalBeneficiaries || 0,
          payrollId: n.payroll?.uuid,
          payrollStatus: n.payroll?.status,
          selected: n.status === 'PLANNING' && (n.totalBeneficiaries || 0) > 0,
        };
      }));
    }
  }, [scheduleData]);

  // Load cycle json_ext config (not in standard projection, fetch separately)
  useEffect(() => {
    if (!cycleId) return;
    gqlFetch(
      `query($id: ID) {
        paymentCycle(id: $id, first: 1) {
          edges { node { id jsonExt } }
        }
      }`,
      { id: cycleId },
    ).then((res) => {
      const raw = res?.data?.paymentCycle?.edges?.[0]?.node?.jsonExt;
      if (!raw) return;
      try {
        const ext = typeof raw === 'string' ? JSON.parse(raw) : raw;
        setTopupActive(ext.topup_active || false);
        setTopupAmount(ext.topup_amount || 0);
        if (ext.vagues) setSelectedVagues(ext.vagues);
        // Restore saved payment plan
        if (ext.payment_plan_id) {
          gqlFetch(
            `query($uuid: ID) {
              paymentPlan(id: $uuid, first: 1) {
                edges { node { id code name benefitPlan } }
              }
            }`,
            { uuid: ext.payment_plan_id },
          ).then((ppRes) => {
            const pp = ppRes?.data?.paymentPlan?.edges?.[0]?.node;
            if (pp) setSelectedPaymentPlan(pp);
          });
        }
      } catch { /* ignore */ }
    });
  }, [cycleId]);

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
    // Get CSRF token from cookie
    const csrfToken = document.cookie.split('; ')
      .find((c) => c.startsWith('csrftoken='))?.split('=')[1] || '';
    // Get JWT token from localStorage
    const token = localStorage.getItem('token') || '';
    const resp = await fetch('/api/graphql', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    return resp.json();
  }, []);

  const initializeCommunes = useCallback(async () => {
    if (!cycleId || selectedProvinces.length === 0 || !selectedPaymentPlan) return;
    setLoading(true);

    // Resolve province UUIDs from names (fetch all provinces, filter client-side)
    const provResult = await gqlFetch(
      `query {
        locations(type: "D", first: 20) {
          edges { node { uuid name } }
        }
      }`,
      {},
    );
    const provIds = (provResult?.data?.locations?.edges || [])
      .filter((e) => selectedProvinces.includes(e.node.name))
      .map((e) => e.node.uuid);

    // Resolve benefit plan UUID from payment plan
    const ppUuid = decodeId(selectedPaymentPlan.id);
    const ppResult = await gqlFetch(
      `query($uuid: ID) {
        paymentPlan(id: $uuid, first: 1) {
          edges { node { id benefitPlan } }
        }
      }`,
      { uuid: ppUuid },
    );
    let bpParsed = ppResult?.data?.paymentPlan?.edges?.[0]?.node?.benefitPlan;
    // benefitPlan is double-JSON-encoded: parse until we get an object
    while (typeof bpParsed === 'string') {
      try { bpParsed = JSON.parse(bpParsed); } catch { break; }
    }
    const bpId = (bpParsed && typeof bpParsed === 'object') ? bpParsed.id : null;

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
          paymentPlanId: decodeId(selectedPaymentPlan.id),
          vagues: selectedVagues,
          clientMutationId: `init-${Date.now()}`,
        },
      },
    );

    // Wait for async mutation then refetch
    setTimeout(() => { refetch(); setLoading(false); }, 2000);
  }, [cycleId, selectedProvinces, selectedPaymentPlan, topupActive, topupAmount, gqlFetch, refetch]);

  const generatePayrolls = useCallback(async () => {
    if (!cycleId || !selectedPaymentPlan) return;

    const eligible = communes.filter(
      (c) => c.selected && c.status === 'PLANNING' && c.beneficiaries > 0,
    );
    if (eligible.length === 0) return;

    setLoading(true);
    const ppId = decodeId(selectedPaymentPlan.id);

    await gqlFetch(
      `mutation($input: BatchGeneratePayrollsMutationInput!) {
        batchGeneratePayrolls(input: $input) { clientMutationId }
      }`,
      {
        input: {
          paymentCycleId: cycleId,
          paymentPlanId: ppId,
          scheduleIds: eligible.map((c) => c.id),
          clientMutationId: `gen-${Date.now()}`,
        },
      },
    );

    setTimeout(() => { refetch(); setLoading(false); }, 3000);
  }, [cycleId, selectedPaymentPlan, communes, gqlFetch, refetch]);

  // Filter communes by selected province
  const filteredCommunes = communes.filter((c) =>
    selectedProvinces.length === 0 || selectedProvinces.includes(c.province)
  );

  // Build preview table from selected provinces (before Initialize)
  const previewCommunes = selectedProvinces.length > 0 && communes.length === 0;

  const updateCommuneDate = useCallback((communeId, date) => {
    setCommunes((prev) =>
      prev.map((c) => (c.id === communeId ? { ...c, dateValidFrom: date } : c))
    );
  }, []);

  const saveDates = useCallback(async () => {
    const toUpdate = communes.filter((c) => c.status === 'PLANNING' && c.dateValidFrom);
    if (toUpdate.length === 0 || !cycleId) return;
    setLoading(true);

    // Group communes by date to minimize requests
    const byDate = {};
    toUpdate.forEach((c) => {
      if (!byDate[c.dateValidFrom]) byDate[c.dateValidFrom] = [];
      byDate[c.dateValidFrom].push(c.communeId);
    });

    for (const [date, communeIds] of Object.entries(byDate)) {
      await gqlFetch(
        `mutation($input: UpdateCommuneDatesBulkMutationInput!) {
          updateCommuneDatesBulk(input: $input) { clientMutationId }
        }`,
        {
          input: {
            paymentCycleId: cycleId,
            communeIds,
            dateValidFrom: date,
            clientMutationId: `dates-${Date.now()}`,
          },
        },
      );
    }

    setTimeout(() => { refetch(); setLoading(false); }, 1500);
  }, [communes, cycleId, gqlFetch, refetch]);

  const eligibleCount = filteredCommunes.filter(
    (c) => c.selected && c.status === 'PLANNING' && c.beneficiaries > 0,
  ).length;
  const blockedCount = filteredCommunes.filter((c) =>
    c.status !== 'PLANNING' && c.status !== 'RECONCILED'
  ).length;
  const noBeneficiariesCount = filteredCommunes.filter(
    (c) => c.status === 'PLANNING' && c.beneficiaries === 0,
  ).length;

  // Cycle date for display and as default payment date
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

          {/* Payment plan picker */}
          <Grid item xs={4}>
            <PublishedComponent
              pubRef="contributionPlan.PaymentPlanPicker"
              required
              filterLabels={false}
              onChange={(pp) => setSelectedPaymentPlan(pp)}
              value={selectedPaymentPlan}
            />
          </Grid>

          {/* Top-up config + Initialize button */}
          <Grid item xs={2}>
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
          <Grid item xs={topupActive ? 3 : 6}>
            <div className={classes.actionButtons}>
              {loading && <CircularProgress size={20} />}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SaveIcon />}
                onClick={initializeCommunes}
                disabled={loading || selectedProvinces.length === 0 || !selectedPaymentPlan}
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
                  <Checkbox
                    size="small"
                    style={{ color: '#fff' }}
                    checked={filteredCommunes.filter((c) => c.status === 'PLANNING' && c.beneficiaries > 0).length > 0
                      && filteredCommunes.filter((c) => c.status === 'PLANNING' && c.beneficiaries > 0).every((c) => c.selected)}
                    indeterminate={
                      filteredCommunes.filter((c) => c.status === 'PLANNING' && c.beneficiaries > 0).some((c) => c.selected)
                      && !filteredCommunes.filter((c) => c.status === 'PLANNING' && c.beneficiaries > 0).every((c) => c.selected)
                    }
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCommunes((prev) =>
                        prev.map((c) =>
                          (selectedProvinces.length === 0 || selectedProvinces.includes(c.province))
                          && c.status === 'PLANNING' && c.beneficiaries > 0
                            ? { ...c, selected: checked }
                            : c
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell className={classes.headerCell}>Province</TableCell>
                <TableCell className={classes.headerCell}>Commune</TableCell>
                <TableCell className={classes.headerCell}>Tranche</TableCell>
                <TableCell className={classes.headerCell}>Date de paiement</TableCell>
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
                        disabled={c.status !== 'PLANNING' || c.beneficiaries === 0}
                      />
                    </TableCell>
                    <TableCell className={classes.cell}>{c.province}</TableCell>
                    <TableCell className={classes.cell}>{c.commune}</TableCell>
                    <TableCell className={classes.cell}>T{c.roundNumber}</TableCell>
                    <TableCell className={classes.cell}>
                      {c.status === 'PLANNING' ? (
                        <TextField
                          type="date"
                          size="small"
                          value={c.dateValidFrom || ''}
                          onChange={(e) => updateCommuneDate(c.id, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ style: { fontSize: '0.85rem', padding: '4px 8px' } }}
                        />
                      ) : (
                        c.dateValidFrom || '—'
                      )}
                    </TableCell>
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
                        clickable={!!c.payrollId}
                        onClick={c.payrollId ? () => history.push(`/payrolls/payroll/${c.payrollId}`) : undefined}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className={classes.emptyTable}>
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
                {eligibleCount}/{filteredCommunes.length} sélectionnées
                {noBeneficiariesCount > 0 && <span className={classes.blocked}> · {noBeneficiariesCount} sans bénéficiaires</span>}
                {blockedCount > 0 && <span className={classes.blocked}> · {blockedCount} bloquées</span>}
                {cycleStartDate && ` · Date début cycle: ${cycleStartDate}`}
              </Typography>
              <div className={classes.actionButtons}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveDates}
                  disabled={loading || communes.filter((c) => c.status === 'PLANNING' && c.dateValidFrom).length === 0}
                >
                  Enregistrer les dates
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={generatePayrolls}
                  disabled={loading || eligibleCount === 0 || !selectedPaymentPlan}
                >
                  Générer les payrolls ({eligibleCount})
                </Button>
              </div>
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

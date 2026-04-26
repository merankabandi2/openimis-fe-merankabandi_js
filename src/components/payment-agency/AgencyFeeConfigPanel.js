import React, { useEffect, useState, useCallback } from 'react';
import { injectIntl } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Switch, IconButton, MenuItem, Fab, Paper,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import {
  withModulesManager, formatMessage, useGraphqlQuery, useGraphqlMutation,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const styles = (theme) => ({
  paper: { ...theme.paper.paper, padding: theme.spacing(2), marginTop: theme.spacing(1) },
  title: { ...theme.paper.item, fontWeight: 'bold', color: theme.palette.primary.main, marginBottom: theme.spacing(1) },
  table: { minWidth: 600 },
  headerCell: { fontWeight: 'bold', backgroundColor: theme.palette.primary.main, color: '#fff' },
  inputCell: { padding: '4px 8px' },
  rateInput: { width: 100 },
  fab: { position: 'fixed', bottom: theme.spacing(3), right: theme.spacing(10) },
});

const BENEFIT_PLAN_QUERY = `
  query {
    benefitPlan(isDeleted: false, first: 20) {
      edges { node { id uuid code name } }
    }
  }
`;

function AgencyFeeConfigPanel({ classes, intl, edited }) {
  const agencyId = edited?.uuid || edited?.id;
  const [configs, setConfigs] = useState([]);
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [dirty, setDirty] = useState(false);

  // Fetch benefit plans
  const { data: bpData } = useGraphqlQuery(BENEFIT_PLAN_QUERY, {}, { skip: false });
  useEffect(() => {
    if (bpData?.benefitPlan?.edges) {
      setBenefitPlans(bpData.benefitPlan.edges.map((e) => e.node));
    }
  }, [bpData]);

  // Fetch existing fee configs for this agency
  const feeQuery = `
    query($agencyId: ID!) {
      agencyFeeConfig(paymentAgency_Id: $agencyId, first: 50) {
        edges {
          node {
            id uuid feeRate feeIncluded isActive
            benefitPlan { id uuid code name }
            province { id uuid name }
          }
        }
      }
    }
  `;
  const { data: feeData, refetch } = useGraphqlQuery(
    feeQuery,
    { agencyId: agencyId || '' },
    { skip: !agencyId },
  );

  useEffect(() => {
    if (feeData?.agencyFeeConfig?.edges) {
      setConfigs(feeData.agencyFeeConfig.edges.map((e) => ({
        id: e.node.uuid,
        benefitPlanId: e.node.benefitPlan?.uuid,
        benefitPlanCode: e.node.benefitPlan?.code,
        provinceId: e.node.province?.uuid || null,
        provinceName: e.node.province?.name || '',
        feeRate: parseFloat(e.node.feeRate) * 100,
        feeIncluded: e.node.feeIncluded,
        isActive: e.node.isActive,
        isNew: false,
      })));
    }
  }, [feeData]);

  const addRow = useCallback(() => {
    setConfigs((prev) => [
      ...prev,
      {
        id: null,
        benefitPlanId: benefitPlans[0]?.uuid || '',
        benefitPlanCode: benefitPlans[0]?.code || '',
        provinceId: null,
        provinceName: '',
        feeRate: 5.5,
        feeIncluded: false,
        isActive: true,
        isNew: true,
      },
    ]);
    setDirty(true);
  }, [benefitPlans]);

  const updateRow = useCallback((idx, field, value) => {
    setConfigs((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    setDirty(true);
  }, []);

  // Shared GraphQL fetch helper. The backend's CSRF guard
  // (core/schema._check_csrf_token) reads request.META['HTTP_X_CSRFTOKEN']
  // and raises KeyError when the header is absent — the resulting GraphQL
  // error surfaces as `'HTTP_X_CSRFTOKEN'`. We mirror the same pattern used
  // in CycleWorkspacePanel: pull the token from localStorage and send it
  // alongside X-Requested-With.
  const gqlFetch = useCallback(async (query, variables) => {
    const csrfToken = localStorage.getItem('csrfToken') || '';
    const resp = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    return resp.json();
  }, []);

  const deleteRow = useCallback((idx) => {
    const row = configs[idx];
    if (row.id && !row.isNew) {
      gqlFetch(
        `mutation($input: DeleteAgencyFeeConfigMutationInput!) {
          deleteAgencyFeeConfig(input: $input) { clientMutationId }
        }`,
        { input: { ids: [row.id], clientMutationId: `del-${Date.now()}` } },
      ).then(() => refetch());
    }
    setConfigs((prev) => prev.filter((_, i) => i !== idx));
  }, [configs, refetch, gqlFetch]);

  const saveAll = useCallback(async () => {
    for (const row of configs) {
      const input = {
        paymentAgencyId: agencyId,
        benefitPlanId: row.benefitPlanId,
        feeRate: (row.feeRate / 100).toFixed(4),
        feeIncluded: row.feeIncluded,
        isActive: row.isActive,
      };
      if (row.provinceId) input.provinceId = row.provinceId;

      if (row.isNew) {
        await gqlFetch(
          `mutation($input: CreateAgencyFeeConfigMutationInput!) {
            createAgencyFeeConfig(input: $input) { clientMutationId }
          }`,
          { input: { ...input, clientMutationId: `create-${Date.now()}` } },
        );
      } else if (row.id) {
        await gqlFetch(
          `mutation($input: UpdateAgencyFeeConfigMutationInput!) {
            updateAgencyFeeConfig(input: $input) { clientMutationId }
          }`,
          { input: { ...input, id: row.id, clientMutationId: `update-${Date.now()}` } },
        );
      }
    }
    setDirty(false);
    refetch();
  }, [configs, agencyId, refetch, gqlFetch]);

  if (!agencyId) return null;

  return (
    <Paper className={classes.paper}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography className={classes.title}>
          {formatMessage(intl, MODULE_NAME, 'paymentAgency.feeConfig.title')}
        </Typography>
        <div>
          {dirty && (
            <IconButton color="primary" onClick={saveAll} title="Sauvegarder">
              <SaveIcon />
            </IconButton>
          )}
          <IconButton color="primary" onClick={addRow} title="Ajouter">
            <AddIcon />
          </IconButton>
        </div>
      </Grid>

      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headerCell}>Programme</TableCell>
            <TableCell className={classes.headerCell}>Province (optionnel)</TableCell>
            <TableCell className={classes.headerCell}>Taux (%)</TableCell>
            <TableCell className={classes.headerCell}>Frais inclus</TableCell>
            <TableCell className={classes.headerCell}>Actif</TableCell>
            <TableCell className={classes.headerCell}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {configs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {formatMessage(intl, MODULE_NAME, 'paymentAgency.feeConfig.empty')}
              </TableCell>
            </TableRow>
          )}
          {configs.map((row, idx) => (
            <TableRow key={row.id || `new-${idx}`}>
              <TableCell className={classes.inputCell}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={row.benefitPlanId || ''}
                  onChange={(e) => {
                    const bp = benefitPlans.find((b) => b.uuid === e.target.value);
                    updateRow(idx, 'benefitPlanId', e.target.value);
                    updateRow(idx, 'benefitPlanCode', bp?.code || '');
                  }}
                >
                  {benefitPlans.map((bp) => (
                    <MenuItem key={bp.uuid} value={bp.uuid}>{bp.code} — {bp.name}</MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell className={classes.inputCell}>
                <TextField
                  fullWidth
                  size="small"
                  value={row.provinceName}
                  placeholder="Défaut (toutes)"
                  disabled
                />
              </TableCell>
              <TableCell className={classes.inputCell}>
                <TextField
                  type="number"
                  size="small"
                  className={classes.rateInput}
                  value={row.feeRate}
                  onChange={(e) => updateRow(idx, 'feeRate', parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 0.01, min: 0, max: 100 }}
                />
              </TableCell>
              <TableCell className={classes.inputCell}>
                <Switch
                  checked={row.feeIncluded}
                  onChange={(e) => updateRow(idx, 'feeIncluded', e.target.checked)}
                  color="primary"
                  size="small"
                />
              </TableCell>
              <TableCell className={classes.inputCell}>
                <Switch
                  checked={row.isActive}
                  onChange={(e) => updateRow(idx, 'isActive', e.target.checked)}
                  color="primary"
                  size="small"
                />
              </TableCell>
              <TableCell className={classes.inputCell}>
                <IconButton size="small" onClick={() => deleteRow(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default withModulesManager(injectIntl(withStyles(styles)(AgencyFeeConfigPanel)));

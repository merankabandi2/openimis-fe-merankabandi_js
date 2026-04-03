import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton,
} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage, formatMutation, PublishedComponent } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { applyQuotaSelection } from '../../wizard-actions';

function WizardQuotaSelectionPanel({ intl, benefitPlanId, dispatch }) {
  const [loading, setLoading] = useState(false);
  const [quotas, setQuotas] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newQuota, setNewQuota] = useState({ location: null, quota: '', multiplier: '2.0', round: '1' });
  const [addingQuota, setAddingQuota] = useState(false);

  const fetchQuotas = useCallback(() => {
    setLoading(true);
    const query = `{
      selectionQuota(benefitPlan_Id: "${benefitPlanId}", first: 100) {
        edges { node { id quota collectMultiplier targetingRound location { id name code } } }
      }
    }`;
    dispatch(graphql(query, 'MERANKABANDI_WIZARD_QUOTAS'))
      .then((result) => {
        const data = result?.payload?.data?.selectionQuota;
        if (data) {
          setQuotas((data.edges || []).map((e) => e.node));
        }
      })
      .finally(() => setLoading(false));
  }, [benefitPlanId, dispatch]);

  useEffect(() => {
    if (benefitPlanId) fetchQuotas();
  }, [benefitPlanId, fetchQuotas]);

  const handleApplySelection = () => {
    setSubmitting(true);
    dispatch(applyQuotaSelection(benefitPlanId))
      .then(() => fetchQuotas())
      .finally(() => setSubmitting(false));
  };

  const handleAddQuota = () => {
    if (!newQuota.location || !newQuota.quota) return;
    setAddingQuota(true);
    const locationId = newQuota.location.uuid || newQuota.location.id;
    const mutation = formatMutation(
      'createSelectionQuota',
      `benefitPlanId: "${benefitPlanId}", locationId: "${locationId}", quota: ${parseInt(newQuota.quota, 10)}, collectMultiplier: ${parseFloat(newQuota.multiplier)}, targetingRound: ${parseInt(newQuota.round, 10)}`,
      ['clientMutationId'],
    );
    dispatch(graphql(mutation.payload, 'MERANKABANDI_CREATE_QUOTA', {
      clientMutationId: mutation.clientMutationId,
    }))
      .then(() => {
        setShowAddDialog(false);
        setNewQuota({ location: null, quota: '', multiplier: '2.0', round: '1' });
        fetchQuotas();
      })
      .finally(() => setAddingQuota(false));
  };

  const handleDeleteQuota = (quotaId) => {
    const mutation = formatMutation(
      'deleteSelectionQuota',
      `ids: ["${quotaId}"]`,
      ['clientMutationId'],
    );
    dispatch(graphql(mutation.payload, 'MERANKABANDI_DELETE_QUOTA', {
      clientMutationId: mutation.clientMutationId,
    }))
      .then(() => fetchQuotas());
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="textSecondary">
          {quotas.length} {formatMessage(intl, MODULE_NAME, 'wizard.quota.collines')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
            style={{ marginRight: 8 }}
          >
            {formatMessage(intl, MODULE_NAME, 'wizard.quota.add')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleApplySelection}
            disabled={submitting || quotas.length === 0}
          >
            {formatMessage(intl, MODULE_NAME, 'wizard.action.applyQuotas')}
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.colline')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.quota')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.multiplier')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.round')}</TableCell>
              <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'wizard.column.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotas.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.location?.name}</TableCell>
                <TableCell align="right">{q.quota}</TableCell>
                <TableCell align="right">{q.collectMultiplier}x</TableCell>
                <TableCell align="right">{q.targetingRound}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleDeleteQuota(q.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formatMessage(intl, MODULE_NAME, 'wizard.quota.addTitle')}</DialogTitle>
        <DialogContent>
          <Box mb={2} mt={1}>
            <PublishedComponent
              pubRef="location.LocationPicker"
              onChange={(location) => setNewQuota((prev) => ({ ...prev, location }))}
              value={newQuota.location}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={formatMessage(intl, MODULE_NAME, 'wizard.column.quota')}
              type="number"
              fullWidth
              value={newQuota.quota}
              onChange={(e) => setNewQuota((prev) => ({ ...prev, quota: e.target.value }))}
              inputProps={{ min: 1 }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={formatMessage(intl, MODULE_NAME, 'wizard.column.multiplier')}
              type="number"
              fullWidth
              value={newQuota.multiplier}
              onChange={(e) => setNewQuota((prev) => ({ ...prev, multiplier: e.target.value }))}
              inputProps={{ min: 1, step: 0.1 }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={formatMessage(intl, MODULE_NAME, 'wizard.column.round')}
              type="number"
              fullWidth
              value={newQuota.round}
              onChange={(e) => setNewQuota((prev) => ({ ...prev, round: e.target.value }))}
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)} disabled={addingQuota}>
            {formatMessage(intl, MODULE_NAME, 'wizard.quota.cancel')}
          </Button>
          <Button
            onClick={handleAddQuota}
            color="primary"
            variant="contained"
            disabled={addingQuota || !newQuota.location || !newQuota.quota}
          >
            {addingQuota ? <CircularProgress size={20} /> : formatMessage(intl, MODULE_NAME, 'wizard.quota.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default injectIntl(WizardQuotaSelectionPanel);

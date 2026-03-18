import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, CircularProgress,
} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { applyQuotaSelection } from '../../wizard-actions';

function WizardQuotaSelectionPanel({ intl, benefitPlanId, dispatch }) {
  const [loading, setLoading] = useState(false);
  const [quotas, setQuotas] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuotas = useCallback(() => {
    setLoading(true);
    const query = `{
      selectionQuota(benefitPlan_Id: "${benefitPlanId}", first: 100) {
        edges { node { id quota collectMultiplier targetingRound location { name code } } }
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

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="textSecondary">
          {quotas.length} {formatMessage(intl, MODULE_NAME, 'wizard.quota.collines')}
        </Typography>
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
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.colline')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.quota')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.multiplier')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.round')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotas.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.location?.name}</TableCell>
                <TableCell align="right">{q.quota}</TableCell>
                <TableCell align="right">{q.collectMultiplier}x</TableCell>
                <TableCell align="right">{q.targetingRound}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default injectIntl(WizardQuotaSelectionPanel);

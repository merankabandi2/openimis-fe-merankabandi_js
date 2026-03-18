import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Button, Grid, CircularProgress,
} from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { enrollValidatedBeneficiaries } from '../../wizard-actions';

function WizardSummaryPanel({ intl, benefitPlan, selectedLocation, dispatch }) {
  const [counts, setCounts] = useState({ potential: 0, validated: 0, suspended: 0, active: 0 });
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!benefitPlan?.id) return;
    setLoading(true);
    const statuses = ['POTENTIAL', 'VALIDATED', 'SUSPENDED', 'ACTIVE'];
    Promise.all(
      statuses.map((status) => {
        const query = `{ groupBeneficiary(benefitPlan_Id: "${benefitPlan.id}", status: ${status}, first: 0) { totalCount } }`;
        return dispatch(graphql(query, `MERANKABANDI_WIZARD_COUNT_${status}`))
          .then((r) => r?.payload?.data?.groupBeneficiary?.totalCount || 0);
      }),
    ).then(([potential, validated, suspended, active]) => {
      setCounts({ potential, validated, suspended, active });
    }).finally(() => setLoading(false));
  }, [benefitPlan?.id, dispatch]);

  const handleEnroll = () => {
    setEnrolling(true);
    dispatch(enrollValidatedBeneficiaries(benefitPlan.id))
      .finally(() => setEnrolling(false));
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Paper style={{ padding: 16, marginBottom: 16 }}>
        <Typography variant="h6" gutterBottom>
          {benefitPlan?.name} ({benefitPlan?.code})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {selectedLocation?.name || formatMessage(intl, MODULE_NAME, 'wizard.summary.allLocations')}
        </Typography>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h4">{counts.potential}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.potential')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h4" style={{ color: '#4caf50' }}>{counts.validated}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.validated')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h4" style={{ color: '#f44336' }}>{counts.suspended}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.suspended')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h4" style={{ color: '#2196f3' }}>{counts.active}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.active')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PersonAddIcon />}
          onClick={handleEnroll}
          disabled={counts.validated === 0 || enrolling}
        >
          {enrolling
            ? formatMessage(intl, MODULE_NAME, 'wizard.action.enrolling')
            : formatMessage(intl, MODULE_NAME, 'wizard.action.confirmEnrollment')}
          {counts.validated > 0 && ` (${counts.validated})`}
        </Button>
      </Box>
    </Box>
  );
}

export default injectIntl(WizardSummaryPanel);

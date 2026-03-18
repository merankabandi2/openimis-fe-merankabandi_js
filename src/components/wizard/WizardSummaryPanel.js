import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Button, Grid, CircularProgress,
} from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME, SELECTION_STATUS } from '../../constants';
import { promoteToBeneficiary } from '../../wizard-actions';

function WizardSummaryPanel({ intl, benefitPlan, selectedLocation, dispatch }) {
  const [counts, setCounts] = useState({
    selected: 0, waitingList: 0, communityValidated: 0, active: 0,
  });
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!benefitPlan?.id) return;
    setLoading(true);
    // Count groups by selection_status in json_ext
    const statusQueries = [
      { key: 'selected', status: SELECTION_STATUS.SELECTED },
      { key: 'waitingList', status: SELECTION_STATUS.WAITING_LIST },
      { key: 'communityValidated', status: SELECTION_STATUS.COMMUNITY_VALIDATED },
    ];
    const promises = statusQueries.map(({ status }) => {
      const query = `{ individualGroup(benefitPlan_Id: "${benefitPlan.id}", jsonExt_Icontains: "\\"selection_status\\": \\"${status}\\"", first: 0) { totalCount } }`;
      return dispatch(graphql(query, `MERANKABANDI_WIZARD_COUNT_${status}`))
        .then((r) => r?.payload?.data?.individualGroup?.totalCount || 0);
    });
    // Also count active GroupBeneficiaries
    promises.push(
      dispatch(graphql(`{ groupBeneficiary(benefitPlan_Id: "${benefitPlan.id}", status: ACTIVE, first: 0) { totalCount } }`, 'MERANKABANDI_WIZARD_COUNT_ACTIVE'))
        .then((r) => r?.payload?.data?.groupBeneficiary?.totalCount || 0),
    );
    Promise.all(promises).then(([selected, waitingList, communityValidated, active]) => {
      setCounts({ selected, waitingList, communityValidated, active });
    }).finally(() => setLoading(false));
  }, [benefitPlan?.id, dispatch]);

  const handlePromote = () => {
    setEnrolling(true);
    dispatch(promoteToBeneficiary(benefitPlan.id))
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
            <Typography variant="h4">{counts.selected}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.selected')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h4" style={{ color: '#ff9800' }}>{counts.waitingList}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.waitingList')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h4" style={{ color: '#4caf50' }}>{counts.communityValidated}</Typography>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.validated')}
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
          onClick={handlePromote}
          disabled={(counts.communityValidated === 0 && counts.selected === 0) || enrolling}
        >
          {enrolling
            ? formatMessage(intl, MODULE_NAME, 'wizard.action.enrolling')
            : formatMessage(intl, MODULE_NAME, 'wizard.action.confirmEnrollment')}
          {counts.communityValidated > 0 && ` (${counts.communityValidated})`}
        </Button>
      </Box>
    </Box>
  );
}

export default injectIntl(WizardSummaryPanel);

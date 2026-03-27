import React from 'react';
import { Box, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ListAltIcon from '@material-ui/icons/ListAlt';

import {
  Helmet,
  useModulesManager,
  useTranslations,
  useHistory,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  ROUTE_ME_MONETARY_TRANSFERS_LIST,
} from '../constants';
import TransfertDashboard from '../components/dashboard/TransfertDashboard';

const useStyles = makeStyles((theme) => ({
  page: {
    ...theme.page,
    display: 'flex',
    flexDirection: 'column',
  },
  navButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(1, 2, 0, 2),
  },
  dashboardContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));

function MonetaryTransfersPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const handleNavigateToList = () => {
    history.push(`/${ROUTE_ME_MONETARY_TRANSFERS_LIST}`);
  };

  return (
    <div className={classes.page} data-testid="monetary-transfers-page">
      <Helmet title={formatMessage('monetaryTransfer.page.title')} />

      {/* Navigation to external payments list */}
      <Box className={classes.navButtonContainer}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ListAltIcon />}
          onClick={handleNavigateToList}
          data-testid="view-external-payments-button"
        >
          {formatMessage('dashboard.transfers.viewExternalPayments')}
        </Button>
      </Box>

      {/* Dashboard Section */}
      <Box className={classes.dashboardContainer} data-testid="dashboard-section">
        <TransfertDashboard />
      </Box>
    </div>
  );
}

export default MonetaryTransfersPage;

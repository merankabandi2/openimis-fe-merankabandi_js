import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet, useModulesManager, useTranslations } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import GrievanceTaskSearcher from '../components/grievance-workflow/GrievanceTaskSearcher';

const MODULE_NAME = 'merankabandi';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function MyTasksPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const userId = useSelector((state) => state.core?.user?.i_user?.id);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('workflow.myTasks.title')} />
      <GrievanceTaskSearcher
        assignedUserId={userId}
        statusFilter={['IN_PROGRESS', 'PENDING']}
      />
    </div>
  );
}

export default MyTasksPage;

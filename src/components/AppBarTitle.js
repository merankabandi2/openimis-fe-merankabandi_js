import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { useTranslations, useModulesManager } from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';

const useStyles = makeStyles(() => ({
  title: {
    color: '#fff',
    textTransform: 'none',
    fontSize: '1.75rem',
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 400,
    margin: 0,
  },
}));

function AppBarTitle() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <h1 className={classes.title}>
      {formatMessage('appName')}
    </h1>
  );
}

export default AppBarTitle;

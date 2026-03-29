import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Helmet,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import LocationDetailPage from '../components/geography/LocationDetailPage';

const useStyles = makeStyles((theme) => ({
  page: {
    ...theme.page,
  },
}));

function CollineDetailPage({ match }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const uuid = match?.params?.uuid;

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('geography.detail.title')} />
      <LocationDetailPage locationUuid={uuid} />
    </div>
  );
}

export default CollineDetailPage;

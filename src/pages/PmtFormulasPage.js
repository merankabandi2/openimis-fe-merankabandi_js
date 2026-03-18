import React from 'react';
import { useSelector } from 'react-redux';

import { Fab } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';

import {
  Helmet,
  useModulesManager,
  useTranslations,
  useHistory,
  withTooltip,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  ROUTE_PMT_FORMULA,
  RIGHT_BENEFIT_PLAN_CREATE,
  RIGHT_BENEFIT_PLAN_SEARCH,
} from '../constants';
import PmtFormulaSearcher from '../components/pmt/PmtFormulaSearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function PmtFormulasPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const onCreate = () => history.push(`/${ROUTE_PMT_FORMULA}`);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('pmtFormula.page.title')} />
      {rights.includes(RIGHT_BENEFIT_PLAN_SEARCH)
        && <PmtFormulaSearcher />}
      {rights.includes(RIGHT_BENEFIT_PLAN_CREATE)
        && withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onCreate}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage('tooltip.createButton'),
        )}
    </div>
  );
}

export default PmtFormulasPage;

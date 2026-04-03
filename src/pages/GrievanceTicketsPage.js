import React from 'react';
import { useSelector } from 'react-redux';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/styles';
import {
  Helmet, useHistory, useModulesManager, useTranslations, withTooltip,
} from '@openimis/fe-core';
import TicketSearcherCustom from '../components/grievance/TicketSearcherCustom';
import { ROUTE_GRIEVANCE_DETAIL, ROUTE_GRIEVANCE_NEW_TICKET } from '../constants';

const MODULE_NAME = 'grievanceSocialProtection';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function GrievanceTicketsPage() {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);

  const onDoubleClick = (ticket) => {
    const id = ticket.id?.includes?.('==') ? atob(ticket.id).split(':').pop() : ticket.id;
    history.push(`/${ROUTE_GRIEVANCE_DETAIL}/${id}`);
  };

  const onAdd = () => history.push(`/${ROUTE_GRIEVANCE_NEW_TICKET}`);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('ticketsPage.title')} />
      <TicketSearcherCustom
        cacheFiltersKey="ticketPageFiltersCache"
        onDoubleClick={onDoubleClick}
      />
      {rights.includes(127001) && withTooltip(
        <div className={classes.fab}>
          <Fab color="primary" onClick={onAdd}>
            <AddIcon />
          </Fab>
        </div>,
        formatMessage('addNewticketTooltip'),
      )}
    </div>
  );
}

export default GrievanceTicketsPage;

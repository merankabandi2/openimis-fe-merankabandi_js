import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet, Searcher, useModulesManager, useTranslations, useHistory } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import { Chip, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fetchRoleAssignments } from '../actions';
import { ROUTE_GRIEVANCE_ROLE_ASSIGNMENT, RIGHT_GRIEVANCE_WORKFLOW_ADMIN } from '../constants';

const MODULE_NAME = 'merankabandi';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function RoleAssignmentsPage({
  fetchRoleAssignments,
  fetchingRoleAssignments,
  roleAssignments,
  roleAssignmentsPageInfo,
  roleAssignmentsTotalCount,
  rights,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();

  const headers = () => [
    'workflow.role.role',
    'workflow.role.user',
    'workflow.role.location',
    'workflow.role.isActive',
  ];

  const sorts = () => [
    ['role', true],
    null,
    null,
    ['isActive', true],
  ];

  const itemFormatters = () => [
    (r) => <Chip label={r.role} size="small" variant="outlined" />,
    (r) => r.userName || '-',
    (r) => r.location ? `${r.location.name} (${r.location.code})` : formatMessage('workflow.role.global'),
    (r) => (
      <Chip
        label={r.isActive ? formatMessage('workflow.role.active') : formatMessage('workflow.role.inactive')}
        color={r.isActive ? 'primary' : 'default'}
        size="small"
      />
    ),
  ];

  const onDoubleClick = (assignment) => {
    history.push(`/${ROUTE_GRIEVANCE_ROLE_ASSIGNMENT}/${assignment.id}`);
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('workflow.roles.title')} />
      <Searcher
        module="merankabandi"
        fetch={fetchRoleAssignments}
        items={roleAssignments}
        itemsPageInfo={roleAssignmentsPageInfo}
        fetchedItems={!fetchingRoleAssignments}
        fetchingItems={fetchingRoleAssignments}
        tableTitle={formatMessageWithValues('workflow.roles.searcherTitle', { count: roleAssignmentsTotalCount ?? 0 })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowIdentifier={(r) => r.id}
        onDoubleClick={onDoubleClick}
      />
      {rights?.includes(RIGHT_GRIEVANCE_WORKFLOW_ADMIN) && (
        <Fab
          color="primary"
          className={classes.fab}
          onClick={() => history.push(`/${ROUTE_GRIEVANCE_ROLE_ASSIGNMENT}`)}
        >
          <AddIcon />
        </Fab>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  roleAssignments: state.merankabandi.roleAssignments,
  roleAssignmentsPageInfo: state.merankabandi.roleAssignmentsPageInfo,
  fetchingRoleAssignments: state.merankabandi.fetchingRoleAssignments,
  roleAssignmentsTotalCount: state.merankabandi.roleAssignmentsTotalCount,
  rights: state.core?.user?.i_user?.rights ?? [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchRoleAssignments,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RoleAssignmentsPage);

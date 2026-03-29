import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet, Searcher, useModulesManager, useTranslations } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import { Chip } from '@material-ui/core';
import { fetchRoleAssignments } from '../actions';

const MODULE_NAME = 'merankabandi';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function RoleAssignmentsPage({
  fetchRoleAssignments,
  fetchingRoleAssignments,
  roleAssignments,
  roleAssignmentsPageInfo,
  roleAssignmentsTotalCount,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

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
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  roleAssignments: state.merankabandi.roleAssignments,
  roleAssignmentsPageInfo: state.merankabandi.roleAssignmentsPageInfo,
  fetchingRoleAssignments: state.merankabandi.fetchingRoleAssignments,
  roleAssignmentsTotalCount: state.merankabandi.roleAssignmentsTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchRoleAssignments,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RoleAssignmentsPage);

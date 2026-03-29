import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Chip, IconButton, Tooltip } from '@material-ui/core';
import { CheckCircle, Visibility } from '@material-ui/icons';
import { Searcher, useModulesManager, useTranslations, useHistory } from '@openimis/fe-core';
import { fetchGrievanceTasks } from '../../actions';

const MODULE_NAME = 'merankabandi';

const STATUS_COLORS = {
  COMPLETED: '#4caf50',
  IN_PROGRESS: '#2196f3',
  BLOCKED: '#9e9e9e',
  SKIPPED: '#bdbdbd',
  PENDING: '#ff9800',
};

function GrievanceTaskSearcher({
  fetchGrievanceTasks,
  fetchingGrievanceTasks,
  grievanceTasks,
  grievanceTasksPageInfo,
  grievanceTasksTotalCount,
  assignedUserId,
  statusFilter,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();

  const fetchData = useCallback((params) => {
    const filters = [...params];
    if (assignedUserId) filters.push(`assignedUser_Id: "${assignedUserId}"`);
    if (statusFilter) filters.push(`status_In: [${statusFilter.map((s) => `"${s}"`).join(',')}]`);
    fetchGrievanceTasks(filters);
  }, [assignedUserId, statusFilter]);

  const headers = () => [
    'workflow.task.stepLabel',
    'workflow.task.ticket',
    'workflow.task.workflow',
    'workflow.task.status',
    'workflow.task.assignedRole',
    'workflow.task.dueDate',
    'emptyLabel',
  ];

  const sorts = () => [
    ['stepLabel', false],
    null,
    null,
    ['status', true],
    ['assignedRole', true],
    ['dueDate', true],
  ];

  const itemFormatters = () => [
    (task) => task.stepLabel,
    (task) => task.ticket ? `${task.ticket.code} - ${task.ticket.title}` : '-',
    (task) => task.workflow?.templateLabel || '-',
    (task) => (
      <Chip
        label={task.status}
        size="small"
        style={{ backgroundColor: STATUS_COLORS[task.status] || '#9e9e9e', color: '#fff' }}
      />
    ),
    (task) => <Chip label={task.assignedRole} size="small" variant="outlined" />,
    (task) => {
      if (!task.dueDate) return '-';
      const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'IN_PROGRESS';
      return (
        <span style={{ color: isOverdue ? '#f44336' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
        </span>
      );
    },
    (task) => (
      <Tooltip title={formatMessage('workflow.task.viewTicket')}>
        <IconButton size="small" onClick={() => history.push(`/grievance/ticket/${task.ticket?.id}`)}>
          <Visibility />
        </IconButton>
      </Tooltip>
    ),
  ];

  return (
    <Searcher
      module="merankabandi"
      fetch={fetchData}
      items={grievanceTasks}
      itemsPageInfo={grievanceTasksPageInfo}
      fetchedItems={!fetchingGrievanceTasks}
      fetchingItems={fetchingGrievanceTasks}
      tableTitle={formatMessageWithValues('workflow.task.searcherTitle', { count: grievanceTasksTotalCount ?? 0 })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowIdentifier={(task) => task.id}
    />
  );
}

const mapStateToProps = (state) => ({
  grievanceTasks: state.merankabandi.grievanceTasks,
  grievanceTasksPageInfo: state.merankabandi.grievanceTasksPageInfo,
  fetchingGrievanceTasks: state.merankabandi.fetchingGrievanceTasks,
  grievanceTasksTotalCount: state.merankabandi.grievanceTasksTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGrievanceTasks,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GrievanceTaskSearcher);

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@material-ui/core';
import { CheckCircle, Visibility, SkipNext, AssignmentInd } from '@material-ui/icons';
import { Searcher, useModulesManager, useTranslations, useHistory, journalize, PublishedComponent, decodeId } from '@openimis/fe-core';
import { fetchGrievanceTasks, completeGrievanceTask, skipGrievanceTask, reassignGrievanceTask } from '../../actions';

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
  completeGrievanceTask,
  skipGrievanceTask,
  reassignGrievanceTask,
  journalize: dispatchJournalize,
  submittingMutation,
  mutation,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();

  const [reassignDialogTask, setReassignDialogTask] = useState(null);
  const [reassignUser, setReassignUser] = useState(null);
  const prevSubmittingRef = useRef();

  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      dispatchJournalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingRef.current = submittingMutation;
  });

  const fetchData = useCallback((params) => {
    const filters = [...params];
    if (assignedUserId) filters.push(`assignedUser_Id: "${assignedUserId}"`);
    if (statusFilter) filters.push(`status_In: [${statusFilter.map((s) => s).join(',')}]`);
    fetchGrievanceTasks(filters);
  }, [assignedUserId, statusFilter]);

  const handleComplete = (task) => {
    completeGrievanceTask(
      task.id,
      null,
      formatMessage('workflow.task.completeLabel'),
    );
  };

  const handleSkip = (task) => {
    skipGrievanceTask(
      task.id,
      null,
      formatMessage('workflow.task.skipLabel'),
    );
  };

  const handleReassignConfirm = () => {
    if (reassignDialogTask && reassignUser) {
      const userId = typeof reassignUser.id === 'string' && reassignUser.id.includes('VXN')
        ? decodeId(reassignUser.id)
        : reassignUser.id;
      reassignGrievanceTask(
        reassignDialogTask.id,
        userId,
        formatMessage('workflow.task.reassignLabel'),
      );
    }
    setReassignDialogTask(null);
    setReassignUser(null);
  };

  const isActionable = (task) => task.status === 'IN_PROGRESS' || task.status === 'PENDING';

  const headers = () => [
    'workflow.task.stepLabel',
    'workflow.task.ticket',
    'workflow.task.workflow',
    'workflow.task.status',
    'workflow.task.assignedRole',
    'workflow.task.dueDate',
    '',
  ];

  const sorts = () => [
    ['stepLabel', false],
    null,
    null,
    ['status', true],
    ['assignedRole', true],
    ['dueDate', true],
    null,
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
      <div style={{ display: 'flex', gap: 4 }}>
        <Tooltip title={formatMessage('workflow.task.viewTicket')}>
          <IconButton size="small" onClick={() => history.push(`/grievance/ticket/${task.ticket?.id}`)}>
            <Visibility />
          </IconButton>
        </Tooltip>
        {isActionable(task) && (
          <Tooltip title={formatMessage('workflow.task.complete')}>
            <IconButton size="small" onClick={() => handleComplete(task)} style={{ color: '#4caf50' }}>
              <CheckCircle />
            </IconButton>
          </Tooltip>
        )}
        {isActionable(task) && !task.isRequired && (
          <Tooltip title={formatMessage('workflow.task.skip')}>
            <IconButton size="small" onClick={() => handleSkip(task)} style={{ color: '#9e9e9e' }}>
              <SkipNext />
            </IconButton>
          </Tooltip>
        )}
        {isActionable(task) && (
          <Tooltip title={formatMessage('workflow.task.reassign')}>
            <IconButton size="small" onClick={() => setReassignDialogTask(task)} style={{ color: '#2196f3' }}>
              <AssignmentInd />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  ];

  return (
    <>
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
      <Dialog
        open={!!reassignDialogTask}
        onClose={() => { setReassignDialogTask(null); setReassignUser(null); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{formatMessage('workflow.task.reassign')}</DialogTitle>
        <DialogContent>
          <PublishedComponent
            pubRef="admin.UserPicker"
            value={reassignUser}
            onChange={(user) => setReassignUser(user)}
            withLabel
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReassignDialogTask(null); setReassignUser(null); }}>
            {formatMessage('workflow.task.cancel')}
          </Button>
          <Button
            onClick={handleReassignConfirm}
            color="primary"
            disabled={!reassignUser}
          >
            {formatMessage('workflow.task.reassignConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  grievanceTasks: state.merankabandi.grievanceTasks,
  grievanceTasksPageInfo: state.merankabandi.grievanceTasksPageInfo,
  fetchingGrievanceTasks: state.merankabandi.fetchingGrievanceTasks,
  grievanceTasksTotalCount: state.merankabandi.grievanceTasksTotalCount,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGrievanceTasks,
  completeGrievanceTask,
  skipGrievanceTask,
  reassignGrievanceTask,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GrievanceTaskSearcher);

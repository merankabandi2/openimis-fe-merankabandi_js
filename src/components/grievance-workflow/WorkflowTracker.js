import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Paper, Typography, Stepper, Step, StepLabel, StepContent,
  Button, Chip, CircularProgress, Box,
} from '@material-ui/core';
import {
  CheckCircle, Lock, PlayArrow, SkipNext, Warning, Person,
} from '@material-ui/icons';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { fetchGrievanceWorkflows, completeGrievanceTask, skipGrievanceTask } from '../../actions';

const MODULE_NAME = 'merankabandi';

const STATUS_ICONS = {
  COMPLETED: <CheckCircle style={{ color: '#4caf50' }} />,
  IN_PROGRESS: <PlayArrow style={{ color: '#2196f3' }} />,
  BLOCKED: <Lock style={{ color: '#9e9e9e' }} />,
  SKIPPED: <SkipNext style={{ color: '#bdbdbd' }} />,
  PENDING: <PlayArrow style={{ color: '#ff9800' }} />,
};

const STATUS_COLORS = {
  COMPLETED: '#4caf50',
  IN_PROGRESS: '#2196f3',
  BLOCKED: '#9e9e9e',
  SKIPPED: '#bdbdbd',
  PENDING: '#ff9800',
};

function WorkflowTracker({
  ticketId,
  grievanceWorkflows,
  fetchingGrievanceWorkflows,
  fetchGrievanceWorkflows,
  completeGrievanceTask,
  skipGrievanceTask,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  useEffect(() => {
    if (ticketId) {
      fetchGrievanceWorkflows([`ticket_Id: "${ticketId}"`]);
    }
  }, [ticketId]);

  if (fetchingGrievanceWorkflows) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  if (!grievanceWorkflows || grievanceWorkflows.length === 0) {
    return (
      <Paper style={{ padding: 16, marginTop: 16 }}>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('workflow.noWorkflow')}
        </Typography>
      </Paper>
    );
  }

  const handleComplete = (task) => {
    completeGrievanceTask(
      task.id,
      { manual_completion: true },
      formatMessage('workflow.task.completeLabel'),
    );
    setTimeout(() => fetchGrievanceWorkflows([`ticket_Id: "${ticketId}"`]), 1000);
  };

  const handleSkip = (task) => {
    skipGrievanceTask(
      task.id,
      'Skipped by operator',
      formatMessage('workflow.task.skipLabel'),
    );
    setTimeout(() => fetchGrievanceWorkflows([`ticket_Id: "${ticketId}"`]), 1000);
  };

  return (
    <div>
      {grievanceWorkflows.map((workflow) => {
        const tasks = workflow.tasks?.edges?.map((e) => e.node) || [];
        const activeStep = tasks.findIndex((t) => t.status === 'IN_PROGRESS');

        return (
          <Paper key={workflow.id} style={{ padding: 16, marginTop: 16 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {workflow.templateLabel}
              </Typography>
              <Chip
                label={workflow.status}
                size="small"
                style={{ backgroundColor: STATUS_COLORS[workflow.status] || '#9e9e9e', color: '#fff' }}
              />
            </Box>

            <Stepper activeStep={activeStep >= 0 ? activeStep : tasks.length} orientation="vertical">
              {tasks.map((task, index) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'IN_PROGRESS';

                return (
                  <Step key={task.id} completed={task.status === 'COMPLETED' || task.status === 'SKIPPED'}>
                    <StepLabel
                      icon={STATUS_ICONS[task.status]}
                      error={isOverdue}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body1"
                          style={{
                            textDecoration: task.status === 'SKIPPED' ? 'line-through' : 'none',
                            color: task.status === 'BLOCKED' ? '#9e9e9e' : 'inherit',
                          }}
                        >
                          {task.stepLabel}
                        </Typography>
                        <Chip label={task.assignedRole} size="small" variant="outlined" style={{ marginLeft: 8 }} />
                        {task.assignedUserName && (
                          <Chip
                            icon={<Person style={{ fontSize: 14 }} />}
                            label={task.assignedUserName}
                            size="small"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                        {isOverdue && <Warning style={{ color: '#f44336', marginLeft: 4, fontSize: 18 }} />}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      {task.status === 'IN_PROGRESS' && (
                        <Box mt={1}>
                          {task.result && (
                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                              {JSON.stringify(task.result)}
                            </Typography>
                          )}
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleComplete(task)}
                            style={{ marginRight: 8 }}
                          >
                            {formatMessage('workflow.task.complete')}
                          </Button>
                          {!task.isRequired && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleSkip(task)}
                            >
                              {formatMessage('workflow.task.skip')}
                            </Button>
                          )}
                        </Box>
                      )}
                      {task.status === 'COMPLETED' && task.result && (
                        <Typography variant="body2" color="textSecondary">
                          {JSON.stringify(task.result)}
                        </Typography>
                      )}
                      {task.status === 'BLOCKED' && task.blockedById && (
                        <Typography variant="body2" color="textSecondary">
                          {formatMessage('workflow.task.blockedBy')}
                        </Typography>
                      )}
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </Paper>
        );
      })}
    </div>
  );
}

const mapStateToProps = (state) => ({
  grievanceWorkflows: state.merankabandi.grievanceWorkflows,
  fetchingGrievanceWorkflows: state.merankabandi.fetchingGrievanceWorkflows,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGrievanceWorkflows,
  completeGrievanceTask,
  skipGrievanceTask,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowTracker);

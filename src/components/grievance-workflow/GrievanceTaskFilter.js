import React from 'react';
import _debounce from 'lodash/debounce';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { TextInput, ControlledField, useModulesManager, useTranslations } from '@openimis/fe-core';

const MODULE_NAME = 'merankabandi';
const DEBOUNCE_TIME = 500;

const TASK_STATUSES = [
  { value: 'PENDING', label: 'workflow.task.status.PENDING' },
  { value: 'IN_PROGRESS', label: 'workflow.task.status.IN_PROGRESS' },
  { value: 'COMPLETED', label: 'workflow.task.status.COMPLETED' },
  { value: 'BLOCKED', label: 'workflow.task.status.BLOCKED' },
  { value: 'SKIPPED', label: 'workflow.task.status.SKIPPED' },
];

const useStyles = makeStyles((theme) => ({
  form: { padding: '0 0 10px 0', width: '100%' },
  item: { padding: theme.spacing(1) },
}));

function GrievanceTaskFilter({ filters, onChangeFilters }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEBOUNCE_TIME);

  const filterTextValue = (name) => filters?.[name]?.value ?? '';

  return (
    <Grid container className={classes.form}>
      <ControlledField
        module={MODULE_NAME}
        id="GrievanceTaskFilter.ticket"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="workflow.filter.ticketCode"
              value={filterTextValue('ticketCode')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'ticketCode', value: v, filter: v ? `ticket_Code_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="GrievanceTaskFilter.status"
        field={(
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>{formatMessage('workflow.filter.taskStatus')}</InputLabel>
              <Select
                value={filters?.taskStatus?.value ?? ''}
                onChange={(e) => onChangeFilters([
                  {
                    id: 'taskStatus',
                    value: e.target.value,
                    filter: e.target.value ? `status: "${e.target.value}"` : null,
                  },
                ])}
              >
                <MenuItem value="">{formatMessage('workflow.filter.all')}</MenuItem>
                {TASK_STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{formatMessage(s.label)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="GrievanceTaskFilter.role"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="workflow.filter.role"
              value={filterTextValue('assignedRole')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'assignedRole', value: v, filter: v ? `assignedRole_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="GrievanceTaskFilter.step"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="workflow.filter.stepLabel"
              value={filterTextValue('stepLabel')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'stepLabel', value: v, filter: v ? `stepTemplate_Label_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
    </Grid>
  );
}

export default GrievanceTaskFilter;

import React from 'react';
import _debounce from 'lodash/debounce';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  TextInput, ControlledField, useModulesManager, useTranslations, PublishedComponent,
} from '@openimis/fe-core';

const MODULE_NAME = 'merankabandi';
const DEBOUNCE_TIME = 500;

const WORKFLOW_ROLES = [
  'OT', 'RTM', 'RSI', 'RDO', 'RVBG', 'RIUIRCH', 'RNES', 'RMACH', 'RCOM', 'SEP', 'RPM',
];

const useStyles = makeStyles((theme) => ({
  form: { padding: '0 0 10px 0', width: '100%' },
  item: { padding: theme.spacing(1) },
}));

function RoleAssignmentFilter({ filters, onChangeFilters }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <Grid container className={classes.form}>
      <ControlledField
        module={MODULE_NAME}
        id="RoleAssignmentFilter.role"
        field={(
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>{formatMessage('workflow.filter.role')}</InputLabel>
              <Select
                value={filters?.role?.value ?? ''}
                onChange={(e) => onChangeFilters([
                  {
                    id: 'role',
                    value: e.target.value,
                    filter: e.target.value ? `role: "${e.target.value}"` : null,
                  },
                ])}
              >
                <MenuItem value="">{formatMessage('workflow.filter.all')}</MenuItem>
                {WORKFLOW_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="RoleAssignmentFilter.user"
        field={(
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="admin.UserPicker"
              value={filters?.user?.value ?? null}
              withLabel
              onChange={(user) => onChangeFilters([
                {
                  id: 'user',
                  value: user,
                  filter: user?.id ? `user_Id: "${user.id}"` : null,
                },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="RoleAssignmentFilter.location"
        field={(
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="location.LocationPicker"
              value={filters?.location?.value ?? null}
              withLabel
              onChange={(loc) => onChangeFilters([
                {
                  id: 'location',
                  value: loc,
                  filter: loc?.id ? `location_Id: "${loc.id}"` : null,
                },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="RoleAssignmentFilter.isActive"
        field={(
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>{formatMessage('workflow.filter.status')}</InputLabel>
              <Select
                value={filters?.isActive?.value ?? ''}
                onChange={(e) => onChangeFilters([
                  {
                    id: 'isActive',
                    value: e.target.value,
                    filter: e.target.value !== '' ? `isActive: ${e.target.value}` : null,
                  },
                ])}
              >
                <MenuItem value="">{formatMessage('workflow.filter.all')}</MenuItem>
                <MenuItem value="true">{formatMessage('workflow.role.active')}</MenuItem>
                <MenuItem value="false">{formatMessage('workflow.role.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      />
    </Grid>
  );
}

export default RoleAssignmentFilter;

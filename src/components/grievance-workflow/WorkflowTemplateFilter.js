import React from 'react';
import _debounce from 'lodash/debounce';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { TextInput, ControlledField, useModulesManager, useTranslations } from '@openimis/fe-core';

const MODULE_NAME = 'merankabandi';
const DEBOUNCE_TIME = 500;

const CASE_TYPE_GROUPS = [
  { key: 'remplacement', label: 'Remplacement' },
  { key: 'suppression', label: 'Suppression' },
  { key: 'reclamation:sensible', label: 'Réclamation — Cas sensible' },
  { key: 'reclamation:speciale', label: 'Réclamation — Cas spécial' },
  { key: 'reclamation:non_sensible', label: 'Réclamation — Cas non sensible' },
];

const useStyles = makeStyles((theme) => ({
  form: { padding: '0 0 10px 0', width: '100%' },
  item: { padding: theme.spacing(1) },
}));

function WorkflowTemplateFilter({ filters, onChangeFilters }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEBOUNCE_TIME);

  const filterTextValue = (name) => filters?.[name]?.value ?? '';

  return (
    <Grid container className={classes.form}>
      <ControlledField
        module={MODULE_NAME}
        id="WorkflowTemplateFilter.name"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="workflow.filter.name"
              value={filterTextValue('name')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'name', value: v, filter: v ? `name_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="WorkflowTemplateFilter.label"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="workflow.filter.label"
              value={filterTextValue('label')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'label', value: v, filter: v ? `label_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="WorkflowTemplateFilter.caseTypeGroup"
        field={(
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>{formatMessage('workflow.filter.caseTypeGroup')}</InputLabel>
              <Select
                value={filters?.caseTypeGroup?.value ?? ''}
                onChange={(e) => onChangeFilters([
                  {
                    id: 'caseTypeGroup',
                    value: e.target.value,
                    filter: e.target.value ? `caseType_Istartswith: "${e.target.value}"` : null,
                  },
                ])}
              >
                <MenuItem value="">{formatMessage('workflow.filter.all')}</MenuItem>
                {CASE_TYPE_GROUPS.map((g) => (
                  <MenuItem key={g.key} value={g.key}>{g.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="WorkflowTemplateFilter.isActive"
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
                <MenuItem value="true">{formatMessage('workflow.template.active')}</MenuItem>
                <MenuItem value="false">{formatMessage('workflow.template.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      />
    </Grid>
  );
}

export default WorkflowTemplateFilter;

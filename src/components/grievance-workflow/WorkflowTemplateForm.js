import React from 'react';
import { injectIntl } from 'react-intl';

import {
  Grid, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  TextInput,
} from '@openimis/fe-core';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

const CASE_TYPES = [
  'cas_sensibles',
  'cas_speciaux',
  'cas_non_sensibles',
];

class WorkflowTemplateForm extends FormPanel {
  render() {
    const {
      edited,
      classes,
      readOnly,
      intl,
    } = this.props;
    const template = { ...edited };

    return (
      <Grid container className={classes.item}>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.template.name"
            required
            readOnly={readOnly}
            value={template?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.template.label"
            readOnly={readOnly}
            value={template?.label ?? ''}
            onChange={(label) => this.updateAttribute('label', label)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <FormControl fullWidth>
            <InputLabel>
              {intl.formatMessage({ id: 'merankabandi.workflow.template.caseType' })}
            </InputLabel>
            <Select
              value={template?.caseType ?? ''}
              onChange={(e) => this.updateAttribute('caseType', e.target.value)}
              disabled={readOnly}
              required
            >
              {CASE_TYPES.map((ct) => (
                <MenuItem key={ct} value={ct}>{ct}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={template?.isActive ?? true}
                onChange={(e) => this.updateAttribute('isActive', e.target.checked)}
                disabled={readOnly}
              />
            }
            label={intl.formatMessage({ id: 'merankabandi.workflow.template.isActive' })}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.template.description"
            readOnly={readOnly}
            value={template?.description ?? ''}
            onChange={(description) => this.updateAttribute('description', description)}
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(WorkflowTemplateForm))));

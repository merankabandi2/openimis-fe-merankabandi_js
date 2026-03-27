import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid, Typography, IconButton, Tooltip } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  FormPanel,
  withModulesManager,
  TextInput,
  NumberInput,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  variableRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    gap: theme.spacing(1),
  },
});

class PmtFormulaForm extends FormPanel {
  addVariable = () => {
    const variables = [...(this.props.edited?.variables || [])];
    variables.push({ field: '', weight: 0, description: '' });
    this.updateAttribute('variables', variables);
  };

  removeVariable = (index) => {
    const variables = [...(this.props.edited?.variables || [])];
    variables.splice(index, 1);
    this.updateAttribute('variables', variables);
  };

  updateVariable = (index, key, value) => {
    const variables = [...(this.props.edited?.variables || [])];
    variables[index] = { ...variables[index], [key]: value };
    this.updateAttribute('variables', variables);
  };

  render() {
    const {
      edited,
      classes,
      readOnly,
      intl,
    } = this.props;
    const formula = { ...edited };
    const variables = formula?.variables || [];

    const fm = (id) => intl.formatMessage({ id: `merankabandi.${id}` });

    return (
      <Grid container className={classes.item}>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="pmtFormula.name"
            required
            readOnly={readOnly}
            value={formula?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="pmtFormula.description"
            readOnly={readOnly}
            value={formula?.description ?? ''}
            onChange={(description) => this.updateAttribute('description', description)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <NumberInput
            module={MODULE_NAME}
            label="pmtFormula.baseScoreUrban"
            readOnly={readOnly}
            value={formula?.baseScoreUrban ?? 0}
            onChange={(v) => this.updateAttribute('baseScoreUrban', v)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <NumberInput
            module={MODULE_NAME}
            label="pmtFormula.baseScoreRural"
            readOnly={readOnly}
            value={formula?.baseScoreRural ?? 0}
            onChange={(v) => this.updateAttribute('baseScoreRural', v)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="pmtFormula.isActive"
            readOnly
            value={formula?.isActive ? fm('pmtFormula.active') : fm('pmtFormula.inactive')}
          />
        </Grid>

        <Grid item xs={12} className={classes.item}>
          <Typography variant="subtitle1" gutterBottom>
            {fm('pmtFormula.variables')}
            {!readOnly && (
              <Tooltip title={fm('pmtFormula.addVariable')}>
                <IconButton size="small" onClick={this.addVariable}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Typography>
          {variables.map((v, i) => (
            <div key={v.field || `var-${i}`} className={classes.variableRow}>
              <TextInput
                module={MODULE_NAME}
                label="pmtFormula.variable.field"
                readOnly={readOnly}
                value={v.field || ''}
                onChange={(val) => this.updateVariable(i, 'field', val)}
              />
              <NumberInput
                module={MODULE_NAME}
                label="pmtFormula.variable.weight"
                readOnly={readOnly}
                value={v.weight || 0}
                onChange={(val) => this.updateVariable(i, 'weight', val)}
              />
              <TextInput
                module={MODULE_NAME}
                label="pmtFormula.variable.description"
                readOnly={readOnly}
                value={v.description || ''}
                onChange={(val) => this.updateVariable(i, 'description', val)}
              />
              {!readOnly && (
                <Tooltip title={fm('pmtFormula.removeVariable')}>
                  <IconButton size="small" onClick={() => this.removeVariable(i)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          ))}
          {variables.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              {fm('pmtFormula.noVariables')}
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(PmtFormulaForm))));

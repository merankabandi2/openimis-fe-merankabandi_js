import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid, IconButton, Tooltip } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

import {
  FormPanel,
  withModulesManager,
  withHistory,
  TextInput,
  NumberInput,
  TextAreaInput,
  PublishedComponent,
  formatMessage,
  historyPush,
} from '@openimis/fe-core';
import { RIGHT_SECTION_CREATE } from '../../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
  sectionWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  sectionPicker: {
    flex: 1,
  },
});

class IndicatorForm extends FormPanel {
  onCreateSection = () => {
    historyPush(this.props.modulesManager, this.props.history, 'merankabandi.route.sections');
  }

  render() {
    const {
      edited,
      classes,
      readOnly,
      intl,
      rights,
      modulesManager,
    } = this.props;
    const indicator = { ...edited };
    const canCreateSection = rights?.includes(RIGHT_SECTION_CREATE);

    return (
      <Grid container className={classes.item}>
        <Grid item xs={6} className={classes.item}>
          <div className={classes.sectionWrapper}>
            <PublishedComponent
              pubRef="merankabandi.SectionPicker"
              value={indicator?.section ?? null}
              required
              readOnly={readOnly}
              onChange={(section) => this.updateAttribute('section', section)}
              className={classes.sectionPicker}
            />
            {!readOnly && canCreateSection && (
              <Tooltip title={formatMessage(intl, 'merankabandi', 'section.createNew')}>
                <IconButton onClick={this.onCreateSection} color="primary">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="indicator.name"
            required
            readOnly={readOnly}
            value={indicator?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="indicator.pbc"
            readOnly={readOnly}
            value={indicator?.pbc ?? ''}
            onChange={(pbc) => this.updateAttribute('pbc', pbc)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="merankabandi"
            label="indicator.baseline"
            readOnly={readOnly}
            value={indicator?.baseline ?? 0}
            onChange={(baseline) => this.updateAttribute('baseline', baseline)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="merankabandi"
            label="indicator.target"
            readOnly={readOnly}
            value={indicator?.target ?? 0}
            onChange={(target) => this.updateAttribute('target', target)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextAreaInput
            module="merankabandi"
            label="indicator.observation"
            readOnly={readOnly}
            value={indicator?.observation ?? ''}
            onChange={(observation) => this.updateAttribute('observation', observation)}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withHistory(withModulesManager(injectIntl(withTheme(withStyles(styles)(IndicatorForm)))));

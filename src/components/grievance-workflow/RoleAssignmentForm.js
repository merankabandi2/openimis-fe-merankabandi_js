import React from 'react';
import { injectIntl } from 'react-intl';

import {
  Grid, FormControlLabel, Checkbox,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  TextInput,
  PublishedComponent,
  decodeId,
} from '@openimis/fe-core';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class RoleAssignmentForm extends FormPanel {
  render() {
    const {
      edited,
      classes,
      readOnly,
      intl,
    } = this.props;
    const assignment = { ...edited };

    return (
      <Grid container className={classes.item}>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.role.role"
            required
            readOnly={readOnly}
            value={assignment?.role ?? ''}
            onChange={(role) => this.updateAttribute('role', role)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <PublishedComponent
            pubRef="admin.UserPicker"
            value={assignment?.user ?? null}
            onChange={(user) => {
              this.updateAttribute('user', user);
              if (user?.id) {
                const userId = typeof user.id === 'string' && user.id.includes('VXN')
                  ? decodeId(user.id)
                  : user.id;
                this.updateAttribute('userId', userId);
              } else {
                this.updateAttribute('userId', null);
              }
            }}
            withLabel
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <PublishedComponent
            pubRef="location.DetailedLocation"
            value={assignment?.location ?? null}
            onChange={(locations) => {
              const loc = locations?.length ? locations[locations.length - 1] : null;
              this.updateAttribute('location', loc);
              if (loc?.id) {
                const locationId = typeof loc.id === 'string' && loc.id.includes('TG9')
                  ? decodeId(loc.id)
                  : loc.id;
                this.updateAttribute('locationId', locationId);
              } else {
                this.updateAttribute('locationId', null);
              }
            }}
            withNull
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={assignment?.isActive ?? true}
                onChange={(e) => this.updateAttribute('isActive', e.target.checked)}
                disabled={readOnly}
              />
            }
            label={intl.formatMessage({ id: 'merankabandi.workflow.role.isActive' })}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(RoleAssignmentForm))));

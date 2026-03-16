import React, { Component } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { withModulesManager, FormattedMessage } from '@openimis/fe-core';
import { BENEFICIARY_PHOTO_URL } from '../../constants';

const styles = (theme) => ({
  photoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
  },
  photo: {
    height: 100,
    borderRadius: theme.shape.borderRadius,
  },
});

class BeneficiaryPhotoPanel extends Component {
  isPrimaryRecipient() {
    const { edited } = this.props;
    return edited?.groupindividuals?.edges?.[0]?.node?.recipientType === 'PRIMARY';
  }

  render() {
    const { edited, classes } = this.props;

    if (!edited || !this.isPrimaryRecipient()) {
      return null;
    }

    return (
      <Grid container className={classes.photoContainer}>
        <Grid item>
          <img
            src={`${BENEFICIARY_PHOTO_URL}/${edited.id}/`}
            alt="beneficiaire"
            className={classes.photo}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(withTheme(withStyles(styles)(BeneficiaryPhotoPanel)));

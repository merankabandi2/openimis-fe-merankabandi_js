import React from 'react';
import { Paper, Typography, Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

function BurundiLocationHierarchyPanel({ intl, value, onChange, readOnly }) {
  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="subtitle2" gutterBottom>
        {formatMessage(intl, MODULE_NAME, 'location.hierarchy.title')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PublishedComponent
            pubRef="location.LocationPicker"
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            withNull
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default injectIntl(BurundiLocationHierarchyPanel);

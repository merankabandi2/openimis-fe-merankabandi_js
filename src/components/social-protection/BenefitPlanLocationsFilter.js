import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { SelectInput, PublishedComponent, formatMessage } from '@openimis/fe-core';

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

function BenefitPlanLocationsFilter({
  intl, classes, filters, onChangeFilters, readOnly, status,
}) {
  const any = formatMessage(intl, 'merankabandi', 'any');
  const filterValue = (filterName) => filters?.[filterName]?.value;

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <SelectInput
          module="merankabandi"
          label="location.locationType.label"
          options={[
            { value: 'D', label: formatMessage(intl, 'location', 'locationType.0') },
            { value: 'W', label: formatMessage(intl, 'location', 'locationType.1') },
            { value: 'V', label: formatMessage(intl, 'location', 'locationType.2') },
          ]}
          value={filterValue('type')}
          onChange={(value) => onChangeFilters([
            {
              id: 'type',
              value,
              filter: `type: "${value}"`,
            },
          ])}
        />
      </Grid>

      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="socialProtection.BeneficiaryStatusPicker"
          label="beneficiary.beneficiaryStatusPicker"
          withNull
          readOnly={readOnly}
          nullLabel={any}
          value={status || filterValue('status')}
          onChange={(value) => onChangeFilters([
            {
              id: 'status',
              value,
              filter: `status: ${value}`,
            },
          ])}
        />
      </Grid>
      <Grid item xs={12}>
        <PublishedComponent
          pubRef="location.LocationFilter"
          withNull
          filters={filters}
          onChangeFilters={onChangeFilters}
          anchor="parentLocation"
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(BenefitPlanLocationsFilter)));

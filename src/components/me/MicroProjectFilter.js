import React from 'react';
import { injectIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

function MicroProjectFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const userProvinces = useSelector((state) => state.loc?.userL0s ?? []);
  const hasRestrictedProvinces = userProvinces.length > 0;

  const filterValue = (filterName) => filters?.[filterName]?.value;

  return (
    <Grid container className={classes.form}>
      <Grid item xs={12}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          withNull
          filters={filters}
          onChangeFilters={onChangeFilters}
          anchor="parentLocation"
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="socialProtection"
          label="filter.startDate"
          value={filterValue('dateFrom')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dateFrom',
              value: v,
              filter: v ? `reportDate_Gte: "${v}"` : null,
            },
          ])}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="socialProtection"
          label="filter.endDate"
          value={filterValue('dateTo')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dateTo',
              value: v,
              filter: v ? `reportDate_Lte: "${v}"` : null,
            },
          ])}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <FormControl fullWidth>
          <InputLabel shrink>
            {formatMessage(intl, 'socialProtection', 'filter.validationStatus.title')}
          </InputLabel>
          <Select
            value={filterValue('validationStatus') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              onChangeFilters([
                {
                  id: 'validationStatus',
                  value: value || null,
                  filter: value ? `validationStatus: ${value}` : null,
                },
              ]);
            }}
            displayEmpty
          >
            <MenuItem value="">{formatMessage(intl, 'socialProtection', 'any')}</MenuItem>
            <MenuItem value="PENDING">{formatMessage(intl, 'socialProtection', 'validation.status.pending')}</MenuItem>
            <MenuItem value="VALIDATED">{formatMessage(intl, 'socialProtection', 'validation.status.validated')}</MenuItem>
            <MenuItem value="REJECTED">{formatMessage(intl, 'socialProtection', 'validation.status.rejected')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(MicroProjectFilter)));

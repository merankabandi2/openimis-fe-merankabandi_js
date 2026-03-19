import React from 'react';
import { injectIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { TextInput, PublishedComponent, formatMessage } from '@openimis/fe-core';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING,
} from '../../constants';

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

function SensitizationTrainingFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const userProvinces = useSelector((state) => state.loc?.userL0s ?? []);
  const hasRestrictedProvinces = userProvinces.length > 0;

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;
  const filterValue = (filterName) => filters?.[filterName]?.value;

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    if (lookup) {
      debouncedOnChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}_${lookup}: "${value}"`,
        },
      ]);
    } else {
      onChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}: "${value}"`,
        },
      ]);
    }
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <PublishedComponent
          pubRef="location.LocationPicker"
          value={filterValue('location')}
          onChange={(value) => onChangeFilters([
            {
              id: 'location',
              value,
              filter: value ? `location_Parent_Parent_Id: "${value.id}"` : null,
            },
          ])}
          label={formatMessage(intl, 'socialProtection', 'MicroProjectFilter.location')}
          restrictedOptions={hasRestrictedProvinces}
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
              filter: v ? `sensitizationDate_Gte: "${v}"` : null,
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
              filter: v ? `sensitizationDate_Lte: "${v}"` : null,
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
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="socialProtection"
          label="sensitizationTraining.category"
          value={filterTextFieldValue('category')}
          onChange={onChangeStringFilter('category', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="socialProtection"
          label="sensitizationTraining.facilitator"
          value={filterTextFieldValue('facilitator')}
          onChange={onChangeStringFilter('facilitator', CONTAINS_LOOKUP)}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(SensitizationTrainingFilter)));

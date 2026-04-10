import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage, useGraphqlQuery } from '@openimis/fe-core';
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

// Theme choices per category (matches KoBo form structure)
const THEMES_BY_CATEGORY = {
  module_mach__mesures_d_accompa: [
    'introduction_au_projet_d_appui_aux_filet',
    'communication_pour_le_changement_de_comp',
    'la_sant__maternelle_et_infantile___hygi_',
    'la_nutrition',
    'la_stimulation_du_jeune_enfant',
    'la_protection_de_l_enfant',
  ],
  module_mip__mesures_d_inclusio: [
    'vsla__village_savings_and_loan_associati',
    'micro_entrepreneuriat_et_connaissance_du',
    'elaboration_des_plans_d_affaires',
    'comp_tences_de_vie',
    'formation_sur_les_techniques_d_agricultu',
  ],
};

const ALL_CATEGORIES = Object.keys(THEMES_BY_CATEGORY);

function SensitizationTrainingFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const [facilitators, setFacilitators] = useState([]);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const selectedCategory = filterValue('category');
  const availableThemes = selectedCategory
    ? (THEMES_BY_CATEGORY[selectedCategory] || [])
    : Object.values(THEMES_BY_CATEGORY).flat();

  // Fetch distinct facilitators on mount
  useEffect(() => {
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: `{
          sensitizationTraining(first: 500, orderBy: ["facilitator"]) {
            edges { node { facilitator } }
          }
        }`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const edges = data?.data?.sensitizationTraining?.edges || [];
        const unique = [...new Set(
          edges.map((e) => (e.node.facilitator || '').trim()).filter(Boolean),
        )].sort();
        setFacilitators(unique);
      })
      .catch((err) => console.warn('Failed to load facilitators:', err));
  }, []);

  const getLabel = (key) => {
    const translationKey = `sensitizationTraining.category.${key.toLowerCase()}`;
    if (intl.messages[translationKey]) return intl.formatMessage({ id: translationKey });
    return key.replace(/__/g, ' — ').replace(/_/g, ' ');
  };

  return (
    <Grid container className={classes.form}>
      {/* Location: Province → Commune → Colline cascade */}
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
        <FormControl fullWidth>
          <InputLabel shrink>
            {formatMessage(intl, 'merankabandi', 'sensitizationTraining.category')}
          </InputLabel>
          <Select
            value={filterValue('category') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              onChangeFilters([
                {
                  id: 'category',
                  value: value || null,
                  filter: value ? `category: "${value}"` : null,
                },
                {
                  id: 'theme',
                  value: null,
                  filter: null,
                },
              ]);
            }}
            displayEmpty
          >
            <MenuItem value="">{formatMessage(intl, 'socialProtection', 'any')}</MenuItem>
            {ALL_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{getLabel(c)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <FormControl fullWidth>
          <InputLabel shrink>
            {formatMessage(intl, 'merankabandi', 'sensitizationTraining.topics')}
          </InputLabel>
          <Select
            value={filterValue('theme') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              onChangeFilters([
                {
                  id: 'theme',
                  value: value || null,
                  filter: value ? `modules_Icontains: "${value}"` : null,
                },
              ]);
            }}
            displayEmpty
          >
            <MenuItem value="">{formatMessage(intl, 'socialProtection', 'any')}</MenuItem>
            {availableThemes.map((t) => (
              <MenuItem key={t} value={t}>{getLabel(t)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <FormControl fullWidth>
          <InputLabel shrink>
            {formatMessage(intl, 'merankabandi', 'validation.facilitator')}
          </InputLabel>
          <Select
            value={filterValue('facilitator') ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              onChangeFilters([
                {
                  id: 'facilitator',
                  value: value || null,
                  filter: value ? `facilitator: "${value}"` : null,
                },
              ]);
            }}
            displayEmpty
          >
            <MenuItem value="">{formatMessage(intl, 'socialProtection', 'any')}</MenuItem>
            {facilitators.map((f) => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(SensitizationTrainingFilter)));

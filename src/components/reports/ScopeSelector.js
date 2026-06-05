import React from 'react';
import {
  Grid, FormControl, FormControlLabel, Radio, RadioGroup, Typography,
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

/**
 * Reusable scope picker: program (benefit plan) + (province | payment agency).
 * - value: { benefitPlanId, scope: { type: 'province'|'agency', id, label } }
 * - onChange(nextValue)
 * - lockedScope: when set ({ type, id, label }), the province/agency dimension is
 *   fixed (shown read-only) and only the program is editable. Used by the
 *   contextual dialog. When absent, the full selector is shown (standalone page).
 */
function ScopeSelector({
  intl, value, onChange, lockedScope = null,
}) {
  const v = value || {};
  const scope = lockedScope || v.scope || { type: 'province', id: null, label: '' };

  const setBenefitPlan = (bp) => onChange({ ...v, benefitPlanId: bp ? (bp.id || bp) : null });
  const setScopeType = (type) => onChange({ ...v, scope: { type, id: null, label: '' } });
  const setScopeId = (loc, type) => onChange({
    ...v,
    scope: { type, id: loc ? (loc.id || loc) : null, label: loc ? (loc.name || '') : '' },
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PublishedComponent
          pubRef="socialProtection.BenefitPlanPicker"
          withNull
          required
          value={v.benefitPlanId || null}
          onChange={setBenefitPlan}
          label={formatMessage(intl, MODULE_NAME, 'report.accountCreation.program')}
        />
      </Grid>

      {lockedScope ? (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage(
              intl, MODULE_NAME,
              lockedScope.type === 'agency'
                ? 'report.accountCreation.scope.agency'
                : 'report.accountCreation.scope.province',
            )}
            {`: ${lockedScope.label}`}
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
            <FormControl>
              <RadioGroup
                row
                value={scope.type}
                onChange={(e) => setScopeType(e.target.value)}
              >
                <FormControlLabel
                  value="province"
                  control={<Radio />}
                  label={formatMessage(intl, MODULE_NAME, 'report.accountCreation.scope.province')}
                />
                <FormControlLabel
                  value="agency"
                  control={<Radio />}
                  label={formatMessage(intl, MODULE_NAME, 'report.accountCreation.scope.agency')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {scope.type === 'province' ? (
              <PublishedComponent
                pubRef="location.LocationPicker"
                value={scope.id}
                onChange={(loc) => setScopeId(loc, 'province')}
              />
            ) : (
              <PublishedComponent
                pubRef="merankabandi.PaymentAgencyPicker"
                value={scope.id}
                onChange={(a) => setScopeId(a, 'agency')}
              />
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default injectIntl(ScopeSelector);

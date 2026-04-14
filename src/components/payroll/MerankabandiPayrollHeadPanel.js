/* eslint-disable camelcase */
import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid, LinearProgress } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import {
  formatMessage,
  FormPanel,
  PublishedComponent,
  withModulesManager,
} from '@openimis/fe-core';
import PayrollStatusPicker from './PayrollStatusPicker';
import { PAYROLL_STATUS } from '../../payroll-actions';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class MerankabandiPayrollHeadPanel extends FormPanel {
  render() {
    const {
      edited, classes, readOnly, intl, isPayrollFromFailedInvoices, benefitPlanId,
    } = this.props;
    const payroll = { ...edited };

    // Location (commune) is the primary user input — stored in jsonExt on save.
    // On create: user picks commune via picker, stored in payroll.location (local form state).
    // On read: parse from jsonExt.location_uuid to recover the saved commune.
    // meraLocation is resolved by the BE from json_ext.location_uuid
    let payrollLocation = payroll?.location || payroll?.meraLocation || null;
    if (!payrollLocation && payroll?.jsonExt) {
      try {
        const ext = typeof payroll.jsonExt === 'string' ? JSON.parse(payroll.jsonExt) : payroll.jsonExt;
        if (ext?.location_uuid) {
          payrollLocation = { uuid: ext.location_uuid };
        } else if (ext?.commune_id) {
          payrollLocation = { uuid: ext.commune_id };
        }
      } catch (e) { /* ignore parse errors */ }
    }

    // Derive province from commune's parent for the province picker
    const provinceValue = payrollLocation?.parent || payroll?.province || null;

    let effectiveBenefitPlanId = benefitPlanId;
    if (!effectiveBenefitPlanId && payroll?.paymentPlan?.benefitPlan) {
      const benefitPlan = JSON.parse(payroll.paymentPlan.benefitPlan);
      if (benefitPlan) {
        effectiveBenefitPlanId = JSON.parse(benefitPlan)?.id;
      }
    }
    return (
      <>
        <Grid container className={classes.item}>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="location.LocationPicker"
              locationLevel={0}
              withNull
              required
              readOnly={readOnly}
              value={provinceValue}
              onChange={(province) => {
                this.updateAttributes({ province, location: null });
              }}
              label={formatMessage(intl, 'merankabandi', 'payroll.province')}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="location.LocationPicker"
              locationLevel={1}
              parentLocation={provinceValue}
              withNull
              required
              readOnly={readOnly || !provinceValue}
              value={payrollLocation}
              onChange={(commune) => this.updateAttribute('location', commune)}
              label={formatMessage(intl, 'merankabandi', 'payroll.commune')}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="contributionPlan.PaymentPlanPicker"
              required
              filterLabels={false}
              onChange={(paymentPlan) => this.updateAttribute('paymentPlan', paymentPlan)}
              value={payroll?.paymentPlan}
              readOnly={readOnly}
              benefitPlanId={effectiveBenefitPlanId}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="payroll.PaymentPointPicker"
              withLabel
              withPlaceholder
              filterLabels={false}
              onChange={(paymentPoint) => this.updateAttribute('paymentPoint', paymentPoint)}
              value={payroll?.paymentPoint}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="paymentCycle.PaymentCyclePicker"
              withLabel
              required
              withPlaceholder
              filterLabels={false}
              onChange={(paymentCycle) => this.updateAttribute('paymentCycle', paymentCycle)}
              value={payroll?.paymentCycle}
              readOnly={isPayrollFromFailedInvoices ? !isPayrollFromFailedInvoices : readOnly}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="payroll"
              label="payroll.dateValidFrom"
              required
              value={payroll.dateValidFrom ? payroll.dateValidFrom : null}
              onChange={(v) => this.updateAttribute('dateValidFrom', v)}
              readOnly={readOnly}
            />
          </Grid>
          {readOnly && !isPayrollFromFailedInvoices && (
            <Grid item xs={3} className={classes.item}>
              <PayrollStatusPicker
                required
                withNull={false}
                readOnly={readOnly}
                value={!!payroll?.status && payroll.status}
              />
            </Grid>
          )}
        </Grid>
        {payroll?.status === PAYROLL_STATUS.GENERATING && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            <LinearProgress variant="determinate" value={payroll.jsonExt?.progress || 0} />
          </div>
        )}
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MerankabandiPayrollHeadPanel))));

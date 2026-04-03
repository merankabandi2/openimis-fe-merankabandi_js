import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import { Grid, FormControlLabel, Switch, Typography, TextField, MenuItem } from '@material-ui/core';
import {
  FormPanel, TextInput, withModulesManager, formatMessage, useGraphqlQuery,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const ONLINE_PUSH_METHOD = 'StrategyOnlinePaymentPush';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  sectionTitle: {
    ...theme.paper.item,
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
});

class PaymentAgencyForm extends FormPanel {
  render() {
    const { classes, intl, edited, readOnly, paymentMethods, gatewayConnectors } = this.props;
    const isOnlinePush = edited?.paymentGateway === ONLINE_PUSH_METHOD;

    return (
      <Grid container className={classes.item}>
        {/* Identity */}
        <Grid item xs={12}>
          <Typography className={classes.sectionTitle}>
            {formatMessage(intl, MODULE_NAME, 'paymentAgency.section.identity')}
          </Typography>
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="paymentAgency.code"
            value={edited?.code ?? ''}
            onChange={(code) => this.updateAttribute('code', code)}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="paymentAgency.name"
            value={edited?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <FormControlLabel
            control={
              <Switch
                checked={edited?.isActive ?? true}
                onChange={(e) => this.updateAttribute('isActive', e.target.checked)}
                color="primary"
                disabled={readOnly}
              />
            }
            label={formatMessage(intl, MODULE_NAME, 'paymentAgency.isActive')}
          />
        </Grid>

        {/* Payment Gateway Configuration */}
        <Grid item xs={12}>
          <Typography className={classes.sectionTitle}>
            {formatMessage(intl, MODULE_NAME, 'paymentAgency.section.gateway')}
          </Typography>
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextField
            select
            fullWidth
            label={formatMessage(intl, MODULE_NAME, 'paymentAgency.paymentMethod')}
            value={edited?.paymentGateway ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== ONLINE_PUSH_METHOD) {
                // Clear gateway fields when not OnlinePush — single update to avoid race
                this.props.onEditedChanged({ ...edited, paymentGateway: val, gatewayConfig: '', gatewayConnectorKey: '' });
              } else {
                this.updateAttribute('paymentGateway', val);
              }
            }}
            disabled={readOnly}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">
              <em>{formatMessage(intl, MODULE_NAME, 'paymentAgency.noPaymentMethod')}</em>
            </MenuItem>
            {(paymentMethods || []).map((m) => (
              <MenuItem key={m.name} value={m.name}>{m.name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {isOnlinePush && (
          <>
            <Grid item xs={4} className={classes.item}>
              <TextField
                select
                fullWidth
                label={formatMessage(intl, MODULE_NAME, 'paymentAgency.gatewayConnector')}
                value={edited?.gatewayConnectorKey ?? ''}
                onChange={(e) => {
                  const connector = (gatewayConnectors || []).find((c) => c.key === e.target.value);
                  this.updateAttribute('gatewayConnectorKey', e.target.value);
                  if (connector) {
                    this.updateAttribute('gatewayConfig', JSON.stringify({ payment_gateway_class: connector.classPath }));
                  }
                }}
                disabled={readOnly}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">
                  <em>{formatMessage(intl, MODULE_NAME, 'paymentAgency.noConnector')}</em>
                </MenuItem>
                {(gatewayConnectors || []).map((c) => (
                  <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="paymentAgency.gatewayConfig"
                value={edited?.gatewayConfig ?? ''}
                onChange={(gatewayConfig) => this.updateAttribute('gatewayConfig', gatewayConfig)}
                readOnly={readOnly}
                multiline
                rows={2}
              />
            </Grid>
          </>
        )}

        {/* Contact Information */}
        <Grid item xs={12}>
          <Typography className={classes.sectionTitle}>
            {formatMessage(intl, MODULE_NAME, 'paymentAgency.section.contact')}
          </Typography>
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="paymentAgency.contactName"
            value={edited?.contactName ?? ''}
            onChange={(contactName) => this.updateAttribute('contactName', contactName)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="paymentAgency.contactPhone"
            value={edited?.contactPhone ?? ''}
            onChange={(contactPhone) => this.updateAttribute('contactPhone', contactPhone)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="paymentAgency.contactEmail"
            value={edited?.contactEmail ?? ''}
            onChange={(contactEmail) => this.updateAttribute('contactEmail', contactEmail)}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>
    );
  }
}

const StyledForm = withModulesManager(injectIntl(withStyles(styles)(PaymentAgencyForm)));

/**
 * Wrapper that fetches payment methods (from payroll) and gateway connectors (from merankabandi)
 * and passes them as props to the class-based FormPanel.
 */
function PaymentAgencyFormWithData(props) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [gatewayConnectors, setGatewayConnectors] = useState([]);

  // Fetch payment methods from upstream payroll module
  const { data: pmData } = useGraphqlQuery(
    'query { paymentMethods { paymentMethods { name } } }',
    {},
    { skip: false }
  );

  // Fetch gateway connectors from merankabandi
  const { data: gcData } = useGraphqlQuery(
    'query { paymentGatewayConnectors { key label classPath } }',
    {},
    { skip: false }
  );

  useEffect(() => {
    if (pmData?.paymentMethods?.paymentMethods) {
      setPaymentMethods(pmData.paymentMethods.paymentMethods);
    }
  }, [pmData]);

  useEffect(() => {
    if (gcData?.paymentGatewayConnectors) {
      setGatewayConnectors(gcData.paymentGatewayConnectors);
    }
  }, [gcData]);

  // Derive gatewayConnectorKey from existing gatewayConfig for editing
  const editedWithKey = { ...props.edited };
  if (editedWithKey.gatewayConfig && !editedWithKey.gatewayConnectorKey && gatewayConnectors.length > 0) {
    try {
      const parsed = typeof editedWithKey.gatewayConfig === 'string'
        ? JSON.parse(editedWithKey.gatewayConfig)
        : editedWithKey.gatewayConfig;
      const classPath = parsed?.payment_gateway_class;
      if (classPath) {
        const match = gatewayConnectors.find((c) => c.classPath === classPath);
        if (match) editedWithKey.gatewayConnectorKey = match.key;
      }
    } catch { /* ignore parse errors */ }
  }

  return (
    <StyledForm
      {...props}
      edited={editedWithKey}
      paymentMethods={paymentMethods}
      gatewayConnectors={gatewayConnectors}
    />
  );
}

export default PaymentAgencyFormWithData;

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';

import {
  Form,
  Helmet,
  withHistory,
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  journalize,
} from '@openimis/fe-core';
import {
  fetchPaymentAgency,
  clearPaymentAgency,
  createPaymentAgency,
  updatePaymentAgency,
} from '../actions';
import { MODULE_NAME, ROUTE_PAYMENT_AGENCIES } from '../constants';
import PaymentAgencyForm from '../components/payment-agency/PaymentAgencyForm';

const styles = (theme) => ({
  page: theme.page,
});

function PaymentAgencyPage({
  intl, classes, history, match,
  paymentAgency, fetchingPaymentAgency,
  fetchPaymentAgency, clearPaymentAgency,
  createPaymentAgency, updatePaymentAgency,
  submittingMutation, mutation,
}) {
  const agencyId = match?.params?.payment_agency_id;
  const isNew = !agencyId;
  const [edited, setEdited] = React.useState({});

  useEffect(() => {
    if (agencyId) {
      fetchPaymentAgency([`id: "${agencyId}"`]);
    }
    return () => clearPaymentAgency();
  }, [agencyId]);

  useEffect(() => {
    if (paymentAgency) setEdited(paymentAgency);
  }, [paymentAgency]);

  useEffect(() => {
    if (!submittingMutation && mutation) {
      journalize(mutation);
      if (isNew) {
        history.push(`/${ROUTE_PAYMENT_AGENCIES}`);
      }
    }
  }, [submittingMutation]);

  const save = (data) => {
    if (isNew) {
      createPaymentAgency(
        data,
        formatMessageWithValues(intl, MODULE_NAME, 'paymentAgency.mutation.createLabel', { name: data.name }),
      );
    } else {
      updatePaymentAgency(
        data,
        formatMessageWithValues(intl, MODULE_NAME, 'paymentAgency.mutation.updateLabel', { name: data.name }),
      );
    }
  };

  const title = isNew
    ? formatMessage(intl, MODULE_NAME, 'paymentAgency.page.title.new')
    : formatMessageWithValues(intl, MODULE_NAME, 'paymentAgency.page.title.edit', { name: paymentAgency?.name ?? '' });

  return (
    <div className={classes.page}>
      <Helmet title={title} />
      <Form
        module={MODULE_NAME}
        title={title}
        edited={edited}
        onEditedChanged={setEdited}
        fetching={fetchingPaymentAgency}
        save={save}
        back={() => history.push(`/${ROUTE_PAYMENT_AGENCIES}`)}
        HeadPanel={PaymentAgencyForm}
        mandatoryFieldsEmpty={() => false}
        saveTooltip={formatMessage(intl, MODULE_NAME, 'tooltip.save')}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  paymentAgency: state.merankabandi.paymentAgency,
  fetchingPaymentAgency: state.merankabandi.fetchingPaymentAgency,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPaymentAgency,
  clearPaymentAgency,
  createPaymentAgency,
  updatePaymentAgency,
  journalize,
}, dispatch);

export default withHistory(
  withModulesManager(injectIntl(withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(PaymentAgencyPage),
  ))),
);

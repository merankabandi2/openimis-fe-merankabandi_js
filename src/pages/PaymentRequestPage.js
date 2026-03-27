import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AddIcon from '@material-ui/icons/Add';
import { Fab } from '@material-ui/core';

import { makeStyles } from '@material-ui/styles';

import {
  Helmet,
  withTooltip,
  Form,
  useModulesManager,
  useTranslations,
  useHistory,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  PAYROLL_MODULE_NAME,
  RIGHT_PAYROLL_CREATE,
  PAYROLL_PAYROLL_ROUTE,
  RIGHT_PAYROLL_SEARCH,
} from '../constants';
import PaymentRequestHeadPanel from '../components/payroll/PaymentRequestHeadPanel';
import PaymentRequestTab from '../components/payroll/PaymentRequestTab';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function PaymentRequestPage({
  rights,
  confirmed,
  submittingMutation,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(PAYROLL_MODULE_NAME, modulesManager);

  const [readOnly] = useState(false);
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  const history = useHistory();

  const onCreate = () => history.push(
    `/${modulesManager.getRef(PAYROLL_PAYROLL_ROUTE)}`,
  );

  useEffect(() => {
    if (confirmed && typeof confirmed === 'function') confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const actions = [];

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('paymentRequestPage.title')} />
      {rights.includes(RIGHT_PAYROLL_SEARCH) &&
        (
          <Form
            key="payments-requests"
            module="payroll"
            title={formatMessage('paymentRequestPage.title')}
            HeadPanel={PaymentRequestHeadPanel}
            Panels={[PaymentRequestTab]}
            rights={rights}
            actions={actions}
            setConfirmedAction={setConfirmedAction}
            readOnly={readOnly}
          />
        )}
      {rights.includes(RIGHT_PAYROLL_CREATE) &&
        withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onCreate}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage('createButton.tooltip'),
        )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
  mutation: state.payroll.mutation,
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentRequestPage);

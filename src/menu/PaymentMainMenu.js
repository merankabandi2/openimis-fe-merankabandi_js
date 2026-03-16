/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import {
  PAYMENT_MAIN_MENU_CONTRIBUTION_KEY,
  PAYROLL_MODULE_NAME,
} from '../constants';

function PaymentMainMenu(props) {
  const entries = props.modulesManager
    .getContribs(PAYMENT_MAIN_MENU_CONTRIBUTION_KEY)
    .filter((c) => !c.filter || c.filter(props.rights));

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, PAYROLL_MODULE_NAME, 'mainMenuPayment')}
      entries={entries}
      menuId="mainMenuPayment"
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(PaymentMainMenu)));

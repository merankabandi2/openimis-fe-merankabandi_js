/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Assessment, BarChart, AttachMoney, Dashboard } from '@material-ui/icons';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import {
  RIGHT_BENEFIT_PLAN_SEARCH,
  ME_MAIN_MENU_CONTRIBUTION_KEY,
  ROUTE_ME_MONETARY_TRANSFERS,
  ROUTE_ME_RESULT_FRAMEWORK,
  RIGHT_MONETARY_TRANSFER_SEARCH,
} from '../constants';

function MEMainMenu(props) {
  const entries = [
    {
      text: formatMessage(props.intl, 'merankabandi', 'menu.merankabandi.resultFrameWork'),
      icon: <Assessment />,
      route: `/${ROUTE_ME_RESULT_FRAMEWORK}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.resultFrameWork',
    },
    {
      text: formatMessage(props.intl, 'merankabandi', 'menu.merankabandi.indicators'),
      icon: <BarChart />,
      route: '/me/indicators',
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'merankabandi.me.indicators',
    },
    {
      text: formatMessage(props.intl, 'merankabandi', 'menu.merankabandi.monetaryTransfer'),
      icon: <AttachMoney />,
      route: `/${ROUTE_ME_MONETARY_TRANSFERS}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.monetaryTransfers',
    },
    {
      text: formatMessage(props.intl, 'merankabandi', 'menu.merankabandi.enhancedResultFramework'),
      icon: <Dashboard />,
      route: '/me/enhanced-results-framework',
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'merankabandi.me.enhancedResultFramework',
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(ME_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, 'merankabandi', 'mainMenu.me')}
      entries={entries}
      menuId="MEMainMenu"
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(MEMainMenu)));

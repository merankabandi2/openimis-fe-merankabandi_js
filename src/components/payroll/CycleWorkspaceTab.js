import React from 'react';
import { Tab } from '@material-ui/core';
import { PublishedComponent, FormattedMessage } from '@openimis/fe-core';
import { CYCLE_WORKSPACE_TAB_VALUE, MODULE_NAME } from '../../constants';
import CycleWorkspacePanel from './CycleWorkspacePanel';

function CycleWorkspaceTabLabel({ onChange, tabStyle, isSelected }) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(CYCLE_WORKSPACE_TAB_VALUE)}
      selected={isSelected(CYCLE_WORKSPACE_TAB_VALUE)}
      value={CYCLE_WORKSPACE_TAB_VALUE}
      label={<FormattedMessage module={MODULE_NAME} id="cycleWorkspace.tab.label" />}
    />
  );
}

function CycleWorkspaceTabPanel({ value, paymentCycleUuid, rights }) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="merankabandi"
      index={CYCLE_WORKSPACE_TAB_VALUE}
      value={value}
    >
      <CycleWorkspacePanel
        edited={{ uuid: paymentCycleUuid }}
        rights={rights}
      />
    </PublishedComponent>
  );
}

export { CycleWorkspaceTabLabel, CycleWorkspaceTabPanel };

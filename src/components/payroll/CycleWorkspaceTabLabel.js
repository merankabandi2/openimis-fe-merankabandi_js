import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage } from '@openimis/fe-core';
import { CYCLE_WORKSPACE_TAB_VALUE } from '../../constants';

function CycleWorkspaceTabLabel({ intl, onChange, tabStyle, isSelected }) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(CYCLE_WORKSPACE_TAB_VALUE)}
      selected={isSelected(CYCLE_WORKSPACE_TAB_VALUE)}
      value={CYCLE_WORKSPACE_TAB_VALUE}
      label={formatMessage(intl, 'merankabandi', 'cycleWorkspace.tab.label')}
    />
  );
}

export default CycleWorkspaceTabLabel;

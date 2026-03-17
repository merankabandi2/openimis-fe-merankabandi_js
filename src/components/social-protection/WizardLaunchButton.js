import React from 'react';
import { Button } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { injectIntl } from 'react-intl';
import { formatMessage, useHistory, useModulesManager } from '@openimis/fe-core';
import { MODULE_NAME, ROUTE_BENEFICIARY_SELECTION_WIZARD } from '../../constants';

function WizardLaunchButton({ intl, benefitPlan }) {
  const history = useHistory();
  const modulesManager = useModulesManager();

  if (!benefitPlan?.id) return null;

  const handleClick = () => {
    history.push(`/${ROUTE_BENEFICIARY_SELECTION_WIZARD}/${benefitPlan.id}`);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outlined"
      style={{
        border: '0px',
        marginTop: '6px',
      }}
    >
      <PlayArrowIcon style={{ marginRight: 4 }} />
      {formatMessage(intl, MODULE_NAME, 'wizard.launchButton')}
    </Button>
  );
}

export default injectIntl(WizardLaunchButton);

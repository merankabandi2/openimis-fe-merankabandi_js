import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import { injectIntl } from 'react-intl';
import { formatMessage } from '@openimis/fe-core';
import { MODULE_NAME, CARD_GENERATION_URL } from '../../constants';

function CardGenerationButton({ intl, location }) {
  const [loading, setLoading] = useState(false);

  if (!location || !location.countActive || location.countActive <= 0) {
    return null;
  }

  const handleGenerateCards = () => {
    setLoading(true);
    const url = `${CARD_GENERATION_URL}/${location.id}/generate-cards-background/`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(formatMessage(intl, MODULE_NAME, 'cards.generationStarted'));
        } else {
          alert(`${formatMessage(intl, MODULE_NAME, 'cards.generationError')}: ${data.message}`);
        }
      })
      .catch((error) => {
        alert(`${formatMessage(intl, MODULE_NAME, 'cards.generationError')}: ${error.message}`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={loading ? <CircularProgress size={16} /> : <CreditCardIcon />}
      onClick={handleGenerateCards}
      disabled={loading}
    >
      {formatMessage(intl, MODULE_NAME, 'cards.generate')}
      {` (${location.countActive})`}
    </Button>
  );
}

export default injectIntl(CardGenerationButton);

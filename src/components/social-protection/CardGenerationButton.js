import React from 'react';
import { CARD_GENERATION_URL } from '../../constants';

function CardGenerationButton({ location, formatMessage }) {
  if (!location || !location.countActive || location.countActive <= 0) {
    return null;
  }

  const handleGenerateCards = (e) => {
    e.preventDefault();
    const url = `${CARD_GENERATION_URL}/${location.id}/generate-cards-background/`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(formatMessage('cards.generationStarted'));
        } else {
          alert(`${formatMessage('cards.generationError')}: ${data.message}`);
        }
      })
      .catch((error) => {
        alert(`${formatMessage('cards.generationError')}: ${error.message}`);
      });
  };

  return (
    <a
      href="#"
      onClick={handleGenerateCards}
    >
      {formatMessage('cards.generate')}
    </a>
  );
}

export default CardGenerationButton;

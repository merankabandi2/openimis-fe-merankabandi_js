import React, { useState } from 'react';
import { useTranslations, Autocomplete, useGraphqlQuery } from '@openimis/fe-core';

function MultiCategoryPicker(props) {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
  } = props;
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations('grievanceSocialProtection', 'ticket');

  const { isLoading, data, error } = useGraphqlQuery(
    `query CategoryPicker {
        grievanceConfig{
          grievanceTypes
        }
    }`,
    { searchString, first: 20 },
    { skip: true },
  );

  const parseValue = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      if (val.startsWith('[')) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val.split(' ').filter(v => v);
        }
      }
      return val.split(' ').filter(v => v);
    }
    return [];
  };

  const handleChange = (newValue) => {
    onChange(Array.isArray(newValue) ? newValue : []);
  };

  return (
    <Autocomplete
      multiple
      required={required}
      placeholder={placeholder ?? formatMessage('CategoryPicker.placeholder')}
      label={label ?? formatMessage('CategoryPicker.label')}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.grievanceConfig?.grievanceTypes ?? []}
      isLoading={isLoading}
      value={parseValue(value)}
      getOptionLabel={(option) => {
        try {
          if (typeof option === 'string' && option.includes('|')) {
            const fullPathTranslated = formatMessage(`grievance.category.${option}`);
            if (fullPathTranslated !== `grievance.category.${option}`) {
              return fullPathTranslated;
            }
            const parts = option.split('|').map(part => part.trim());
            const translatedParts = parts.map(part => {
              const translated = formatMessage(`grievance.category.${part}`);
              return translated !== `grievance.category.${part}` ? translated : part;
            });
            return translatedParts.join(' | ');
          }
          const translated = formatMessage(`grievance.category.${option}`);
          return translated !== `grievance.category.${option}` ? translated : option;
        } catch (e) {
          return option;
        }
      }}
      onChange={(options) => handleChange(options)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
}

export default MultiCategoryPicker;

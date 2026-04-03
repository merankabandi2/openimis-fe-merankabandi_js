import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';

const GRIEVANT_TYPE_LIST = ['individual', 'beneficiary', 'user'];

function GrievantTypePicker(props) {
  const {
    required, withNull = true, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="grievanceSocialProtection"
      label="grievantType"
      constants={GRIEVANT_TYPE_LIST}
      onChange={onChange}
      value={value}
      required={required}
      readOnly={readOnly}
      withNull={withNull}
      nullLabel={nullLabel || ' '}
      withLabel={withLabel}
    />
  );
}

export default GrievantTypePicker;

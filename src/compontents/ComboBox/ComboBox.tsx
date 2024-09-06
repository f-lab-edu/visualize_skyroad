import React from "react";
import { styled } from '@stitches/react';

const ComboBoxContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minWidth: '250px',
  padding: '8px',
  border: '1px solid $border',
  borderRadius: '8px',
  backgroundColor: '#EFEFEF',//'$background',
});

const Select = styled('select', {
  padding: '8px',
  borderRadius: '4px',
  border: 'none',
  color: '$primary',
  backgroundColor: '#EFEFEF',//'$background',
});

const Option = styled('option', {
  textAlign: 'center',
});

const ComboBox = () => {
  return (
    <ComboBoxContainer>
      <Select>
        <Option value="value-01">value</Option>
      </Select>
    </ComboBoxContainer>
  );
};

export default ComboBox;

import React from "react";
import { styled } from "@stitches/react";

const Button = styled('button', {
  backgroundColor: '#18B2FF', // todo - blue로 정의하고 바꾸기
  color: 'white',
  minWidth: '120px',
  fontSize: '16px',
  padding: '10px 20px',
  borderRadius: '50px',
  border: 'none',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'darkblue', // todo - hex변경하기
  },
});

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

function VSkyButton({ children, onClick }: ButtonProps) {
  return <Button onClick={onClick}>{children}</Button>;
}

export default VSkyButton;

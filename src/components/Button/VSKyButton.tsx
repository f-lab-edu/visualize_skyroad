import { styled } from '@stitches/react'
import React from 'react'

const Button = styled('button', {
  backgroundColor: '#18B2FF',
  color: 'white',
  minWidth: '120px',
  fontSize: '16px',
  padding: '10px 20px',
  borderRadius: '50px',
  border: 'none',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'darkblue',
  },
  '&.toggled': {
    backgroundColor: '#28a745',
  },
})

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  toggled?: boolean
}

function VSkyButton({ children, onClick, toggled }: ButtonProps) {
  return (
    <Button className={toggled ? 'toggled' : ''} onClick={onClick}>
      {children}
    </Button>
  )
}

export default VSkyButton

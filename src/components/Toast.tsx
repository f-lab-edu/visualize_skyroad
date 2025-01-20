import { keyframes, styled } from '@stitches/react'
import React, { useState } from 'react'

const fadeInOut = keyframes({
  '0%': { opacity: 0, transform: 'translateY(20px)' },
  '10%, 90%': { opacity: 1, transform: 'translateY(0)' },
  '100%': { opacity: 0, transform: 'translateY(20px)' },
})

const ToastWrapper = styled('div', {
  position: 'fixed',
  tor: '20px',
  right: `50px`,
  backgroundColor: '#333',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '5px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  animation: `${fadeInOut} 3s ease-in-out`,
})

const Button = styled('button', {
  padding: '10px 15px',
  backgroundColor: '#007BFF',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#0056b3',
  },
})

interface ToastProps {
  duration: number
  message: string
}

const Toast: React.FC<ToastProps> = ({ duration, message }) => {
  const [visible, setVisible] = useState(false)

  const showToast = () => {
    setVisible(true)
    setTimeout(() => {
      setVisible(false)
    }, duration)
  }

  return (
    <div>
      <Button onClick={showToast}>Show Toast</Button>
      {visible && (
        <ToastWrapper>
          {message || '토스트 메시지 내용이 없습니다.'}
        </ToastWrapper>
      )}
    </div>
  )
}

export default Toast

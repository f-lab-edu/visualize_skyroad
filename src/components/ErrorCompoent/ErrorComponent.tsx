import { styled } from '@stitches/react'
import React from 'react'

import VSkyButton from '../Button/VSKyButton'

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <ErrorPageContainer>
      <div className="modal">
        <h2>에러가 발생했어요!</h2>
        <p className="cat">😿</p>
        <p>
          <b>자세히:</b>&nbsp;{error.message}
        </p>
        <VSkyButton onClick={() => window.location.reload()}>
          다시시도
        </VSkyButton>
      </div>
    </ErrorPageContainer>
  )
}

export default ErrorFallback

const ErrorPageContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
  '.modal': {
    padding: '50px 100px',
    margin: 'auto',
    border: '1px solid black',
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: '10px 6px 12px 1px rgba(50, 50, 255, .2)',
    textAlign: 'center',
  },
  '.cat': {
    fontSize: '3rem',
  },
})

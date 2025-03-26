import { styled } from '@stitches/react'
import React from 'react'

type LoadingType = 'data' | 'default' | 'flight'

interface LoadingProps {
  type?: LoadingType
}
// eslint-disable-next-line react/prop-types
const Loading: React.FC<LoadingProps> = ({ type = 'default' }) => {
  const loadingTexts: Record<LoadingType, string> = {
    flight: ' 항공데이터를 불러오는 중...',
    data: '데이터를 분석하는 중...',
    default: '로딩중입니다!',
  }

  return (
    <LoadingContainer type={type}>
      <div className="LoadingText">{loadingTexts[type]}</div>
      <div className="dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </LoadingContainer>
  )
}

const LoadingContainer = styled('div', {
  variants: {
    type: {
      flight: {
        background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
      },
      data: {
        background: 'linear-gradient(135deg, #90EE90, #98FB98, #3CB371)',
      },
      default: {
        background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
      },
    },
  },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  margin: '0',
  fontFamily: 'Arial, sans-serif',

  '.LoadingText': {
    fontSize: '2rem',
    marginBottom: '20px',
    color: 'White',
    background: 'rgba(135, 206, 250, 0.85)',
    padding: '10px 25px',
    borderRadius: '25px',
  },

  '.dots': {
    display: 'flex',
    gap: '10px',
  },

  '.dot': {
    width: '20px',
    height: '20px',
    backgroundColor: 'white',
    borderRadius: '50%',
    animation: 'blink 1.2s infinite',

    '&:nth-child(2)': {
      animationDelay: '0.4s',
    },
    '&:nth-child(3)': {
      animationDelay: '0.8s',
    },
  },

  '@keyframes blink': {
    '0%, 80%, 100%': { opacity: 0.3 },
    '40%': { opacity: 1 },
  },
})

export default Loading

import { styled } from '@stitches/react'
import React from 'react'

import { STRINGS } from '../../constants/strings'

export const AppTitle = () => (
  <HomeHeaderText>
    <div className="title">{STRINGS.HOME.Header}</div>
    <p>{STRINGS.HOME.Greeting}</p>
    <p>{STRINGS.HOME.Description}</p>
  </HomeHeaderText>
)

const HomeHeaderText = styled('header', {
  color: 'WhiteSmoke',
  WebkitBackgroundClip: 'text',
  fontSize: '5rem',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
  margin: 'auto',
  cursor: 'default',
  textAlign: 'center',

  '@media (max-width: 768px)': {
    fontSize: '3rem',
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    fontSize: '4rem',
  },

  div: {
    position: 'relative',
    color: 'SmokeWhite',
    textDecoration: 'none',

    '::before': {
      content: "''",
      position: 'absolute',
      left: 0,
      bottom: '-4px', // 텍스트 하단에서 조금 더 여유를 둠
      width: 0,
      height: '2px',
      backgroundColor: '#4A90E2',
      transition: 'width 0.3s ease',
    },

    '&:hover::before': {
      width: '100%',
    },
  },

  p: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.80)',
    fontWeight: 'bold',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',

    '@media (max-width: 768px)': {
      fontSize: '1rem',
    },
    '@media (min-width: 769px) and (max-width: 1024px)': {
      fontSize: '1.1rem',
    },
  },
})

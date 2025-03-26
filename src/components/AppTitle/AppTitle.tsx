import { keyframes, styled } from '@stitches/react'
import React from 'react'

import { STR_HOME } from '../../constants/strings'

export const AppTitle = () => (
  <HomeHeaderText>
    <div className="title">
      <span style={{ position: 'relative' }}>{STR_HOME.Header}</span>
    </div>
    <p>{STR_HOME.Greeting}</p>
    <p>{STR_HOME.Description}</p>
  </HomeHeaderText>
)

const waveAnimation = keyframes({
  '0%': { backgroundPosition: '0 0' },
  '100%': { backgroundPosition: '200% 0' },
})

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

  '.title': {
    position: 'relative',
    color: 'whitesmoke',
    textDecoration: 'none',
    display: 'inline-block',

    '&::before': {
      content: '""',
      position: 'absolute',
      left: '0',
      bottom: '10%',
      width: '100%',
      height: '35px',
      backgroundColor: 'rgba(135, 206, 235, 0.4)',
      zIndex: '0',
      transition: 'all 0.3s ease',
    },

    '&:hover::before': {
      height: '45px',
      backgroundColor: 'rgba(135, 206, 235, 0.6)',
      backgroundImage:
        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
      backgroundSize: '200% 100%',
      animation: `${waveAnimation} 2s infinite linear`,
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

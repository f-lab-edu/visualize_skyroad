import { styled } from '@stitches/react'
import React, { Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Airport, useAirports } from '../api/airports'
import { Flight, FlightForDisplay, FlightList } from '../api/flight'
import backgroundImage from '../assets/sky1.jpg'
import SkyButton from '../components/Button/VSKyButton'
import AirportComboBox from '../components/AirportComboBox/AirportComboBox'
import { requestFlightList } from '../data/dataProcessingLayer'
import { useSuspenseQuery } from '@tanstack/react-query'

const STINGS = {
  Header: 'Explore the World!',
  Greeting: `🎒우리 또 떠나요~!!!`,
  LoadingText: `···✈️`,
  Description: `✈️ 출발지와 도착지의 공항을 검색 및 선택해주세요.(도시이름으로 검색 🏙️)`,
  Departure: 'Departure(출발지)',
  Arrival: 'Arrival(도착지)',
  buttonText: 'Search',
  appversion: 'AppVersion: VSky v0.5',
}

const Home = () => {
  const { airports } = useAirports()
  const navigate = useNavigate()
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)

  const { data: flightList, isLoading, error, refetch } = useSuspenseQuery<FlightList>({
    queryKey: ['flightList', departureAirport, arrivalAirport],
    queryFn: () => requestFlightList({ departureAirport, arrivalAirport }),
  })

  const handleSearch = async () => {
    if (!(departureAirport && arrivalAirport)) {
      alert('출발/도착 공항을 선택해주세요! :)')
      return
    }

    refetch()

  }

  const handleFlight = (index: number) => {
    navigate('/flight', {
      state: {
        departure: departureAirport,
        arrival: arrivalAirport,
        flight: flightList ? flightList[index] : null,
      },
    })
  }

  return (<HomeLayoutSytle>
    <HomeHeaderText>
      <div className='title'>{STINGS.Header}</div>
      {/* <p>{STINGS.Greeting}</p> */}
      <p>{STINGS.Description}</p>
    </HomeHeaderText>

    <RouteComboxBoxContainer>
      <div>
        <AirportComboBox
          airports={airports}
          blacklist={arrivalAirport}
          onSelectAirport={setDepartureAirport}
        />
        <AirportComboBox
          airports={airports}
          blacklist={departureAirport}
          onSelectAirport={setArrivalAirport}
        />
      </div>
      <div>
        <SkyButton onClick={handleSearch}>{STINGS.buttonText}</SkyButton>
      </div>
    </RouteComboxBoxContainer>

    <Suspense fallback={<div>로딩중...</div>}>
      {flightList && flightList.length > 0
        && (<FlightListContainer>
          {flightList && flightList.map((flight: Flight & FlightForDisplay, index: number) => (
            <li key={flight.icao24 + flight.firstSeen}>
              `항공편: {flight.callsign} | 출발: [공항이름] {flight.estDepartureAirport} | 도착: [공항이름] {flight.estArrivalAirport} | `
              <SkyButton onClick={() => handleFlight(index)}>Flight</SkyButton>
            </li>
          ))}
        </FlightListContainer>)}
    </Suspense>

    <p className='app'>{STINGS.appversion}</p>

  </HomeLayoutSytle>)
}

export default Home

const HomeLayoutSytle = styled('div', {
  margin: 'none',
  height: '100vh',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  fontFamily: 'Roboto, sans-serif',
  gap: '20px',

  '@media (max-width: 768px)': {
    padding: '10px',
    backgroundPosition: 'center',
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    padding: '20px',
    backgroundPosition: 'top',
  },
  '.app': {
    marginLeft: 'auto',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.75)',
  }
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

  'div': {
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

  'p': {
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

const RouteComboxBoxContainer = styled('div', {
  display: 'flex',
  backgroundColor: 'rgba(250, 250, 250, 0.9)',
  width: 'max-content',
  borderRadius: '15px',
  padding: '20px',
  margin: 'auto',
  gap: '10px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',

  '@media (max-width: 768px)': {
    flexDirection: 'column',
    width: '80vw',
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    width: '60vw',
  },
})

const FlightListContainer = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(250, 250, 250, 0.9)',
  color: 'rgba(0, 0, 0, 0.8)',
  width: '90vw',
  maxHeight: '30vh',
  overflowY: 'auto',
  borderRadius: '20px',
  padding: '20px',
  margin: 'auto',
  gap: '10px',
  listStyle: 'none',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',

  '@media (max-width: 768px)': {
    width: '100vw',
    maxHeight: '40vh',
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    width: '80vw',
  },

  li: {
    '&:hover': {
      backgroundColor: 'rgba(200, 200, 200, 0.15)',
    },
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '10px',
    transition: 'background-color 0.3s ease',
  },
})

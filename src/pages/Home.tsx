import { styled } from '@stitches/react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Airport, useAirports } from '../api/airports'
import { fetchFlight, Flight, FlightForDisplay, FlightList } from '../api/flight'
import backgroundImage from '../assets/sky1.jpg'
import SkyButton from '../components/Button/VSKyButton'
import AirportComboBox from '../components/AirportComboBox/AirportComboBox'
import { requestFlightList } from '../data/dataProcessingLayer'

const STINGS = {
  Header: 'ExploreTheWorld!!',
  Greeting: '같이 튀자 ~ ✈️',
  Departure: 'Departure(출발지)',
  Arrival: 'Arrival(도착지)',
  buttonText: 'Search',
}

const Home = () => {
  const { airports } = useAirports()
  const navigate = useNavigate()
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)
  const [flightList, setFlightList] = useState<FlightList>([])

  const handleSearch = async () => {
    if (!(departureAirport && arrivalAirport)) {
      alert('출발/도착 공항을 선택해주세요! :)')
      return
    }

    const flightList = await requestFlightList({
      departureAirport,
      arrivalAirport,
    })
    console.log(flightList)
    setFlightList(flightList)

  }

  const handleFlight = (index: number) => {
    navigate('/flight', {
      state: {
        departure: departureAirport,
        arrival: arrivalAirport,
        flight: flightList[index],
      },
    })
  }

  return (
    <HomeLayoutSytle>
      <HomeHeaderText>
        {STINGS.Header}
        <p>{STINGS.Greeting}</p>
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

      {flightList.length > 0
        && (<FlightListContainer>
          {flightList.map((flight: Flight & FlightForDisplay, index: number) => (
            <li key={flight.icao24 + flight.firstSeen}>
              {flight.text} &nbsp;|&nbsp; {flight.dep}&nbsp;|&nbsp; {flight.arr}{' '}
              |<SkyButton onClick={() => handleFlight(index)}>Flight</SkyButton>
            </li>
          ))}
        </FlightListContainer>)}
    </HomeLayoutSytle>
  )
}

export default Home
const HomeLayoutSytle = styled('div', {
  margin: 'none',
  height: '100vh',
  boxSizing: 'border-box',
  display: 'flex',
  textAlign: 'center',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundOrigin: 'padding-box',
  fontFamily: 'Roboto, sans-serif',
  borderRadius: '5px',

  '@media (max-width: 768px)': {
    // 모바일 화면 스타일
    padding: '10px',
    backgroundPosition: 'center',
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    // 태블릿 화면 스타일
    padding: '20px',
    backgroundPosition: 'top',
  },
})

const HomeHeaderText = styled('h1', {
  color: 'WhiteSmoke',
  WebkitBackgroundClip: 'text',
  fontSize: '5rem',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  margin: 'auto',
  cursor: 'default',

  '@media (max-width: 768px)': {
    fontSize: '3rem', // 모바일 화면에서는 글씨 크기 축소
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    fontSize: '4rem', // 태블릿 화면에서는 중간 크기
  },

  p: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 'normal',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',

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
  borderRadius: '50px',
  padding: '20px',
  margin: 'auto',
  gap: '10px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',

  '@media (max-width: 768px)': {
    flexDirection: 'column', // 모바일에서는 수직 정렬
    width: '80vw',
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    width: '60vw', // 태블릿에서는 조금 더 넓게
  },
})

const FlightListContainer = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(250, 250, 250, 0.9)',
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
    width: '100vw', // 모바일 화면에서는 전체 너비 사용
    maxHeight: '40vh', // 모바일에서는 더 큰 높이
  },
  '@media (min-width: 769px) and (max-width: 1024px)': {
    width: '80vw', // 태블릿에서는 중간 너비
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

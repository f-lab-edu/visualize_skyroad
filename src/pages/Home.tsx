import { styled } from '@stitches/react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Airport, useAirports } from '../api/airports'
import { fetchFlight, Flight, FlightList } from '../api/flight'
import backgroundImage from '../assets/sky1.jpg'
import SkyButton from '../components/Button/VSKyButton'
import AirportComboBox from '../components/AirportComboBox/AirportComboBox'
import { findFlightFromICNtoJFK } from '../data/dataProcessingLayer'

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
  // const [flight, setFlight] = useState();

  // useEffect(() => {
  //   findFlightFromICNtoJFK().then(console.log)
  // }, [])

  const handleSearch = async () => {
    if (!(departureAirport && arrivalAirport)) {
      alert('출발/도착 공항을 선택해주세요! :)')
      return
    }

    const flightList = await fetchFlight({
      departureAirport,
      arrivalAirport,
    })

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

      {flightList.length > 0 && (
        <FlightListContainer>
          {flightList.map((flight: Flight, index: number) => (
            <li key={flight.icao24 + flight.firstSeen}>
              {flight.text} &nbsp;|&nbsp; {flight.dep}&nbsp;|&nbsp; {flight.arr}{' '}
              |<SkyButton onClick={() => handleFlight(index)}>Flight</SkyButton>
            </li>
          ))}
        </FlightListContainer>
      )}
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
  fontFamily: 'Roboto',
  borderRadius: '5px',
})

/*
  출발지: Departure point (or Origin)
  도착지: Arrival point (or Destination)
*/
// const DepartureComboBox = () => <ComboBox />
// const ArrivalComboBox = () => <ComboBox />

const RouteComboxBoxContainer = styled('div', {
  display: 'flex',
  // flexDirection: 'column',
  backgroundColor: '#FAFAFA',
  width: 'max-content',
  borderRadius: '100px',
  padding: '15px',
  margin: 'auto',
  gap: '5px',
})

const FlightListContainer = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FAFAFA',
  width: '90vw',
  borderRadius: '35px',
  padding: '15px',
  margin: 'auto',
  gap: '5px',
  listStyle: 'none',
  li: {
    '&:hover': {
      backgroundColor: 'rgba(200,200,200,0.125)',
    },
    width: '100%',
    //border: "1px solid red",
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    verticalAlign: 'center',
  },
})

const HomeHeaderText = styled('h1', {
  color: 'white',
  fontSize: '5rem',
  margin: 'auto',
  cursor: 'default',
  p: {
    fontSize: '1rem',
    color: 'black',
    fontWeight: 'normal',
  },
})

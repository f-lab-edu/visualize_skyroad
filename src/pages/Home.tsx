import { styled } from '@stitches/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Airport } from '../api/airports'
import { FlightList } from '../api/flight'
import backgroundImage from '../assets/sky1.jpg'
import { AppTitle } from '../components/AppTitle/AppTitle'
import AppVersion from '../components/AppVersion'
import { SearchBar } from '../components/Search/SearchBar'
import { SearchResults } from '../components/Search/SearchResult'
import { STRINGS } from '../constants/strings'
import { requestFlightList } from '../data/dataProcessingLayer'

const Home = () => {
  const navigate = useNavigate()
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)

  const {
    data: flightList,
    isLoading,
    refetch,
  } = useSuspenseQuery<FlightList>({
    queryKey: ['flightList', departureAirport, arrivalAirport],
    queryFn: () => requestFlightList({ departureAirport, arrivalAirport }),
  })

  const handleSearch = async () => {
    if (!(departureAirport && arrivalAirport)) {
      alert(STRINGS.HOME.WarningChooseBoth)
      return
    }
    refetch()
  }

  const handleFlightSelect = (index: number) => {
    navigate('/flight', {
      state: {
        departure: departureAirport,
        arrival: arrivalAirport,
        flight: flightList ? flightList[index] : null,
      },
    })
  }

  return (
    <HomeLayout>
      <AppTitle />
      <SearchBar
        arrivalAirport={arrivalAirport}
        departureAirport={departureAirport}
        onArrivalSelect={setArrivalAirport}
        onDepartureSelect={setDepartureAirport}
        onSearch={handleSearch}
      />
      <Suspense fallback={<div>{STRINGS.HOME.LoadingText}</div>}>
        <SearchResults
          flightList={flightList}
          isLoading={isLoading}
          onFlightSelect={handleFlightSelect}
        />
      </Suspense>
      <AppVersion />
    </HomeLayout>
  )
}
export default Home

const HomeLayout = styled('div', {
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
    fontSize: '.75rem',
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.75)',
  },
})

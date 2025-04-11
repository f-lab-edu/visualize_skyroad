import { styled } from '@stitches/react'
import React from 'react'

import { Flight, FlightForDisplay } from '../../api/flight'
import SkyButton from '../../components/Button/VSKyButton'

interface FlightListItemProps {
  flight: Flight & FlightForDisplay
  onSelect: () => void
}

const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return '시간 정보 없음'

  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) return '시간 정보 없음'

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const FlightListItem = ({ flight, onSelect }: FlightListItemProps) => {
  return (
    <ListItem>
      <FlightInfo>
        <FlightHeader>
          <Callsign>{flight.callsign || '항공편 정보 없음'}</Callsign>
          <Route>
            <Airport>
              {flight.estDepartureAirport || '출발지 정보 없음'}
            </Airport>
            <Arrow>→</Arrow>
            <Airport>{flight.estArrivalAirport || '도착지 정보 없음'}</Airport>
          </Route>
        </FlightHeader>
        <TimeInfo>
          <TimeRange>
            <Time>출발: {formatDate(flight.firstSeen)}</Time>
            <Arrow>~</Arrow>
            <Time>도착: {formatDate(flight.lastSeen)}</Time>
          </TimeRange>
        </TimeInfo>
      </FlightInfo>
      <SkyButton onClick={onSelect}>Flight</SkyButton>
    </ListItem>
  )
}

const ListItem = styled('li', {
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
})

const FlightInfo = styled('div', {
  flex: 1,
})

const FlightHeader = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
})

const Callsign = styled('span', {
  fontWeight: 'bold',
})

const Route = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: '10px',
})

const Airport = styled('span', {
  margin: '0 5px',
})

const Arrow = styled('span', {
  margin: '0 5px',
})

const TimeInfo = styled('div', {
  marginTop: '10px',
})

const TimeRange = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
})

const Time = styled('span', {
  margin: '0 5px',
})

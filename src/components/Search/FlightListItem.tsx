import { styled } from '@stitches/react'
import React from 'react'

import { Flight, FlightForDisplay } from '../../api/flight'
import SkyButton from '../../components/Button/VSKyButton'

interface FlightListItemProps {
  flight: Flight & FlightForDisplay
  onSelect: () => void
}

export const FlightListItem = ({ flight, onSelect }: FlightListItemProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <ListItem>
      {`Callsign: ${flight.callsign} | 출발 -> 도착: ${
        flight.estDepartureAirport
      } -> ${flight.estArrivalAirport} | ${formatDate(
        flight.firstSeen
      )}~${formatDate(flight.lastSeen)}) | `}
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

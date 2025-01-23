import { styled } from '@stitches/react'
import React from 'react'

import { Airport, useAirports } from '../../api/airports'
import AirportComboBox from '../../components/AirportComboBox/AirportComboBox'
import SkyButton from '../../components/Button/VSKyButton'
import { STR_HOME } from '../../constants/strings'

interface SearchBarProps {
  arrivalAirport: Airport | null
  departureAirport: Airport | null
  onArrivalSelect: (airport: Airport | null) => void
  onDepartureSelect: (airport: Airport | null) => void
  onSearch: () => void
}

export const SearchBar = ({
  departureAirport,
  arrivalAirport,
  onDepartureSelect,
  onArrivalSelect,
  onSearch,
}: SearchBarProps) => {
  const { airports, searchAirports } = useAirports()

  return (
    <RouteComboBoxContainer>
      <div>
        <AirportComboBox
          airports={airports}
          // blacklist={arrivalAirport}
          onSelectAirport={onDepartureSelect}
          searchAirports={searchAirports}
        />
        <AirportComboBox
          airports={airports}
          // blacklist={departureAirport}
          onSelectAirport={onArrivalSelect}
          searchAirports={searchAirports}
        />
      </div>
      <div>
        <SkyButton onClick={onSearch}>{STR_HOME.buttonText}</SkyButton>
      </div>
    </RouteComboBoxContainer>
  )
}

const RouteComboBoxContainer = styled('div', {
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

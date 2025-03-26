import { styled } from '@stitches/react'
import React, { useEffect, useRef, useState } from 'react'
import FlagIcon from 'react-flagkit'

import { AirportList } from '../../api/airports'

const AirportComboBox = ({
  airports,
  onSelectAirport,
  blacklist,
  searchAirports,
}: any) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredAirports, setFilteredAirports] = useState<AirportList>([])
  const isSelecting = useRef(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  useEffect(() => {
    if (isSelecting.current) {
      isSelecting.current = false
      return
    }

    if (searchTerm === '' || searchTerm.length < 2) {
      setFilteredAirports([])
      return
    }

    const filtered = searchAirports(searchTerm)
    setFilteredAirports(filtered)
  }, [searchTerm])

  const handleOptionClick = (airport: any) => {
    isSelecting.current = true
    onSelectAirport(airport)
    setSearchTerm(`${airport.city} ${airport.name}`)
    setFilteredAirports([])
  }

  const AirportElementItem = ({ airport }: { airport: any }) => (
    <Option onClick={() => handleOptionClick(airport)}>
      {airport.flag === '-' ? (
        '🌏'
      ) : (
        <FlagIcon alt={airport.country} country={airport.flag} />
      )}
      &nbsp;<p>{airport.city}</p>&nbsp;{airport.name}
    </Option>
  )

  return (
    <ComboBoxContainer>
      <Input
        onChange={handleInputChange}
        placeholder="공항을 검색해주세요."
        type="text"
        value={searchTerm}
      />
      {filteredAirports.length > 0 && (
        <Dropdown>
          {filteredAirports
            .filter((airport: any) => airport.id !== blacklist?.id)
            .map((airport: any) => (
              <div key={airport.id}>
                <AirportElementItem airport={airport} />
              </div>
            ))}
        </Dropdown>
      )}
    </ComboBoxContainer>
  )
}

export default AirportComboBox

const ComboBoxContainer = styled('div', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '250px',
  padding: '8px',
  border: '1px solid #CCC',
  borderRadius: '8px',
  backgroundColor: '#EFEFEF',
})
const Input = styled('input', {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #CCC',
  marginBottom: '8px',
  width: '100%',
  boxSizing: 'border-box',
})
const Dropdown = styled('ul', {
  position: 'absolute',
  top: '100%',
  left: '0',
  right: '0',
  zIndex: 1000,
  listStyle: 'none',
  padding: '0',
  margin: '0',
  border: '1px solid #CCC',
  borderRadius: '4px',
  backgroundColor: '#FFF',
  maxHeight: '200px',
  overflowY: 'auto',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
})
const Option = styled('li', {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'left',
  padding: '8px',
  cursor: 'pointer',
  width: '100%',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  '&:hover': {
    backgroundColor: '#DDD',
  },

  p: {
    fontWeight: 'bold',
    fontSize: '.8rem',
    margin: '0',
    padding: '0',
  },
})

import { styled } from '@stitches/react'
import React, { useEffect, useState } from 'react'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  useEffect(() => {
    if (searchTerm === '' || searchTerm.length < 2) {
      setFilteredAirports([])
      return
    }

    // const filtered = airports.filter(
    //   (airport: any) =>
    //     airport.city
    //       .replaceAll(' ', '')
    //       .toLowerCase()
    //       .indexOf(searchTerm.toLocaleLowerCase()) > -1 ||
    //     airport.country
    //       .replaceAll(' ', '')
    //       .toLowerCase()
    //       .indexOf(searchTerm.toLocaleLowerCase()) > -1
    // )
    const filtered = searchAirports(searchTerm)
    setFilteredAirports(filtered)
  }, [searchTerm])

  const handleOptionClick = (airport: any) => {
    onSelectAirport(airport)
    setSearchTerm(airport.name)
    setFilteredAirports([])
  }

  const AirportElementItem = ({ key, airport }: { key: any; airport: any }) => (
    <Option key={key} onClick={() => handleOptionClick(airport)}>
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
              <AirportElementItem airport={airport} key={airport.id} />
            ))}
        </Dropdown>
      )}
    </ComboBoxContainer>
  )
}

export default AirportComboBox

const ComboBoxContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minWidth: '250px',
  padding: '8px',
  border: '1px solid #CCC',
  borderRadius: '8px',
  backgroundColor: '#EFEFEF', //'$background',
})
const Input = styled('input', {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #CCC',
  marginBottom: '8px',
  // position: 'absolute',
})
const Dropdown = styled('ul', {
  listStyle: 'none',
  padding: '0',
  margin: '0',
  border: '1px solid #CCC',
  borderRadius: '4px',
  backgroundColor: '#FFF',
  maxHeight: '150px',
  maxWidth: '350px',
  overflowY: 'auto',
})
const Option = styled('li', {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'left',
  width: 'max-content',
  padding: '8px',
  overflow: 'hidden',
  cursor: 'pointer',

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

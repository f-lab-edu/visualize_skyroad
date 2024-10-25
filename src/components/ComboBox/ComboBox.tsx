import { styled } from '@stitches/react'
import React, { useEffect, useState } from 'react'

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
  maxWidth: '250px',
  overflowY: 'auto',
})
const Option = styled('li', {
  padding: '8px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#DDD',
  },
  textAlign: 'left',
})

const ComboBox = ({ airports, onSelectAirport, blacklist }: any) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredAirports, setFilteredAirports] = useState([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  useEffect(() => {
    if (searchTerm === '' || searchTerm.length < 2) return

    const filtered = airports.filter(
      (airport: any) =>
        airport.city
          .replaceAll(' ', '')
          .toLowerCase()
          .indexOf(searchTerm.toLocaleLowerCase()) > -1
    )
    setFilteredAirports(filtered)
    console.log('--*--', searchTerm, '--*--', filtered)
  }, [searchTerm])

  const handleOptionClick = (airport: any) => {
    onSelectAirport(airport)
    setSearchTerm(airport.name)
    setFilteredAirports([])
  }

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
              <Option
                key={airport.id}
                onClick={() => handleOptionClick(airport)}
              >
                ({airport.country}:{airport.city}) {airport.name}
              </Option>
            ))}
        </Dropdown>
      )}
    </ComboBoxContainer>
  )
}

export default ComboBox

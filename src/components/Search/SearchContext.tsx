import { createContext } from 'react'

import { Airport } from '../../api/airports'
import { FlightList } from '../../api/flight'

// SearchContext.tsx
export const SearchContext = createContext<{
  departureAirport: Airport | null
  arrivalAirport: Airport | null
  setDepartureAirport: (airport: Airport | null) => void
  setArrivalAirport: (airport: Airport | null) => void
  flightList: FlightList | null
}>({})

export const SearchProvider = ({ children }) => {
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)
  // React Query 로직...

  return (
    <SearchContext.Provider
      value={{
        departureAirport,
        arrivalAirport,
        setDepartureAirport,
        setArrivalAirport,
        flightList,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

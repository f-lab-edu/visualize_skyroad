export interface Flight {
  id: string
  flightNumber: string
  departure: {
    latitude: number
    longitude: number
    name: string
  }
  arrival: {
    latitude: number
    longitude: number
    name: string
  }
  departureAirport: string
  arrivalAirport: string
  departureTime: Date
  arrivalTime: Date
  path: [number, number][] // [longitude, latitude]
  altitude?: number
  speed?: number
  heading?: number
}

export type FlightList = Flight[] 
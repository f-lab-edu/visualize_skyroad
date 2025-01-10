import { Airport } from '../api/airports'
import { Aircraft, AircraftStatus, Flight, FlightList } from '../api/flight'
import { getAllActiveFlights, getDepartureAirport } from '../api/flight'
import { flightsDepartureAirport, flightsLAX2RKSI } from '../dummyData'

// export const getDepartureAirport = async (airportICAO: string): Promise<any> => {
//     const TIMESTAMP_END = 1730194134
//     const url = `https://opensky-network.org/api/flights/departure?airport=${airportICAO}&begin=${TIMESTAMP_BEGIN}&end=${TIMESTAMP_END}`
//     const response = await fetch(url)
//     const data = await response.json()

//     return data
// }

// console.log(getUnixTime30DaysAgo());

const getAircraftTracks = async (flight: Flight): Promise<any> => {
  // const days: number = 30
  // const TIMESTAMP_BEGIN: number = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
  const url = `https://opensky-network.org/api/tracks/all?icao24=${flight.icao24}&time=${flight.lastSeen}`
  console.log('::::getAircraftTracks:::::', url)
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const requestFlightTrack = async (flight: any) => {
  return await getAircraftTracks(flight) //.then(console.log)
  //   const index = await flightsLAX2RKSI.findIndex(
  //     (track) => track.icao24 === flight.icao24
  //   )
  //   return flightsLAX2RKSI[index] || {}
}

const requestFlightList = async ({
  departureAirport,
  arrivalAirport,
}: {
  departureAirport: Airport | null
  arrivalAirport: Airport | null
}): Promise<FlightList> => {
  // console.log("****", departureAirport, arrivalAirport)
  if (!departureAirport || !arrivalAirport) return []
  return await getDepartureAirport(departureAirport['icao']).then((flights) => {
    const flightList: FlightList = flights.filter(
      (flight: Flight) => flight.estArrivalAirport === arrivalAirport['icao']
    )
    // .map((flight: Flight) => ({
    //     ...flight,
    //     text: `항공편:${flight.callsign}`,
    //     dep: `출발:[공항이름](${flight.estDepartureAirport})`,
    //     arr: `도착:[공항이름](${flight.estArrivalAirport})`
    // }))
    console.log('******depart', flightList, flights)
    return flightList
  })

  //   const FlightList = flightsDepartureAirport.filter(
  //     (flight) =>
  //       flight.estDepartureAirport === departureAirport.icao &&
  //       flight.estArrivalAirport === arrivalAirport.icao
  //   )
  //   console.log(
  //     departureAirport,
  //     arrivalAirport,
  //     flightsDepartureAirport.map((flight) => [
  //       flight.estDepartureAirport,
  //       departureAirport.icao,
  //       flight.estArrivalAirport,
  //       arrivalAirport.icao,
  //     ]),
  //     flightsDepartureAirport
  //   )
  //   //
  //   /*
  //         "icao24": "4d00f3",
  //         "firstSeen": 1725186940,
  //         "estDepartureAirport": "ELLX",
  //         "lastSeen": 1725195565,
  //         "estArrivalAirport": "LEMG",
  //         "callsign": "LGL663  ",
  //     */
  //   return FlightList
}

export { requestFlightList, requestFlightTrack }

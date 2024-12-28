import { flightsLAX2RKSI, flightsDepartureAirport } from "../dummyData";
import { Aircraft, AircraftStatus, Flight, FlightList } from "../api/flight";
import { getAllActiveFlights, getDepartureAirport } from "../api/flight";
import { Airport } from "../api/airports";

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
    console.log(url)
    const response = await fetch(url)
    const data = await response.json()
    return data
}

const requestFlightTrack = async (flight: any) => {
    return await getAircraftTracks(flight)//.then(console.log)
    // const index = await flightsLAX2RKSI.findIndex(track => track.icao24 === flight.icao24);
    // return flightsLAX2RKSI[index] || {};
}

const requestFlightList = async ({ departureAirport, arrivalAirport, }
    : { departureAirport: Airport | null, arrivalAirport: Airport | null })
    : Promise<FlightList | void> => {

    if (!departureAirport || !arrivalAirport)
        return []

    return await getDepartureAirport(departureAirport["icao"])
        .then(flights => {
            const flightList: FlightList = flights
                .filter((flight: Flight) => flight.estArrivalAirport === arrivalAirport['icao'])
            console.log('******depart', flightList)
            return flightList
        }).catch(_ => {
            alert('API서버와 연결이 원할하지 않습니다.')
        })
}

export { requestFlightList, requestFlightTrack, }


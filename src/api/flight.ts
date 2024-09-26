import { requestFlightList } from '../data/dataProcessingLayer'
import { Airport } from './airports'

export type FlightList = Awaited<ReturnType<typeof requestFlightList>>
export type Flight = FlightList[number]

export const fetchFlight = ({
    departureAirport,
    arrivalAirport,
}: {
    departureAirport: Airport
    arrivalAirport: Airport
}) => {
    return requestFlightList(departureAirport, arrivalAirport)
}

export type Aircraft = {
    icao24: string
    callsign: string
    origin_country: string
    time_position: number
    last_contact: number
    longitude: number | null
    latitude: number | null
    baro_altitude: number | null
    on_ground: boolean
    velocity: number | null
    true_track: number | null
    vertical_rate: number | null
    geo_altitude: number | null
}

export type AircraftStatus = Aircraft | false


export const getAllActiveFlights = async (): Promise<Aircraft[]> => {
    const response = await fetch(`https://opensky-network.org/api/states/all`)
    const data = await response.json()

    return data.states.map((state: any) => ({
        icao24: state[0],
        callsign: state[1],
        origin_country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude: state[5],
        latitude: state[6],
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        true_track: state[10],
        vertical_rate: state[11],
        geo_altitude: state[13],
    }))
}

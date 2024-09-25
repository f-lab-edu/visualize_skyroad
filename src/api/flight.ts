import { requestFlightList } from '../dataProcessingLayer'
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

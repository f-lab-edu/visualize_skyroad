import { requestFlightList } from '../dataProcessingLayer'
import { Airport } from './airports'

export type FlightList = Awaited<ReturnType<typeof requestFlightList>>
export type Flight = FlightList[number]
export type FlightPathElement = {
    // 0 time integer Time which the given waypoint is associated with in seconds since epoch (Unix time).
    // 1 latitude float WGS-84 latitude in decimal degrees. Can be null.
    // 2 longitude float WGS-84 longitude in decimal degrees. Can be null.
    // 3 baro_altitude float Barometric altitude in meters. Can be null.
    // 4 true_track float True track in decimal degrees clockwise from north (north=0°). Can be null.
    // 5 on_ground boolean Boolean value which indicates if the position was retrieved from a surface position report.
    // Ex. [1724696134, 33.9465, -118.4397, 0, 264, false]
    time: number
    latitude: number
    longitude: number
    baro_altitude: number
    true_track: number
    on_ground: boolean
}
export const fetchFlight = ({
    departureAirport,
    arrivalAirport,
}: {
    departureAirport: Airport
    arrivalAirport: Airport
}) => {
    return requestFlightList(departureAirport, arrivalAirport)
}

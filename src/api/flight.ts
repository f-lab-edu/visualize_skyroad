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

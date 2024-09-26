// import { getDepatureAirport } from "./apis";
import { flightsLAX2RKSI, flightsDepartureAirport } from "../dummyData";
import { Aircraft, AircraftStatus } from "../api/flight";
import { getAllActiveFlights } from "../api/flight";

const requestFlightTrack = async (flight: any) => {
    // return await getAircraftTracks(flight.icao24);
    const index = await flightsLAX2RKSI.findIndex(track => track.icao24 === flight.icao24);
    return flightsLAX2RKSI[index] || {};
}
const requestFlightList = async (departureAirport: any, arrivalAirport: any) => {
    // console.log(departureAirport, arrivalAirport);
    // await getDepatureAirport(departureAirport["icao24"]);
    // console.log(flightsDepartureAirport.map(flight => flight))
    const FlightList = flightsDepartureAirport
        .filter(flight => flight.estDepartureAirport === departureAirport.icao &&
            flight.estArrivalAirport === arrivalAirport.icao)
        .map(flight => (
            {
                ...flight,
                text: `항공편:${flight.callsign}`,
                dep: `출발:[공항이름](${flight.estDepartureAirport})`,
                arr: `도착:[공항이름](${flight.estArrivalAirport})`
            }));

    // console.log("---", FlightList);
    /*
        "icao24": "4d00f3",
        "firstSeen": 1725186940,
        "estDepartureAirport": "ELLX",
        "lastSeen": 1725195565,
        "estArrivalAirport": "LEMG",
        "callsign": "LGL663  ",
    */
    return FlightList;
}

const findFlightFromICNtoJFK = async (): Promise<AircraftStatus> => {
    const flights = await getAllActiveFlights()
    console.log(flights)
    for (const flight of flights) {
        if (true) {
            return flight
        }
    }
    return false
}

export { requestFlightList, requestFlightTrack, findFlightFromICNtoJFK };

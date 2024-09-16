// import { getDepatureAirport } from "./apis";
import { flightsLAX2RKSI, flightsDepartureAirport } from "./dummyData";

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
            { ...flight, text: `항공편:${flight.callsign}`, dep: `출발공항이름`, arr: "도착공항이름" }));
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

export { requestFlightList, requestFlightTrack };
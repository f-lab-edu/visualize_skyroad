export const fetchFlight = ({ departureAirport, arrivalAirport, }) => {
    return [];
    // return requestFlightList(departureAirport, arrivalAirport)
};
export const getAllActiveFlights = async () => {
    const response = await fetch(`https://opensky-network.org/api/states/all`);
    const data = await response.json();
    return data.states.map((state) => ({
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
    }));
};
// export const getDepartureAirport = async (airportICAO: string): Promise<any> => {
//     const TIMESTAMP_END = Math.floor(new Date().getTime() / 1000)
//     const url = `https://opensky-network.org/api/flights/departure?airport=${airportICAO}&begin=${TIMESTAMP_BEGIN}&end=${TIMESTAMP_END}`
//     console.log(url)
//     const response = await fetch(url)
//     const data = await response.json()
//     return data
// }
export const getDepartureAirport = async (airportICAO) => {
    const DAYS = 5;
    const TIMESTAMP_END = Math.floor(Date.now() / 1000);
    const TIMESTAMP_BEGIN = Math.floor((Date.now() - DAYS * 24 * 60 * 60 * 1000) / 1000);
    if (TIMESTAMP_BEGIN >= TIMESTAMP_END) {
        throw new Error('시간설정이 잘못되었습니다.');
    }
    const url = `https://opensky-network.org/api/flights/departure?airport=${airportICAO}&begin=${TIMESTAMP_BEGIN}&end=${TIMESTAMP_END}`;
    console.log(url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API 요청실패 ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Error 도착공항열람실패:', error);
        throw error;
    }
};
// export const getArrivalAirport = async (airportICAO: string): Promise<any> => {
//     const TIMESTAMP_BEGIN = 1729589334
//     const TIMESTAMP_END = 1730194134
//     const url = `https://opensky-network.org/api/flights/arrival?airport=${airportICAO}&begin=${TIMESTAMP_BEGIN}&end=${TIMESTAMP_END}`
//     console.log(url)
//     const response = await fetch(url)
//     const data = await response.json()
//     return data
// }

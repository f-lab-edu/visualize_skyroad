const getDepatureAirport = async (icao: string) => {
    const begin = "1724583153";
    const end = "1725187953";
    const response = await fetch(
        `https://opensky-network.org/api/flights/departure?airport=${icao}&begin=${begin}&end=${end}`
        , {

        })
    if (response.status) {
        return [];
    }
    return [];
}

export { getDepatureAirport };

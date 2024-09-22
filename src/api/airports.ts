import { useSuspenseQuery } from '@tanstack/react-query'

export type AirportList = Awaited<ReturnType<typeof fetchAirports>>
export type Airport = AirportList[number]

const fetchAirports = async () => {
    const response = await fetch('/airports.dat')

    if (!response.ok) {
        throw new Error('공항정보를 가져오지 못하였습니다.')
    }

    const textData = await response.text()

    const parseCSV = (data: string) => {
        /*
          ID: The unique identifier of the airport.
          Airport Name: The name of the airport.
          City: The city where the airport is located.
          Country: The country where the airport is located.
          IATA Code: The IATA airport code.
          ICAO Code: The ICAO airport code.
          Latitude: The latitude of the airport.
          Longitude: The longitude of the airport.
          Altitude: The altitude of the airport.
          Timezone: The timezone in which the airport is located.
          DST: Daylight saving time information.
          Tz Database Timezone: The timezone database name.
          Type: The type of location (e.g., "airport").
          Source: The source of the data.
        */
        return data
            .trim()
            .split('\n')
            .map((line) => {
                const parts = line.split(',')

                return {
                    id: parts[0],
                    name: parts[1].replace(/"/g, ''), // Remove quotes from the airport name
                    city: parts[2].replace(/"/g, ''), // City name
                    country: parts[3].replace(/"/g, ''), // Country name
                    iata: parts[4].replace(/"/g, ''), // IATA code
                    icao: parts[5].replace(/"/g, ''), // ICAO code
                    latitude: parseFloat(parts[6]), // Latitude
                    longitude: parseFloat(parts[7]), // Longitude
                    altitude: parseInt(parts[8]), // Altitude
                    timezone: parts[9], // Timezone
                    dst: parts[10], // DST information
                    tzDatabaseTimezone: parts[11], // Tz database timezone
                    type: parts[12], // Type (e.g., airport)
                    source: parts[13], // Source (e.g., OurAirports)
                }
            })
    }
    return parseCSV(textData)
}

export const useAirports = () => {
    const {
        data: airports,
        isLoading,
        error,
    } = useSuspenseQuery({
        queryKey: ['airports'],
        queryFn: fetchAirports,
    })

    return { airports, isLoading, error }
}
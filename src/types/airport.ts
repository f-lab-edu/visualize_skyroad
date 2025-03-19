export interface Airport {
  id: string
  name: string
  city: string
  country: string
  flag: string
  iata: string
  icao: string
  latitude: number
  longitude: number
  altitude: number
  timezone: string
  dst: string
  tzDatabaseTimezone: string
  type: 'airport'
  source: 'OurAirports'
  korName: string
  korCity: string
  korCountry: string
  searchKeywords: string
}

export interface CityKeyword {
  related: string[]
  aliases: string[]
}

export interface AirportKoreanName {
  korName: string
  korCity: string
  korCountry: string
  searchKeywords: string[]
}

export interface CountryAlias {
  name: string
  aliases: string[]
}

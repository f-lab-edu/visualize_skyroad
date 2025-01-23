import { useSuspenseQuery } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useMemo } from 'react'

import { countryNameToCode } from '../countryNameToCode'

export type AirportList = Awaited<ReturnType<typeof fetchAirports>>
export type Airport = AirportList[number]

const fetchAirports = async () => {
  const response = await fetch('/airports.dat')

  if (!response.ok) {
    throw new Error('공항정보를 가져오지 못하였습니다.')
  }

  const textData = await response.text()

  const parseCSV = (data: string) => {
    return data
      .trim()
      .split('\n')
      .map((record) => {
        const parts = record.split(',')
        const iata = parts[4].replace(/"/g, '') // IATA code
        const country = parts[3].replace(/"/g, '')
        const koreanData = majorAirportKoreanNames[iata]
        const countryKorean = countryKoreanNames[country]
        const searchTerms = [
          koreanData?.korName || '',
          koreanData?.korCity || '',
          koreanData?.korCountry || countryKorean?.name || '',
          iata,
        ]

        if (countryKorean?.aliases) {
          searchTerms.push(...countryKorean.aliases)
        }

        return {
          id: parts[0],
          name: parts[1].replace(/"/g, ''),
          city: parts[2].replace(/"/g, ''),
          country: parts[3].replace(/"/g, ''),
          flag: countryNameToCode[parts[3].replace(/"/g, '')],
          iata,
          icao: parts[5].replace(/"/g, ''),
          latitude: parseFloat(parts[6]),
          longitude: parseFloat(parts[7]),
          altitude: parseInt(parts[8]),
          timezone: parts[9].replace(/"/g, ''),
          dst: parts[10].replace(/"/g, ''),
          tzDatabaseTimezone: parts[11].replace(/"/g, ''),
          type: parts[12].replace(/"/g, ''),
          source: parts[13].replace(/"/g, ''),

          korName: koreanData?.korName || '',
          korCity: koreanData?.korCity || '',
          korCountry:
            koreanData?.korCountry || countryKoreanNames[country] || '',
          searchKeywords: searchTerms.filter(Boolean).join(' '),
        }
      })
      .filter(
        (airport) =>
          airport.type === 'airport' && airport.source === 'OurAirports'
      )
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

  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'searchKeywords', weight: 2 },
        { name: 'name', weight: 1.5 },
        { name: 'city', weight: 1.5 },
        { name: 'country', weight: 1 },
        { name: 'iata', weight: 2 },
        { name: 'icao', weight: 1 },
      ],
      threshold: 0.3,
      includeScore: true,
    }
    return new Fuse(airports, options)
  }, [airports])

  const searchAirports = (query: string) => {
    if (!query) return airports
    return fuse.search(query).map((result) => result.item)
  }

  const nations = new Set<string>()
  airports.map((airport) => {
    nations.add(airport.country)
  })

  return { airports, isLoading, error, searchAirports }
}

const majorAirportKoreanNames: Record<
  string,
  {
    korName: string
    korCity: string
    korCountry: string
  }
> = {
  ICN: {
    korName: '인천국제공항',
    korCity: '인천',
    korCountry: '대한민국',
  },
  GMP: {
    korName: '김포국제공항',
    korCity: '서울',
    korCountry: '대한민국',
  },

  NRT: {
    korName: '나리타국제공항',
    korCity: '도쿄',
    korCountry: '일본',
  },
  HND: {
    korName: '하네다국제공항',
    korCity: '도쿄',
    korCountry: '일본',
  },

  // 주요 중국 공항
  PEK: {
    korName: '베이징 캐피털 국제공항',
    korCity: '베이징',
    korCountry: '중국',
  },
  PVG: {
    korName: '상하이 푸동 국제공항',
    korCity: '상하이',
    korCountry: '중국',
  },

  SIN: {
    korName: '창이 국제공항',
    korCity: '싱가포르',
    korCountry: '싱가포르',
  },
  BKK: {
    korName: '수완나품 국제공항',
    korCity: '방콕',
    korCountry: '태국',
  },

  LAX: {
    korName: '로스앤젤레스 국제공항',
    korCity: '로스앤젤레스',
    korCountry: '미국',
  },
  JFK: {
    korName: '존 F. 케네디 국제공항',
    korCity: '뉴욕',
    korCountry: '미국',
  },

  LHR: {
    korName: '히드로 국제공항',
    korCity: '런던',
    korCountry: '영국',
  },
  CDG: {
    korName: '샤를 드골 국제공항',
    korCity: '파리',
    korCountry: '프랑스',
  },
}

const countryKoreanNames: Record<
  string,
  {
    name: string
    aliases: string[]
  }
> = {
  'South Korea': {
    name: '대한민국',
    aliases: ['한국', '코리아'],
  },
  Japan: {
    name: '일본',
    aliases: ['닛폰'],
  },
  China: {
    name: '중국',
    aliases: ['중화인민공화국'],
  },
  'United States': {
    name: '미국',
    aliases: ['미합중국', '아메리카'],
  },
  'United Kingdom': {
    name: '영국',
    aliases: ['영국', '대영국'],
  },
  France: {
    name: '프랑스',
    aliases: [],
  },
  Germany: {
    name: '독일',
    aliases: ['도이칠란드'],
  },
  Thailand: {
    name: '태국',
    aliases: ['타이'],
  },
  Singapore: {
    name: '싱가포르',
    aliases: [],
  },
}

import { useSuspenseQuery } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useMemo } from 'react'

import { countryNameToCode } from '../countryNameToCode'
import { AirportFetchError } from '../types/error'
import { CityKeyword, CountryAlias } from '../types/airport'

export type AirportList = Awaited<ReturnType<typeof fetchAirports>>
export type Airport = AirportList[number]

// 1. 통합된 키워드 매핑 정의
const cityKeywords: Record<string, CityKeyword> = {

  '서울': {
    related: ['인천', '김포'],
    aliases: ['서울역', '수도권']
  },
  '인천': {
    related: ['서울', '김포'],
    aliases: ['수도권']
  },
  '김포': {
    related: ['서울'],
    aliases: []
  },
  '도쿄': {
    related: ['나리타', '하네다'],
    aliases: []
  },
  '나리타': {
    related: ['도쿄'],
    aliases: []
  },
  '하네다': {
    related: ['도쿄'],
    aliases: []
  },
  '베이징': {
    related: ['수도', '북경'],
    aliases: []
  },
  '상하이': {
    related: ['푸동', '상해'],
    aliases: []
  },
  '뉴욕': {
    related: ['존 F. 케네디', 'JFK'],
    aliases: []
  },
  '런던': {
    related: ['히드로'],
    aliases: []
  },
  '파리': {
    related: ['샤를 드골'],
    aliases: []
  },
}

// 2. 일관된 타입 정의
interface AirportKoreanName {
  korName: string
  korCity: string
  korCountry: string
  searchKeywords: string[]
}

const majorAirportKoreanNames: Record<string, AirportKoreanName> = {
  ICN: {
    korName: '인천국제공항',
    korCity: '인천',
    korCountry: '대한민국',
    searchKeywords: ['서울', '수도권', '김포'],
  },
  GMP: {
    korName: '김포국제공항',
    korCity: '서울',
    korCountry: '대한민국',
    searchKeywords: ['인천', '수도권'],
  },

  NRT: {
    korName: '나리타국제공항',
    korCity: '도쿄',
    korCountry: '일본',
    searchKeywords: ['하네다'],
  },
  HND: {
    korName: '하네다국제공항',
    korCity: '도쿄',
    korCountry: '일본',
    searchKeywords: ['나리타'],
  },

  // 주요 중국 공항
  PEK: {
    korName: '베이징 캐피털 국제공항',
    korCity: '베이징',
    korCountry: '중국',
    searchKeywords: ['베이징', '북경', '수도'],
  },
  PVG: {
    korName: '상하이 푸동 국제공항',
    korCity: '상하이',
    korCountry: '중국',
    searchKeywords: ['상하이', '상해', '푸동'],
  },

  SIN: {
    korName: '창이 국제공항',
    korCity: '싱가포르',
    korCountry: '싱가포르',
    searchKeywords: [],
  },
  BKK: {
    korName: '수완나품 국제공항',
    korCity: '방콕',
    korCountry: '태국',
    searchKeywords: [],
  },

  LAX: {
    korName: '로스앤젤레스 국제공항',
    korCity: '로스앤젤레스',
    korCountry: '미국',
    searchKeywords: [],
  },
  JFK: {
    korName: '존 F. 케네디 국제공항',
    korCity: '뉴욕',
    korCountry: '미국',
    searchKeywords: [],
  },

  LHR: {
    korName: '히드로 국제공항',
    korCity: '런던',
    korCountry: '영국',
    searchKeywords: [],
  },
  CDG: {
    korName: '샤를 드골 국제공항',
    korCity: '파리',
    korCountry: '프랑스',
    searchKeywords: [],
  },
}

const countryKoreanNames: Record<string, CountryAlias> = {

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

const parseCSV = (data: string) => {
  return data
    .trim()
    .split('\n')
    .map((record) => {
      const parts = record.split(',')
      const iata = parts[4].replace(/"/g, '')
      const country = parts[3].replace(/"/g, '')
      const koreanData = majorAirportKoreanNames[iata]
      const countryKorean = countryKoreanNames[country]

      // 검색 키워드 확장
      const searchTerms = [
        koreanData?.korName || '',
        koreanData?.korCity || '',
        koreanData?.korCountry || countryKorean?.name || '',
        iata,
        ...(koreanData?.searchKeywords || []), // 추가 검색 키워드 포함
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
        korCountry: koreanData?.korCountry || countryKorean?.name || '',
        searchKeywords: searchTerms.filter(Boolean).join(' '),
      }
    })
    .filter(
      (airport) =>
        airport.type === 'airport' && airport.source === 'OurAirports'
    )
}
const fetchAirports = async () => {
  try {
    const response = await fetch('/airports.dat')

    if (!response.ok) {
      throw new AirportFetchError(
        '공항정보를 가져오지 못하였습니다.',
        response.status
      )
    }

    const textData = await response.text()
    if (!textData) {
      throw new AirportFetchError('공항 데이터가 비어있습니다.')
    }

    return parseCSV(textData)
  } catch (error) {
    if (error instanceof AirportFetchError) {
      throw error
    }
    throw new AirportFetchError(
      '공항 데이터 로딩 중 오류가 발생했습니다: ' + (error as Error).message
    )
  }
}

export const useAirports = () => {
  const { data: airports, isLoading, error } = useSuspenseQuery({
    queryKey: ['airports'],
    queryFn: fetchAirports,
    staleTime: 24 * 60 * 60 * 1000, // 24시간
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7일
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'korCity', weight: 2 },
        { name: 'korName', weight: 1.5 },
        { name: 'searchKeywords', weight: 1.5 },
        { name: 'iata', weight: 1 },
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    }
    return new Fuse(airports, options)
  }, [airports])

  const searchAirports = (query: string) => {
    if (!query) return airports

    // 한 번의 검색으로 처리
    const results = fuse.search(query)
    return results
      .filter(result => result.score && result.score < 0.6)
      .map(result => result.item)
  }

  const nations = new Set<string>()
  airports.map((airport) => {
    nations.add(airport.country)
  })

  return { airports, isLoading, error, searchAirports }
}

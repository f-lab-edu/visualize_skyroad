import { useSuspenseQuery } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useMemo } from 'react'

import { countryNameToCode } from '../countryNameToCode'
import { AirportFetchError } from '../types/error'
import { CityKeyword, CountryAlias, AirlineInfo } from '../types/airport'

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
  '토론토': {
    related: ['피어슨'],
    aliases: ['온타리오']
  },
  '밴쿠버': {
    related: ['YVR'],
    aliases: ['브리티시컬럼비아']
  },
  '몬트리올': {
    related: ['트뤼도'],
    aliases: ['퀘벡']
  },
  '캘거리': {
    related: ['YYC'],
    aliases: ['앨버타']
  },
  '홍콩': {
    related: ['홍콩국제공항', 'HKG'],
    aliases: ['홍콩특별행정구']
  },
  '싱가포르': {
    related: ['창이', 'SIN'],
    aliases: ['싱가포르공화국']
  },
  '방콕': {
    related: ['수완나품', 'BKK'],
    aliases: ['방콕국제공항']
  },
  '마닐라': {
    related: ['니노이 아키노', 'MNL'],
    aliases: ['필리핀']
  },
  '하노이': {
    related: ['노이바이', 'HAN'],
    aliases: ['베트남']
  },
  '호치민': {
    related: ['떤선녓', 'SGN'],
    aliases: ['사이공']
  },
  '타이페이': {
    related: ['타오위안', 'TPE'],
    aliases: ['대만']
  },
  '마카오': {
    related: ['마카오국제공항', 'MFM'],
    aliases: ['마카오특별행정구']
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
    searchKeywords: ['하네다', '도쿄'],
  },
  HND: {
    korName: '하네다국제공항',
    korCity: '도쿄',
    korCountry: '일본',
    searchKeywords: ['나리타', '도쿄'],
  },
  KIX: {
    korName: '간사이국제공항',
    korCity: '오사카',
    korCountry: '일본',
    searchKeywords: ['오사카', '교토', '간사이'],
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
  CAN: {
    korName: '광저우 바이윈 국제공항',
    korCity: '광저우',
    korCountry: '중국',
    searchKeywords: ['광저우', '광동'],
  },

  // 인도 공항
  DEL: {
    korName: '인디라 간디 국제공항',
    korCity: '델리',
    korCountry: '인도',
    searchKeywords: ['뉴델리', '델리'],
  },
  BOM: {
    korName: '차트라파티 시바지 국제공항',
    korCity: '뭄바이',
    korCountry: '인도',
    searchKeywords: ['봄베이', '뭄바이'],
  },

  // 인도네시아 공항
  CGK: {
    korName: '수카르노하타 국제공항',
    korCity: '자카르타',
    korCountry: '인도네시아',
    searchKeywords: ['자카르타', '수도'],
  },

  // 호주 공항
  SYD: {
    korName: '시드니 킹스포드 스미스 공항',
    korCity: '시드니',
    korCountry: '호주',
    searchKeywords: ['시드니', 'NSW'],
  },
  MEL: {
    korName: '멜버른 공항',
    korCity: '멜버른',
    korCountry: '호주',
    searchKeywords: ['멜버른', '빅토리아'],
  },

  // 미국 공항
  LAX: {
    korName: '로스앤젤레스 국제공항',
    korCity: '로스앤젤레스',
    korCountry: '미국',
    searchKeywords: ['LA', '엘에이'],
  },
  JFK: {
    korName: '존 F. 케네디 국제공항',
    korCity: '뉴욕',
    korCountry: '미국',
    searchKeywords: ['뉴욕', 'NYC'],
  },
  ORD: {
    korName: '오헤어 국제공항',
    korCity: '시카고',
    korCountry: '미국',
    searchKeywords: ['시카고', '일리노이'],
  },

  // 영국 공항
  LHR: {
    korName: '히드로 국제공항',
    korCity: '런던',
    korCountry: '영국',
    searchKeywords: ['런던', '히드로'],
  },
  LGW: {
    korName: '개트윅 공항',
    korCity: '런던',
    korCountry: '영국',
    searchKeywords: ['런던', '개트윅'],
  },

  // 프랑스 공항
  CDG: {
    korName: '샤를 드골 국제공항',
    korCity: '파리',
    korCountry: '프랑스',
    searchKeywords: ['파리', '드골'],
  },
  ORY: {
    korName: '오를리 공항',
    korCity: '파리',
    korCountry: '프랑스',
    searchKeywords: ['파리', '오를리'],
  },

  // 독일 공항
  FRA: {
    korName: '프랑크푸르트 국제공항',
    korCity: '프랑크푸르트',
    korCountry: '독일',
    searchKeywords: ['프랑크푸르트', '헤센'],
  },
  MUC: {
    korName: '뮌헨 공항',
    korCity: '뮌헨',
    korCountry: '독일',
    searchKeywords: ['뮌헨', '바이에른'],
  },

  // 이탈리아 공항
  FCO: {
    korName: '레오나르도 다 빈치 국제공항',
    korCity: '로마',
    korCountry: '이탈리아',
    searchKeywords: ['로마', '피우미치노'],
  },
  MXP: {
    korName: '밀라노 말펜사 공항',
    korCity: '밀라노',
    korCountry: '이탈리아',
    searchKeywords: ['밀라노', '말펜사'],
  },

  // 캐나다 공항
  YYZ: {
    korName: '토론토 피어슨 국제공항',
    korCity: '토론토',
    korCountry: '캐나다',
    searchKeywords: ['피어슨', '온타리오'],
  },
  YVR: {
    korName: '밴쿠버 국제공항',
    korCity: '밴쿠버',
    korCountry: '캐나다',
    searchKeywords: ['브리티시컬럼비아'],
  },
  YUL: {
    korName: '몬트리올 트뤼도 국제공항',
    korCity: '몬트리올',
    korCountry: '캐나다',
    searchKeywords: ['퀘벡', '트뤼도'],
  },

  // 브라질 공항
  GRU: {
    korName: '과룰류스 국제공항',
    korCity: '상파울루',
    korCountry: '브라질',
    searchKeywords: ['상파울루', '과룰류스'],
  },
  GIG: {
    korName: '갈레앙 국제공항',
    korCity: '리우데자네이루',
    korCountry: '브라질',
    searchKeywords: ['리우', '리우데자네이루'],
  },

  // 멕시코 공항
  MEX: {
    korName: '베니토 후아레스 국제공항',
    korCity: '멕시코시티',
    korCountry: '멕시코',
    searchKeywords: ['멕시코시티', '수도'],
  },

  // 사우디아라비아 공항
  JED: {
    korName: '킹 압둘아지즈 국제공항',
    korCity: '제다',
    korCountry: '사우디아라비아',
    searchKeywords: ['제다', '메카'],
  },
  RUH: {
    korName: '킹 칼리드 국제공항',
    korCity: '리야드',
    korCountry: '사우디아라비아',
    searchKeywords: ['리야드', '수도'],
  },

  // 터키 공항
  IST: {
    korName: '이스탄불 공항',
    korCity: '이스탄불',
    korCountry: '터키',
    searchKeywords: ['이스탄불', '터키'],
  },

  // 아시아 주요 공항
  HKG: {
    korName: '홍콩국제공항',
    korCity: '홍콩',
    korCountry: '홍콩',
    searchKeywords: ['홍콩특별행정구', 'HKG'],
  },
  SIN: {
    korName: '창이 국제공항',
    korCity: '싱가포르',
    korCountry: '싱가포르',
    searchKeywords: ['창이', 'SIN'],
  },
  BKK: {
    korName: '수완나품 국제공항',
    korCity: '방콕',
    korCountry: '태국',
    searchKeywords: ['수완나품', 'BKK'],
  },
  MNL: {
    korName: '니노이 아키노 국제공항',
    korCity: '마닐라',
    korCountry: '필리핀',
    searchKeywords: ['니노이 아키노', 'MNL'],
  },
  HAN: {
    korName: '노이바이 국제공항',
    korCity: '하노이',
    korCountry: '베트남',
    searchKeywords: ['노이바이', 'HAN'],
  },
  SGN: {
    korName: '떤선녓 국제공항',
    korCity: '호치민',
    korCountry: '베트남',
    searchKeywords: ['떤선녓', 'SGN', '사이공'],
  },
  TPE: {
    korName: '타오위안 국제공항',
    korCity: '타이페이',
    korCountry: '대만',
    searchKeywords: ['타오위안', 'TPE'],
  },
  MFM: {
    korName: '마카오국제공항',
    korCity: '마카오',
    korCountry: '마카오',
    searchKeywords: ['마카오특별행정구', 'MFM'],
  },
  EZE: {
    korName: '미니스트로 피스타리니 국제공항',
    korCity: '부에노스아이레스',
    korCountry: '아르헨티나',
    searchKeywords: ['미니스트로 피스타리니', 'EZE'],
  },
  JNB: {
    korName: 'OR 탐보 국제공항',
    korCity: '요하네스버그',
    korCountry: '남아프리카공화국',
    searchKeywords: ['OR 탐보', 'JNB'],
  },
  CPT: {
    korName: '케이프타운 국제공항',
    korCity: '케이프타운',
    korCountry: '남아프리카공화국',
    searchKeywords: ['케이프타운', 'CPT'],
  },
}

const countryKoreanNames: Record<string, CountryAlias> = {

  'South Korea': {
    name: '대한민국',
    aliases: ['한국', '코리아'],
  },
  'Japan': {
    name: '일본',
    aliases: ['닛폰', '일본국'],
  },
  'China': {
    name: '중국',
    aliases: ['중화인민공화국', '중화'],
  },
  'India': {
    name: '인도',
    aliases: ['인디아', '힌두스탄'],
  },
  'Indonesia': {
    name: '인도네시아',
    aliases: ['인도네시아 공화국'],
  },
  'Australia': {
    name: '호주',
    aliases: ['오스트레일리아', '호주연방'],
  },
  'United States': {
    name: '미국',
    aliases: ['미합중국', '아메리카'],
  },
  'United Kingdom': {
    name: '영국',
    aliases: ['영국', '대영국', '그레이트브리튼'],
  },
  'France': {
    name: '프랑스',
    aliases: ['프랑스 공화국', '불란서'],
  },
  'Germany': {
    name: '독일',
    aliases: ['도이칠란드', '독일연방공화국'],
  },
  'Italy': {
    name: '이탈리아',
    aliases: ['이태리', '이탈리아 공화국'],
  },
  'Canada': {
    name: '캐나다',
    aliases: ['캐나다', 'Canada', 'CA'],
  },
  'Brazil': {
    name: '브라질',
    aliases: ['브라질 연방공화국'],
  },
  'Mexico': {
    name: '멕시코',
    aliases: ['멕시코 합중국'],
  },
  'Saudi Arabia': {
    name: '사우디아라비아',
    aliases: ['사우디', 'KSA'],
  },
  'Turkey': {
    name: '터키',
    aliases: ['튀르키예'],
  },
  'Argentina': {
    name: '아르헨티나',
    aliases: ['아르헨티나 공화국'],
  },
  'South Africa': {
    name: '남아프리카공화국',
    aliases: ['남아공'],
  },
}

// 항공사 국적 정보 추가
const airlineNationality: Record<string, AirlineInfo> = {
  'KOR': {
    mainCarrier: '대한항공',
    carriers: ['대한항공', '아시아나항공', '제주항공', '진에어'],
    flag: 'KR'
  },
  'JPN': {
    mainCarrier: 'JAL',
    carriers: ['JAL', 'ANA', 'Peach'],
    flag: 'JP'
  },
  'CHN': {
    mainCarrier: 'Air China',
    carriers: ['Air China', 'China Eastern', 'China Southern'],
    flag: 'CN'
  },
  'USA': {
    mainCarrier: 'American Airlines',
    carriers: ['American Airlines', 'United', 'Delta'],
    flag: 'US'
  },
  'GBR': {
    mainCarrier: 'British Airways',
    carriers: ['British Airways', 'Virgin Atlantic'],
    flag: 'GB'
  },
  'FRA': {
    mainCarrier: 'Air France',
    carriers: ['Air France'],
    flag: 'FR'
  },
  'DEU': {
    mainCarrier: 'Lufthansa',
    carriers: ['Lufthansa', 'Eurowings'],
    flag: 'DE'
  },
  'ITA': {
    mainCarrier: 'ITA Airways',
    carriers: ['ITA Airways'],
    flag: 'IT'
  },
  'CAN': {
    mainCarrier: 'Air Canada',
    carriers: ['Air Canada', 'WestJet'],
    flag: 'CA'
  },
  'AUS': {
    mainCarrier: 'Qantas',
    carriers: ['Qantas', 'Virgin Australia'],
    flag: 'AU'
  },
  'BRA': {
    mainCarrier: 'LATAM Brasil',
    carriers: ['LATAM Brasil', 'GOL', 'Azul'],
    flag: 'BR'
  },
  'MEX': {
    mainCarrier: 'Aeroméxico',
    carriers: ['Aeroméxico', 'Volaris'],
    flag: 'MX'
  },
  'SAU': {
    mainCarrier: 'Saudia',
    carriers: ['Saudia'],
    flag: 'SA'
  },
  'TUR': {
    mainCarrier: 'Turkish Airlines',
    carriers: ['Turkish Airlines'],
    flag: 'TR'
  },
  'IND': {
    mainCarrier: 'Air India',
    carriers: ['Air India', 'IndiGo'],
    flag: 'IN'
  },
  'IDN': {
    mainCarrier: 'Garuda Indonesia',
    carriers: ['Garuda Indonesia'],
    flag: 'ID'
  }
}

// 국가 코드 매핑
const countryToISOCode: Record<string, string> = {
  'South Korea': 'KOR',
  'Japan': 'JPN',
  'China': 'CHN',
  'United States': 'USA',
  'United Kingdom': 'GBR',
  'France': 'FRA',
  'Germany': 'DEU',
  'Italy': 'ITA',
  'Canada': 'CAN',
  'Australia': 'AUS',
  'Brazil': 'BRA',
  'Mexico': 'MEX',
  'Saudi Arabia': 'SAU',
  'Turkey': 'TUR',
  'India': 'IND',
  'Indonesia': 'IDN'
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
      const isoCode = countryToISOCode[country]
      const airlineData = isoCode ? airlineNationality[isoCode] : undefined

      // 검색 키워드 확장
      const searchTerms = [
        koreanData?.korName || '',
        koreanData?.korCity || '',
        koreanData?.korCountry || countryKorean?.name || '',
        iata,
        ...(koreanData?.searchKeywords || []),
      ]

      // cityKeywords 활용
      if (koreanData?.korCity) {
        const cityKeyword = cityKeywords[koreanData.korCity]
        if (cityKeyword) {
          searchTerms.push(...cityKeyword.related)
          searchTerms.push(...cityKeyword.aliases)
        }
      }

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
        searchKeywords: searchTerms.filter(Boolean),

        // 항공사 정보 추가
        mainCarrier: airlineData?.mainCarrier || '',
        carriers: airlineData?.carriers || [],
        airlineFlag: airlineData?.flag || ''
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
        { name: 'korName', weight: 2 },
        { name: 'korCountry', weight: 1.5 },
        { name: 'searchKeywords', weight: 1.8 },
        { name: 'iata', weight: 1 },
        { name: 'city', weight: 1.5 },
        { name: 'country', weight: 1.2 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
    }
    return new Fuse(airports, options)
  }, [airports])

  const searchAirports = (query: string) => {
    if (!query) return airports

    // 검색어 정규화
    const normalizedQuery = query.toLowerCase().trim()

    // IATA 코드 검색 (3글자 정확히 일치)
    if (normalizedQuery.length === 3 && /^[A-Za-z]{3}$/.test(normalizedQuery)) {
      const exactMatch = airports.find(airport =>
        airport.iata.toLowerCase() === normalizedQuery
      )
      if (exactMatch) return [exactMatch]
    }

    const results = fuse.search(normalizedQuery)
    return results
      .filter(result => result.score && result.score < 0.7)
      .map(result => result.item)
  }

  const nations = new Set<string>()
  airports.map((airport) => {
    nations.add(airport.country)
  })

  return { airports, isLoading, error, searchAirports }
}

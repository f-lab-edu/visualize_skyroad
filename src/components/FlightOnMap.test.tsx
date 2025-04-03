import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import FlightOnMap from '../pages/FlightOnMap'
import { MemoryRouter } from 'react-router-dom'

describe('FlightOnMap', () => {
  const mockFlightData = {
    departure: {
      name: '인천국제공항',
      code: 'ICN',
      latitude: 37.4602,
      longitude: 126.4407,
    },
    arrival: {
      name: '나리타국제공항',
      code: 'NRT',
      latitude: 35.772,
      longitude: 140.3929,
    },
    flight: '123',
  }

  it('항공편 데이터가 없을 때 에러 메시지를 표시해야 합니다', () => {
    render(
      <MemoryRouter>
        <FlightOnMap />
      </MemoryRouter>
    )
    expect(
      screen.getByText('항공상세정보를 가져오지 못하였습니다.')
    ).toBeInTheDocument()
  })

  it('항공편 데이터가 있을 때 지도를 표시해야 합니다', async () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockFlightData }]}>
        <FlightOnMap />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('인천국제공항')).toBeInTheDocument()
      expect(screen.getByText('나리타국제공항')).toBeInTheDocument()
    })
  })
})

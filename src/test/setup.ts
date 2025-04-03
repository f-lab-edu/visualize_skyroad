import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// MSW 서버 설정
const server = setupServer(...handlers)

// 각 테스트 전에 실행
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 각 테스트 후에 실행
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// 모든 테스트가 끝난 후 실행
afterAll(() => server.close()) 
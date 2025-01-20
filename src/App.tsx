import { styled } from '@stitches/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import VSkyButton from './components/Button/VSKyButton'
import LoadingScreen from './components/Loading/Loading'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const FlightOnMap = lazy(() => import('./pages/FlightOnMap'))
const TestMap = lazy(() => import('./pages/TestPage'))

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundaryWithFallback>
          <SuspenseWithLoadingScreen>
            <Routes>
              <Route element={<Home />} path="/" />
              <Route element={<FlightOnMap />} path="flight" />
              <Route element={<TestMap />} path="/test" />
            </Routes>
          </SuspenseWithLoadingScreen>
        </ErrorBoundaryWithFallback>
      </Router>
    </QueryClientProvider>
  )
}

export default App

const ErrorPageContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
  '.modal': {
    padding: '50px 100px',
    margin: 'auto',
    border: '1px solid black',
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: '10px 6px 12px 1px rgba(50, 50, 255, .2)',
    textAlign: 'center',
  },
  '.cat': {
    fontSize: '3rem',
  },
})

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <ErrorPageContainer>
      <div className="modal">
        <h2>에러가 발생했어요!</h2>
        <p className="cat">😿</p>
        <p>
          <b>자세히:</b>&nbsp;{error.message}
        </p>
        <VSkyButton onClick={() => window.location.reload()}>
          다시시도
        </VSkyButton>
      </div>
    </ErrorPageContainer>
  )
}

const ErrorBoundaryWithFallback: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: any
}) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  )
}

const SuspenseWithLoadingScreen: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: any
}) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

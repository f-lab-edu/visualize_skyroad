import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import VSkyButton from './components/Button/VSKyButton'
import './App.css'
import LoadingScreen from './components/Loading/Loading'

const Home = lazy(() => import('./pages/Home'))
const FlightOnMap = lazy(() => import('./pages/FlightOnMap'))

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
            </Routes>
          </SuspenseWithLoadingScreen>
        </ErrorBoundaryWithFallback>
      </Router>
    </QueryClientProvider>
  )
}

export default App

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div>
      <h2>에러가 발생했어요!</h2>
      <p>자세히:{error.message}</p>
      <VSkyButton onClick={() => window.location.reload()}>다시시도</VSkyButton>
    </div>
  )
}

const ErrorBoundaryWithFallback: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  )
}

const SuspenseWithLoadingScreen: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

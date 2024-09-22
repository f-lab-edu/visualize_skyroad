import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import LoadingScreen from './components/Loading/Loading'
import './App.css'
import VSkyButton from './components/Button/VSKyButton'

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

              <Route
                path='/'
                element={
                  <Home />
                } />

              <Route
                path='flight'
                element={
                  <FlightOnMap />} />

            </Routes>
          </SuspenseWithLoadingScreen>
        </ErrorBoundaryWithFallback>
      </Router>
    </QueryClientProvider>)
}

export default App


const ErrorBoundaryWithFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const ErrorFallback = ({ error }: { error: Error }) => {
    return (
      <div>
        <h2>에러가 발생했어요!</h2>
        <p>자세히:{error.message}</p>
        <VSkyButton onClick={() => window.location.reload()}>다시시도</VSkyButton>
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}

const SuspenseWithLoadingScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  )
}

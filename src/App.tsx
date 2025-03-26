import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import ErrorFallback from './components/ErrorCompoent/ErrorComponent'
import './App.css'
import LoadingScreen from './components/Loading/Loading'

const Home = lazy(() => import('./pages/Home'))
const FlightOnMap = lazy(() => import('./pages/FlightOnMap'))

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route element={<Home />} path="/" />
              <Route element={<FlightOnMap />} path="flight" />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  )
}

export default App

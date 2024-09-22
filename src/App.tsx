import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import Loading from './components/Loading/Loading'
import { ErrorBoundary } from 'react-error-boundary'

const Home = lazy(() => import('./pages/Home'))
const FlightOnMap = lazy(() => import('./pages/FlightOnMap'))

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary FallbackComponent={({ error }) => <Error error={error} />}>
          <Suspense fallback={<Loading />}>
            <Routes>

              <Route
                path='/'
                element={
                  <Suspense fallback={<h1>홈로딩</h1>}>
                    <Home />
                  </Suspense>} />

              <Route
                path='flight'
                element={
                  <FlightOnMap />} />

            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>)
}

export default App

const Error = ({ error }: { error: Error }) => {
  return <div>{error.message}</div>
}

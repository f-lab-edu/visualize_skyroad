import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import VSkyButton from './components/Button/VSKyButton'
import './App.css'
import LoadingScreen from './components/Loading/Loading'

const Home = lazy(() => import('./pages/Home'))
const A380test = lazy(() => import('./pages/A380test'))
const FlightOnMap = lazy(() => import('./pages/FlightOnMap'))
// import A380test from './pages/A380test'; // 상대 경로 확인

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundaryWithFallback>
          <SuspenseWithLoadingScreen>
            <Routes>
              <Route element={<Home />} path="/" />
              <Route element={<A380test />} path="/a380" />
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)' }}>
      <div style={{ padding: '50px 100px', margin: 'auto', border: '1px solid black', borderRadius: '15px', backgroundColor: 'white', boxShadow: '10px 6px 12px 1px rgba(50, 50, 255, .2)', textAlign: 'center', }}>
        <h2>에러가 발생했어요!</h2>
        <p style={{ fontSize: '3rem' }}>😿</p>
        <p><b>자세히:</b>&nbsp;{error.message}</p>
        <VSkyButton onClick={() => window.location.reload()}>다시시도</VSkyButton>
      </div>
    </div>
  )
}

const ErrorBoundaryWithFallback: React.FC<{ children: React.ReactNode }> = ({
  children,
}: { children: any }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  )
}

const SuspenseWithLoadingScreen: React.FC<{ children: React.ReactNode }> = ({
  children,
}: { children: any }) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

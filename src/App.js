import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ErrorFallback from './components/ErrorCompoent/ErrorComponent';
import './App.css';
import LoadingScreen from './components/Loading/Loading';
const Home = lazy(() => import('./pages/Home'));
const FlightOnMap = lazy(() => import('./pages/FlightOnMap'));
const queryClient = new QueryClient();
function App() {
    return (React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(Router, null,
            React.createElement(ErrorBoundary, { FallbackComponent: ErrorFallback },
                React.createElement(Suspense, { fallback: React.createElement(LoadingScreen, null) },
                    React.createElement(Routes, null,
                        React.createElement(Route, { element: React.createElement(Home, null), path: "/" }),
                        React.createElement(Route, { element: React.createElement(FlightOnMap, null), path: "flight" })))))));
}
export default App;

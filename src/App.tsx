import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import "./App.css"
import Loading from "./components/Loading/Loading";

const Home = lazy(() => import("./pages/Home"));
const FlightOnMap = lazy(() => import("./pages/FlightOnMap"));

const queryClient = new QueryClient();

const fetchAirports = async () => {
  const response = await fetch('/airports.dat');
  if (!response.ok) {
    throw new Error('공항정보를 가져오지 못하였습니다.');
  }
  console.log(response)
  return response;
};

const AirportDataFetcher = ({ children }: any) => {
  const { data: airports, isLoading, error } = useQuery({
    queryKey: ['airports'],
    queryFn: fetchAirports,
  });
  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  return children(airports);
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<Loading />}>
          <AirportDataFetcher>
            {(airports: any) => (
              <Routes>
                <Route path="/" element={<Home airports={airports as any} />} />
                <Route path="/flight" element={<FlightOnMap />} />
              </Routes>
            )}
          </AirportDataFetcher>
        </Suspense>
      </Router>
    </QueryClientProvider>
  )
}

export default App

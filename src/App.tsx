import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css"

const Home = lazy(() => import("./pages/Home"));
const FlightOnMap = lazy(() => import("./pages/FlightOnMap"));

import Loading from "./components/Loading/Loading";

function App() {

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flight" element={<FlightOnMap />} />
        </Routes>
      </Suspense>
    </Router>)
}

export default App
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FlightOnMap from "./pages/FlightOnMap";
// import { Loading } from "./pages/Loading";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flight" element={<FlightOnMap />} />
      </Routes>
    </Router>)
}

export default App
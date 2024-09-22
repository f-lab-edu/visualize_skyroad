import React, { ReactElement, useEffect, useState } from "react";
import { styled } from "@stitches/react";
import ComboBox from "../components/ComboBox/ComboBox";
import SkyButton from "../components/Button/VSKyButton";
import backgroundImage from "../assets/sky1.jpg";
import { useNavigate } from "react-router-dom";

import { requestFlightList } from "../dataProcessingLayer";

const HomeLayoutSytle = styled('div', {
  margin: 'none',
  height: '100vh',
  boxSizing: 'border-box',
  display: 'flex',
  textAlign: "center",
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundOrigin: 'padding-box',
  fontFamily: 'Roboto',
  borderRadius: '5px',
});

/*
  출발지: Departure point (or Origin)
  도착지: Arrival point (or Destination)
*/
// const DepartureComboBox = () => <ComboBox />
// const ArrivalComboBox = () => <ComboBox />

const RouteComboxBoxContainer = styled('div', {
  display: "flex",
  backgroundColor: "#FAFAFA",
  width: "max-content",
  borderRadius: "100px",
  padding: "15px",
  margin: "auto",
  gap: "5px",
});
const FlightListContainer = styled('ul', {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#FAFAFA",
  width: "90vw",
  borderRadius: "35px",
  padding: "15px",
  margin: "auto",
  gap: "5px",
  listStyle: "none",
  "li": {
    '&:hover': {
      backgroundColor: 'rgba(200,200,200,0.125)',
    },
    width: "100%",
    //border: "1px solid red",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    verticalAlign: "center",
  }
});
const HomeHeaderText = styled('h1', {
  color: 'white',
  fontSize: '5rem',
  margin: "auto",
  cursor: 'default',
  "p": {
    fontSize: '1rem',
    color: 'black',
    fontWeight: 'normal'
  }
});
const STINGS = {
  Header: "ExploreTheWorld!!",
  Greeting: "같이 튀자 ~ ✈️",
  Departure: "Departure(출발지)",
  Arrival: "Arrival(도착지)",
  buttonText: "Search",
};


const Home = ({ airports }: any) => {
  const navigate = useNavigate();
  const [departureAirport, setDepartureAirport] = useState(null);
  const [arrivalAirport, setArrivalAirport] = useState(null);
  const [flightList, setFlightList] = useState([]);
  // const [flight, setFlight] = useState();

  const handleSearch = async () => {
    if (!(departureAirport && arrivalAirport)) {
      alert("출발/도착 공항을 선택해주세요! :)");
      return;
    }

    const flightList = await requestFlightList(departureAirport, arrivalAirport) as [];
    setFlightList(flightList);
    //
  };
  const handleFlight = (index: number) => {
    navigate("/flight", { state: { departure: departureAirport, arrival: arrivalAirport, flight: flightList[index] } });
  };


  return (<HomeLayoutSytle>
    <HomeHeaderText>
      {STINGS.Header}
      <p>{STINGS.Greeting}</p>
    </HomeHeaderText>
    <RouteComboxBoxContainer>
      <ComboBox blacklist={arrivalAirport} airports={airports} onSelectAirport={setDepartureAirport} />
      <ComboBox blacklist={departureAirport} airports={airports} onSelectAirport={setArrivalAirport} />
      <SkyButton onClick={handleSearch}>{STINGS.buttonText}</SkyButton>
    </RouteComboxBoxContainer>
    {flightList.length > 0 &&
      <FlightListContainer>
        {flightList.map((flight: any, index: number) => (
          <li key={index}>
            {flight.text} &nbsp;|&nbsp; {flight.dep}&nbsp;|&nbsp; {flight.arr} |
            <SkyButton onClick={() => handleFlight(index)}>Flight</SkyButton>
          </li>
        ))}
      </FlightListContainer>
    }
  </HomeLayoutSytle>);
}

export default Home;

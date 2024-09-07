import React from "react";
import { styled } from "@stitches/react";
import ComboBox from "../compontents/ComboBox/ComboBox";
import SkyButton from "../compontents/Button/VSKyButton";
import backgroundImage from "../assets/sky1.jpg";
import { useNavigate } from "react-router-dom";

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
const OriginComboBox = () => <ComboBox />
const DestinationComboBox = () => <ComboBox />

const RouteComboxBoxContainer = styled('div', {
  display: "flex",
  backgroundColor: "#FAFAFA",
  width: "max-content",
  borderRadius: "100px",
  padding: "15px",
  margin: "auto",
  gap: "5px",
});
const STINGS = {
  Header: "ExploreTheWorld!!",
  Greeting: "같이 튀자 ~ ✈️",
  Departure: "Departure(출발지)",
  Arrival: "Arrival(도착지)",
  buttonText: "Search",
}
const DummyData = {
  FlightList: [
    { text: "항공편: KAL1839", dep: "인천국제공항", arr: "-" },
    { text: "항공편: KAL1839", dep: "인천국제공항", arr: "-" },
    { text: "항공편: KAL1839", dep: "인천국제공항", arr: "-" },
  ],
}
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
    width: "100%", border: "1px solid red",
    display: "flex", flexDirection: "row", justifyContent: "space-between",
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
function Home() {
  const navigate = useNavigate();
  
  return (<HomeLayoutSytle>

    <HomeHeaderText>
      {STINGS.Header}
      <p>{STINGS.Greeting}</p>
    </HomeHeaderText>

    <RouteComboxBoxContainer>
      <label>{STINGS.Departure}
        <OriginComboBox />
      </label>
      <label>{STINGS.Arrival}
        <DestinationComboBox />
      </label>
      <SkyButton>{STINGS.buttonText}</SkyButton>
    </RouteComboxBoxContainer>

    <FlightListContainer>
      {DummyData.FlightList.map((flight, index) =>
        <li key={index} >{flight.text} &nbsp;|&nbsp; {flight.dep}&nbsp;|&nbsp; {flight.arr} | <SkyButton onClick={() => { navigate("/flight") }}>Flight</SkyButton></li>)}
    </FlightListContainer>

  </HomeLayoutSytle>)
}

export default Home;

import React from "react";
import { styled } from "@stitches/react";
import ComboBox from "../compontents/ComboBox/ComboBox";
import SkyButton from "../compontents/Button/VSKyButton";
import backgroundImage from "../assets/sky1.jpg";

const HomeLayoutSytle = styled('div', {
  border: '1px solid red',
  margin: 'none',
  // width: '100vw',
  height: '100vh',
  display: 'flex',
  textAlign: "center",
  flexDirection: 'column',
  justifyItems: 'space-evenly',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundOrigin: 'padding-box',
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
  border: "1px solid red",
  gap: "5px",
});
const STINGS = {
  Departure: "출발지",
  Arrival: "도착지"
}
function Home() {
  return (<HomeLayoutSytle>
    <h3>Explore The World!</h3>
    <p>같이튀자!!</p>
    <RouteComboxBoxContainer>
      <label>{STINGS.Departure}
        <OriginComboBox />
      </label>
      <label>{STINGS.Arrival}
        <DestinationComboBox />
      </label>
      <SkyButton>Search</SkyButton>
    </RouteComboxBoxContainer>
    <div>
      <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  </HomeLayoutSytle>)
}

export default Home;

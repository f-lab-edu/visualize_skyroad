import { styled } from '@stitches/react';
import React from 'react';
import { STR_HOME } from '../../constants/strings';
import { FlightListItem } from './FlightListItem';
export const SearchResults = ({ flightList, isLoading, onFlightSelect, }) => {
    if (isLoading)
        return React.createElement("div", null, STR_HOME.LoadingText);
    if (!flightList?.length)
        return null;
    return (React.createElement(FlightListContainer, null, flightList.map((flight, index) => (React.createElement(FlightListItem, { flight: flight, key: flight.icao24 + flight.firstSeen, onSelect: () => onFlightSelect(index) })))));
};
const FlightListContainer = styled('ul', {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    color: 'rgba(0, 0, 0, 0.8)',
    width: '90vw',
    maxHeight: '30vh',
    overflowY: 'auto',
    borderRadius: '20px',
    padding: '20px',
    margin: 'auto',
    gap: '10px',
    listStyle: 'none',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    '@media (max-width: 768px)': {
        width: '100vw',
        maxHeight: '40vh',
    },
    '@media (min-width: 769px) and (max-width: 1024px)': {
        width: '80vw',
    },
    li: {
        '&:hover': {
            backgroundColor: 'rgba(200, 200, 200, 0.15)',
        },
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderRadius: '10px',
        transition: 'background-color 0.3s ease',
    },
});

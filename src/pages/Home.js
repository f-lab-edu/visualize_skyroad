import { styled } from '@stitches/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import React, { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/sky1.jpg';
import { AppTitle } from '../components/AppTitle/AppTitle';
import AppVersion from '../components/AppVersion';
import ErrorFallback from '../components/ErrorCompoent/ErrorComponent';
import Loading from '../components/Loading/Loading';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchResults } from '../components/Search/SearchResult';
import { STR_HOME } from '../constants/strings';
import { requestFlightList } from '../data/dataProcessingLayer';
const Home = () => {
    const navigate = useNavigate();
    const [departureAirport, setDepartureAirport] = useState(null);
    const [arrivalAirport, setArrivalAirport] = useState(null);
    const [searchTrigger, setSearchTrigger] = useState(0);
    useEffect(() => {
        // setSearchTrigger(0)
    }, [departureAirport, arrivalAirport]);
    const { data: flightList, isLoading } = useSuspenseQuery({
        queryKey: [
            'flightList',
            departureAirport?.id,
            arrivalAirport?.id,
            /*departureAirport, arrivalAirport,*/ searchTrigger,
        ],
        queryFn: () => {
            if (!departureAirport || !arrivalAirport) {
                return Promise.resolve([]);
            }
            return requestFlightList({ departureAirport, arrivalAirport });
        },
    });
    const handleSearch = () => {
        if (!(departureAirport && arrivalAirport)) {
            alert(STR_HOME.WarningChooseBoth);
            return;
        }
        setSearchTrigger((prev) => prev + 1);
    };
    const handleFlightSelect = (index) => {
        navigate('/flight', {
            state: {
                departure: departureAirport,
                arrival: arrivalAirport,
                flight: flightList ? flightList[index] : null,
            },
        });
    };
    return (React.createElement(ErrorBoundary, { FallbackComponent: ErrorFallback },
        React.createElement(HomeLayout, null,
            React.createElement(AppTitle, null),
            React.createElement(SearchBar, { arrivalAirport: arrivalAirport, departureAirport: departureAirport, onArrivalSelect: setArrivalAirport, onDepartureSelect: setDepartureAirport, onSearch: handleSearch }),
            React.createElement(Suspense, { fallback: React.createElement(Loading, { type: "flight" }) },
                React.createElement(SearchResults, { flightList: flightList, isLoading: isLoading, onFlightSelect: handleFlightSelect })),
            React.createElement(AppVersion, null))));
};
export default Home;
const HomeLayout = styled('div', {
    margin: 'none',
    height: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: 'Roboto, sans-serif',
    gap: '20px',
    '@media (max-width: 768px)': {
        padding: '10px',
        backgroundPosition: 'center',
    },
    '@media (min-width: 769px) and (max-width: 1024px)': {
        padding: '20px',
        backgroundPosition: 'top',
    },
    '.app': {
        marginLeft: 'auto',
        fontSize: '.75rem',
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.75)',
    },
});

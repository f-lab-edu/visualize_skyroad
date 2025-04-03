import { styled } from '@stitches/react';
import React, { useEffect, useRef, useState } from 'react';
import FlagIcon from 'react-flagkit';
const AirportComboBox = ({ airports, onSelectAirport, blacklist, searchAirports, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAirports, setFilteredAirports] = useState([]);
    const isSelecting = useRef(false);
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };
    useEffect(() => {
        if (isSelecting.current) {
            isSelecting.current = false;
            return;
        }
        if (searchTerm === '' || searchTerm.length < 2) {
            setFilteredAirports([]);
            return;
        }
        const filtered = searchAirports(searchTerm);
        setFilteredAirports(filtered);
    }, [searchTerm]);
    const handleOptionClick = (airport) => {
        isSelecting.current = true;
        onSelectAirport(airport);
        setSearchTerm(`${airport.city} ${airport.name}`);
        setFilteredAirports([]);
    };
    const AirportElementItem = ({ airport }) => (React.createElement(Option, { onClick: () => handleOptionClick(airport) },
        airport.flag === '-' ? ('🌏') : (React.createElement(FlagIcon, { alt: airport.country, country: airport.flag })),
        "\u00A0",
        React.createElement("p", null, airport.city),
        "\u00A0",
        airport.name));
    return (React.createElement(ComboBoxContainer, null,
        React.createElement(Input, { onChange: handleInputChange, placeholder: "\uACF5\uD56D\uC744 \uAC80\uC0C9\uD574\uC8FC\uC138\uC694.", type: "text", value: searchTerm }),
        filteredAirports.length > 0 && (React.createElement(Dropdown, null, filteredAirports
            .filter((airport) => airport.id !== blacklist?.id)
            .map((airport) => (React.createElement("div", { key: airport.id },
            React.createElement(AirportElementItem, { airport: airport }))))))));
};
export default AirportComboBox;
const ComboBoxContainer = styled('div', {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '250px',
    padding: '8px',
    border: '1px solid #CCC',
    borderRadius: '8px',
    backgroundColor: '#EFEFEF',
});
const Input = styled('input', {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #CCC',
    marginBottom: '8px',
    width: '100%',
    boxSizing: 'border-box',
});
const Dropdown = styled('ul', {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    zIndex: 1000,
    listStyle: 'none',
    padding: '0',
    margin: '0',
    border: '1px solid #CCC',
    borderRadius: '4px',
    backgroundColor: '#FFF',
    maxHeight: '200px',
    overflowY: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});
const Option = styled('li', {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textAlign: 'left',
    padding: '8px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&:hover': {
        backgroundColor: '#DDD',
    },
    p: {
        fontWeight: 'bold',
        fontSize: '.8rem',
        margin: '0',
        padding: '0',
    },
});

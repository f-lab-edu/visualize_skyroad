import { styled } from '@stitches/react';
import React from 'react';
import VSkyButton from '../Button/VSKyButton';
const ErrorFallback = ({ error }) => {
    return (React.createElement(ErrorPageContainer, null,
        React.createElement("div", { className: "modal" },
            React.createElement("h2", null, "\uC5D0\uB7EC\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694!"),
            React.createElement("p", { className: "cat" }, "\uD83D\uDE3F"),
            React.createElement("p", null,
                React.createElement("b", null, "\uC790\uC138\uD788:"),
                "\u00A0",
                error.message),
            React.createElement(VSkyButton, { onClick: () => window.location.reload() }, "\uB2E4\uC2DC\uC2DC\uB3C4"))));
};
export default ErrorFallback;
const ErrorPageContainer = styled('div', {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
    '.modal': {
        padding: '50px 100px',
        margin: 'auto',
        border: '1px solid black',
        borderRadius: '15px',
        backgroundColor: 'white',
        boxShadow: '10px 6px 12px 1px rgba(50, 50, 255, .2)',
        textAlign: 'center',
    },
    '.cat': {
        fontSize: '3rem',
    },
});

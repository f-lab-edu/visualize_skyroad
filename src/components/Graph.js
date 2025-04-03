import { styled } from '@stitches/react';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
const Graph = ({ altitude, onCloseBtnClicked }) => {
    const svgRef = useRef(null);
    const timeData = altitude.map((item) => new Date(item.time * 1000));
    const altitudeData = altitude.map((item) => item.altitude);
    useEffect(() => {
        if (!svgRef.current)
            return;
        const width = 600;
        const height = 175;
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background-color', '#f9f9f9')
            .style('border-radius', '8px');
        svg.selectAll('*').remove();
        const xScale = d3
            .scaleTime()
            .domain([timeData[0], timeData[timeData.length - 1]])
            .range([margin.left, width - margin.right]);
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(altitudeData) || 1])
            .range([height - margin.bottom, margin.top]);
        svg
            .append('g')
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(d3
            .axisBottom(xScale)
            .ticks(15)
            .tickFormat((domainValue) => d3.timeFormat('%H:%M')(domainValue)));
        svg
            .append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));
        const line = d3
            .line()
            .x((d) => xScale(d.time))
            .y((d) => yScale(d.altitude));
        svg
            .append('path')
            .datum(altitude.map((item, i) => ({
            time: timeData[i],
            altitude: item.altitude,
        })))
            .attr('fill', 'none')
            .attr('stroke', '#4A90E2')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 2)
            .attr('d', line);
    }, [altitude]);
    return (React.createElement(GraphContainer, null,
        React.createElement(Header, null,
            React.createElement("p", null, "\uD83D\uDCC8 Altitude Graph"),
            React.createElement("button", { onClick: onCloseBtnClicked }, "Fold \u25BC")),
        React.createElement("svg", { ref: svgRef })));
};
export default Graph;
const GraphContainer = styled('div', {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '600px',
    height: '200px',
    zIndex: 1000,
    '& section': {
        border: '1px solid red',
        overflow: 'auto',
        height: '50px',
    },
    '& header': {
        maxWidth: 'max-content',
        margin: 'auto',
    },
    '& ul': {
        listStyle: 'none',
    },
});
const Header = styled('div', {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: {
        width: 'max-content',
        fontSize: '1rem',
        margin: 'auto',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4A90E2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#357ABD',
        },
    },
});

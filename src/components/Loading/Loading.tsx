import { styled } from '@stitches/react';
import React from 'react';

const Loading = () => {
    return (<Container>
        <div className="LoadingText">로딩중입니다!</div>
        {/* <div class="dots"> */}
        {/* <div class="dot"></div> */}
        {/* <div class="dot"></div> */}
        {/* <div class="dot"></div> */}
        {/* </div> */}
    </Container>)
}

export default Loading;

const Container = styled('div', {
    background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: '0',
    fontFamily: 'Arial, sans-serif',
    '.LoadingText': {
        fontSize: '2rem',
        marginBottom: '20px',
        color: 'White',
        background: 'skyblue',
        opacity: '0.85',
        padding: '10px 25px',
        borderRadius: '25px',
    },
    backgroundBlendMode: 'overlay', // 배경 혼합 효과 추가
    backgroundOpacity: '0.9',
})
/*
.loading - container {
    text - align: center;
}

.loading - text {
}

.dots {
    display: flex;
    justify - content: center;
    gap: 10px;
}

.dot {
    width: 20px;
    height: 20px;
    background - color: gray;
    border - radius: 50 %;
    animation: blink 1.2s infinite;
}

.dot: nth - child(2) {
    animation - delay: 0.4s;
}

.dot: nth - child(3) {
    animation - delay: 0.8s;
}

@keyframes blink {
    0 %, 80 %, 100 % {
        background- color: gray;
}
40 % {
    background- color: white;
    }
}
*/
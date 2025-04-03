import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import VSkyButton from './VSKyButton';
describe('VSkyButton', () => {
    it('버튼이 올바르게 렌더링되어야 합니다', () => {
        render(React.createElement(VSkyButton, null, "\uD14C\uC2A4\uD2B8 \uBC84\uD2BC"));
        expect(screen.getByText('테스트 버튼')).toBeInTheDocument();
    });
    it('클릭 이벤트가 발생해야 합니다', () => {
        const handleClick = vi.fn();
        render(React.createElement(VSkyButton, { onClick: handleClick }, "\uD074\uB9AD"));
        fireEvent.click(screen.getByText('클릭'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    it('toggled 상태일 때 올바른 스타일이 적용되어야 합니다', () => {
        render(React.createElement(VSkyButton, { toggled: true }, "\uD1A0\uAE00 \uBC84\uD2BC"));
        const button = screen.getByText('토글 버튼');
        expect(button).toHaveClass('toggled');
    });
});

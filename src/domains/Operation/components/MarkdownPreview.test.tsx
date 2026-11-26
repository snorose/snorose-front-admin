import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { MarkdownPreview } from './MarkdownPreview';

describe('본문 링크 이동', () => {
  test.each([
    ['https://example.com/path', 'https://example.com/path'],
    ['HTTP://example.com/path', 'https://example.com/path'],
    ['www.example.com/path?q=1#info', 'https://www.example.com/path?q=1#info'],
    ['example.com', 'https://example.com'],
  ])('외부 주소 %s는 새 탭으로 연다', (address, expected) => {
    render(<MarkdownPreview markdown={`[외부 링크](${address})`} />);
    const link = screen.getByRole('link', { name: '외부 링크' });
    expect(link).toHaveAttribute('href', expected);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test.each([
    '/notices/1',
    './notice',
    '../notice',
    '#info',
    'mailto:a@example.com',
    'tel:01012345678',
  ])('외부 웹 주소가 아닌 %s는 차단한다', (address) => {
    render(<MarkdownPreview markdown={`[링크](${address})`} />);
    expect(screen.getByText('링크')).toHaveAttribute('href', '');
  });

  test('실행 가능한 스크립트 주소는 차단한다', () => {
    render(<MarkdownPreview markdown='[위험 링크](javascript:alert)' />);
    expect(screen.getByText('위험 링크')).toHaveAttribute('href', '');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ExamDiscussionStatusBadge } from './ExamDiscussionStatusBadge';

describe('ExamDiscussionStatusBadge', () => {
  test('논의 있음 상태를 info 배지로 표시한다', () => {
    render(<ExamDiscussionStatusBadge isDiscussed />);

    expect(screen.getByText('논의 있음')).toHaveClass(
      'bg-blue-50',
      'text-blue-700'
    );
  });

  test('논의 없음 상태를 neutral 배지로 표시한다', () => {
    render(<ExamDiscussionStatusBadge isDiscussed={false} />);

    expect(screen.getByText('논의 없음')).toHaveClass(
      'bg-slate-100',
      'text-slate-700'
    );
  });
});

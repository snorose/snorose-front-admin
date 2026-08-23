import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ExamConfirmStatusBadge } from './ExamConfirmStatusBadge';

describe('ExamConfirmStatusBadge', () => {
  test.each([
    ['CONFIRMED', '확인', 'bg-blue-50'],
    ['UNCONFIRMED', '미확인', 'bg-slate-100'],
    ['NEED_DISCUSS', '논의필요', 'bg-amber-50'],
    ['NEED_ACTION', '징계필요', 'bg-rose-50'],
    ['DELETED', '삭제됨', 'bg-rose-50'],
  ])('%s 상태를 공통 배지로 표시한다', (status, label, className) => {
    render(<ExamConfirmStatusBadge status={status} />);

    expect(screen.getByText(label)).toHaveClass(className);
  });

  test('알 수 없는 상태는 neutral 배지로 표시한다', () => {
    render(<ExamConfirmStatusBadge status='UNKNOWN' />);

    expect(screen.getByText('알 수 없음')).toHaveClass(
      'bg-slate-100',
      'text-slate-700'
    );
  });
});

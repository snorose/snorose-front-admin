import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ExamReviewProcessStatus } from '@/domains/Reviews/types';

import { ExamReviewProcessStatusBadge } from './ExamReviewProcessStatusBadge';

describe('ExamReviewProcessStatusBadge', () => {
  test.each<[ExamReviewProcessStatus, string, string]>([
    ['VISIBLE', '노출', 'bg-emerald-50'],
    ['USER_DELETED', '유저 삭제', 'bg-rose-50'],
    ['ADMIN_DELETED', '어드민 삭제', 'bg-rose-50'],
    ['ADMIN_HIDDEN', '어드민 비공개', 'bg-amber-50'],
    ['AUTO_HIDDEN', '비공개 (신고 5개 이상)', 'bg-amber-50'],
    ['SANCTIONED', '징계', 'bg-violet-50'],
    ['DESANCTIONED', '징계 없음', 'bg-emerald-50'],
  ])('%s 상태를 공통 배지로 표시한다', (status, label, className) => {
    render(<ExamReviewProcessStatusBadge status={status} />);

    expect(screen.getByText(label)).toHaveClass(className);
  });
});

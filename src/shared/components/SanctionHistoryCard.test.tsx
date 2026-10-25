import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { SanctionHistoryCard } from './SanctionHistoryCard';

describe('게시글·댓글 제재 이력', () => {
  test('종료일 없이 강등 개월 수와 시작일을 표시한다', () => {
    render(
      <SanctionHistoryCard
        title='제재 이력'
        loadingMessage='로딩 중'
        errorMessage='조회 실패'
        emptyMessage='이력 없음'
        historyData={[
          {
            type: 'RELEGATION',
            createdAt: '2026-01-01T00:00:00',
            startAt: '2026-01-02T00:00:00',
            relegationMonth: 12,
            reason: '제재 사유',
            encryptedAdminId: 'admin-id',
          },
        ]}
        isLoading={false}
        isError={false}
        currentPage={1}
        totalPage={1}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('강등 기간')).toBeInTheDocument();
    expect(screen.getByText('12개월')).toBeInTheDocument();
    expect(screen.getByText('2026-01-02')).toBeInTheDocument();
    expect(screen.queryByText('종료일 없음')).not.toBeInTheDocument();
  });
});

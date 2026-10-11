import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { SectionTitleWithCount } from './SectionTitleWithCount';

describe('SectionTitleWithCount', () => {
  test('목록 제목으로 섹션을 연결하고 개수와 단위를 표시한다', () => {
    render(
      <section aria-labelledby='member-results-heading'>
        <SectionTitleWithCount
          title='회원 목록'
          titleId='member-results-heading'
          totalCount={1234}
          status='ready'
        />
      </section>
    );

    expect(
      screen.getByRole('region', { name: '회원 목록' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '회원 목록' })
    ).toHaveAttribute('id', 'member-results-heading');
    expect(screen.getByRole('status')).toHaveTextContent('총 1,234건');
  });

  test('제목 ID 없이도 조회 상태를 전달한다', () => {
    render(
      <SectionTitleWithCount
        title='게시글 목록'
        totalCount={undefined}
        status='loading'
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).not.toHaveAttribute('id');
    expect(screen.getByRole('status')).toHaveTextContent('조회 중…');
  });
});

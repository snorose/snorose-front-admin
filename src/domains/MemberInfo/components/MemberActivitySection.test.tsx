import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import MemberActivitySection from './MemberActivitySection';

describe('MemberActivitySection', () => {
  test('학번을 작성자 키워드로 사용해 게시글과 댓글 관리 화면에 연결한다', () => {
    render(
      <MemoryRouter>
        <MemberActivitySection studentNumber='3498993' />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: /작성한 게시글 조회/ })
    ).toHaveAttribute('href', '/posts/manage?keywordAuthor=3498993&page=1');
    expect(
      screen.getByRole('link', { name: /작성한 댓글 조회/ })
    ).toHaveAttribute(
      'href',
      '/posts/comments?searchScope=CONTENT&keywordAuthor=3498993&page=1'
    );
  });

  test('아직 연결되지 않은 활동 항목은 비활성 상태로 표시한다', () => {
    render(
      <MemoryRouter>
        <MemberActivitySection studentNumber='3498993' />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);
    screen.getAllByRole('button').forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

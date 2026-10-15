import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, describe, expect, test, vi } from 'vitest';

import { OriginalPostButton } from './OriginalPostButton';

vi.hoisted(() => {
  vi.stubEnv('VITE_USER_FRONT_BASE_URL', 'http://localhost:5174');
});
afterAll(() => vi.unstubAllEnvs());

describe('OriginalPostButton', () => {
  test('사용자 사이트 경로의 선행 슬래시 유무와 쿼리를 처리한다', () => {
    const { rerender } = render(
      <OriginalPostButton
        href='inquiry/123?tab=comments#reply'
        label='문의 원문'
        isUserSnorose
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'http://localhost:5174/inquiry/123?tab=comments#reply'
    );
    rerender(
      <OriginalPostButton
        href='/inquiry/123?tab=comments#reply'
        label='문의 원문'
        isUserSnorose
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'http://localhost:5174/inquiry/123?tab=comments#reply'
    );
    rerender(
      <OriginalPostButton
        href='/posts/manage/456?commentId=123'
        label='신고 대상'
        isUserSnorose={false}
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/posts/manage/456?commentId=123'
    );
  });

  test('전달한 문구로 링크를 구분하고 새 탭 안내와 목적지를 유지한다', () => {
    render(
      <>
        <OriginalPostButton href='/report/1' label='신고 원문' isUserSnorose />
        <OriginalPostButton
          href='/posts/manage/456'
          label='신고 대상'
          isUserSnorose={false}
        />
      </>
    );

    const original = screen.getByTitle('신고 원문 바로가기');
    const target = screen.getByTitle('신고 대상 바로가기');
    expect(original).toHaveAttribute('href', 'http://localhost:5174/report/1');
    expect(target).toHaveAttribute('href', '/posts/manage/456');
    expect(original).toHaveAccessibleName(/^신고 원문\s*\(새 탭에서 열림\)$/);
    expect(target).toHaveAccessibleName(/^신고 대상\s*\(새 탭에서 열림\)$/);
    expect(target).toHaveAccessibleDescription('신고 대상 바로가기');
  });

  test('주입한 주소를 새 탭으로 여는 링크와 안내를 제공한다', () => {
    const href = '/board/large-snow/post/123';
    render(
      <OriginalPostButton href={href} label='원본 게시글' isUserSnorose />
    );

    const link = screen.getByRole('link', {
      name: /^원본 게시글\s*\(새 탭에서 열림\)$/,
    });
    expect(link).toHaveAttribute('href', `http://localhost:5174${href}`);
    expect(link).toHaveAttribute('title', '원본 게시글 바로가기');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test.each([null, undefined, '', '   '])(
    '주소가 %s이면 링크를 표시하지 않는다',
    (href) => {
      const { container } = render(
        <OriginalPostButton href={href} label='원본 게시글' isUserSnorose />
      );

      expect(container).toBeEmptyDOMElement();
    }
  );

  test('키보드로 초점을 이동할 수 있고 주소 제거 시 링크가 사라진다', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <OriginalPostButton href='/inquiry/123' label='문의 원문' isUserSnorose />
    );

    await user.tab();
    expect(screen.getByRole('link')).toHaveFocus();

    rerender(
      <OriginalPostButton href={null} label='문의 원문' isUserSnorose />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

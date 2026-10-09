import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import MemberDirectoryActionBar from './MemberDirectoryActionBar';

describe('MemberDirectoryActionBar', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      }
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test('실행 기능이 연결되지 않은 일괄 행동은 모두 비활성 상태로 표시한다', () => {
    render(<MemberDirectoryActionBar />);

    for (const name of ['포인트 지급', '제재 부여', '회원 탈퇴', '알림 전송']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  test('비활성 버튼에 마우스를 올리면 준비 중 안내를 표시한다', async () => {
    const user = userEvent.setup();
    render(<MemberDirectoryActionBar />);

    for (const name of ['포인트 지급', '제재 부여', '회원 탈퇴', '알림 전송']) {
      const trigger = screen.getByRole('group', {
        name: `${name} 기능 준비 중`,
      });
      await user.hover(trigger);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        '준비 중인 기능입니다.'
      );
      await user.unhover(trigger);
    }
  });

  test('키보드 포커스로도 준비 중 안내를 확인할 수 있다', async () => {
    const user = userEvent.setup();
    render(<MemberDirectoryActionBar />);

    await user.tab();
    expect(
      screen.getByRole('group', { name: '포인트 지급 기능 준비 중' })
    ).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      '준비 중인 기능입니다.'
    );
    expect(screen.getByRole('button', { name: '포인트 지급' })).toBeDisabled();
  });
});

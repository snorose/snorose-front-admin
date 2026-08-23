import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import MemberInfoEditForm from './MemberInfoEditForm';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const MEMBER: MemberInfo = {
  encryptedUserId: 'encrypted-user-id',
  loginId: 'test-id',
  userName: '테스트',
  email: 'test@sookmyung.ac.kr',
  nickname: '테스터',
  userRoleId: 2,
  studentNumber: '1234567',
  major: '컴퓨터과학전공',
  birthday: '2000-01-01',
  pointBalance: 100,
  createdAt: '2026-01-01T00:00:00',
  authenticatedAt: null,
  totalWarningCount: 0,
  isBlacklist: false,
  blacklistStartDate: null,
  blacklistEndDate: null,
};

describe('MemberInfoEditForm', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  test('유효하지 않은 첫 번째 변경 필드로 이동하고 포커스한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MemberInfoEditForm
        member={MEMBER}
        onCopy={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const loginIdInput = screen.getByLabelText('아이디');
    await user.clear(loginIdInput);
    fireEvent.submit(loginIdInput.closest('form') as HTMLFormElement);

    expect(loginIdInput).toHaveFocus();
    expect(loginIdInput).toHaveAttribute('aria-invalid', 'true');
    expect(loginIdInput).toHaveClass('border-rose-300', 'bg-rose-50');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

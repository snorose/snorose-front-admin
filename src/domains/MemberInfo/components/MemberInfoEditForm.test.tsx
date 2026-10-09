import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    expect(loginIdInput).toHaveAccessibleDescription(
      screen.getByRole('alert').textContent ?? ''
    );
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('생년월일의 월·연도를 빠르게 이동하고 선택한 문자열만 저장한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MemberInfoEditForm
        member={MEMBER}
        onCopy={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    const birthday = screen.getByRole('button', { name: '생년월일' });
    expect(birthday).toHaveTextContent('2000-01-01');
    expect(birthday).toHaveAttribute('name', 'birthday');
    await user.click(birthday);
    const yearSelect = screen.getByRole('combobox', {
      name: '연도 선택',
    });
    const currentYear = new Date().getFullYear();
    expect(yearSelect.querySelector('option:last-child')).toHaveValue(
      String(currentYear)
    );
    expect(
      yearSelect.querySelector(`option[value="${currentYear + 1}"]`)
    ).toBeNull();
    await user.selectOptions(yearSelect, String(currentYear));
    await user.selectOptions(
      screen.getByRole('combobox', { name: '월 선택' }),
      '11'
    );
    const nextMonth = screen.getByRole('button', { name: '다음 달로 이동' });
    expect(nextMonth).toHaveAttribute('aria-disabled', 'true');
    await user.click(nextMonth);
    expect(screen.getByRole('grid')).toHaveAccessibleName(
      `${currentYear}년 12월`
    );
    expect(
      screen.getByRole('button', {
        name: new RegExp(`${currentYear}년 12월 31일`),
      })
    ).toBeEnabled();
    await user.selectOptions(
      screen.getByRole('combobox', { name: '연도 선택' }),
      '1980'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: '월 선택' }),
      '1'
    );
    await user.click(screen.getByRole('button', { name: /1980년 2월 29일/ }));
    expect(birthday).toHaveTextContent('1980-02-29');
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.submit(birthday.closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      birthday: '1980-02-29',
    });
    expect(screen.getByLabelText('이메일')).toHaveAttribute('type', 'email');
  });

  test('생년월일 해제 후 저장하면 날짜 버튼에 오류·포커스를 연결하고 재선택으로 복구한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MemberInfoEditForm
        member={MEMBER}
        onCopy={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    const birthday = screen.getByRole('button', { name: '생년월일' });
    await user.click(birthday);
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    await waitFor(() => expect(birthday).toHaveFocus());
    expect(birthday).toHaveTextContent('생년월일 선택');
    fireEvent.submit(birthday.closest('form') as HTMLFormElement);
    expect(birthday).toHaveFocus();
    expect(birthday).toHaveAttribute('aria-invalid', 'true');
    expect(birthday).toHaveAccessibleDescription('생년월일을 입력해주세요.');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(birthday);
    await user.selectOptions(
      screen.getByRole('combobox', { name: '연도 선택' }),
      '2000'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: '월 선택' }),
      '0'
    );
    await user.click(screen.getByRole('button', { name: /2000년 1월 5일/ }));
    expect(birthday).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.submit(birthday.closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      birthday: '2000-01-05',
    });
  });
});

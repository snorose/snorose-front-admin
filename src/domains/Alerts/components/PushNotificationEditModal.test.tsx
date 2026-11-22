import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { PushNotificationEditModal } from './PushNotificationEditModal';
import type { NotificationHistory } from './PushNotificationList';

const notification: NotificationHistory = {
  id: 5,
  status: '예약',
  requestedAt: '2026-08-13 16:00',
  target: '전체 회원',
  name: '기존 알림명',
  category: '광고성',
  memberCount: null,
  admin: 'admin_kim',
  title: '기존 제목',
  body: '기존 내용',
  url: '/board/notice/post/815',
  isExternal: false,
  sendTiming: 'scheduled',
  scheduledAt: '2026-08-15T16:00',
};

describe('알림 수정 모달', () => {
  test('기존 입력값을 불러오고 수정한 내용과 발송 옵션을 함께 저장한다', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <PushNotificationEditModal
        notification={notification}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    for (const [label, value] of [
      ['알림명', '수정 알림명'],
      ['알림 제목', '수정 제목'],
      ['알림 내용', '수정 내용'],
      ['알림 클릭 시 연결되는 주소', 'http://example.com/event'],
    ]) {
      const input = screen.getByLabelText(new RegExp(`^${label}`));
      await user.clear(input);
      await user.type(input, value);
    }
    await user.click(
      screen.getByRole('radio', { name: '외부 URL', exact: true })
    );
    await user.click(
      screen.getByRole('radio', { name: '정보성 (전체 공지 등)' })
    );
    await user.click(
      screen.getByRole('radio', { name: '관리자에게만 테스트 발송' })
    );
    await user.click(screen.getByRole('radio', { name: '즉시 발송' }));
    await user.click(screen.getByRole('button', { name: '수정', exact: true }));
    expect(onSave).toHaveBeenCalledWith({
      ...notification,
      name: '수정 알림명',
      title: '수정 제목',
      body: '수정 내용',
      url: 'https://example.com/event',
      isExternal: true,
      category: '정보성',
      target: '관리자',
      sendTiming: 'immediate',
      scheduledAt: '',
    });
  });

  test('예약 일시를 유지하며 취소하면 변경 내용을 저장하지 않는다', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <PushNotificationEditModal
        notification={notification}
        onClose={onClose}
        onSave={onSave}
      />
    );
    expect(
      screen.getByRole('radio', { name: '예약 발송', exact: true })
    ).toBeChecked();
    expect(screen.getByLabelText(/^알림 제목/)).toHaveValue('기존 제목');
    await user.click(screen.getByRole('button', { name: '취소', exact: true }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  test('잘못된 내부 주소는 저장하지 않는다', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <PushNotificationEditModal
        notification={notification}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    const input = screen.getByLabelText('알림 클릭 시 연결되는 주소');
    await user.clear(input);
    await user.type(input, 'https://example.com');
    await user.click(screen.getByRole('button', { name: '수정', exact: true }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      '내부 URL은 기본 주소를 제외한 경로만 입력해주세요.'
    );
    expect(onSave).not.toHaveBeenCalled();
  });
});

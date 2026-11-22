import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import {
  deleteAdminMaintenance,
  updateAdminMaintenance,
  uploadMaintenanceImage,
} from '@/apis/maintenance';

import type { ServerMaintenanceListItem } from '../types/maintenance';
import { MaintenanceDeleteModal } from './MaintenanceDeleteModal';
import { MaintenanceEditModal } from './MaintenanceEditModal';
import { MaintenanceListSection } from './MaintenanceListSection';

vi.mock('@/apis/maintenance', () => ({
  deleteAdminMaintenance: vi.fn(),
  updateAdminMaintenance: vi.fn(),
  uploadMaintenanceImage: vi.fn(),
}));
const item: ServerMaintenanceListItem = {
  id: 12,
  number: 1,
  status: 'SCHEDULED',
  title: '점검',
  startAt: '2026-11-10 02:00:00',
  endAt: '2026-11-10 04:00:00',
  createdAt: '',
  updatedAt: '',
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateAdminMaintenance).mockResolvedValue({
    id: 12,
    attachmentUrlList: [],
  });
  vi.mocked(deleteAdminMaintenance).mockResolvedValue({ message: 'Complete' });
});
test('수정 기본값은 메모·문구·이미지를 보내지 않으며 성공 후 갱신하고 닫는다', async () => {
  const user = userEvent.setup();
  const onChanged = vi.fn();
  const onClose = vi.fn();
  render(
    <MaintenanceEditModal item={item} onChanged={onChanged} onClose={onClose} />
  );
  await user.clear(screen.getByLabelText('관리용 일정 제목'));
  await user.type(screen.getByLabelText('관리용 일정 제목'), '변경 점검');
  await user.click(screen.getByRole('button', { name: '수정' }));
  expect(updateAdminMaintenance).toHaveBeenCalledExactlyOnceWith(12, {
    title: '변경 점검',
    startAt: item.startAt,
    endAt: item.endAt,
  });
  expect(onChanged).toHaveBeenCalledOnce();
  expect(onClose).toHaveBeenCalledOnce();
});
test('명시적 삭제 선택은 빈 문자열과 빈 배열을 전송하고 오류 시 모달을 유지한다', async () => {
  vi.mocked(updateAdminMaintenance).mockRejectedValue(new Error('중복된 기간'));
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <MaintenanceEditModal item={item} onChanged={vi.fn()} onClose={onClose} />
  );
  await user.selectOptions(
    screen.getByLabelText('사용자 안내 문구 처리'),
    'remove'
  );
  await user.selectOptions(
    screen.getByLabelText('사용자 안내 이미지 처리'),
    'remove'
  );
  await user.click(screen.getByRole('button', { name: '수정' }));
  expect(updateAdminMaintenance).toHaveBeenCalledWith(
    12,
    expect.objectContaining({ noticeMessage: '', attachments: [] })
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('중복된 기간');
  expect(onClose).not.toHaveBeenCalled();
});
test('이미지 재시도는 PATCH를 반복하지 않는다', async () => {
  vi.mocked(updateAdminMaintenance).mockResolvedValue({
    id: 12,
    attachmentUrlList: ['https://example.com/upload'],
  });
  vi.mocked(uploadMaintenanceImage)
    .mockRejectedValueOnce(new Error('업로드 실패'))
    .mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <MaintenanceEditModal item={item} onChanged={vi.fn()} onClose={onClose} />
  );
  await user.selectOptions(
    screen.getByLabelText('사용자 안내 이미지 처리'),
    'change'
  );
  await user.upload(
    screen.getByLabelText('사용자 안내 이미지'),
    new File(['image'], 'a.png', { type: 'image/png' })
  );
  await user.click(screen.getByRole('button', { name: '수정' }));
  await user.click(
    await screen.findByRole('button', { name: '이미지 업로드 재시도' })
  );
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(updateAdminMaintenance).toHaveBeenCalledOnce();
  expect(uploadMaintenanceImage).toHaveBeenCalledTimes(2);
});
test('삭제 처리 중 중복 실행과 닫기를 막고 완료 후 갱신한다', async () => {
  let finish!: (value: { message: string }) => void;
  vi.mocked(deleteAdminMaintenance).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const user = userEvent.setup();
  const onChanged = vi.fn();
  const onClose = vi.fn();
  render(
    <MaintenanceDeleteModal
      item={item}
      onChanged={onChanged}
      onClose={onClose}
    />
  );
  await user.click(screen.getByRole('button', { name: '삭제' }));
  expect(screen.getByRole('button', { name: '삭제 중…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.keyboard('{Escape}');
  expect(onClose).not.toHaveBeenCalled();
  finish({ message: 'Complete' });
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(onChanged).toHaveBeenCalledOnce();
  expect(deleteAdminMaintenance).toHaveBeenCalledExactlyOnceWith(12);
});
test('진행 중인 일정의 삭제 메뉴를 비활성화한다', async () => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  const user = userEvent.setup();
  render(
    <MaintenanceListSection
      items={[{ ...item, status: 'IN_PROGRESS' }]}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />
  );
  await user.click(
    screen.getByRole('button', { name: '점검 서버 점검 일정 메뉴 열기' })
  );
  expect(screen.getByRole('menuitem', { name: /삭제/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
});

import type { ReactElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, expect, test, vi } from 'vitest';

import {
  completeAdminMaintenance,
  deleteAdminMaintenance,
  getAdminMaintenance,
  updateAdminMaintenance,
  uploadMaintenanceImage,
} from '@/apis/maintenance';

import type { ServerMaintenanceListItem } from '../types/maintenance';
import { MaintenanceCompleteModal } from './MaintenanceCompleteModal';
import { MaintenanceDeleteModal } from './MaintenanceDeleteModal';
import { MaintenanceDetailModal } from './MaintenanceDetailModal';
import { MaintenanceEditModal } from './MaintenanceEditModal';
import { MaintenanceListSection } from './MaintenanceListSection';
import { MaintenanceMemoModal } from './MaintenanceMemoModal';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock('@/apis/maintenance', () => ({
  completeAdminMaintenance: vi.fn(),
  deleteAdminMaintenance: vi.fn(),
  getAdminMaintenance: vi.fn(),
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
  URL.createObjectURL = vi.fn(() => 'blob:maintenance-preview');
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getAdminMaintenance).mockResolvedValue({
    title: '점검',
    startAt: item.startAt,
    endAt: item.endAt,
    memo: '기존 메모',
    noticeMessage: '기존 안내 문구',
    imageUrl: 'https://example.com/old.png',
  });
  vi.mocked(updateAdminMaintenance).mockResolvedValue({
    id: 12,
    attachmentUrlList: [],
  });
  vi.mocked(deleteAdminMaintenance).mockResolvedValue({ message: 'Complete' });
});
function render(element: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return rtlRender(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>
  );
}
test('수정 기본값은 메모·문구·이미지를 보내지 않으며 성공 후 갱신하고 닫는다', async () => {
  const user = userEvent.setup();
  const onChanged = vi.fn();
  const onClose = vi.fn();
  render(
    <MaintenanceEditModal item={item} onChanged={onChanged} onClose={onClose} />
  );
  await user.clear(await screen.findByLabelText(/관리용 일정 제목/));
  expect(screen.getByLabelText(/관리자 메모/)).toHaveValue('기존 메모');
  expect(screen.getByLabelText('사용자 안내 문구')).toHaveValue(
    '기존 안내 문구'
  );
  expect(screen.getByAltText('현재 사용자 안내 이미지')).toHaveAttribute(
    'src',
    'https://example.com/old.png'
  );
  await user.type(screen.getByLabelText(/관리용 일정 제목/), '변경 점검');
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
  await user.clear(await screen.findByLabelText('사용자 안내 문구'));
  await user.click(
    await screen.findByRole('button', { name: '기본 이미지 사용' })
  );
  await user.click(screen.getByRole('button', { name: '수정' }));
  expect(updateAdminMaintenance).toHaveBeenCalledWith(
    12,
    expect.objectContaining({ noticeMessage: '', attachments: [] })
  );
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('중복된 기간'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
  await screen.findByRole('button', { name: '이미지 변경' });
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
      onComplete={vi.fn()}
      onMemo={vi.fn()}
      onDetail={vi.fn()}
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

test('상세 조회는 기존 문구·관리자 메모·이미지를 표시한다', async () => {
  render(<MaintenanceDetailModal id={12} onClose={vi.fn()} />);
  expect(await screen.findByText('기존 안내 문구')).toBeInTheDocument();
  expect(screen.getByText('기존 메모')).toBeInTheDocument();
  expect(screen.getByAltText('사용자 안내 이미지')).toHaveAttribute(
    'src',
    'https://example.com/old.png'
  );
  expect(getAdminMaintenance).toHaveBeenCalledWith(12);
});
test('상세 조회 실패 시 편집 폼 대신 오류와 재시도를 표시한다', async () => {
  vi.mocked(getAdminMaintenance).mockRejectedValueOnce(
    new Error('서버 점검 일정을 찾을 수 없습니다.')
  );
  const user = userEvent.setup();
  render(
    <MaintenanceEditModal item={item} onClose={vi.fn()} onChanged={vi.fn()} />
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '서버 점검 일정을 찾을 수 없습니다.'
  );
  expect(
    screen.queryByRole('button', { name: '수정' })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByLabelText(/관리자 메모/)).toHaveValue('기존 메모');
});

test('즉시 종료 처리 중 중복 실행과 닫기를 막고 성공 후 목록을 갱신한다', async () => {
  let finish!: (value: {
    id: number;
    endAt: string;
    status: 'COMPLETED';
  }) => void;
  vi.mocked(completeAdminMaintenance).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onChanged = vi.fn();
  render(
    <MaintenanceCompleteModal
      item={{ ...item, status: 'IN_PROGRESS' }}
      onClose={onClose}
      onChanged={onChanged}
    />
  );
  await user.click(screen.getByRole('button', { name: '즉시 종료' }));
  expect(screen.getByRole('button', { name: '종료 중…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.keyboard('{Escape}');
  expect(onClose).not.toHaveBeenCalled();
  expect(completeAdminMaintenance).toHaveBeenCalledExactlyOnceWith(12);
  finish({ id: 12, endAt: '2026-11-10 03:00:00', status: 'COMPLETED' });
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(onChanged).toHaveBeenCalledOnce();
});
test('즉시 종료 실패 시 확인 모달을 유지하고 재시도할 수 있다', async () => {
  vi.mocked(completeAdminMaintenance).mockRejectedValue(
    new Error('일정을 찾을 수 없습니다.')
  );
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onChanged = vi.fn();
  render(
    <MaintenanceCompleteModal
      item={{ ...item, status: 'IN_PROGRESS' }}
      onClose={onClose}
      onChanged={onChanged}
    />
  );
  await user.click(screen.getByRole('button', { name: '즉시 종료' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '즉시 종료' })).toBeEnabled()
  );
  expect(onClose).not.toHaveBeenCalled();
  expect(onChanged).not.toHaveBeenCalled();
});
test.each(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] as const)(
  '즉시 종료 메뉴는 진행 중인 일정에만 표시한다 (%s)',
  async (status) => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <MaintenanceListSection
        items={[{ ...item, status }]}
        onComplete={onComplete}
        onMemo={vi.fn()}
        onDetail={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    await user.click(
      screen.getByRole('button', { name: '점검 서버 점검 일정 메뉴 열기' })
    );
    if (status === 'IN_PROGRESS') {
      await user.click(screen.getByRole('menuitem', { name: '즉시 종료' }));
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ id: 12, status })
      );
    } else
      expect(
        screen.queryByRole('menuitem', { name: '즉시 종료' })
      ).not.toBeInTheDocument();
  }
);

test('생성일시와 같은 수정일시는 수정 이력 없이 표시한다', () => {
  const { container } = render(
    <MaintenanceListSection
      items={[
        {
          ...item,
          createdAt: '2026-11-23 21:47:00',
          updatedAt: '2026-11-23 21:47:00',
        },
      ]}
      onMemo={vi.fn()}
      onDetail={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onComplete={vi.fn()}
    />
  );
  const cells = container.querySelectorAll('tbody td');
  expect(cells[5]).toHaveTextContent('2026-11-23 21:47');
  expect(cells[6]).toHaveTextContent('-');
});

test.each(['관리용 일정 제목', '관리자 메모'])(
  '수정 시 필수 항목 %s 누락은 토스트로 안내한다',
  async (label) => {
    const user = userEvent.setup();
    render(
      <MaintenanceEditModal item={item} onChanged={vi.fn()} onClose={vi.fn()} />
    );
    await user.clear(await screen.findByLabelText(new RegExp(label)));
    await user.click(screen.getByRole('button', { name: '수정' }));
    expect(toast.error).toHaveBeenCalledWith('모든 필수 항목을 입력해 주세요.');
    expect(updateAdminMaintenance).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  }
);

test('메모 조회 메뉴는 선택한 일정을 전달한다', async () => {
  const user = userEvent.setup();
  const onMemo = vi.fn();
  render(
    <MaintenanceListSection
      items={[item]}
      onMemo={onMemo}
      onDetail={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onComplete={vi.fn()}
    />
  );
  await user.click(
    screen.getByRole('button', { name: '점검 서버 점검 일정 메뉴 열기' })
  );
  await user.click(screen.getByRole('menuitem', { name: '메모 조회' }));
  expect(onMemo).toHaveBeenCalledWith(item);
});
test('메모 조회는 관리자 메모만 표시하며 닫을 수 있다', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<MaintenanceMemoModal id={12} onClose={onClose} />);
  expect(await screen.findByText('기존 메모')).toBeInTheDocument();
  expect(getAdminMaintenance).toHaveBeenCalledWith(12);
  expect(screen.queryByText('기존 안내 문구')).not.toBeInTheDocument();
  expect(screen.queryByAltText('사용자 안내 이미지')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '닫기' }));
  expect(onClose).toHaveBeenCalledOnce();
});
test('빈 관리자 메모는 빈 상태를 표시한다', async () => {
  vi.mocked(getAdminMaintenance).mockResolvedValue({
    title: '점검',
    startAt: item.startAt,
    endAt: item.endAt,
    memo: '  ',
    noticeMessage: null,
    imageUrl: null,
  });
  render(<MaintenanceMemoModal id={12} onClose={vi.fn()} />);
  expect(
    await screen.findByText('등록된 메모가 없습니다.')
  ).toBeInTheDocument();
});

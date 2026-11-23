import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createAdminMaintenance,
  getAdminMaintenances,
  uploadMaintenanceImage,
} from '@/apis/maintenance';

import ServerMaintenancePage from './ServerMaintenancePage';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock('@/apis/maintenance', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis/maintenance')>()),
  createAdminMaintenance: vi.fn(),
  getAdminMaintenances: vi.fn(),
  uploadMaintenanceImage: vi.fn(),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdminMaintenances).mockResolvedValue([]);
  vi.mocked(createAdminMaintenance).mockResolvedValue({
    id: 7,
    attachmentUrlList: [],
  });
});
beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ServerMaintenancePage />
    </QueryClientProvider>
  );
}

async function chooseDate(
  user: ReturnType<typeof userEvent.setup>,
  label: string
) {
  await user.click(screen.getByRole('button', { name: label }));
  const month = screen
    .getByRole('grid')
    .getAttribute('aria-label')
    ?.match(/(\d+)년 (\d+)월/);
  if (!month) throw new Error('달력의 현재 월을 확인할 수 없습니다.');
  const offset = 2026 * 12 + 9 - (Number(month[1]) * 12 + Number(month[2]) - 1);
  for (let index = 0; index < Math.abs(offset); index++) {
    await user.click(
      screen.getByRole('button', {
        name: offset > 0 ? '다음 달로 이동' : '이전 달로 이동',
      })
    );
  }
  await user.click(screen.getByRole('button', { name: /2026년 10월 1일/ }));
}

async function chooseHour(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  hour: string
) {
  await user.click(screen.getByRole('combobox', { name: `${label} 시` }));
  await user.click(screen.getByRole('option', { name: `${hour}시` }));
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/일정 제목/), '정기 점검');
  await user.type(screen.getByLabelText(/메모/), 'DB 작업');
  await chooseDate(user, '시작 일시');
  await chooseHour(user, '시작 일시', '02');
  await chooseDate(user, '종료 일시');
  await chooseHour(user, '종료 일시', '03');
}
describe('서버 점검 생성 API 연동', () => {
  test('명세의 로컬 날짜 형식과 필수 메모를 전송하고 성공 후 초기화한다', async () => {
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: '생성' }));
    await waitFor(() =>
      expect(screen.getByLabelText(/일정 제목/)).toHaveValue('')
    );
    expect(createAdminMaintenance).toHaveBeenCalledExactlyOnceWith({
      title: '정기 점검',
      startAt: '2026-10-01 02:00:00',
      endAt: '2026-10-01 03:00:00',
      memo: 'DB 작업',
      noticeMessage:
        '안정적인 서비스 제공을 위한 서버 점검을 하고 있어요.\n이용에 불편을 드리게 된 점 양해 부탁드립니다.',
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
    await waitFor(() => expect(getAdminMaintenances).toHaveBeenCalledTimes(2));
  });
  test('중복 기간 응답의 메시지를 표시하고 입력을 유지한다', async () => {
    vi.mocked(createAdminMaintenance).mockRejectedValue(
      new Error('중복된 서버 점검 기간 일정이 있습니다')
    );
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: '생성' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        '중복된 서버 점검 기간 일정이 있습니다'
      )
    );
    expect(
      screen.queryByText('중복된 서버 점검 기간 일정이 있습니다')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/일정 제목/)).toHaveValue('정기 점검');
    expect(screen.getByLabelText(/메모/)).toHaveValue('DB 작업');
  });
  test('저장 응답을 기다리는 동안 중복 제출을 차단한다', async () => {
    let finish!: (value: { id: number; attachmentUrlList: string[] }) => void;
    vi.mocked(createAdminMaintenance).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: '생성' }));
    const saving = screen.getByRole('button', { name: '저장 중…' });
    expect(saving).toBeDisabled();
    await user.click(saving);
    expect(createAdminMaintenance).toHaveBeenCalledTimes(1);
    finish({ id: 7, attachmentUrlList: [] });
    await waitFor(() =>
      expect(screen.getByLabelText(/일정 제목/)).toHaveValue('')
    );
  });
  test('이미지 실패 후 재시도는 생성 API를 다시 호출하지 않는다', async () => {
    vi.mocked(createAdminMaintenance).mockResolvedValue({
      id: 7,
      attachmentUrlList: ['https://example.com/upload'],
    });
    vi.mocked(uploadMaintenanceImage)
      .mockRejectedValueOnce(new Error('이미지 업로드 실패'))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    const file = new File(['image'], 'notice.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('사용자 안내 이미지'), file);
    await user.click(screen.getByRole('button', { name: '생성' }));
    await user.click(
      await screen.findByRole('button', { name: '이미지 업로드 재시도' })
    );
    await screen.findByRole('button', { name: '생성' });
    expect(createAdminMaintenance).toHaveBeenCalledTimes(1);
    expect(uploadMaintenanceImage).toHaveBeenCalledTimes(2);
    expect(uploadMaintenanceImage).toHaveBeenLastCalledWith(
      'https://example.com/upload',
      file
    );
  });
});

test('목록 조회 실패 후 다시 시도하면 일정 ID와 상태를 표시한다', async () => {
  vi.mocked(getAdminMaintenances)
    .mockRejectedValueOnce(new Error('목록 조회 실패'))
    .mockResolvedValueOnce([
      {
        id: 12,
        number: 9,
        status: 'COMPLETED',
        title: '완료 점검',
        startAt: '2099-11-10 02:00:00',
        endAt: '2099-11-10 04:00:00',
        createdAt: '2026-11-08 18:00:00',
        updatedAt: '2026-11-08 19:00:00',
      },
    ]);
  const user = userEvent.setup();
  renderPage();
  expect(await screen.findByText('목록 조회 실패')).toBeInTheDocument();
  expect(screen.queryByText('등록된 일정이 없습니다.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(
    await screen.findByRole('cell', { name: '완료 점검' })
  ).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: '12' })).toBeInTheDocument();
  expect(screen.getByText('종료')).toBeInTheDocument();
});

test('목록 응답 대기 중 로딩 표시 후 빈 목록을 표시한다', async () => {
  let finish!: (value: []) => void;
  vi.mocked(getAdminMaintenances).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  renderPage();
  expect(screen.getByRole('status')).toHaveTextContent(
    '서버 점검 일정을 불러오는 중입니다.'
  );
  expect(screen.queryByText('등록된 일정이 없습니다.')).not.toBeInTheDocument();
  finish([]);
  expect(
    await screen.findByText('등록된 일정이 없습니다.')
  ).toBeInTheDocument();
});

test('사용자 안내 문구를 비우면 기본값으로 대체하지 않고 빈 문자열을 전송한다', async () => {
  const user = userEvent.setup();
  renderPage();
  await fillForm(user);
  await user.clear(screen.getByLabelText('사용자 안내 문구'));
  await user.click(screen.getByRole('button', { name: '생성' }));
  await waitFor(() =>
    expect(createAdminMaintenance).toHaveBeenCalledWith(
      expect.objectContaining({ noticeMessage: '' })
    )
  );
});

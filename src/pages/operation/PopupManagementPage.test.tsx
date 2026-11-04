import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type {
  PopupDetail,
  PopupSummary,
} from '@/domains/Operation/types/popup';

import {
  createPopup,
  deletePopup,
  getPopupDetail,
  getPopups,
  updatePopup,
} from '@/apis/popups';

import PopupManagementPage from './PopupManagementPage';

vi.mock('@/apis/popups', () => ({
  createPopup: vi.fn(),
  deletePopup: vi.fn(),
  getPopupDetail: vi.fn(),
  getPopups: vi.fn(),
  updatePopup: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/shared/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components')>()),
  DatePicker: ({
    id,
    value,
    onValueChange,
    ...props
  }: {
    id: string;
    value?: string;
    onValueChange: (value: string) => void;
    'aria-label'?: string;
  }) => (
    <input
      id={id}
      type='date'
      aria-label={props['aria-label']}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  ),
}));

const summary: PopupSummary = {
  id: 9,
  title: '서버 팝업',
  displayOrder: 0,
  startDate: '2026-10-20',
  endDate: '2026-10-22',
  status: 'ACTIVE',
  createdAt: '2026-10-15T14:00:00',
  updatedAt: null,
};
const detail: PopupDetail = {
  ...summary,
  description: '기존 본문',
  imageUrl: 'https://cdn.example.com/notice.webp',
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <PopupManagementPage />
    </QueryClientProvider>
  );
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPopups).mockResolvedValue({
    data: [summary],
    totalCount: 1,
    totalPage: 1,
    currentCount: 1,
    hasNext: false,
  });
  vi.mocked(getPopupDetail).mockResolvedValue(detail);
  vi.mocked(createPopup).mockResolvedValue({ id: 10 });
  vi.mocked(updatePopup).mockResolvedValue({ id: 9 });
  vi.mocked(deletePopup).mockResolvedValue({ id: 9 });
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:test-image'),
      revokeObjectURL: vi.fn(),
    })
  );
});

async function openEdit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: '수정' }));
  return screen.findByRole('dialog', { name: '팝업 수정' });
}
async function saveEdit(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement
) {
  await user.click(
    within(dialog).getByRole('button', { name: '저장 후 반영' })
  );
  const confirm = await screen.findByRole('dialog', {
    name: '팝업을 수정할까요?',
  });
  await user.click(within(confirm).getByRole('button', { name: '수정' }));
}

describe('팝업 관리 API 흐름', () => {
  test('서버 상태와 최신 등록순을 그대로 표시하고 페이지를 0 기반으로 요청한다', async () => {
    vi.mocked(getPopups).mockResolvedValue({
      data: [
        { ...summary, id: 10, title: '최신 등록', displayOrder: 1 },
        summary,
      ],
      totalCount: 11,
      totalPage: 2,
      currentCount: 2,
      hasNext: true,
    });
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('최신 등록');
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('최신 등록');
    expect(rows[2]).toHaveTextContent('진행중');
    await user.click(screen.getByRole('link', { name: '2' }));
    await waitFor(() => expect(getPopups).toHaveBeenLastCalledWith(1));
  });
  test('제목과 날짜만으로 등록하고 저장 후 목록을 갱신한다', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('서버 팝업');
    await user.click(screen.getByRole('button', { name: '새 팝업 등록' }));
    const dialog = await screen.findByRole('dialog', { name: '새 팝업 등록' });
    await user.type(
      within(dialog).getByLabelText(/팝업 제목/),
      '제목만 있는 팝업'
    );
    fireEvent.change(
      within(dialog).getByLabelText('게시 시작일', { exact: true }),
      { target: { value: '2026-10-20' } }
    );
    fireEvent.change(
      within(dialog).getByLabelText('게시 종료일', { exact: true }),
      { target: { value: '2026-10-22' } }
    );
    await user.click(
      within(dialog).getByRole('button', { name: '저장 후 반영' })
    );
    const confirm = await screen.findByRole('dialog', {
      name: '팝업을 등록할까요?',
    });
    await user.click(within(confirm).getByRole('button', { name: '등록' }));
    await waitFor(() =>
      expect(createPopup).toHaveBeenCalledWith(
        {
          title: '제목만 있는 팝업',
          description: null,
          startDate: '2026-10-20',
          endDate: '2026-10-22',
          displayOrder: 1,
        },
        undefined
      )
    );
    await waitFor(() => expect(getPopups).toHaveBeenCalledTimes(2));
  });
  test('상세를 조회해 기존 이미지를 표시하고 제목만 수정할 때 이미지는 유지한다', async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openEdit(user);
    expect(getPopupDetail).toHaveBeenCalledWith(9);
    expect(within(dialog).getByRole('img')).toHaveAttribute(
      'src',
      detail.imageUrl
    );
    const title = within(dialog).getByLabelText(/팝업 제목/);
    await user.clear(title);
    await user.type(title, '변경 제목');
    await saveEdit(user, dialog);
    await waitFor(() =>
      expect(updatePopup).toHaveBeenCalledWith(
        9,
        { title: '변경 제목' },
        undefined
      )
    );
  });
  test('본문과 기존 이미지를 지우면 삭제 의도를 API로 전달한다', async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openEdit(user);
    await user.clear(within(dialog).getByLabelText('본문', { exact: true }));
    await user.click(
      within(dialog).getByRole('button', { name: '첨부 이미지 삭제' })
    );
    await saveEdit(user, dialog);
    await waitFor(() =>
      expect(updatePopup).toHaveBeenCalledWith(
        9,
        { description: null, removeImage: true },
        undefined
      )
    );
  });
  test('이미지 교체 시 파일을 보내고 removeImage는 보내지 않는다', async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openEdit(user);
    const file = new File(['image'], 'new.png', { type: 'image/png' });
    await user.upload(
      within(dialog).getByLabelText('이미지 첨부', { selector: 'input' }),
      file
    );
    await saveEdit(user, dialog);
    await waitFor(() => expect(updatePopup).toHaveBeenCalledWith(9, {}, file));
    await waitFor(() =>
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-image')
    );
  });
  test('저장 실패 후 편집 내용이 남고 재시도할 수 있다', async () => {
    vi.mocked(updatePopup).mockRejectedValueOnce(new Error('서버 오류'));
    const user = userEvent.setup();
    renderPage();
    const dialog = await openEdit(user);
    await user.type(within(dialog).getByLabelText(/팝업 제목/), ' 변경');
    await saveEdit(user, dialog);
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: '팝업을 수정할까요?' })
      ).not.toBeInTheDocument()
    );
    expect(within(dialog).getByLabelText(/팝업 제목/)).toHaveValue(
      '서버 팝업 변경'
    );
    await saveEdit(user, dialog);
    await waitFor(() => expect(updatePopup).toHaveBeenCalledTimes(2));
  });
  test('목록 조회 실패 시 재시도할 수 있다', async () => {
    vi.mocked(getPopups).mockRejectedValueOnce(new Error('조회 실패'));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: '다시 시도' }));
    await screen.findByText('서버 팝업');
    expect(getPopups).toHaveBeenCalledTimes(2);
  });
  test('마지막 페이지의 마지막 항목 삭제 후 이전 페이지를 조회한다', async () => {
    vi.mocked(getPopups).mockImplementation(async (page) => ({
      data: [summary],
      totalCount: 11,
      totalPage: 2,
      currentCount: 1,
      hasNext: page === 0,
    }));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('서버 팝업');
    await user.click(screen.getByRole('link', { name: '2' }));
    await waitFor(() => expect(getPopups).toHaveBeenLastCalledWith(1));
    await user.click(await screen.findByRole('button', { name: '삭제' }));
    const confirm = await screen.findByRole('dialog', {
      name: '팝업을 삭제할까요?',
    });
    await user.click(within(confirm).getByRole('button', { name: '삭제' }));
    await waitFor(() => expect(deletePopup).toHaveBeenCalledWith(9));
    await waitFor(() => expect(getPopups).toHaveBeenLastCalledWith(0));
  });
});

import {
  RouterProvider,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { Faq } from '@/domains/Faqs/types';

import { getUserDetailAPI } from '@/apis';
import {
  createAdminFaq,
  deleteAdminFaq,
  getAllAdminFaqs,
  updateAdminFaq,
} from '@/apis/faqs';

import FaqManagementPage from './FaqManagementPage';

vi.mock('@/apis/faqs', () => ({
  getAllAdminFaqs: vi.fn(),
  createAdminFaq: vi.fn(),
  updateAdminFaq: vi.fn(),
  deleteAdminFaq: vi.fn(),
}));
vi.mock('@/apis', () => ({ getUserDetailAPI: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const faq: Faq = {
  faqId: 23,
  faqCategory: '계정',
  question: '인증 이메일이 오지 않아요.',
  answer: '스팸함을 확인해 주세요.\n\nhttps://example.com/help',
  writer: '김송이',
  createdAt: '2026-10-02T12:34:14',
  updatedAt: null,
};
function Location() {
  const location = useLocation();
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  );
}
function renderPage(path = '/report/faq', initialEntries = [path]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      {
        path: '/report/faq',
        element: (
          <>
            <FaqManagementPage />
            <Location />
          </>
        ),
      },
      { path: '*', element: <Location /> },
    ],
    { initialEntries, initialIndex: initialEntries.length - 1 }
  );
  const result = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return { ...result, router };
}
const detail = () => screen.getByRole('region', { name: 'FAQ 내용' });

test('작성 중 뒤로 가기는 확인하고 계속 작성하면 입력을 보존하며 취소 확정 시 이동한다', async () => {
  const user = userEvent.setup();
  const { router } = renderPage('/report/faq', ['/member/info', '/report/faq']);
  await user.click(screen.getByRole('button', { name: 'FAQ 작성하기' }));
  await user.type(
    screen.getByRole('textbox', { name: /^제목/ }),
    '저장 전 제목'
  );
  await act(async () => {
    await router.navigate(-1);
  });
  const confirmation = screen.getByRole('dialog', {
    name: '작성을 취소하시겠습니까?',
  });
  expect(screen.getByTestId('location')).toHaveTextContent('/report/faq');
  await user.click(
    within(confirmation).getByRole('button', { name: '계속 작성' })
  );
  expect(screen.getByRole('textbox', { name: /^제목/ })).toHaveValue(
    '저장 전 제목'
  );
  await act(async () => {
    await router.navigate(-1);
  });
  await user.click(screen.getByRole('button', { name: '작성 취소' }));
  await waitFor(() =>
    expect(screen.getByTestId('location')).toHaveTextContent('/member/info')
  );
  expect(createAdminFaq).not.toHaveBeenCalled();
});

test('입력하지 않은 작성창은 뒤로 가기를 막지 않는다', async () => {
  const user = userEvent.setup();
  const { router } = renderPage('/report/faq', ['/member/info', '/report/faq']);
  await user.click(screen.getByRole('button', { name: 'FAQ 작성하기' }));
  await act(async () => {
    await router.navigate(-1);
  });
  expect(screen.getByTestId('location')).toHaveTextContent('/member/info');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('저장 중 뒤로 가기를 차단하고 저장 완료 후 대기 중 이탈을 해제한다', async () => {
  const user = userEvent.setup();
  let resolveSave!: (value: { faqId: number }) => void;
  vi.mocked(updateAdminFaq).mockReturnValue(
    new Promise((resolve) => {
      resolveSave = resolve;
    })
  );
  const { router } = renderPage('/report/faq', ['/member/info', '/report/faq']);
  await openEdit(user);
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  await act(async () => {
    await router.navigate(-1);
  });
  expect(screen.getByRole('button', { name: '작성 취소' })).toBeDisabled();
  expect(screen.getByTestId('location')).toHaveTextContent('/report/faq');
  await act(async () => {
    resolveSave({ faqId: 23 });
  });
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  expect(updateAdminFaq).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('location')).toHaveTextContent('/report/faq');
  await act(async () => {
    await router.navigate(-1);
  });
  expect(screen.getByTestId('location')).toHaveTextContent('/member/info');
});

test('2페이지에서 신규 저장 성공 시 이탈 확인 없이 1페이지로 이동한다', async () => {
  const user = userEvent.setup();
  vi.mocked(getAllAdminFaqs).mockResolvedValue(
    Array.from({ length: 11 }, (_, index) => ({
      ...faq,
      faqId: index + 1,
      question: `제목 ${index}`,
    }))
  );
  renderPage('/report/faq?page=2');
  await screen.findByRole('button', { name: '제목 10' });
  await user.click(screen.getByRole('button', { name: 'FAQ 작성하기' }));
  await user.click(screen.getByRole('combobox', { name: /분류/ }));
  await user.click(screen.getByRole('option', { name: '가입 · 인증' }));
  await user.type(screen.getByRole('textbox', { name: /^제목/ }), '신규 제목');
  await user.type(screen.getByRole('textbox', { name: /^내용/ }), '신규 내용');
  await user.click(screen.getByRole('button', { name: 'FAQ 등록' }));
  await waitFor(() =>
    expect(screen.getByTestId('location')).toHaveTextContent('page=1')
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(createAdminFaq).toHaveBeenCalledTimes(1);
});
async function selectFaq(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: faq.question }));
}
async function openEdit(user: ReturnType<typeof userEvent.setup>) {
  await selectFaq(user);
  await user.click(within(detail()).getByRole('button', { name: 'FAQ 수정' }));
}
beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getAllAdminFaqs).mockResolvedValue([faq]);
  vi.mocked(createAdminFaq).mockResolvedValue({ faqId: 24 });
  vi.mocked(updateAdminFaq).mockResolvedValue({ faqId: 23 });
  vi.mocked(deleteAdminFaq).mockResolvedValue({ faqId: 23 });
});

test('제목 또는 행 바로 아래에 내용과 수정·삭제가 펼쳐지고 다시 선택하면 접힌다', async () => {
  const user = userEvent.setup();
  renderPage();
  await screen.findByRole('button', { name: faq.question });
  expect(
    screen.getByRole('columnheader', { name: '제목' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('columnheader', { name: '관리' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'FAQ 수정' })
  ).not.toBeInTheDocument();
  await selectFaq(user);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(
    within(detail()).getByRole('region', { name: '내용' }).textContent
  ).toBe(faq.answer);
  expect(
    within(detail()).getByRole('button', { name: 'FAQ 수정' })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: faq.question })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await user.click(screen.getByRole('button', { name: faq.question }));
  expect(
    screen.queryByRole('region', { name: 'FAQ 내용' })
  ).not.toBeInTheDocument();
  const row = screen.getByRole('button', { name: faq.question }).closest('tr')!;
  await user.click(within(row).getByText(String(faq.faqId)));
  expect(row).toHaveAttribute('data-state', 'selected');
});

test.each([undefined, null, ''])(
  '작성자 ID가 %s이면 이름만 표시한다',
  async (encryptedUserId) => {
    vi.mocked(getAllAdminFaqs).mockResolvedValue([{ ...faq, encryptedUserId }]);
    renderPage();
    expect(await screen.findByText(faq.writer)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: faq.writer })
    ).not.toBeInTheDocument();
  }
);

test('작성자 ID가 있으면 공통 회원 메뉴로 실제 ID를 조회하고 행은 펼치지 않는다', async () => {
  const user = userEvent.setup();
  vi.mocked(getAllAdminFaqs).mockResolvedValue([
    { ...faq, encryptedUserId: 'faq-author-id' },
  ]);
  vi.mocked(getUserDetailAPI).mockResolvedValue({
    encryptedUserId: 'faq-author-id',
    loginId: 'author',
    userName: '김송이',
    email: 'author@example.com',
    nickname: faq.writer,
    userRoleId: 1,
    studentNumber: '20260000',
    major: '컴퓨터과학',
    birthday: '2000-01-01',
    pointBalance: 10,
    createdAt: faq.createdAt,
    authenticatedAt: null,
    totalWarningCount: 0,
    isBlacklist: false,
    blacklistStartDate: null,
    blacklistEndDate: null,
  });
  renderPage();
  await user.click(await screen.findByRole('button', { name: faq.writer }));
  expect(
    screen.queryByRole('region', { name: 'FAQ 내용' })
  ).not.toBeInTheDocument();
  expect(getUserDetailAPI).not.toHaveBeenCalled();
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  expect(
    await screen.findByRole('dialog', { name: '회원 정보' })
  ).toBeInTheDocument();
  expect(getUserDetailAPI).toHaveBeenCalledWith('faq-author-id');
});

test('같은 FAQ의 작성자 ID가 갱신되면 이전 회원 캐시를 비우고 새 회원 정보를 조회한다', async () => {
  const user = userEvent.setup();
  const firstAuthor = {
    ...faq,
    writer: '기존 작성자',
    encryptedUserId: 'author-a',
  };
  const nextAuthor = {
    ...faq,
    writer: '변경된 작성자',
    encryptedUserId: 'author-b',
  };
  vi.mocked(getAllAdminFaqs)
    .mockResolvedValueOnce([firstAuthor])
    .mockResolvedValue([nextAuthor]);
  vi.mocked(getUserDetailAPI).mockImplementation(async (encryptedUserId) => ({
    encryptedUserId,
    loginId: `member-${encryptedUserId}`,
    userName: encryptedUserId === 'author-a' ? '기존 회원' : '새 회원',
    email: 'member@example.com',
    nickname: encryptedUserId,
    userRoleId: 1,
    studentNumber: '20260000',
    major: '컴퓨터과학',
    birthday: '2000-01-01',
    pointBalance: 10,
    createdAt: faq.createdAt,
    authenticatedAt: null,
    totalWarningCount: 0,
    isBlacklist: false,
    blacklistStartDate: null,
    blacklistEndDate: null,
  }));
  renderPage();
  await user.click(
    await screen.findByRole('button', { name: firstAuthor.writer })
  );
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  const firstModal = await screen.findByRole('dialog', { name: '회원 정보' });
  expect(within(firstModal).getByText('기존 회원')).toBeInTheDocument();
  await user.click(within(firstModal).getByRole('button', { name: '닫기' }));

  await user.click(screen.getByRole('button', { name: '새로고침' }));
  await user.click(
    await screen.findByRole('button', { name: nextAuthor.writer })
  );
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  const nextModal = await screen.findByRole('dialog', { name: '회원 정보' });
  expect(getUserDetailAPI).toHaveBeenCalledTimes(2);
  expect(getUserDetailAPI).toHaveBeenNthCalledWith(2, 'author-b');
  expect(within(nextModal).getByText('새 회원')).toBeInTheDocument();
  expect(within(nextModal).queryByText('기존 회원')).not.toBeInTheDocument();
  await user.click(
    within(nextModal).getByRole('button', { name: '유저 상세 페이지로 이동' })
  );
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/member/info/author-b'
  );
});

test('텍스트 검색은 비활성화하고 카테고리는 즉시 필터링하여 페이지·건수·펼침을 갱신한다', async () => {
  const user = userEvent.setup();
  vi.mocked(getAllAdminFaqs).mockResolvedValue(
    Array.from({ length: 12 }, (_, index) => ({
      ...faq,
      faqId: index + 1,
      faqCategory: index === 11 ? '신규 분류' : '계정',
      question: index === 11 ? '찾을 제목' : `제목 ${index + 1}`,
    }))
  );
  renderPage('/report/faq?page=2');
  await user.click(await screen.findByRole('button', { name: '찾을 제목' }));
  expect(screen.getByLabelText('게시글 검색')).toBeDisabled();
  expect(
    screen.getByRole('combobox', { name: '게시글 검색 범위' })
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: '검색' })).toBeDisabled();
  const category = screen.getByRole('combobox', { name: '카테고리' });
  expect(category).toBeEnabled();
  await user.click(category);
  await user.click(screen.getByRole('option', { name: '신규 분류' }));
  expect(screen.getByTestId('location')).toHaveTextContent('page=1');
  expect(
    screen.queryByRole('region', { name: 'FAQ 내용' })
  ).not.toBeInTheDocument();
  const list = screen.getByRole('region', { name: 'FAQ 목록' });
  expect(within(list).getByRole('status')).toHaveTextContent('1');
  expect(screen.getByRole('button', { name: '찾을 제목' })).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: '제목 11' })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }));
  expect(within(list).getByRole('status')).toHaveTextContent('12');
  expect(category).toHaveTextContent('전체');
});

test('기존 URL의 검색어·범위로도 검색되지 않고 카테고리만 복원한다', async () => {
  const user = userEvent.setup();
  vi.mocked(getAllAdminFaqs).mockResolvedValue([
    faq,
    { ...faq, faqId: 24, faqCategory: '포인트', question: '포인트 FAQ' },
  ]);
  const { router } = renderPage(
    `/report/faq?${new URLSearchParams({ keyword: '찾을 수 없는 검색어', scope: 'content', category: '계정' })}`
  );
  await screen.findByRole('button', { name: faq.question });
  expect(screen.getByLabelText('게시글 검색')).toHaveValue('');
  expect(
    screen.getByRole('combobox', { name: '게시글 검색 범위' })
  ).toHaveTextContent('제목+내용');
  expect(screen.getByRole('combobox', { name: '카테고리' })).toHaveTextContent(
    '계정'
  );
  expect(
    screen.queryByRole('button', { name: '포인트 FAQ' })
  ).not.toBeInTheDocument();
  await act(async () => {
    await router.navigate('/report/faq?keyword=다른검색&scope=title');
  });
  expect(
    screen.getByRole('button', { name: faq.question })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '포인트 FAQ' })
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '검색' }));
  expect(getAllAdminFaqs).toHaveBeenCalledTimes(1);
});

test('신규 카테고리 팝업은 빈 값·중복·전체를 거부하고 확인 후 선택하여 FAQ와 함께 저장한다', async () => {
  const user = userEvent.setup();
  renderPage();
  await screen.findByRole('button', { name: faq.question });
  await user.click(screen.getByRole('button', { name: 'FAQ 작성하기' }));
  await user.type(screen.getByLabelText(/^제목/), '신규 카테고리 제목');
  await user.type(
    screen.getByRole('textbox', { name: /^내용/ }),
    '새로운 안내'
  );
  await user.click(screen.getByRole('combobox', { name: /^분류/ }));
  await user.click(screen.getByRole('option', { name: '신규 카테고리 추가' }));
  const popup = screen.getByRole('dialog', { name: '신규 카테고리 추가' });
  const input = within(popup).getByLabelText(/카테고리 이름/);
  const confirm = within(popup).getByRole('button', { name: '확인' });
  await user.click(confirm);
  expect(within(popup).getByRole('alert')).toHaveTextContent('이름을 입력');
  await user.type(input, ' 계정 ');
  await user.click(confirm);
  expect(within(popup).getByRole('alert')).toHaveTextContent('이미 있는');
  await user.clear(input);
  await user.type(input, '전체');
  await user.click(confirm);
  expect(within(popup).getByRole('alert')).toHaveTextContent('조회용');
  await user.clear(input);
  await user.type(input, '  새 카테고리  ');
  await user.click(confirm);
  expect(screen.getByRole('combobox', { name: /^분류/ })).toHaveTextContent(
    '새 카테고리'
  );
  expect(createAdminFaq).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'FAQ 등록' }));
  await waitFor(() =>
    expect(createAdminFaq).toHaveBeenCalledWith({
      category: '새 카테고리',
      question: '신규 카테고리 제목',
      answer: '새로운 안내',
    })
  );
});

test('새 카테고리 칩을 X로 삭제하면 선택을 해제하고 입력을 보존하며 다른 분류로 저장할 수 있다', async () => {
  const user = userEvent.setup();
  renderPage();
  await openEdit(user);
  await user.click(screen.getByRole('combobox', { name: /^분류/ }));
  await user.click(screen.getByRole('option', { name: '신규 카테고리 추가' }));
  const popup = screen.getByRole('dialog', { name: '신규 카테고리 추가' });
  await user.type(
    within(popup).getByLabelText(/카테고리 이름/),
    '새 임시 카테고리'
  );
  await user.click(within(popup).getByRole('button', { name: '확인' }));
  const chip = screen.getByRole('group', { name: '새로 추가한 카테고리' });
  await user.click(
    within(chip).getByRole('button', { name: '새 임시 카테고리 카테고리 삭제' })
  );
  expect(
    screen.queryByRole('group', { name: '새로 추가한 카테고리' })
  ).not.toBeInTheDocument();
  const category = screen.getByRole('combobox', { name: /^분류/ });
  expect(category).toHaveTextContent('분류를 선택해 주세요.');
  expect(category).toHaveFocus();
  expect(screen.getByLabelText(/^제목/)).toHaveValue(faq.question);
  expect(screen.getByRole('textbox', { name: /^내용/ })).toHaveValue(
    faq.answer
  );
  expect(deleteAdminFaq).not.toHaveBeenCalled();
  expect(updateAdminFaq).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  expect(screen.getByRole('alert')).toHaveTextContent(
    '분류, 제목, 내용을 모두 입력'
  );
  await user.click(category);
  expect(
    screen.queryByRole('option', { name: '새 임시 카테고리' })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: '시험후기' }));
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  await waitFor(() =>
    expect(updateAdminFaq).toHaveBeenCalledWith(faq.faqId, {
      category: '시험후기',
      question: faq.question,
      answer: faq.answer,
    })
  );
});

test('카테고리 추가를 취소하면 기존 분류와 입력을 유지한다', async () => {
  const user = userEvent.setup();
  renderPage();
  await openEdit(user);
  await user.click(screen.getByRole('combobox', { name: /^분류/ }));
  await user.click(screen.getByRole('option', { name: '신규 카테고리 추가' }));
  const popup = screen.getByRole('dialog', { name: '신규 카테고리 추가' });
  await user.type(
    within(popup).getByLabelText(/카테고리 이름/),
    '취소한 카테고리'
  );
  await user.click(within(popup).getByRole('button', { name: '취소' }));
  expect(screen.getByRole('combobox', { name: /^분류/ })).toHaveTextContent(
    '계정'
  );
  expect(screen.getByLabelText(/^제목/)).toHaveValue(faq.question);
  expect(screen.getByRole('textbox', { name: /^내용/ })).toHaveValue(
    faq.answer
  );
});

test('전체 개수를 표시하고 10개씩 번호형 페이지를 이동하며 선택을 해제한다', async () => {
  const user = userEvent.setup();
  const faqs = Array.from({ length: 25 }, (_, index) => ({
    ...faq,
    faqId: index + 1,
    question: `제목 ${index + 1}`,
  }));
  vi.mocked(getAllAdminFaqs).mockResolvedValue(faqs);
  renderPage();
  await user.click(await screen.findByRole('button', { name: '제목 1' }));
  const list = screen.getByRole('region', { name: 'FAQ 목록' });
  expect(within(list).getByRole('status')).toHaveTextContent('25');
  expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: '2' }));
  expect(screen.getByTestId('location')).toHaveTextContent('page=2');
  expect(screen.getByRole('button', { name: '제목 11' })).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: '제목 1' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'FAQ 수정' })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: '3' }));
  expect(screen.getByRole('button', { name: '제목 25' })).toBeInTheDocument();
  expect(getAllAdminFaqs).toHaveBeenCalledTimes(1);
});

test('작성한 분류·제목·내용을 기존 API 필드로 보내고 목록을 갱신한다', async () => {
  const user = userEvent.setup();
  renderPage();
  await screen.findByRole('button', { name: faq.question });
  await user.click(screen.getByRole('button', { name: 'FAQ 작성하기' }));
  await user.click(screen.getByRole('combobox', { name: /분류/ }));
  expect(screen.getAllByRole('option')).toHaveLength(8);
  await user.click(screen.getByRole('option', { name: '가입 · 인증' }));
  await user.type(screen.getByLabelText(/^제목/), ' 새 제목 ');
  const answer = '첫 줄\n\nhttps://example.com/help';
  await user.type(screen.getByRole('textbox', { name: /^내용/ }), answer);
  await user.click(screen.getByRole('button', { name: 'FAQ 등록' }));
  await waitFor(() =>
    expect(createAdminFaq).toHaveBeenCalledWith({
      category: '가입 · 인증',
      question: '새 제목',
      answer,
    })
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  expect(getAllAdminFaqs).toHaveBeenCalledTimes(2);
});

test('하단 수정에서 저장 실패 후 입력을 유지하고 재시도 성공 후 상세에 최신 내용을 반영한다', async () => {
  const user = userEvent.setup();
  vi.mocked(updateAdminFaq).mockRejectedValueOnce(
    new Error('수정 권한이 없습니다.')
  );
  renderPage();
  await openEdit(user);
  expect(screen.getByRole('combobox', { name: /분류/ })).toHaveTextContent(
    '계정'
  );
  expect(screen.getByRole('textbox', { name: /^내용/ })).toHaveValue(
    faq.answer
  );
  await user.type(
    screen.getByRole('textbox', { name: /^내용/ }),
    '\n추가 안내'
  );
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '수정 권한이 없습니다.'
  );
  expect(screen.getByRole('textbox', { name: /^내용/ })).toHaveValue(
    `${faq.answer}\n추가 안내`
  );
  vi.mocked(getAllAdminFaqs).mockResolvedValue([
    { ...faq, answer: `${faq.answer}\n추가 안내` },
  ]);
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  expect(updateAdminFaq).toHaveBeenLastCalledWith(23, {
    category: '계정',
    question: faq.question,
    answer: `${faq.answer}\n추가 안내`,
  });
  expect(
    within(detail()).getByRole('region', { name: '내용' }).textContent
  ).toBe(`${faq.answer}\n추가 안내`);
});

test('저장 중 중복 제출과 닫기를 막는다', async () => {
  const user = userEvent.setup();
  let resolveSave!: (value: { faqId: number }) => void;
  vi.mocked(updateAdminFaq).mockReturnValue(
    new Promise((resolve) => {
      resolveSave = resolve;
    })
  );
  renderPage();
  await openEdit(user);
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  expect(screen.getByRole('button', { name: '저장 중…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(updateAdminFaq).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolveSave({ faqId: 23 });
  });
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
});

test('저장 성공 후 조회 실패는 저장 실패와 구분하고 오래된 상세를 숨긴다', async () => {
  const user = userEvent.setup();
  renderPage();
  await openEdit(user);
  vi.mocked(getAllAdminFaqs).mockRejectedValue(new Error('조회 실패'));
  await user.click(screen.getByRole('button', { name: '수정사항 저장' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  expect(toast.success).toHaveBeenCalledWith('FAQ가 수정되었습니다.');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '데이터를 불러오지 못했습니다.'
  );
  expect(
    screen.queryByRole('button', { name: 'FAQ 수정' })
  ).not.toBeInTheDocument();
});

test('공백만 있는 제목·내용을 저장하지 않고 작성 취소 시 입력을 보존하거나 폐기한다', async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole('button', { name: 'FAQ 작성하기' }));
  await user.click(screen.getByRole('combobox', { name: /분류/ }));
  await user.click(screen.getByRole('option', { name: '가입 · 인증' }));
  await user.type(screen.getByLabelText(/^제목/), ' ');
  await user.type(screen.getByRole('textbox', { name: /^내용/ }), ' ');
  await user.click(screen.getByRole('button', { name: 'FAQ 등록' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '분류, 제목, 내용을 모두 입력'
  );
  expect(createAdminFaq).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '취소' }));
  await user.click(screen.getByRole('button', { name: '계속 작성' }));
  expect(screen.getByRole('textbox', { name: /^내용/ })).toHaveValue(' ');
  await user.click(screen.getByRole('button', { name: '취소' }));
  await user.click(screen.getByRole('button', { name: '작성 취소' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
});

test('삭제 취소는 요청하지 않고 마지막 페이지 항목 삭제 후 이전 페이지로 보정한다', async () => {
  const user = userEvent.setup();
  const firstPage = Array.from({ length: 10 }, (_, index) => ({
    ...faq,
    faqId: 100 + index,
    question: `첫 페이지 ${index}`,
  }));
  vi.mocked(getAllAdminFaqs).mockResolvedValue([...firstPage, faq]);
  renderPage('/report/faq?page=2');
  await selectFaq(user);
  await user.click(within(detail()).getByRole('button', { name: 'FAQ 삭제' }));
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: '취소' })
  );
  expect(deleteAdminFaq).not.toHaveBeenCalled();
  await user.click(within(detail()).getByRole('button', { name: 'FAQ 삭제' }));
  vi.mocked(getAllAdminFaqs).mockResolvedValue(firstPage);
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: '삭제' })
  );
  await waitFor(() =>
    expect(screen.getByTestId('location')).toHaveTextContent('page=1')
  );
  expect(deleteAdminFaq).toHaveBeenCalledExactlyOnceWith(23);
  expect(
    screen.queryByRole('button', { name: 'FAQ 수정' })
  ).not.toBeInTheDocument();
});

test('삭제 실패 시 확인창과 오류를 유지한다', async () => {
  const user = userEvent.setup();
  vi.mocked(deleteAdminFaq).mockRejectedValue(new Error('삭제할 수 없습니다.'));
  renderPage();
  await selectFaq(user);
  await user.click(within(detail()).getByRole('button', { name: 'FAQ 삭제' }));
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: '삭제' })
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '삭제할 수 없습니다.'
  );
});

test('조회 실패·빈 목록을 구분하고 새로고침으로 복구한다', async () => {
  const user = userEvent.setup();
  vi.mocked(getAllAdminFaqs)
    .mockRejectedValueOnce(new Error('서버 오류'))
    .mockResolvedValue([]);
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '데이터를 불러오지 못했습니다.'
  );
  await user.click(screen.getByRole('button', { name: '새로고침' }));
  expect(await screen.findByText('등록된 FAQ가 없습니다.')).toBeInTheDocument();
});

test('잘못된 URL 페이지와 전체 페이지를 넘는 번호를 보정한다', async () => {
  renderPage('/report/faq?page=999');
  await screen.findByRole('button', { name: faq.question });
  expect(screen.getByTestId('location')).toHaveTextContent('page=1');
});

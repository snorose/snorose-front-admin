import {
  Link,
  Outlet,
  Route,
  RouterProvider,
  createMemoryRouter,
  createRoutesFromElements,
  useLocation,
} from 'react-router-dom';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { AuthContext } from '@/shared/contexts';
import type { AuthContextType } from '@/shared/types';

import { NoticesProvider } from '@/domains/Notices';
import { createSampleNotices } from '@/domains/Notices/mocks/notices';

import GeneralNoticePage from './GeneralNoticePage';
import NoticeEditorPage from './NoticeEditorPage';

const auth: AuthContextType = {
  user: {
    userId: 101,
    nickname: '테스트리자',
    balance: 0,
    userRoleId: 4,
    birthday: '',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: async () => ({ success: true }),
  logout: vi.fn(),
  clearError: vi.fn(),
};
const NativeURL = URL;
function LocationProbe() {
  const location = useLocation();
  return (
    <span data-testid='current-url' hidden>
      {location.pathname}
      {location.search}
    </span>
  );
}
function NoticeTestRoot() {
  return (
    <AuthContext.Provider value={auth}>
      <NoticesProvider>
        <LocationProbe />
        <Link to='/elsewhere'>다른 어드민 화면</Link>
        <Outlet />
      </NoticesProvider>
    </AuthContext.Provider>
  );
}
function renderNotices(
  entry = '/notices/general',
  initialEntries = [entry],
  initialIndex = initialEntries.length - 1
) {
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route element={<NoticeTestRoot />}>
        <Route
          path='/member/info/:memberKey'
          element={<Link to='/notices/general'>공지 목록으로 돌아가기</Link>}
        />
        <Route
          path='/elsewhere'
          element={<Link to='/notices/general'>공지 목록으로 돌아가기</Link>}
        />
        <Route path='/notices'>
          <Route path='general' element={<GeneralNoticePage />} />
          <Route path='general/new' element={<NoticeEditorPage />} />
          <Route path='general/:noticeId/edit' element={<NoticeEditorPage />} />
        </Route>
      </Route>
    ),
    { initialEntries, initialIndex }
  );
  return { ...render(<RouterProvider router={router} />), router };
}

afterEach(() => {
  cleanup();
  globalThis.URL = NativeURL;
});

describe('공지 조회와 작성 흐름', () => {
  test('고정 설정 영역 없이 소제목·글자색·형광펜을 적용하고 저장 후 다시 편집한다', async () => {
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    expect(
      screen.queryByText('상단 고정', { exact: true })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/최종 업로드 관리자:/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(screen.getByRole('textbox', { name: /제목/ }), '꾸민 공지');
    await user.click(screen.getByRole('textbox', { name: '내용' }));
    await user.click(screen.getByRole('button', { name: '문단 형식' }));
    await user.click(screen.getByRole('menuitemradio', { name: '소제목' }));
    await user.click(screen.getByRole('button', { name: '글자색' }));
    await user.click(
      screen.getByRole('menuitemradio', { name: '글자색 파랑' })
    );
    await user.click(screen.getByRole('button', { name: '형광펜' }));
    await user.click(
      screen.getByRole('menuitemradio', { name: '형광펜 노랑' })
    );
    await user.keyboard('서식 유지 본문');
    const assertFormatting = () => {
      const content = screen.getByRole('textbox', {
        name: '내용',
      });
      expect(content.querySelector('h1')).toHaveTextContent('서식 유지 본문');
      expect(content.querySelector('span[style]')).toHaveStyle({
        color: 'rgb(0, 54, 142)',
        backgroundColor: 'rgb(253, 255, 108)',
      });
    };
    assertFormatting();
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    await user.click(
      within(screen.getByText('꾸민 공지').closest('tr')!).getByRole('link', {
        name: /수정/,
      })
    );
    assertFormatting();
  });

  test('링크 입력창에서 이미지와 임베드를 본문에 직접 삽입한다', async () => {
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '링크' }));
    await user.type(
      screen.getByRole('textbox', { name: '링크 주소' }),
      'https://example.com/picture.png'
    );
    await user.click(screen.getByRole('button', { name: '이미지 삽입' }));
    const content = screen.getByRole('textbox', { name: '내용' });
    expect(content.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/picture.png'
    );
    await user.click(screen.getByRole('button', { name: '링크' }));
    await user.type(
      screen.getByRole('textbox', { name: '링크 주소' }),
      'https://youtu.be/abc123'
    );
    await user.click(screen.getByRole('button', { name: '임베드로 삽입' }));
    expect(content.querySelector('iframe')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/abc123'
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('브라우저 뒤로 가기를 취소하면 작성 내용을 유지하고 확인한 경우에만 이동한다', async () => {
    const user = userEvent.setup();
    const { router } = renderNotices('/notices/general/new', [
      '/notices/general',
      '/notices/general/new',
    ]);
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '미저장 제목'
    );
    await act(async () => {
      await router.navigate(-1);
    });
    const dialog = () =>
      screen.getByRole('dialog', { name: '작성 중인 화면을 나갈까요?' });
    await user.click(
      within(dialog()).getByRole('button', { name: '계속 작성' })
    );
    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue(
      '미저장 제목'
    );
    expect(router.state.location.pathname).toBe('/notices/general/new');
    await act(async () => {
      await router.navigate(-1);
    });
    await user.click(within(dialog()).getByRole('button', { name: '나가기' }));
    expect(
      await screen.findByRole('heading', { name: '일반 공지 관리' })
    ).toBeInTheDocument();
  });

  test('앞으로 가기와 다른 어드민 링크도 같은 이탈 확인을 거친다', async () => {
    const user = userEvent.setup();
    const { router } = renderNotices(
      '/notices/general/new',
      ['/notices/general/new', '/elsewhere'],
      0
    );
    await user.type(screen.getByRole('textbox', { name: /제목/ }), '작성 내용');
    await act(async () => {
      await router.navigate(1);
    });
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '계속 작성',
      })
    );
    await user.click(screen.getByRole('link', { name: '다른 어드민 화면' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '계속 작성',
      })
    );
    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue(
      '작성 내용'
    );
    await user.click(screen.getByRole('button', { name: '목록으로' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '나가기' })
    );
    expect(
      await screen.findByRole('heading', { name: '일반 공지 관리' })
    ).toBeInTheDocument();
  });

  test('첨부 제한으로 거절한 파일에는 미리보기 URL을 만들지 않는다', async () => {
    const createObjectURL = vi.fn(() => 'blob:review');
    globalThis.URL = class extends NativeURL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = vi.fn();
    };
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    const tooLarge = new File(['x'], '큰이미지.png', { type: 'image/png' });
    Object.defineProperty(tooLarge, 'size', { value: 7 * 1024 * 1024 + 1 });
    await user.upload(screen.getByLabelText('이미지 파일 선택'), tooLarge);
    expect(screen.getByRole('alert')).toHaveTextContent('7MB');
    expect(createObjectURL).not.toHaveBeenCalled();
    const images = Array.from(
      { length: 6 },
      (_, index) => new File(['x'], `사진${index}.png`, { type: 'image/png' })
    );
    await user.upload(screen.getByLabelText('이미지 파일 선택'), images);
    expect(screen.getByRole('alert')).toHaveTextContent('5개');
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  test('링크 입력창의 적용은 작성 폼을 제출하지 않고 본문에 링크만 추가한다', async () => {
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '링크 입력 확인'
    );
    await user.type(screen.getByRole('textbox', { name: '내용' }), '본문 안내');
    await user.click(screen.getByRole('button', { name: '링크' }));
    await user.type(
      screen.getByRole('textbox', { name: '링크 주소' }),
      'javascript:alert(1)'
    );
    await user.click(
      within(screen.getByRole('dialog', { name: '링크 설정' })).getByRole(
        'button',
        { name: '적용' }
      )
    );
    expect(screen.getByRole('alert')).toHaveTextContent('주소');
    await user.clear(screen.getByRole('textbox', { name: '링크 주소' }));
    await user.type(
      screen.getByRole('textbox', { name: '링크 주소' }),
      'https://snorose.com'
    );
    await user.click(
      within(screen.getByRole('dialog', { name: '링크 설정' })).getByRole(
        'button',
        { name: '적용' }
      )
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '공지사항 작성' })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('textbox', { name: '내용' })).getByRole('link')
    ).toHaveAttribute('href', 'https://snorose.com');
  });

  test('게시판별 카테고리를 선택 사항으로 제공하고 카테고리가 없는 게시판에서는 숨긴다', async () => {
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    const boards = within(screen.getByRole('group', { name: /게시판 선택/ }));
    expect(
      boards.queryByRole('button', { name: '스노로즈' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: '카테고리' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '미리보기' })
    ).not.toBeInTheDocument();
    await user.click(boards.getByRole('button', { name: '공지사항' }));
    let categories = within(screen.getByRole('group', { name: '카테고리' }));
    expect(categories.getAllByRole('button')).toHaveLength(5);
    for (const button of categories.getAllByRole('button'))
      expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(categories.getByRole('button', { name: '회계' }));
    await user.click(categories.getByRole('button', { name: '회계' }));
    expect(categories.getByRole('button', { name: '회계' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await user.click(boards.getByRole('button', { name: '이벤트' }));
    expect(
      screen.queryByRole('group', { name: '카테고리' })
    ).not.toBeInTheDocument();
    await user.click(boards.getByRole('button', { name: '문화생활' }));
    await user.click(boards.getByRole('button', { name: '반려동물' }));
    categories = within(screen.getByRole('group', { name: '카테고리' }));
    expect(
      categories.getAllByRole('button').map((button) => button.textContent)
    ).toEqual(['개숙희', '숙냥숙냥', '숙햄숙햄', '자유']);
    for (const button of categories.getAllByRole('button'))
      expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(categories.getByRole('button', { name: '숙냥숙냥' }));
    await user.click(categories.getByRole('button', { name: '숙냥숙냥' }));
    expect(
      categories.getByRole('button', { name: '숙냥숙냥' })
    ).toHaveAttribute('aria-pressed', 'false');
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '반려동물 미선택 공지'
    );
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    await user.click(
      within(screen.getByText('반려동물 미선택 공지').closest('tr')!).getByRole(
        'link',
        { name: /수정/ }
      )
    );
    for (const button of within(
      screen.getByRole('group', { name: '카테고리' })
    ).getAllByRole('button'))
      expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: '책' }));
    expect(
      screen.queryByRole('group', { name: '카테고리' })
    ).not.toBeInTheDocument();
  });

  test('한 페이지에 10개를 표시하고 게시판 필터를 변경하면 첫 페이지부터 표시한다', async () => {
    const user = userEvent.setup();
    renderNotices();
    expect(screen.getAllByRole('row')).toHaveLength(11);
    await user.click(screen.getByRole('link', { name: '2' }));
    expect(screen.getAllByRole('row')).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: '커뮤니티' }));
    expect(screen.getAllByRole('row')).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: '함박눈방' }));
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await user.type(screen.getByLabelText('게시글 검색'), '없는 검색어');
    expect(
      screen.getByText('조건에 맞는 공지사항이 없습니다.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '필터 초기화' }));
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(
      screen.queryByRole('button', { name: '스노로즈' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    expect(screen.getByRole('status')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: '이벤트' }));
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(
      screen.getByText('11월 스노로즈 이벤트 안내 (작성 중)')
    ).toBeInTheDocument();
  });

  test('게시판과 제목을 검증하고 임시저장한 글을 다시 열어 게시할 수 있다', async () => {
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '게시' }));
    expect(screen.getByRole('alert')).toHaveTextContent('게시판을 선택');
    await user.click(screen.getByRole('button', { name: '공지사항' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '새로운 운영 공지'
    );
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    const draft = screen.getByText('새로운 운영 공지').closest('tr')!;
    expect(within(draft).getByText('임시저장')).toBeInTheDocument();
    expect(
      within(draft).getByRole('button', { name: '테스트리자' })
    ).toBeInTheDocument();
    await user.click(within(draft).getByRole('link', { name: /수정/ }));
    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue(
      '새로운 운영 공지'
    );
    for (const button of within(
      screen.getByRole('group', { name: '카테고리' })
    ).getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
    await user.click(screen.getByRole('button', { name: '게시' }));
    expect(screen.getByRole('alert')).toHaveTextContent('본문을 입력');
    const content = screen.getByRole('textbox', { name: '내용' });
    await user.click(content);
    await user.click(screen.getByRole('button', { name: '굵게' }));
    await user.keyboard('눈송이 여러분께 안내합니다.');
    expect(content.querySelector('strong')).toHaveTextContent(
      '눈송이 여러분께 안내합니다.'
    );
    await user.click(screen.getByRole('button', { name: '게시' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '저장',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(
      within(screen.getAllByRole('row')[1]).getByText('새로운 운영 공지')
    ).toBeInTheDocument();
    expect(
      within(screen.getAllByRole('row')[1]).getByText('NEW')
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      String(createSampleNotices().length + 1)
    );
    const published = screen.getAllByRole('row')[1];
    expect(
      within(published).getByText('눈송이 여러분께 안내합니다.')
    ).toBeInTheDocument();
    await user.click(within(published).getByRole('link', { name: /수정/ }));
    expect(
      screen.getByRole('textbox', { name: '내용' }).querySelector('strong')
    ).toHaveTextContent('눈송이 여러분께 안내합니다.');
  });

  test('이전 게시글을 수정해도 최신 공지를 바꾸지 않고 최종 관리자를 갱신한다', async () => {
    const user = userEvent.setup();
    renderNotices('/notices/general/1076/edit');
    await user.clear(screen.getByRole('textbox', { name: /제목/ }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '이용 수칙 개정'
    );
    await user.click(screen.getByRole('button', { name: '수정사항 반영' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '저장',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    expect(
      within(screen.getAllByRole('row')[1]).getByText(
        '스노로즈 서비스 점검 안내'
      )
    ).toBeInTheDocument();
    const updated = screen.getByText('이용 수칙 개정').closest('tr')!;
    expect(
      within(updated).getByRole('button', { name: '테스트리자' })
    ).toBeInTheDocument();
    expect(within(updated).queryByText('NEW')).not.toBeInTheDocument();
  });

  test('회원 정보는 기존 회원 상세 경로로 이동하고 작성한 공지는 이름을 검색창에 채운다', async () => {
    const user = userEvent.setup();
    renderNotices();
    const openAuthor = async () =>
      user.click(
        within(screen.getAllByRole('row')[1]).getByRole('button', {
          name: '운영리자',
        })
      );
    await openAuthor();
    expect(
      screen.queryByRole('menuitem', { name: '제재하기' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
    expect(screen.getByTestId('current-url')).toHaveTextContent(
      '/member/info/sample-admin-0'
    );
    expect(screen.getByTestId('current-url')).not.toHaveTextContent('?');
    await user.click(
      screen.getByRole('link', { name: '공지 목록으로 돌아가기' })
    );
    await openAuthor();
    await user.click(screen.getByRole('menuitem', { name: '작성한 공지글' }));
    expect(screen.getByLabelText('작성자 검색 (아이디/닉네임)')).toHaveValue(
      '운영리자'
    );
    expect(screen.getByTestId('current-url')).toHaveTextContent(
      'author=sample-admin-0'
    );
    expect(screen.getAllByRole('row')).toHaveLength(
      Math.min(
        10,
        createSampleNotices().filter(
          (notice) => notice.authorId === 'sample-admin-0'
        ).length
      ) + 1
    );
    await user.clear(screen.getByLabelText('작성자 검색 (아이디/닉네임)'));
    await user.type(
      screen.getByLabelText('작성자 검색 (아이디/닉네임)'),
      '개발리자'
    );
    expect(screen.getByTestId('current-url')).not.toHaveTextContent(
      'author=sample-admin-0'
    );
    for (const row of screen.getAllByRole('row').slice(1))
      expect(
        within(row).getByRole('button', { name: '개발리자' })
      ).toBeInTheDocument();
  });

  test('작성자 ID가 있는 공유 URL도 작성자 검색에 닉네임을 표시한다', () => {
    renderNotices('/notices/general?author=sample-admin-1');
    expect(screen.getByLabelText('작성자 검색 (아이디/닉네임)')).toHaveValue(
      '소통리자'
    );
  });

  test('선택한 첨부를 키보드로 이동하고 포커스·썸네일·저장 순서를 유지한다', async () => {
    globalThis.URL = class extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:keyboard-attachment');
      static revokeObjectURL = vi.fn();
    };
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    await user.click(screen.getByRole('button', { name: '이벤트' }));
    await user.type(
      screen.getByRole('textbox', { name: /제목/ }),
      '키보드 첨부 공지'
    );
    await user.upload(screen.getByLabelText('이미지 파일 선택'), [
      new File(['first'], '첫사진.png', { type: 'image/png' }),
      new File(['second'], '둘째사진.png', { type: 'image/png' }),
      new File(['third'], '셋째사진.png', { type: 'image/png' }),
    ]);
    await user.upload(
      screen.getByLabelText('동영상 파일 선택'),
      new File(['video'], '영상.mp4', { type: 'video/mp4' })
    );
    const list = () => screen.getByRole('list', { name: '첨부 순서' });
    const order = () =>
      within(list())
        .getAllByRole('link')
        .map((link) => link.textContent);
    await user.click(screen.getByRole('img', { name: '둘째사진.png' }));
    const selected = screen
      .getByRole('img', { name: '둘째사진.png' })
      .closest('li')!;
    expect(selected).toHaveFocus();
    expect(selected).toHaveAttribute('aria-current', 'true');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(order()).toEqual([
      '둘째사진.png',
      '첫사진.png',
      '셋째사진.png',
      '영상.mp4',
    ]);
    expect(within(selected).getByText('썸네일')).toBeInTheDocument();
    expect(selected).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(order()).toEqual([
      '첫사진.png',
      '셋째사진.png',
      '둘째사진.png',
      '영상.mp4',
    ]);
    expect(selected).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(order()).toEqual([
      '첫사진.png',
      '셋째사진.png',
      '영상.mp4',
      '둘째사진.png',
    ]);
    expect(selected).toHaveFocus();

    await user.click(screen.getByRole('textbox', { name: '내용' }));
    await user.keyboard('본문{ArrowLeft}');
    const unchanged = order();
    const videoArrow = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    fireEvent(screen.getByLabelText('영상.mp4 동영상'), videoArrow);
    expect(videoArrow.defaultPrevented).toBe(false);
    expect(order()).toEqual(unchanged);

    await user.click(
      screen.getByRole('button', { name: '셋째사진.png 순서 끌어서 이동' })
    );
    await user.keyboard('{ArrowLeft}');
    const savedOrder = [
      '셋째사진.png',
      '첫사진.png',
      '영상.mp4',
      '둘째사진.png',
    ];
    expect(order()).toEqual(savedOrder);
    expect(list().querySelectorAll('[aria-current="true"]')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    await user.click(
      within(screen.getByText('키보드 첨부 공지').closest('tr')!).getByRole(
        'link',
        { name: /수정/ }
      )
    );
    expect(order()).toEqual(savedOrder);
    expect(within(list()).getAllByRole('listitem')[0]).toHaveTextContent(
      '썸네일'
    );
  });

  test('첨부 파일은 임시저장 후 다시 열어도 유지되고 제거할 수 있다', async () => {
    globalThis.URL = class extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:test-attachment');
      static revokeObjectURL = vi.fn();
    };
    const user = userEvent.setup();
    renderNotices('/notices/general/new');
    await user.click(
      within(screen.getByRole('group', { name: /게시판 선택/ })).getByRole(
        'button',
        { name: '이벤트' }
      )
    );
    await user.type(screen.getByRole('textbox', { name: /제목/ }), '첨부 공지');
    await user.upload(
      screen.getByLabelText('동영상 파일 선택'),
      new File(['sample'], '안내.mp4', { type: 'video/mp4' })
    );
    expect(screen.getByRole('link', { name: '안내.mp4' })).toBeInTheDocument();
    await user.upload(screen.getByLabelText('이미지 파일 선택'), [
      new File(['first'], '첫사진.png', { type: 'image/png' }),
      new File(['second'], '둘째사진.png', { type: 'image/png' }),
    ]);
    const rows = () =>
      within(screen.getByRole('list', { name: '첨부 순서' })).getAllByRole(
        'listitem'
      );
    expect(within(rows()[1]).getByText('썸네일')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: '둘째사진.png 앞으로 이동' })
    );
    await user.click(
      screen.getByRole('button', { name: '둘째사진.png 앞으로 이동' })
    );
    expect(within(rows()[0]).getByRole('link')).toHaveTextContent(
      '둘째사진.png'
    );
    expect(within(rows()[0]).getByText('썸네일')).toBeInTheDocument();
    const data = new Map<string, string>();
    const dataTransfer = {
      setData: (type: string, value: string) => data.set(type, value),
      getData: (type: string) => data.get(type) ?? '',
      effectAllowed: '',
      dropEffect: '',
    };
    fireEvent.dragStart(
      screen.getByRole('button', { name: '첫사진.png 순서 끌어서 이동' }),
      { dataTransfer }
    );
    fireEvent.dragOver(rows()[0], { dataTransfer });
    fireEvent.drop(rows()[0], { dataTransfer });
    expect(
      rows().map((row) => within(row).getByRole('link').textContent)
    ).toEqual(['첫사진.png', '둘째사진.png', '안내.mp4']);
    expect(within(rows()[0]).getByText('썸네일')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '임시저장' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '임시저장',
      })
    );
    await screen.findByRole('heading', { name: '일반 공지 관리' });
    const savedRow = screen.getByText('첨부 공지').closest('tr')!;
    await user.click(
      within(savedRow).getByRole('button', { name: '테스트리자' })
    );
    await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
    expect(screen.getByTestId('current-url')).toHaveTextContent(
      '/member/info/101'
    );
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('link', { name: '공지 목록으로 돌아가기' })
    );
    expect(await screen.findByText('첨부 공지')).toBeInTheDocument();
    await user.click(
      within(screen.getByText('첨부 공지').closest('tr')!).getByRole('link', {
        name: /수정/,
      })
    );
    expect(screen.getByRole('link', { name: '안내.mp4' })).toBeInTheDocument();
    expect(
      rows().map((row) => within(row).getByRole('link').textContent)
    ).toEqual(['첫사진.png', '둘째사진.png', '안내.mp4']);
    await user.click(screen.getByRole('button', { name: '첫사진.png 삭제' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '취소' })
    );
    expect(within(rows()[0]).getByRole('link')).toHaveTextContent('첫사진.png');
    await user.click(screen.getByRole('button', { name: '첫사진.png 삭제' }));
    await user.click(
      within(
        screen.getByRole('dialog', { name: '첨부 파일을 삭제할까요?' })
      ).getByRole('button', { name: '삭제' })
    );
    expect(within(rows()[0]).getByRole('link')).toHaveTextContent(
      '둘째사진.png'
    );
    expect(within(rows()[0]).getByText('썸네일')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '안내.mp4 삭제' }));
    await user.click(
      within(
        screen.getByRole('dialog', { name: '첨부 파일을 삭제할까요?' })
      ).getByRole('button', { name: '삭제' })
    );
    expect(
      screen.queryByRole('link', { name: '안내.mp4' })
    ).not.toBeInTheDocument();
  });
});

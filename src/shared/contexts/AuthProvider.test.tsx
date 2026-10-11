import { useContext } from 'react';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { ADMIN_ROLE_ID } from '@/shared/constants';

import { loginAPI } from '@/apis';

import { AuthContext } from './AuthContext';
import { AuthProvider } from './AuthProvider';

vi.mock('@/apis', () => ({ loginAPI: vi.fn() }));
vi.mock('@/shared/utils', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearAll: vi.fn(),
  },
  userStorage: {
    getUser: vi.fn(),
    setUser: vi.fn(),
    removeUser: vi.fn(),
  },
  TokenRefreshManager: { refresh: vi.fn() },
  executeTokenRefresh: vi.fn(),
}));

function LoginHarness() {
  const auth = useContext(AuthContext)!;
  return (
    <>
      <button
        disabled={auth.isLoading}
        onClick={() => void auth.login({ loginId: 'admin', password: 'test' })}
      >
        로그인
      </button>
      {auth.error && <p role='alert'>{auth.error}</p>}
    </>
  );
}

function renderAuth(
  initialEntry: string | { pathname: string; state: unknown }
) {
  const router = createMemoryRouter(
    [
      {
        element: (
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        ),
        children: [
          { path: '/', element: <LoginHarness /> },
          {
            path: '*',
            element: (
              <ProtectedRoute>
                <p>보호된 페이지</p>
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loginAPI).mockResolvedValue({
    tokenResponse: {
      grantType: 'Bearer',
      accessToken: 'access',
      refreshToken: 'refresh',
    },
    userId: 1,
    nickname: 'admin',
    balance: 0,
    userRoleId: ADMIN_ROLE_ID,
    birthday: '2000-01-01',
  });
});

describe('로그인 후 원래 경로 복원', () => {
  test('비로그인 공유 링크의 경로·쿼리·해시를 로그인 후 복원한다', async () => {
    const user = userEvent.setup();
    const returnTo = '/report/inquiry?page=2&postId=1725670#detail';
    const router = renderAuth(returnTo);
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(router.state.location.state).toEqual({ returnTo });

    await user.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByText('보호된 페이지');
    const { pathname, search, hash } = router.state.location;
    expect(pathname + search + hash).toBe(returnTo);
    expect(router.state.historyAction).toBe('REPLACE');
    expect(router.state.location.state).toBeNull();
  });

  test('로그인 실패 후 재시도해도 공유 경로가 유지된다', async () => {
    vi.mocked(loginAPI).mockRejectedValueOnce(new Error('로그인 실패'));
    const user = userEvent.setup();
    const returnTo = '/report/inquiry?postId=1725670';
    const router = renderAuth(returnTo);
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByRole('alert');
    expect(router.state.location.state).toEqual({ returnTo });
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByText('보호된 페이지');
    expect(router.state.location.pathname + router.state.location.search).toBe(
      returnTo
    );
  });

  test('일반 로그인은 회원 정보 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    const router = renderAuth('/');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByText('보호된 페이지');
    expect(router.state.location.pathname).toBe('/member/info');
  });

  test.each(['https://example.com', '//example.com', '/\\example.com', 123])(
    '잘못된 복원 경로 %s는 기본 페이지로 이동한다',
    async (returnTo) => {
      const user = userEvent.setup();
      const router = renderAuth({ pathname: '/', state: { returnTo } });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled()
      );
      await user.click(screen.getByRole('button', { name: '로그인' }));
      await screen.findByText('보호된 페이지');
      expect(router.state.location.pathname).toBe('/member/info');
    }
  );
});

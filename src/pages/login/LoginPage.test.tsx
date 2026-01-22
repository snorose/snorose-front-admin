import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogInPage from './LogInPage';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/assets', () => ({
  snoroseLogo: 'mocked-logo.png',
}));

describe('로그인 페이지', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: mockLogout,
      clearError: mockClearError,
    });
  });

  test('로그인 페이지가 정상적으로 렌더링된다', () => {
    render(<LogInPage />);

    expect(screen.getByAltText('스노로즈 로고')).toBeInTheDocument();
    expect(
      screen.getByText('어드민 페이지에 오신 것을 환영합니다')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('스노로즈 아이디')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('스노로즈 비밀번호')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  test('아이디 입력란에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<LogInPage />);

    const idInput = screen.getByPlaceholderText('스노로즈 아이디');
    await user.type(idInput, 'testuser');

    expect(idInput).toHaveValue('testuser');
  });

  test('비밀번호 입력란에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<LogInPage />);

    const passwordInput = screen.getByPlaceholderText('스노로즈 비밀번호');
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  test('비밀번호는 기본적으로 숨김 처리되어 있다', () => {
    render(<LogInPage />);

    const passwordInput = screen.getByPlaceholderText('스노로즈 비밀번호');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('눈 아이콘 버튼 클릭 시 비밀번호가 보이고 숨겨진다', async () => {
    const user = userEvent.setup();
    render(<LogInPage />);

    const passwordInput = screen.getByPlaceholderText('스노로즈 비밀번호');

    // 초기 상태: 비밀번호 숨김
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(
      screen.getByRole('button', { name: '비밀번호 보기' })
    ).toBeInTheDocument();

    // 첫 번째 클릭: 비밀번호 보임
    const toggleButtonShow = screen.getByRole('button', {
      name: '비밀번호 보기',
    });
    await user.click(toggleButtonShow);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: '비밀번호 숨기기' })
    ).toBeInTheDocument();

    // 두 번째 클릭: 비밀번호 숨김
    const toggleButtonHide = screen.getByRole('button', {
      name: '비밀번호 숨기기',
    });
    await user.click(toggleButtonHide);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(
      screen.getByRole('button', { name: '비밀번호 보기' })
    ).toBeInTheDocument();
  });

  test.each([
    {
      id: 'testuser',
      password: '',
      description: '비밀번호가 비어있는 경우',
    },
    {
      id: '',
      password: 'password123',
      description: '아이디가 비어있는 경우',
    },
    {
      id: '',
      password: '',
      description: '아이디와 비밀번호 모두 비어있는 경우',
    },
    {
      id: '   ',
      password: 'password123',
      description: '아이디가 공백만 있는 경우',
    },
    {
      id: 'testuser',
      password: '   ',
      description: '비밀번호가 공백만 있는 경우',
    },
  ])(
    '$description 로그인 시도 시 유효성 검사에 실패한다',
    async ({ id, password }) => {
      const user = userEvent.setup();
      render(<LogInPage />);

      if (id) {
        await user.type(screen.getByPlaceholderText('스노로즈 아이디'), id);
      }
      if (password) {
        await user.type(
          screen.getByPlaceholderText('스노로즈 비밀번호'),
          password
        );
      }

      await user.click(screen.getByRole('button', { name: '로그인' }));

      expect(toast.info).toHaveBeenCalledWith(
        '아이디와 비밀번호를 입력해 주세요.'
      );
      expect(mockLogin).not.toHaveBeenCalled();
    }
  );

  test('유효한 아이디와 비밀번호로 로그인 시도 시 login 함수가 호출된다', async () => {
    mockLogin.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LogInPage />);

    await user.type(screen.getByPlaceholderText('스노로즈 아이디'), 'testuser');
    await user.type(
      screen.getByPlaceholderText('스노로즈 비밀번호'),
      'password123'
    );
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(mockClearError).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith({
      loginId: 'testuser',
      password: 'password123',
    });
  });

  test('로그인 실패 시 toast.error가 호출된다', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: '아이디 또는 비밀번호가 일치하지 않습니다.',
    });
    const user = userEvent.setup();
    render(<LogInPage />);

    await user.type(screen.getByPlaceholderText('스노로즈 아이디'), 'testuser');
    await user.type(
      screen.getByPlaceholderText('스노로즈 비밀번호'),
      'wrongpassword'
    );
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        '아이디 또는 비밀번호가 일치하지 않습니다.'
      );
    });
  });

  test('로그인 성공 시 toast.error가 호출되지 않는다', async () => {
    mockLogin.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LogInPage />);

    await user.type(screen.getByPlaceholderText('스노로즈 아이디'), 'testuser');
    await user.type(
      screen.getByPlaceholderText('스노로즈 비밀번호'),
      'password123'
    );
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('isLoading이 true일 때 입력란과 버튼이 비활성화되고 버튼 텍스트가 변경된다', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: mockLogin,
      logout: mockLogout,
      clearError: mockClearError,
    });

    render(<LogInPage />);

    expect(screen.getByPlaceholderText('스노로즈 아이디')).toBeDisabled();
    expect(screen.getByPlaceholderText('스노로즈 비밀번호')).toBeDisabled();

    const loadingButton = screen.getByRole('button', { name: '로그인 중...' });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();

    expect(
      screen.queryByRole('button', { name: '로그인' })
    ).not.toBeInTheDocument();
  });

  test('폼 제출(Enter 키) 시에도 로그인이 실행된다', async () => {
    mockLogin.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LogInPage />);

    const idInput = screen.getByPlaceholderText('스노로즈 아이디');
    const passwordInput = screen.getByPlaceholderText('스노로즈 비밀번호');

    await user.type(idInput, 'testuser');
    await user.type(passwordInput, 'password123{Enter}');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        loginId: 'testuser',
        password: 'password123',
      });
    });
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  test('로그인 시도마다 clearError가 호출된다', async () => {
    mockLogin.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LogInPage />);

    await user.type(screen.getByPlaceholderText('스노로즈 아이디'), 'testuser');
    await user.type(
      screen.getByPlaceholderText('스노로즈 비밀번호'),
      'password123'
    );
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  test('아이디와 비밀번호 앞뒤 공백은 자동으로 제거된다', async () => {
    mockLogin.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LogInPage />);

    await user.type(
      screen.getByPlaceholderText('스노로즈 아이디'),
      '  testuser  '
    );
    await user.type(
      screen.getByPlaceholderText('스노로즈 비밀번호'),
      '  password123  '
    );
    await user.click(screen.getByRole('button', { name: '로그인' }));

    // trim() 처리로 앞뒤 공백이 제거된 값이 전달됨
    expect(mockLogin).toHaveBeenCalledWith({
      loginId: 'testuser',
      password: 'password123',
    });
  });

  test('로고 이미지가 올바른 src를 가진다', () => {
    render(<LogInPage />);

    const logo = screen.getByAltText('스노로즈 로고');
    expect(logo).toHaveAttribute('src', 'mocked-logo.png');
  });
});

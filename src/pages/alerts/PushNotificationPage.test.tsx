import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PushNotification } from '@/shared/types';

import { postPushNotificationAPI } from '@/apis';

import PushNotificationPage from './PushNotificationPage';

vi.mock('@/apis', () => ({
  postPushNotificationAPI: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/shared/utils', () => ({
  getErrorMessage: vi.fn((_error, defaultMessage) => defaultMessage),
}));

vi.mock('@/domains/Alerts/components', () => ({
  PushNotificationConfirmModal: ({
    isOpen,
    onClose,
    onConfirm,
    data,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: PushNotification;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid='confirm-modal'>
        <div>푸시 알림 전송 확인</div>
        <div>알림명: {data.name}</div>
        <div>알림 제목: {data.title}</div>
        <div>알림 내용: {data.body}</div>
        <div data-testid='modal-url'>URL: {data.url}</div>
        <button onClick={onClose}>취소</button>
        <button onClick={onConfirm}>확인</button>
      </div>
    );
  },
}));

describe('PushNotificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('페이지가 정상적으로 렌더링된다', () => {
    render(<PushNotificationPage />);

    expect(screen.getByText('푸시 알림 전송')).toBeInTheDocument();
    expect(
      screen.getByText('푸시 알림을 허용한 회원을 대상으로 전송할 수 있어요.')
    ).toBeInTheDocument();
    expect(screen.getByText('필수 정보')).toBeInTheDocument();
    expect(screen.getByText('발송 옵션')).toBeInTheDocument();
  });

  test('모든 입력 필드가 렌더링된다', () => {
    render(<PushNotificationPage />);

    expect(screen.getByLabelText(/알림명/)).toBeInTheDocument();
    expect(screen.getByLabelText(/알림 제목/)).toBeInTheDocument();
    expect(screen.getByLabelText(/알림 내용/)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/알림 클릭 시 연결되는 주소/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/스노로즈 내부 URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/외부 URL/)).toBeInTheDocument();
    expect(screen.getByText(/메시지 유형/)).toBeInTheDocument();
    expect(screen.getByText(/발송 대상/)).toBeInTheDocument();
  });

  test('알림명 입력란에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    await user.type(nameInput, '테스트 알림');

    expect(nameInput).toHaveValue('테스트 알림');
  });

  test('알림 제목 입력란에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const titleInput = screen.getByLabelText(/알림 제목/);
    await user.type(titleInput, '테스트 제목');

    expect(titleInput).toHaveValue('테스트 제목');
  });

  test('알림 내용 입력란에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const bodyInput = screen.getByLabelText(/알림 내용/);
    await user.type(bodyInput, '테스트 내용');

    expect(bodyInput).toHaveValue('테스트 내용');
  });

  test('URL 입력란에 값을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);
    await user.clear(urlInput);
    await user.type(urlInput, '/test/path');

    expect(urlInput).toHaveValue('/test/path');
  });

  test('내부 URL인데 슬래시로 시작하지 않으면 알림 전송 시 토스트가 표시된다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);
    const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');
    await user.clear(urlInput);
    await user.type(urlInput, 'board/notice/post/123');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    expect(toast.info).toHaveBeenCalledWith(
      '스노로즈 내부 주소는 슬래시("/")로 시작해 주세요. (예: /board/notice/post/1863135)'
    );
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  test('내부 URL(슬래시로 시작)를 입력하면 모달이 열린다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);
    const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');
    await user.clear(urlInput);
    await user.type(urlInput, '/board/notice/post/123');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
  });

  test('알림 제목 글자 수가 표시된다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const titleInput = screen.getByLabelText(/알림 제목/);
    expect(screen.getByText('0 / 21자')).toBeInTheDocument();

    await user.type(titleInput, '테스트');
    expect(screen.getByText('3 / 21자')).toBeInTheDocument();
  });

  test('알림 내용 글자 수가 표시된다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const bodyInput = screen.getByLabelText(/알림 내용/);
    expect(screen.getByText('0 / 100자')).toBeInTheDocument();

    await user.type(bodyInput, '테스트 내용입니다');
    expect(screen.getByText('9 / 100자')).toBeInTheDocument();
  });

  test('광고성 알림 여부 라디오 버튼을 선택할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const marketingFalseRadio = screen.getByLabelText(
      /정보성 \(전체 공지, 댓글, 관리자 삭제\/비공개 통보 등\)/
    );
    await user.click(marketingFalseRadio);

    expect(marketingFalseRadio).toBeChecked();
  });

  test('테스트 발송 여부 라디오 버튼을 선택할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const testFalseRadio =
      screen.getByLabelText(/푸시 알림 허용 회원 전체에게 발송/);
    await user.click(testFalseRadio);

    expect(testFalseRadio).toBeChecked();
  });

  test('초기화 버튼을 클릭하면 모든 입력값이 초기화된다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');

    const resetButton = screen.getByRole('button', { name: '초기화' });
    await user.click(resetButton);

    expect(nameInput).toHaveValue('');
    expect(titleInput).toHaveValue('');
    expect(bodyInput).toHaveValue('');
  });

  test('필수 항목이 비어있을 때 알림 전송 버튼 클릭 시 토스트가 표시된다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    expect(toast.info).toHaveBeenCalledWith('모든 필수 항목을 입력해주세요.');
  });

  test.each([
    {
      description: '알림명이 비어있을 때',
      name: '',
      title: '테스트 제목',
      body: '테스트 내용',
    },
    {
      description: '알림 제목이 비어있을 때',
      name: '테스트 알림',
      title: '',
      body: '테스트 내용',
    },
    {
      description: '알림 내용이 비어있을 때',
      name: '테스트 알림',
      title: '테스트 제목',
      body: '',
    },
  ])(
    '$description 알림 전송 버튼 클릭 시 토스트가 표시된다',
    async ({ name, title, body }) => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      if (name) await user.type(nameInput, name);
      if (title) await user.type(titleInput, title);
      if (body) await user.type(bodyInput, body);

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(toast.info).toHaveBeenCalledWith('모든 필수 항목을 입력해주세요.');
    }
  );

  test('모든 필수 항목이 입력되어 있을 때 알림 전송 버튼 클릭 시 모달이 열린다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText('푸시 알림 전송 확인')).toBeInTheDocument();
  });

  test('모달에서 취소 버튼을 클릭하면 모달이 닫힌다', async () => {
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  test('모달에서 확인 버튼을 클릭하면 API가 호출되고 성공 토스트가 표시된다', async () => {
    vi.mocked(postPushNotificationAPI).mockResolvedValue({});
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    const confirmButton = screen.getByRole('button', { name: '확인' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(postPushNotificationAPI).toHaveBeenCalledWith({
        name: '테스트 알림',
        title: '테스트 제목',
        body: '테스트 내용',
        url: '/',
        isMarketing: true,
        isTest: true,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        '푸시 알림 전송이 완료되었어요.'
      );
    });

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  test('API 호출 성공 시 폼이 초기화된다', async () => {
    vi.mocked(postPushNotificationAPI).mockResolvedValue({});
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    const confirmButton = screen.getByRole('button', { name: '확인' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(titleInput).toHaveValue('');
      expect(bodyInput).toHaveValue('');
    });
  });

  test('API 호출 실패 시 에러 토스트가 표시되고 모달이 닫힌다', async () => {
    const error = new Error('API Error');
    vi.mocked(postPushNotificationAPI).mockRejectedValue(error);
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);

    await user.type(nameInput, '테스트 알림');
    await user.type(titleInput, '테스트 제목');
    await user.type(bodyInput, '테스트 내용');

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    const confirmButton = screen.getByRole('button', { name: '확인' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('푸시 알림 전송에 실패했어요.');
    });

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  test('모달에서 확인 버튼 클릭 시 올바른 데이터가 전달된다', async () => {
    vi.mocked(postPushNotificationAPI).mockResolvedValue({});
    const user = userEvent.setup();
    render(<PushNotificationPage />);

    const nameInput = screen.getByLabelText(/알림명/);
    const titleInput = screen.getByLabelText(/알림 제목/);
    const bodyInput = screen.getByLabelText(/알림 내용/);
    const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

    await user.type(nameInput, '리뉴얼 알림');
    await user.type(titleInput, '리뉴얼 제목');
    await user.type(bodyInput, '리뉴얼 내용');
    await user.clear(urlInput);
    await user.type(urlInput, '/board/notice/post/123');

    // 광고성 알림 여부를 정보성으로 변경
    const marketingFalseRadio = screen.getByLabelText(
      /정보성 \(전체 공지, 댓글, 관리자 삭제\/비공개 통보 등\)/
    );
    await user.click(marketingFalseRadio);

    // 테스트 발송 여부를 전체 회원 발송으로 변경
    const testFalseRadio =
      screen.getByLabelText(/푸시 알림 허용 회원 전체에게 발송/);
    await user.click(testFalseRadio);

    const applyButton = screen.getByRole('button', { name: '알림 전송' });
    await user.click(applyButton);

    const confirmButton = screen.getByRole('button', { name: '확인' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(postPushNotificationAPI).toHaveBeenCalledWith({
        name: '리뉴얼 알림',
        title: '리뉴얼 제목',
        body: '리뉴얼 내용',
        url: '/board/notice/post/123',
        isMarketing: false,
        isTest: false,
      });
    });
  });

  describe('예외 상황 및 엣지 케이스', () => {
    test.each([
      {
        description: '알림명에 공백만 입력한 경우',
        name: '   ',
        title: '테스트 제목',
        body: '테스트 내용',
      },
      {
        description: '알림 제목에 공백만 입력한 경우',
        name: '테스트 알림',
        title: '   ',
        body: '테스트 내용',
      },
      {
        description: '알림 내용에 공백만 입력한 경우',
        name: '테스트 알림',
        title: '테스트 제목',
        body: '   ',
      },
    ])(
      '$description 알림 전송이 되지 않아야 한다',
      async ({ name, title, body }) => {
        const user = userEvent.setup();
        render(<PushNotificationPage />);

        const nameInput = screen.getByLabelText(/알림명/);
        const titleInput = screen.getByLabelText(/알림 제목/);
        const bodyInput = screen.getByLabelText(/알림 내용/);

        await user.type(nameInput, name);
        await user.type(titleInput, title);
        await user.type(bodyInput, body);

        const applyButton = screen.getByRole('button', { name: '알림 전송' });
        await user.click(applyButton);

        expect(toast.info).toHaveBeenCalledWith(
          '모든 필수 항목을 입력해주세요.'
        );
        expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
      }
    );

    test('모든 필수 필드에 공백만 입력한 경우 알림 전송이 되지 않아야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      await user.type(nameInput, '   ');
      await user.type(titleInput, '   ');
      await user.type(bodyInput, '   ');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(toast.info).toHaveBeenCalledWith('모든 필수 항목을 입력해주세요.');
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });

    test('알림명 앞뒤에 공백이 있어도 알림 전송이 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      await user.type(nameInput, '  테스트 알림  ');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    test('알림 제목이 최대 길이(21자)를 초과하면 입력이 제한되어야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const titleInput = screen.getByLabelText(/알림 제목/);
      const longText =
        '가나다라마바사아자차카타파하가나다라마바사아자차카타파하';

      await user.type(titleInput, longText);

      // maxLength가 21이므로 21자까지만 입력되어야 함
      expect(titleInput).toHaveAttribute('maxLength', '21');
      expect(screen.getByText(/21 \/ 21자/)).toBeInTheDocument();
    });

    test('알림 내용이 최대 길이(100자)를 초과하면 입력이 제한되어야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const bodyInput = screen.getByLabelText(/알림 내용/);
      const longText = '가'.repeat(101);

      await user.type(bodyInput, longText);

      // maxLength가 100이므로 100자까지만 입력되어야 함
      expect(bodyInput).toHaveAttribute('maxLength', '100');
      expect(screen.getByText(/100 \/ 100자/)).toBeInTheDocument();
    });

    test('특수 문자가 포함된 알림명으로도 알림 전송이 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      await user.type(nameInput, '테스트 알림!@#$%^&*()');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    test('URL에 특수 문자가 포함되어도 알림 전송이 가능해야 한다', async () => {
      vi.mocked(postPushNotificationAPI).mockResolvedValue({});
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);
      await user.type(urlInput, '/board/notice?page=1&id=123');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      const confirmButton = screen.getByRole('button', { name: '확인' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(postPushNotificationAPI).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/board/notice?page=1&id=123',
          })
        );
      });
    });

    test('알림명에 줄바꿈 문자가 포함되어도 알림 전송이 가능해야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      await user.type(nameInput, '테스트\n알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    test('초기화 버튼 클릭 시 라디오 버튼과 URL 타입이 초기값으로 돌아간다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const marketingFalseRadio = screen.getByLabelText(
        /정보성 \(전체 공지, 댓글, 관리자 삭제\/비공개 통보 등\)/
      );
      await user.click(marketingFalseRadio);

      const testFalseRadio =
        screen.getByLabelText(/푸시 알림 허용 회원 전체에게 발송/);
      await user.click(testFalseRadio);

      await user.click(screen.getByLabelText(/외부 URL/));

      const resetButton = screen.getByRole('button', { name: '초기화' });
      await user.click(resetButton);

      const marketingTrueRadio =
        screen.getByLabelText(/광고성 \(이벤트 홍보 등\)/);
      const testTrueRadio = screen.getByLabelText(/관리자에게만 테스트 발송/);
      const internalUrlRadio = screen.getByLabelText(/스노로즈 내부 URL/);

      expect(marketingTrueRadio).toBeChecked();
      expect(testTrueRadio).toBeChecked();
      expect(internalUrlRadio).toBeChecked();
    });

    test('API 호출 중에 다시 확인 버튼을 클릭해도 중복 호출되지 않아야 한다', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(postPushNotificationAPI).mockReturnValue(promise);

      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      const confirmButton = screen.getByRole('button', { name: '확인' });
      await user.click(confirmButton);

      // API 호출 중에 다시 클릭 시도
      await user.click(confirmButton);

      // API는 한 번만 호출되어야 함 (중복 호출 방지 필요)
      expect(postPushNotificationAPI).toHaveBeenCalledTimes(1);

      // Promise 해결
      resolvePromise!({});
      await promise;
    });

    test('URL 입력 타입 기본값은 스노로즈 내부 URL이다', () => {
      render(<PushNotificationPage />);

      const internalUrlRadio = screen.getByLabelText(/스노로즈 내부 URL/);
      expect(internalUrlRadio).toBeChecked();
    });

    test('내부 URL 모드에서 스노로즈 전체(https) 주소를 입력하면 토스트만 뜨고 모달은 열리지 않는다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);
      await user.type(
        urlInput,
        'https://www.snorose.com/board/notice/post/1869958'
      );

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(toast.info).toHaveBeenCalledWith(
        '기본 주소("https://www.snorose.com")를 제외한 경로만 입력해 주세요.'
      );
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });

    test('내부 URL 모드에서 스노로즈 전체(http) 주소를 입력하면 토스트만 뜨고 모달은 열리지 않는다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);
      await user.type(
        urlInput,
        'http://www.snorose.com/board/notice/post/1869958'
      );

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(toast.info).toHaveBeenCalledWith(
        '기본 주소("https://www.snorose.com")를 제외한 경로만 입력해 주세요.'
      );
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });

    test('외부 URL 모드에서 스노로즈 전체(https) 주소를 입력하면 모달이 열리고 API 호출 시 그대로 전달된다', async () => {
      vi.mocked(postPushNotificationAPI).mockResolvedValue({});
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.click(screen.getByLabelText(/외부 URL/));

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);
      await user.type(
        urlInput,
        'https://www.snorose.com/board/notice/post/1869958'
      );

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      const modalUrl = screen.getByTestId('modal-url');
      expect(modalUrl).toHaveTextContent(
        'URL: https://www.snorose.com/board/notice/post/1869958'
      );

      const confirmButton = screen.getByRole('button', { name: '확인' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(postPushNotificationAPI).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://www.snorose.com/board/notice/post/1869958',
          })
        );
      });
    });

    test('외부 URL 모드에서 스노로즈 전체(http) 주소를 입력하면 모달이 열리고 API 호출 시 그대로 전달된다', async () => {
      vi.mocked(postPushNotificationAPI).mockResolvedValue({});
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.click(screen.getByLabelText(/외부 URL/));

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);
      await user.type(
        urlInput,
        'http://www.snorose.com/board/notice/post/1869958'
      );

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: '확인' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(postPushNotificationAPI).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'http://www.snorose.com/board/notice/post/1869958',
          })
        );
      });
    });

    test('다른 도메인의 전체 URL을 입력해도 모달이 열린다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);
      await user.type(urlInput, 'https://example.com/some/path');

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      // 모달이 열려야 함
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });

    test('URL을 수정하지 않고 기본값(/)을 사용할 때 모달에는 절대 경로가 표시되어야 한다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');

      // URL 입력란은 비운 채(내부 기본 = 플레이스홀더만 보임) 전송

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      // 모달이 열렸는지 확인
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

      // 모달에는 저장될 절대 경로가 표시되어야 함
      const modalUrl = screen.getByTestId('modal-url');
      expect(modalUrl).toHaveTextContent('URL: /');
    });

    test('URL이 빈 문자열일 때 모달에는 절대 경로 기본값이 표시된다', async () => {
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      // 모달이 열렸는지 확인
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

      // 모달에는 저장될 절대 경로가 표시되어야 함
      const modalUrl = screen.getByTestId('modal-url');
      expect(modalUrl).toHaveTextContent('URL: /');
    });

    test('URL이 빈 문자열일 때 API 호출 시 절대 경로로 전달된다', async () => {
      vi.mocked(postPushNotificationAPI).mockResolvedValue({});
      const user = userEvent.setup();
      render(<PushNotificationPage />);

      const nameInput = screen.getByLabelText(/알림명/);
      const titleInput = screen.getByLabelText(/알림 제목/);
      const bodyInput = screen.getByLabelText(/알림 내용/);
      const urlInput = screen.getByLabelText(/알림 클릭 시 연결되는 주소/);

      await user.type(nameInput, '테스트 알림');
      await user.type(titleInput, '테스트 제목');
      await user.type(bodyInput, '테스트 내용');
      await user.clear(urlInput);

      const applyButton = screen.getByRole('button', { name: '알림 전송' });
      await user.click(applyButton);

      const confirmButton = screen.getByRole('button', { name: '확인' });
      await user.click(confirmButton);

      // API 호출 시 URL이 절대 경로로 전달되어야 함
      await waitFor(() => {
        expect(postPushNotificationAPI).toHaveBeenCalledWith({
          name: '테스트 알림',
          title: '테스트 제목',
          body: '테스트 내용',
          url: '/',
          isMarketing: true,
          isTest: true,
        });
      });
    });
  });
});

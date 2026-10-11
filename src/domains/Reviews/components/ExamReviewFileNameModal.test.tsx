import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { renameExamReviewFile } from '@/apis/reviews';

import { ExamReviewFileNameModal } from './ExamReviewFileNameModal';

vi.mock('@/apis/reviews', () => ({
  renameExamReviewFile: vi.fn(),
}));

const onClose = vi.fn();
const onSuccess = vi.fn();

const renderModal = (currentFileName = '기존파일.pdf') =>
  render(
    <ExamReviewFileNameModal
      postId={101}
      currentFileName={currentFileName}
      returnFocusRef={{ current: null }}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );

describe('ExamReviewFileNameModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('이름만 수정하면 고정된 확장자를 붙여 보내고 성공 결과를 전달한다', async () => {
    const user = userEvent.setup();
    const result = { postId: 101, fileName: '새파일.pdf', logs: [] };
    vi.mocked(renameExamReviewFile).mockResolvedValue(result);
    renderModal();

    const input = screen.getByRole('textbox', { name: '새 파일명' });
    expect(input).toHaveValue('기존파일');
    expect(screen.getByText('.pdf')).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, '새파일');
    await user.click(screen.getByRole('button', { name: '파일명 변경' }));

    await waitFor(() => {
      expect(renameExamReviewFile).toHaveBeenCalledWith(101, '새파일.pdf');
      expect(onSuccess).toHaveBeenCalledWith(101, result);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  test('빈 이름, 기존 이름, 금지 문자는 요청하지 않는다', async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole('textbox', { name: '새 파일명' });
    const submitButton = screen.getByRole('button', { name: '파일명 변경' });
    expect(submitButton).toBeDisabled();
    await user.clear(input);
    expect(submitButton).toBeDisabled();
    await user.type(input, '   ');
    expect(submitButton).toBeDisabled();
    await user.clear(input);
    await user.type(input, '잘못된/이름');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('사용할 수 없습니다');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    await user.clear(input);
    await user.type(input, '새파일');
    expect(submitButton).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(renameExamReviewFile).not.toHaveBeenCalled();
  });

  test.each([
    ['기존파일.pdf', '새파일.docx', '새파일.docx.pdf'],
    ['기존.파일.PDF', '  새.파일  ', '새.파일.PDF'],
  ])(
    '이름에 점이 있어도 기존 확장자를 유지한다: %s',
    async (currentFileName, newFileName, expectedFileName) => {
      const user = userEvent.setup();
      vi.mocked(renameExamReviewFile).mockResolvedValue({
        postId: 101,
        fileName: expectedFileName,
        logs: [],
      });
      renderModal(currentFileName);

      const input = screen.getByRole('textbox', { name: '새 파일명' });
      await user.clear(input);
      await user.type(input, newFileName);
      await user.click(screen.getByRole('button', { name: '파일명 변경' }));

      await waitFor(() => {
        expect(renameExamReviewFile).toHaveBeenCalledWith(
          101,
          expectedFileName
        );
      });
    }
  );

  test('서버 오류가 나면 입력한 이름을 유지하고 오류를 보여준다', async () => {
    const user = userEvent.setup();
    vi.mocked(renameExamReviewFile).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: '이미 사용 중인 파일명입니다.' } },
    });
    renderModal();

    const input = screen.getByRole('textbox', { name: '새 파일명' });
    await user.clear(input);
    await user.type(input, '새파일');
    await user.click(screen.getByRole('button', { name: '파일명 변경' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이미 사용 중인 파일명입니다.'
    );
    expect(input).toHaveValue('새파일');
    expect(onClose).not.toHaveBeenCalled();
  });
});

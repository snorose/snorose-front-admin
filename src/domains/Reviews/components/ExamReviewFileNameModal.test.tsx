import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { renameExamReviewFile } from '@/apis/reviews';

import { ExamReviewFileNameModal } from './ExamReviewFileNameModal';

vi.mock('@/apis/reviews', () => ({
  renameExamReviewFile: vi.fn(),
}));

const onClose = vi.fn();
const onApply = vi.fn();

const renderModal = (currentFileName = '기존파일.pdf') =>
  render(
    <ExamReviewFileNameModal
      currentFileName={currentFileName}
      returnFocusRef={{ current: null }}
      onClose={onClose}
      onApply={onApply}
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
    await user.click(screen.getByRole('button', { name: '적용' }));

    await waitFor(() => {
      expect(renameExamReviewFile).not.toHaveBeenCalled();
      expect(onApply).toHaveBeenCalledWith('새파일.pdf');
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  test('빈 이름, 기존 이름, 금지 문자는 요청하지 않는다', async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole('textbox', { name: '새 파일명' });
    const submitButton = screen.getByRole('button', { name: '적용' });
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
      await user.click(screen.getByRole('button', { name: '적용' }));

      await waitFor(() => {
        expect(onApply).toHaveBeenCalledWith(expectedFileName);
      });
    }
  );

  test('취소하면 임시 파일명을 적용하지 않는다', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onApply).not.toHaveBeenCalled();
    expect(renameExamReviewFile).not.toHaveBeenCalled();
  });
});

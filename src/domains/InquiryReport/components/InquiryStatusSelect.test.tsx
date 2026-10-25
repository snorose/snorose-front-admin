import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import InquiryStatusSelect from './InquiryStatusSelect';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

describe('InquiryStatusSelect', () => {
  test('상태 변경 요청 중에는 재실행과 닫기를 막고 완료 후 닫는다', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const onStatusChange = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    render(
      <InquiryStatusSelect
        inquiryId={1}
        status='PENDING'
        title='문의 제목'
        onStatusChange={onStatusChange}
      />
    );
    await user.click(screen.getByRole('combobox', { name: '상태 변경' }));
    await user.click(screen.getByRole('option', { name: '답변 완료' }));
    await user.click(screen.getByRole('button', { name: '변경' }));
    const confirm = screen.getByRole('button', { name: '변경 중...' });
    expect(confirm).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    await user.click(confirm);
    await user.keyboard('{Escape}');
    expect(onStatusChange).toHaveBeenCalledExactlyOnceWith(1, 'COMPLETED');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => finish());
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  test('현재 답변 상태를 tone 배지로 표시한다', () => {
    render(
      <InquiryStatusSelect
        inquiryId={1}
        status='COMPLETED'
        title='문의 제목'
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText('답변 완료')).toHaveClass(
      'bg-emerald-50',
      'text-emerald-700'
    );
  });

  test('상태 선택과 확인 후 변경 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <InquiryStatusSelect
        inquiryId={1}
        status='PENDING'
        title='문의 제목'
        onStatusChange={onStatusChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: '상태 변경' }));
    await user.click(screen.getByRole('option', { name: '답변 완료' }));

    expect(
      screen.getByText('"문의 제목" 상태를 답변 완료(으)로 변경할까요?')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '변경' }));

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(1, 'COMPLETED');
    });
  });
});

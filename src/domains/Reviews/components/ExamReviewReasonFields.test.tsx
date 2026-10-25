import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { ExamReviewReasonFields } from './ExamReviewReasonFields';

test.each(['삭제', '복구'] as const)(
  '%s 사유는 수정키+Enter로 확인하고 일반 Enter·IME 조합·처리 중에는 실행하지 않는다',
  (action) => {
    const onConfirm = vi.fn();
    const props = {
      action,
      existingMemo: '기존 메모 내용',
      reason: '처리 요청',
      disabled: false,
      onReasonChange: vi.fn(),
      onConfirm,
    };
    const { rerender } = render(<ExamReviewReasonFields {...props} />);
    const reason = screen.getByLabelText(`${action} 사유`);
    expect(reason).toHaveAccessibleDescription(
      `기존 메모 아래에 [${action} 사유]로 저장됩니다.`
    );
    expect(screen.getByLabelText('기존 메모')).toHaveAttribute('readonly');
    fireEvent.keyDown(reason, { key: 'Enter' });
    fireEvent.keyDown(reason, {
      key: 'Enter',
      ctrlKey: true,
      isComposing: true,
    });
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.keyDown(reason, { key: 'Enter', ctrlKey: true });
    fireEvent.keyDown(reason, { key: 'Enter', metaKey: true });
    expect(onConfirm).toHaveBeenCalledTimes(2);
    rerender(<ExamReviewReasonFields {...props} disabled />);
    fireEvent.keyDown(reason, { key: 'Enter', ctrlKey: true });
    expect(onConfirm).toHaveBeenCalledTimes(2);
    rerender(<ExamReviewReasonFields {...props} reason='  ' />);
    fireEvent.keyDown(reason, { key: 'Enter', ctrlKey: true });
    expect(onConfirm).toHaveBeenCalledTimes(2);
  }
);

import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { WarningFields } from './PenaltyHistoryAddFields';

const COMMON_PROPS = {
  customReason: '',
  onCustomReasonChange: vi.fn(),
  onReasonChange: vi.fn(),
  onWarningCountChange: vi.fn(),
  warningCount: 1,
};

describe('WarningFields', () => {
  test('기본 카테고리는 경고 횟수를 수정할 수 없다', () => {
    render(
      <WarningFields
        {...COMMON_PROPS}
        needsCustomReason={false}
        reason='LOW_QUALITY_POST'
      />
    );

    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  test('기타 카테고리는 경고 횟수를 수정할 수 있다', () => {
    render(<WarningFields {...COMMON_PROPS} needsCustomReason reason='ETC' />);

    expect(screen.getByRole('spinbutton')).toBeEnabled();
  });

  test('경고 횟수의 오류 상태와 접근성 이름을 제공한다', () => {
    render(
      <WarningFields
        {...COMMON_PROPS}
        invalidFieldName='warningCount'
        needsCustomReason
        reason='ETC'
      />
    );

    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('spinbutton', { name: '경고 횟수' })).toBe(
      screen.getByLabelText('경고 횟수')
    );
    expect(screen.getByRole('textbox', { name: '상세 사유' })).toBeEnabled();
  });
});

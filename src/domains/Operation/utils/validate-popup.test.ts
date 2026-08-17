import { describe, expect, test } from 'vitest';

import type { PopupContent } from '@/domains/Operation/types';

import { validatePopupContent } from './validate-popup';

function createPopup(displayPriority: number): PopupContent {
  return {
    id: 1,
    title: '팝업',
    bodyMarkdown: '본문',
    imageFileName: '',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    displayPriority,
    createdAt: '2026-08-01 09:00',
    updatedAt: '2026-08-01 09:00',
  };
}

describe('팝업 노출 우선순위 검증', () => {
  test.each([Number.NaN, 0, -1, 1.5])(
    '우선순위가 1 이상의 정수가 아니면 저장을 거부한다: %s',
    (displayPriority) => {
      expect(validatePopupContent(createPopup(displayPriority))).toBe(
        '노출 우선순위는 1 이상의 정수로 입력해주세요.'
      );
    }
  );

  test('1 이상의 정수이면 저장할 수 있다', () => {
    expect(validatePopupContent(createPopup(1))).toBeNull();
  });
});

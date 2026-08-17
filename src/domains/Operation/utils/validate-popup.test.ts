import { describe, expect, test } from 'vitest';

import type { PopupContent } from '@/domains/Operation/types';

import { validatePopupContent } from './validate-popup';

function createPopup(displayPriority: number): PopupContent {
  return {
    id: 1,
    title: '팝업',
    bodyMarkdown: '본문',
    imageFileName: '',
    startDate: '2026-08-01T09:00',
    endDate: '2026-08-31T18:00',
    displayPriority,
    createdAt: '2026-08-01 09:00',
    updatedAt: '2026-08-01 09:00',
  };
}

describe('팝업 노출 순서 검증', () => {
  test.each([Number.NaN, 0, -1, 1.5])(
    '노출 순서가 1 이상의 정수가 아니면 저장을 거부한다: %s',
    (displayPriority) => {
      expect(validatePopupContent(createPopup(displayPriority))).toBe(
        '노출 순서는 1 이상의 정수로 입력해주세요.'
      );
    }
  );

  test('1 이상의 정수이면 저장할 수 있다', () => {
    expect(validatePopupContent(createPopup(1))).toBeNull();
  });
});

describe('팝업 게시 일시 검증', () => {
  test('종료일시가 시작일시보다 빠르면 저장을 거부한다', () => {
    const popup = createPopup(10);

    expect(
      validatePopupContent({
        ...popup,
        startDate: '2026-08-10T10:00',
        endDate: '2026-08-10T09:59',
      })
    ).toBe('게시 종료일시는 시작일시보다 빠를 수 없습니다.');
  });

  test('시작일시와 종료일시가 같으면 저장할 수 있다', () => {
    const popup = createPopup(10);

    expect(
      validatePopupContent({
        ...popup,
        startDate: '2026-08-10T10:00',
        endDate: '2026-08-10T10:00',
      })
    ).toBeNull();
  });
});

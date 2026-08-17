import { describe, expect, test } from 'vitest';

import type { PopupContent } from '@/domains/Operation/types';

import {
  getNextPopupDisplayPriority,
  getVisiblePopupsForDate,
  sortPopupsByDisplayOrder,
} from './popup-display';

function createPopup(overrides: Partial<PopupContent> = {}): PopupContent {
  return {
    id: 1,
    title: '팝업',
    bodyMarkdown: '본문',
    imageFileName: '',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    displayPriority: 10,
    createdAt: '2026-08-01 09:00',
    updatedAt: '2026-08-01 09:00',
    ...overrides,
  };
}

describe('팝업 노출 순서', () => {
  test('우선순위, 생성 일시, id 오름차순으로 정렬한다', () => {
    const popups = [
      createPopup({ id: 4, displayPriority: 20 }),
      createPopup({ id: 3, createdAt: '2026-08-02 09:00' }),
      createPopup({ id: 2 }),
      createPopup({ id: 1 }),
    ];

    expect(sortPopupsByDisplayOrder(popups).map((popup) => popup.id)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(popups.map((popup) => popup.id)).toEqual([4, 3, 2, 1]);
  });

  test('기준 날짜가 게시 시작일 또는 종료일과 같아도 노출한다', () => {
    const popup = createPopup({
      startDate: '2026-08-10',
      endDate: '2026-08-20',
    });

    expect(getVisiblePopupsForDate([popup], '2026-08-10')).toEqual([popup]);
    expect(getVisiblePopupsForDate([popup], '2026-08-20')).toEqual([popup]);
  });

  test('게시 기간을 먼저 적용하고 노출 대상만 순서대로 반환한다', () => {
    const popups = [
      createPopup({
        id: 1,
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        displayPriority: 10,
      }),
      createPopup({
        id: 2,
        startDate: '2026-08-05',
        endDate: '2026-08-20',
        displayPriority: 20,
      }),
      createPopup({
        id: 3,
        startDate: '2026-08-11',
        endDate: '2026-08-30',
        displayPriority: 10,
      }),
    ];

    expect(
      getVisiblePopupsForDate(popups, '2026-08-07').map((popup) => popup.id)
    ).toEqual([1, 2]);
    expect(
      getVisiblePopupsForDate(popups, '2026-08-12').map((popup) => popup.id)
    ).toEqual([3, 2]);
  });
});

describe('신규 팝업 우선순위', () => {
  test('팝업이 없으면 10을 반환한다', () => {
    expect(getNextPopupDisplayPriority([])).toBe(10);
  });

  test('기존 최대 우선순위에 10을 더한다', () => {
    const popups = [
      createPopup({ id: 1, displayPriority: 10 }),
      createPopup({ id: 2, displayPriority: 30 }),
      createPopup({ id: 3, displayPriority: 20 }),
    ];

    expect(getNextPopupDisplayPriority(popups)).toBe(40);
  });
});

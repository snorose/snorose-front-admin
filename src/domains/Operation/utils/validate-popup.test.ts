import { describe, expect, test } from 'vitest';

import type { PopupContent } from '@/domains/Operation/types';

import { validatePopupContent, validatePopupImage } from './validate-popup';

function createPopup(displayPriority = 0): PopupContent {
  return {
    id: 1,
    title: '팝업',
    bodyMarkdown: '',
    imageFileName: '',
    startDate: '2026-10-20',
    endDate: '2026-10-22',
    displayPriority,
    createdAt: '',
    updatedAt: '',
  };
}

describe('팝업 API 입력 정책', () => {
  test.each([Number.NaN, -1, 1.5])(
    '음수·소수·빈 순서를 거부한다: %s',
    (order) => {
      expect(validatePopupContent(createPopup(order), 2)).toBe(
        '노출 순서는 0 이상의 정수로 입력해주세요.'
      );
    }
  );
  test('등록은 0~N, 수정은 0~N-1까지 허용한다', () => {
    expect(validatePopupContent(createPopup(0), 0)).toBeNull();
    expect(validatePopupContent(createPopup(2), 2)).toBeNull();
    expect(validatePopupContent(createPopup(2), 1)).toBe(
      '노출 순서는 0부터 1까지 입력해주세요.'
    );
  });
  test('본문과 이미지 없이 등록할 수 있고 문서에 없는 본문 길이 제한을 적용하지 않는다', () => {
    expect(validatePopupContent(createPopup())).toBeNull();
    expect(
      validatePopupContent({
        ...createPopup(),
        bodyMarkdown: '가'.repeat(3001),
      })
    ).toBeNull();
  });
  test('본문 링크 검증은 유지한다', () => {
    expect(
      validatePopupContent({
        ...createPopup(),
        bodyMarkdown: '[링크](javascript:alert)',
      })
    ).not.toBeNull();
  });
  test('종료일이 시작일보다 빠르면 거부하고 같은 날짜는 허용한다', () => {
    expect(
      validatePopupContent({ ...createPopup(), endDate: '2026-10-19' })
    ).toBe('게시 종료일은 시작일보다 빠를 수 없습니다.');
    expect(
      validatePopupContent({ ...createPopup(), endDate: '2026-10-20' })
    ).toBeNull();
  });
  test('기존 CDN 이미지의 표시용 이름은 파일 검증 대상이 아니다', () => {
    expect(
      validatePopupContent({ ...createPopup(), imageFileName: '기존 이미지' })
    ).toBeNull();
  });
  test.each(['png', 'jpg', 'jpeg', 'webp'])('허용한 이미지 형식: %s', (ext) => {
    expect(
      validatePopupImage(
        new File(['image'], `팝업.${ext}`, {
          type: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
        })
      )
    ).toBeNull();
  });
  test('GIF와 확장자만 바꾼 파일은 거부한다', () => {
    expect(
      validatePopupImage(new File(['gif'], '팝업.gif', { type: 'image/gif' }))
    ).not.toBeNull();
    expect(
      validatePopupImage(new File(['text'], '팝업.png', { type: 'text/plain' }))
    ).not.toBeNull();
  });
  test('10MB 경계를 검증한다', () => {
    const file = new File(['image'], '팝업.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', {
      value: 10 * 1024 * 1024,
      configurable: true,
    });
    expect(validatePopupImage(file)).toBeNull();
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 });
    expect(validatePopupImage(file)).toBe(
      '파일 크기는 10MB를 초과할 수 없습니다.'
    );
  });
});

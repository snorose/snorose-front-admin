import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createMockPopupAPI } from './popup-api';
import { createMockPopupDetails } from './popups';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-20T14:59:59Z'));
});
afterEach(() => vi.useRealTimers());

const request = {
  title: '새 팝업',
  startDate: '2026-10-20',
  endDate: '2026-10-22',
};

async function allOrders(api: ReturnType<typeof createMockPopupAPI>) {
  const { result: first } = await api.list(0);
  const rows = [...first.data];
  for (let page = 1; page < first.totalPage; page++)
    rows.push(...(await api.list(page)).result.data);
  return rows.map((popup) => popup.displayOrder).sort((a, b) => a - b);
}

describe('API 스펙에 맞는 팝업 목 데이터', () => {
  test('목록은 성공 응답 형식과 10개 페이지 단위, 최신순을 유지한다', async () => {
    const api = createMockPopupAPI();
    const first = await api.list(0);
    expect(first).toMatchObject({
      isSuccess: true,
      code: 1000,
      message: '요청에 성공하였습니다.',
      result: { totalCount: 12, totalPage: 2, currentCount: 10, hasNext: true },
    });
    expect(first.result.data.map((popup) => popup.id)).toEqual([
      12, 11, 10, 9, 8, 7, 6, 5, 4, 3,
    ]);
    expect(first.result.data[0]).not.toHaveProperty('description');
    expect(first.result.data[0]).not.toHaveProperty('imageUrl');
    expect(await api.list(1)).toMatchObject({
      result: { currentCount: 2, hasNext: false, data: [{ id: 2 }, { id: 1 }] },
    });
    expect(new Set(first.result.data.map((popup) => popup.status))).toEqual(
      new Set(['ACTIVE', 'SCHEDULED', 'ENDED'])
    );
  });
  test('상세는 nullable 본문·이미지와 날짜 및 0 기반 고유 순번을 제공한다', async () => {
    const fixtures = createMockPopupDetails();
    expect(
      fixtures.every((popup) => /^\d{4}-\d{2}-\d{2}$/.test(popup.startDate))
    ).toBe(true);
    expect(
      fixtures.some(
        (popup) => popup.description === null && popup.imageUrl === null
      )
    ).toBe(true);
    expect(fixtures.some((popup) => popup.imageUrl !== null)).toBe(true);
    expect(fixtures.some((popup) => popup.updatedAt === null)).toBe(true);
    const api = createMockPopupAPI(fixtures);
    expect((await api.detail(1)).result).toEqual(fixtures[0]);
    expect(await allOrders(api)).toEqual(
      Array.from({ length: 12 }, (_, index) => index)
    );
  });
  test('KST 종료일 당일은 진행중이며 자정부터 종료된다', async () => {
    const api = createMockPopupAPI([
      {
        ...createMockPopupDetails()[0],
        startDate: '2026-10-20',
        endDate: '2026-10-20',
      },
    ]);
    expect((await api.detail(1)).result.status).toBe('ACTIVE');
    vi.setSystemTime(new Date('2026-10-20T15:00:00Z'));
    expect((await api.detail(1)).result.status).toBe('ENDED');
  });
  test('등록한 위치에 삽입하고 다른 순번을 이동한다', async () => {
    const api = createMockPopupAPI();
    const created = await api.create({ ...request, displayOrder: 0 });
    expect(created.result.id).toBe(13);
    expect((await api.detail(13)).result).toMatchObject({
      ...request,
      displayOrder: 0,
      description: null,
      imageUrl: null,
      updatedAt: null,
    });
    expect((await api.detail(1)).result.displayOrder).toBe(1);
    expect((await api.list(0)).result.data[0].id).toBe(13);
    expect(await allOrders(api)).toEqual(
      Array.from({ length: 13 }, (_, index) => index)
    );
  });
  test('수정 시 생략한 필드를 유지하고 순서를 양방향으로 이동한다', async () => {
    const api = createMockPopupAPI();
    const original = (await api.detail(1)).result;
    await api.update(1, { displayOrder: 11 });
    expect((await api.detail(1)).result).toMatchObject({
      title: original.title,
      description: original.description,
      imageUrl: original.imageUrl,
      displayOrder: 11,
    });
    expect((await api.detail(2)).result.displayOrder).toBe(0);
    await api.update(1, { title: '변경 제목', displayOrder: 0 });
    expect((await api.detail(1)).result).toMatchObject({
      title: '변경 제목',
      displayOrder: 0,
    });
    expect(await allOrders(api)).toEqual(
      Array.from({ length: 12 }, (_, index) => index)
    );
  });
  test('본문 및 기존 이미지 삭제를 반영한다', async () => {
    const api = createMockPopupAPI();
    await api.update(1, { description: null, removeImage: true });
    expect((await api.detail(1)).result).toMatchObject({
      description: null,
      imageUrl: null,
    });
  });
  test('이미지 등록·교체는 페이지 미리보기에 사용할 URL로 보존한다', async () => {
    const api = createMockPopupAPI([]);
    const image = new File(['first'], 'first.png', { type: 'image/png' });
    await api.create(request, image);
    expect((await api.detail(1)).result.imageUrl).toMatch(
      /^data:image\/png;base64,/
    );
    const replacement = new File(['second'], 'second.webp', {
      type: 'image/webp',
    });
    await api.update(1, {}, replacement);
    expect((await api.detail(1)).result.imageUrl).toMatch(
      /^data:image\/webp;base64,/
    );
    await expect(api.update(1, { removeImage: true }, image)).rejects.toThrow(
      '이미지 교체와 삭제를 동시에 요청할 수 없습니다.'
    );
  });
  test('삭제하면 순번을 당기고 삭제된 ID는 다시 사용하지 않는다', async () => {
    const api = createMockPopupAPI();
    await api.delete(1);
    await expect(api.detail(1)).rejects.toThrow('팝업을 찾을 수 없습니다.');
    expect((await api.detail(2)).result.displayOrder).toBe(0);
    expect(await allOrders(api)).toEqual(
      Array.from({ length: 11 }, (_, index) => index)
    );
    expect((await api.create(request)).result.id).toBe(13);
  });
  test('빈 목록은 API 문서의 0개 응답을 반환한다', async () => {
    const api = createMockPopupAPI([]);
    expect((await api.list(0)).result).toEqual({
      data: [],
      totalCount: 0,
      totalPage: 0,
      currentCount: 0,
      hasNext: false,
    });
    expect((await api.create(request)).result.id).toBe(1);
    expect((await api.detail(1)).result.displayOrder).toBe(0);
  });
  test('순번 범위와 날짜 형식을 검증하고 실패 시 기존 데이터를 보존한다', async () => {
    const api = createMockPopupAPI();
    await expect(api.create({ ...request, displayOrder: 13 })).rejects.toThrow(
      '노출 순서'
    );
    await expect(api.update(1, { displayOrder: 12 })).rejects.toThrow(
      '노출 순서'
    );
    await expect(api.update(1, { endDate: '2026-01-01' })).rejects.toThrow(
      '게시 종료일'
    );
    await expect(
      api.create({ ...request, startDate: '2026-02-30' })
    ).rejects.toThrow('입력 값을 확인해주세요.');
    await expect(
      api.create({ ...request, startDate: '2026-10-20T09:00:00' })
    ).rejects.toThrow('입력 값을 확인해주세요.');
    expect((await api.list(0)).result.totalCount).toBe(12);
  });
});

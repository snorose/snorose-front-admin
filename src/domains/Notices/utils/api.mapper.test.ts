import { describe, expect, test } from 'vitest';

import {
  createMockNoticeCreateResponse,
  createMockNoticeListResponse,
  createSampleNotices,
} from '@/test/fixtures/notices';

import { NOTICE_BOARD_CATALOG, getNoticeCategories } from '../constants/boards';
import type { NoticeForm } from '../types';
import { fromAdminNotice, toCreateNoticeRequest } from './api.mapper';
import { validateNotice } from './notice';

const form: NoticeForm = {
  board: '주거',
  category: '자취',
  title: '주거 게시판 이용 안내',
  content: '계약 전 확인사항을 안내드립니다.',
  attachments: [],
  pinned: true,
  scheduledAt: '2026-11-10T09:30',
};

describe('공개 게시판과 API 계약', () => {
  test('공개 게시판 27개를 중복 없이 제공하고 미오픈·모아보기·문의 게시판을 제외한다', () => {
    const ids = NOTICE_BOARD_CATALOG.map((board) => board.id);
    expect(ids).toHaveLength(27);
    expect(new Set(ids).size).toBe(27);
    for (const id of [13, 20, 25, 70, 1015, 1016])
      expect(ids).not.toContain(id);
    expect(getNoticeCategories('공지사항')).toEqual([
      '일반',
      '회계',
      '점검',
      '이벤트',
      '기타',
    ]);
    expect(getNoticeCategories('주거')).toEqual([
      '명재관',
      '외부기숙사',
      '자취',
    ]);
    expect(getNoticeCategories('게임')).toEqual(['PC', '모바일', '기타']);
    expect(getNoticeCategories('반려동물')).toEqual([
      '개숙희',
      '숙냥숙냥',
      '숙햄숙햄',
      '자유',
    ]);
    expect(getNoticeCategories('책')).toEqual([]);
    for (const board of NOTICE_BOARD_CATALOG) {
      const emptyCategory = { ...form, board: board.name, category: '' };
      expect(validateNotice(emptyCategory, 'published', [])).toBeNull();
      expect(
        toCreateNoticeRequest(emptyCategory, 'published')
      ).not.toHaveProperty('category');
    }
  });

  test('목 응답은 문서의 envelope·페이지·컬럼과 상태값을 그대로 사용한다', () => {
    const response = createMockNoticeListResponse(0);
    expect(response).toMatchObject({
      isSuccess: true,
      code: 1000,
      result: { hasNext: true, totalPage: 3, totalCount: 30, currentCount: 10 },
    });
    expect(response.result.data[0]).toMatchObject({
      postId: 1082,
      boardId: 12,
      boardName: '공지사항',
      adminNickname: '운영리자',
      status: 'PUBLISHED',
      isNew: true,
      isPinned: false,
    });
    expect(Object.keys(response.result.data[0]).sort()).toEqual(
      [
        'postId',
        'boardId',
        'boardName',
        'title',
        'content',
        'adminNickname',
        'viewCount',
        'likeCount',
        'scrapCount',
        'status',
        'isNew',
        'isPinned',
        'updatedAt',
      ].sort()
    );
    expect(response.result.data[0].updatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
    );
    const lastPage = createMockNoticeListResponse(2).result;
    expect(lastPage.hasNext).toBe(false);
    expect(lastPage.currentCount).toBe(10);
    expect(lastPage.data.at(-1)?.status).toBe('PRIVATE');
  });

  test('모든 공개 게시판을 실제 ID와 연결한 예시 공지가 있다', () => {
    const notices = createSampleNotices();
    for (const board of NOTICE_BOARD_CATALOG)
      expect(
        notices.some(
          (notice) => notice.boardId === board.id && notice.board === board.name
        )
      ).toBe(true);
  });

  test('NEW는 수정일과 관계없이 API isNew 값을 따른다', () => {
    const notice = createSampleNotices()[0];
    const item = createMockNoticeListResponse().result.data[0];
    const mapped = fromAdminNotice(
      { ...item, isNew: false, updatedAt: '2026-11-05T09:00:00' },
      notice
    );
    expect(mapped.isNew).toBe(false);
    expect(mapped.updatedAt).toBe('2026-11-05T09:00:00+09:00');
  });

  test('목록에 없는 작성자 ID·작성일·예약·카테고리·첨부는 샘플로 보완하지 않는다', () => {
    const item = createMockNoticeListResponse().result.data[0];
    const mapped = fromAdminNotice({
      ...item,
      updatedAt: '2026-09-29T00:13:45.312433',
    });
    expect(mapped).toMatchObject({
      authorId: '',
      createdAt: '',
      publishedAt: null,
      scheduledAt: '',
      category: '',
      attachments: [],
      updatedAt: '2026-09-29T00:13:45.312433+09:00',
    });
    expect(Number.isFinite(Date.parse(mapped.updatedAt))).toBe(true);
    expect(
      fromAdminNotice({ ...item, updatedAt: '2026-09-29T00:13:45Z' }).updatedAt
    ).toBe('2026-09-29T00:13:45Z');
    expect(
      fromAdminNotice({ ...item, updatedAt: '2026-09-29T00:13:45+09:00' })
        .updatedAt
    ).toBe('2026-09-29T00:13:45+09:00');
  });

  test('즉시 게시와 임시저장 요청에 예약 시각이나 UI 전용 필드를 보내지 않는다', () => {
    expect(toCreateNoticeRequest(form, 'published')).toEqual({
      boardId: 41,
      category: '자취',
      title: form.title,
      content: `<p>${form.content}</p>`,
      images: [],
      isDraft: false,
      isScheduled: false,
      scheduledAt: null,
    });
    expect(toCreateNoticeRequest(form, 'draft')).toMatchObject({
      isDraft: true,
      isScheduled: false,
      scheduledAt: null,
    });
    expect(
      toCreateNoticeRequest({ ...form, category: '' }, 'published')
    ).not.toHaveProperty('category');
    expect(
      toCreateNoticeRequest(
        { ...form, board: '공지사항', category: '회계' },
        'published'
      )
    ).toMatchObject({ boardId: 12, category: '회계' });
    for (const status of ['published', 'draft', 'scheduled'] as const) {
      const unselected = { ...form, board: '공지사항', category: '' };
      expect(
        validateNotice(
          unselected,
          status,
          [],
          undefined,
          Date.parse('2026-11-06T00:00:00+09:00')
        )
      ).toBeNull();
      expect(toCreateNoticeRequest(unselected, status)).not.toHaveProperty(
        'category'
      );
    }
  });

  test('예약과 첨부는 LocalDateTime, PHOTO/VIDEO 메타데이터로 변환한다', () => {
    const request = toCreateNoticeRequest(
      {
        ...form,
        attachments: [
          {
            id: 'image',
            name: '안내.png',
            type: 'image/png',
            size: 100,
            url: 'blob:preview',
            fileComment: '일정 안내',
          },
          {
            id: 'video',
            name: '안내.mp4',
            type: 'video/mp4',
            size: 200,
            url: 'blob:preview-video',
          },
        ],
      },
      'scheduled'
    );
    expect(request).toMatchObject({
      isDraft: false,
      isScheduled: true,
      scheduledAt: '2026-11-10T09:30:00',
      images: [
        { type: 'PHOTO', fileName: '안내.png', fileComment: '일정 안내' },
        { type: 'VIDEO', fileName: '안내.mp4', fileComment: '' },
      ],
    });
    expect(createMockNoticeCreateResponse(request, 2000).result).toMatchObject({
      postId: 2000,
      isDraft: false,
      isScheduled: true,
      scheduledAt: request.scheduledAt,
    });
  });

  test('제목 길이·첨부 종류·게시판별 카테고리를 검증한다', () => {
    expect(
      validateNotice({ ...form, title: '가'.repeat(127) }, 'draft', [])
    ).toBeNull();
    expect(
      validateNotice({ ...form, title: '가'.repeat(128) }, 'draft', [])
    ).toMatch('127');
    expect(
      validateNotice(
        { ...form, board: '공지사항', category: '교내' },
        'draft',
        []
      )
    ).toMatch('카테고리');
    const unsupported = {
      ...form,
      attachments: [
        {
          id: 'pdf',
          name: '안내.pdf',
          type: 'application/pdf',
          size: 10,
          url: 'blob:pdf',
        },
      ],
    };
    expect(validateNotice(unsupported, 'published', [])).toMatch(
      '이미지와 동영상'
    );
    expect(() => toCreateNoticeRequest(unsupported, 'published')).toThrow(
      '이미지와 동영상'
    );
  });
});

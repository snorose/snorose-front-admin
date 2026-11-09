import { describe, expect, test } from 'vitest';

import { createSampleNotices } from '@/test/fixtures/notices';

import type { NoticeForm } from '../types';
import {
  filterNotices,
  getLatestNoticeId,
  publishScheduledNotices,
  sortNotices,
  validateNotice,
} from './notice';

const now = Date.parse('2026-11-05T10:00:00+09:00');
const samples = () => createSampleNotices(new Date(now));
const form: NoticeForm = {
  title: '새 공지',
  content: '본문',
  board: '공지사항',
  category: '일반',
  pinned: false,
  scheduledAt: '',
  attachments: [],
};

describe('공지 목록 정책', () => {
  test('최신 1개, 수동 고정, 임시저장, 예약, 게시, 비공개 순서로 정렬한다', () => {
    const notices = samples();
    const sorted = sortNotices([...notices].reverse());
    expect(sorted.slice(0, 6).map((item) => item.id)).toEqual([
      1082, 1081, 1080, 1079, 1078, 1077,
    ]);
    expect(
      sorted
        .slice(6, -1)
        .every(
          (notice) =>
            notice.status === 'published' && !notice.pinned && !notice.isNew
        )
    ).toBe(true);
    expect(sorted.at(-1)?.status).toBe('private');
    expect(
      sortNotices(notices, 'oldest')
        .slice(0, 3)
        .map((item) => item.id)
    ).toEqual([1082, 1080, 1081]);
  });

  test('이전 글을 수정해도 최초 게시일 기준의 NEW와 게시 순서를 유지한다', () => {
    const notices = samples();
    const changed = notices.map((notice) =>
      notice.id === 1076
        ? { ...notice, updatedAt: new Date(now).toISOString() }
        : notice
    );
    expect(getLatestNoticeId(changed)).toBe(1082);
    expect(sortNotices(changed).map((item) => item.id)).toEqual(
      sortNotices(notices).map((item) => item.id)
    );
  });

  test('게시판 대분류·하위 게시판·상태·본문 검색을 조합한다', () => {
    const notices = samples();
    expect(filterNotices(notices, { group: '커뮤니티' })).toHaveLength(3);
    expect(
      filterNotices(notices, {
        group: '커뮤니티',
        board: '함박눈방',
        status: 'published',
        scope: 'content',
        keyword: '따뜻한',
      }).map((item) => item.board)
    ).toEqual(['함박눈방']);
    expect(
      filterNotices(notices, { scope: 'title', keyword: '따뜻한' })
    ).toHaveLength(0);
    expect(filterNotices(notices, { kind: 'new' })).toHaveLength(1);
    expect(filterNotices(notices, { author: 'sample-admin-0' })).toHaveLength(
      notices.filter((notice) => notice.authorId === 'sample-admin-0').length
    );
  });

  test('마지막 수정일 기간의 마지막 날은 한국 시간 자정까지 포함한다', () => {
    const notices = samples();
    expect(
      filterNotices(notices, {
        startDate: '2026-11-04',
        endDate: '2026-11-04',
      }).map((item) => item.id)
    ).toEqual([1082]);
  });

  test('게시판별 NEW를 모두 유지하고 작성일이 없는 목록은 서버 순서를 보존한다', () => {
    const notices = samples()
      .slice(0, 3)
      .map((notice, index) => ({
        ...notice,
        id: [10, 99, 12][index],
        isNew: true,
        createdAt: '',
        publishedAt: null,
      }));
    expect(sortNotices(notices).map((notice) => notice.id)).toEqual([
      10, 99, 12,
    ]);
    expect(sortNotices(notices, 'oldest').map((notice) => notice.id)).toEqual([
      12, 99, 10,
    ]);
    expect(filterNotices(notices, { kind: 'new' })).toHaveLength(3);
    expect(filterNotices(notices, { kind: 'normal' })).toHaveLength(0);
    expect(filterNotices(notices, { kind: 'pinned' })).toHaveLength(0);
  });

  test('작성일 대신 실제 응답의 수정일로 기간을 검색한다', () => {
    const notices = [
      {
        ...samples()[0],
        createdAt: '',
        updatedAt: '2026-11-06T00:00:00+09:00',
      },
    ];
    expect(
      filterNotices(notices, { startDate: '2026-11-06', endDate: '2026-11-06' })
    ).toHaveLength(1);
    expect(filterNotices(notices, { endDate: '2026-11-05' })).toHaveLength(0);
  });
});

describe('공지 저장과 예약', () => {
  test('게시판과 제목이 필수이고, 본문 없이 임시저장할 수 있다', () => {
    expect(validateNotice({ ...form, board: '' }, 'draft', [])).toMatch(
      '게시판'
    );
    expect(validateNotice({ ...form, title: ' ' }, 'draft', [])).toMatch(
      '제목'
    );
    expect(validateNotice({ ...form, content: '' }, 'draft', [])).toBeNull();
    expect(validateNotice({ ...form, content: '' }, 'published', [])).toMatch(
      '본문'
    );
  });

  test('과거·누락 예약 시간을 거부하고 한국 시간 기준 미래 일시를 허용한다', () => {
    expect(
      validateNotice(
        { ...form, scheduledAt: '2026-11-05T09:59' },
        'scheduled',
        [],
        undefined,
        now
      )
    ).toMatch('이후');
    expect(validateNotice(form, 'scheduled', [], undefined, now)).toMatch(
      '이후'
    );
    expect(
      validateNotice(
        { ...form, scheduledAt: '2026-11-05T10:01' },
        'scheduled',
        [],
        undefined,
        now
      )
    ).toBeNull();
  });

  test('고정 4개 한도를 적용하되 기존 고정 글 수정과 고정 해제는 허용한다', () => {
    const notices = samples()
      .slice(0, 4)
      .map((notice) => ({ ...notice, pinned: true }));
    expect(
      validateNotice({ ...form, pinned: true }, 'published', notices)
    ).toMatch('최대 4개');
    expect(
      validateNotice(
        { ...form, pinned: true },
        'published',
        notices,
        notices[0].id
      )
    ).toBeNull();
    expect(
      validateNotice(form, 'published', notices, notices[0].id)
    ).toBeNull();
  });

  test('예약 시각에 게시 상태로 전환되며 새 최신 공지가 된다', () => {
    const notices = samples();
    const target = notices.find((notice) => notice.status === 'scheduled')!;
    const at = Date.parse(`${target.scheduledAt}+09:00`);
    expect(
      publishScheduledNotices(notices, at - 1).find(
        (notice) => notice.id === target.id
      )?.status
    ).toBe('scheduled');
    const published = publishScheduledNotices(notices, at);
    expect(published.find((notice) => notice.id === target.id)?.status).toBe(
      'published'
    );
    expect(getLatestNoticeId(published)).toBe(target.id);
    expect(sortNotices(published)[0].id).toBe(target.id);
    expect(
      publishScheduledNotices([{ ...target, scheduledAt: '' }], at)[0].status
    ).toBe('scheduled');
  });
});

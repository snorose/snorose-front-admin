import { BOARD_NAMES } from '@/shared/utils';

/**
 * snorose-front 공개 게시판 스냅샷 (2026-11-05).
 * 출처: shared/lib/board-registry.ts, shared/constant/board.js,
 * shared/constant/board-config.ts, shared/lib/new-board.ts.
 * new-board는 현재 OFF: 25·70·1015·1016 제외 (운영 상태 확인).
 * 베숙트는 모아보기이며 NOTICE 미지원, 문의·신고는 별도 기능이므로 제외.
 * 공지사항·이벤트는 각각 표시하고, 게시판별 카테고리는 선택 사항으로 사용합니다.
 */
export const NOTICE_CATEGORIES = [
  '일반',
  '회계',
  '점검',
  '이벤트',
  '기타',
] as const;

const NOTICE_BOARD_CONFIG = [
  {
    id: 12,
    group: '공지사항',
    categories: NOTICE_CATEGORIES,
  },
  { id: 14, group: '이벤트', categories: [] },
  {
    id: 21,
    group: '커뮤니티',
    categories: [],
  },
  {
    id: 22,
    group: '커뮤니티',
    categories: [],
  },
  {
    id: 23,
    group: '커뮤니티',
    categories: [],
  },
  {
    id: 60,
    group: '공식 게시판',
    categories: [],
  },
  {
    id: 61,
    group: '공식 게시판',
    categories: [],
  },
  {
    id: 62,
    group: '공식 게시판',
    categories: [],
  },
  {
    id: 43,
    group: '로즈 라이프',
    categories: ['교내', '교외'],
  },
  {
    id: 41,
    group: '로즈 라이프',
    categories: ['명재관', '외부기숙사', '자취'],
  },
  {
    id: 1001,
    group: '문화생활',
    categories: ['영화', '시리즈', '예능', 'OTT'],
  },
  {
    id: 1002,
    group: '문화생활',
    categories: ['애니', '만화', '웹툰', '웹소설'],
  },
  { id: 1003, group: '문화생활', categories: [] },
  {
    id: 1004,
    group: '문화생활',
    categories: ['국내', '해외'],
  },
  {
    id: 1005,
    group: '문화생활',
    categories: ['콘서트', '뮤지컬', '연극'],
  },
  {
    id: 1006,
    group: '문화생활',
    categories: [],
  },
  {
    id: 1007,
    group: '문화생활',
    categories: ['국내', '해외'],
  },
  {
    id: 1008,
    group: '문화생활',
    categories: [],
  },
  {
    id: 1009,
    group: '문화생활',
    categories: [],
  },
  {
    id: 1010,
    group: '문화생활',
    categories: ['개숙희', '숙냥숙냥', '숙햄숙햄', '자유'],
  },
  { id: 1011, group: '문화생활', categories: [] },
  { id: 1013, group: '문화생활', categories: [] },
  {
    id: 1014,
    group: '문화생활',
    categories: ['PC', '모바일', '기타'],
  },
  { id: 1012, group: '문화생활', categories: [] },
  {
    id: 54,
    group: '커리어',
    categories: ['어학', '자격증'],
  },
  {
    id: 71,
    group: '캠퍼스',
    categories: ['교환학생', '어학연수'],
  },
  {
    id: 32,
    group: '시험후기',
    categories: [],
  },
] as const;

// 게시판 표기는 게시글 관리와 같은 공통 사전을 사용합니다.
export const NOTICE_BOARD_CATALOG = NOTICE_BOARD_CONFIG.map((board) => ({
  ...board,
  name: BOARD_NAMES[board.id],
}));

export const NOTICE_BOARD_GROUPS = [
  ...new Set(NOTICE_BOARD_CATALOG.map((board) => board.group)),
].map((label) => ({
  label,
  boards: NOTICE_BOARD_CATALOG.filter((board) => board.group === label).map(
    (board) => board.name as string
  ),
}));
export const NOTICE_BOARDS: readonly string[] = NOTICE_BOARD_CATALOG.map(
  (board) => board.name
);

export function getNoticeBoard(name: string) {
  return NOTICE_BOARD_CATALOG.find((board) => board.name === name);
}

export function getNoticeCategories(name: string): readonly string[] {
  return getNoticeBoard(name)?.categories ?? [];
}

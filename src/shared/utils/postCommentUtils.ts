import type { StatusBadgeTone } from '@/shared/components';

export const BOARD_NAMES: Record<number, string> = {
  11: 'about 스노로즈',
  12: '공지사항',
  13: '문의게시판/신고게시판',
  14: '이벤트',
  20: '베숙트',
  21: '첫눈온방',
  22: '함박눈방',
  23: '만년설방',
  // 24: '달글게시판',
  25: '홍보',
  31: '강의후기',
  32: '시험후기',
  41: '주거',
  // 42: '벼룩장터',
  43: '숙플레이스',
  // 51: '알바 및 채용',
  // 52: '취업후기',
  // 53: '취업준비',
  54: '어학·자격증',
  60: '총학생회',
  61: '졸업준비위원회',
  62: '재정감사위원회',
  70: '동아리 이모저모',
  71: '교환학생·어학연수',
  1001: '영상 컨텐츠',
  1002: '애니·만화·웹툰·웹소설',
  1003: '책',
  1004: '음악',
  1005: '공연',
  1006: '전시',
  1007: '여행',
  1008: '요리·레시피',
  1009: '스포츠·운동',
  1010: '반려동물',
  1011: '건강',
  1012: '금융',
  1013: '뷰티',
  1014: '게임',
  1015: '리빙·소품',
  1016: '여성학',
};

export const BOARD_OPTIONS = Object.entries(BOARD_NAMES).map(([id, name]) => ({
  label: name,
  value: Number(id),
}));

// boardId → URL board key (예: 22 → large-snow). 출처: snorose-front board-registry.ts
export const BOARD_KEYS: Record<number, string> = {
  12: 'notice',
  13: 'support',
  14: 'event',
  20: 'besookt',
  21: 'first-snow',
  22: 'large-snow',
  23: 'permanent-snow',
  32: 'exam-review',
  41: 'residence',
  43: 'sookplace',
  60: 'student-council',
  61: 'graduation-preparation',
  62: 'finance-audit',
  71: 'studyabroad',
  1001: 'video-content',
  1002: 'anime-comics',
  1003: 'book',
  1004: 'music',
  1005: 'performance',
  1006: 'exhibition',
  1007: 'trip',
  1008: 'cooking',
  1009: 'sport',
  1010: 'pet',
  1011: 'health',
};

export const getBoardKey = (boardId: number): string | undefined =>
  BOARD_KEYS[boardId];

export const getBoardKeyByName = (boardName: string): string | undefined => {
  const boardEntry = Object.entries(BOARD_NAMES).find(
    ([, name]) => name === boardName
  );

  if (!boardEntry) return undefined;

  return getBoardKey(Number(boardEntry[0]));
};

export const stripHtmlTags = (html: string | null | undefined): string => {
  if (!html) return '-';
  return (
    html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim() || '-'
  );
};

// ID 포맷터
export const formatCommentId = (id: number) => String(id).padStart(3, '0');
export const formatPostId = (id: number) => String(id).padStart(3, '0');
interface StatusBadgeInfo {
  label: string;
  tone: StatusBadgeTone;
}

export type AdminStatus =
  | 'USER_DELETED'
  | 'ADMIN_DELETED'
  | 'SANCTIONED'
  | 'AUTO_HIDDEN'
  | 'ADMIN_HIDDEN'
  | 'VISIBLE'
  | 'DESANCTIONED';

export const STATUS_OPTIONS: {
  label: string;
  value: AdminStatus;
  tone: StatusBadgeTone;
}[] = [
  { label: '유저 삭제', value: 'USER_DELETED', tone: 'danger' },
  { label: '어드민 삭제', value: 'ADMIN_DELETED', tone: 'danger' },
  { label: '신고다수+비공개', value: 'AUTO_HIDDEN', tone: 'warning' },
  { label: '어드민 비공개', value: 'ADMIN_HIDDEN', tone: 'warning' },
  { label: '노출', value: 'VISIBLE', tone: 'success' },
];

export function removeObsoleteAdminStatuses<
  T extends { adminCommonStatuses?: string[] },
>(params: T): T {
  if (!params.adminCommonStatuses) return params;
  const statuses = params.adminCommonStatuses.filter(
    (status) => status !== 'SANCTIONED' && status !== 'DESANCTIONED'
  );
  return {
    ...params,
    adminCommonStatuses: statuses.length ? statuses : undefined,
  };
}

/**
 * 게시글에 대한 상태 배지 리스트 반환
 */
export function getPostStatusBadges(post: {
  isVisible?: boolean;
  deletedAt?: string | null;
  reportCount: number;
  adminCommonStatuses?: string[];
}): StatusBadgeInfo[] {
  const statuses = post.adminCommonStatuses || [];
  const badges: StatusBadgeInfo[] = [];

  // 1. 신고 및 비공개 여부 (Report & Private)
  const isReportedMultiple =
    statuses.includes('AUTO_HIDDEN') ||
    statuses.includes('REPORTED') ||
    post.reportCount >= 5;

  if (isReportedMultiple) {
    badges.push({
      label: '신고 다수',
      tone: 'warning',
    });
  } else if (post.isVisible === false && statuses.includes('ADMIN_HIDDEN')) {
    badges.push({
      label: '리자 비공개',
      tone: 'warning',
    });
  }

  // 2. 징계 여부
  if (statuses.includes('SANCTIONED')) {
    badges.push({
      label: '징계',
      tone: 'accent',
    });
  }

  // 3. 삭제 여부
  if (statuses.includes('ADMIN_DELETED') || post.deletedAt != null) {
    badges.push({
      label: '어드민 삭제',
      tone: 'danger',
    });
  } else if (statuses.includes('USER_DELETED')) {
    badges.push({
      label: '유저 삭제',
      tone: 'danger',
    });
  }

  // 매칭되는 상태가 없는 경우 '노출' 표시
  if (badges.length === 0) {
    badges.push({
      label: '노출',
      tone: 'success',
    });
  }

  return badges;
}

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
  24: '달글게시판',
  31: '강의후기',
  32: '시험후기',
  41: '주거',
  42: '벼룩장터',
  43: '속플페이스',
  51: '알바 및 채용',
  52: '취업후기',
  53: '취업준비',
  60: '총학생회',
  61: '졸업준비위원회',
  62: '재정감사위원회',
  70: '교환학생/어학연수',
  91: '홍보게시판',
};

export const BOARD_OPTIONS = [11, 12, 21, 22, 23, 32, 60, 61, 62].map((id) => ({
  label: BOARD_NAMES[id] ?? `게시판 ${id}`,
  value: id,
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
  60: 'student-council',
  61: 'graduation-preparation',
  62: 'finance-audit',
};

export const getBoardKey = (boardId: number): string | undefined =>
  BOARD_KEYS[boardId];

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

export const STATUS_OPTIONS: { label: string; value: AdminStatus }[] = [
  { label: '유저 삭제', value: 'USER_DELETED' },
  { label: '어드민 삭제', value: 'ADMIN_DELETED' },
  { label: '징계', value: 'SANCTIONED' },
  { label: '신고다수+비공개', value: 'AUTO_HIDDEN' },
  { label: '어드민 비공개', value: 'ADMIN_HIDDEN' },
  { label: '노출', value: 'VISIBLE' },
  { label: '징계없음', value: 'DESANCTIONED' },
];

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
      label: '리자 삭제',
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

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

export const getRowStyle = (status: string) => {
  if (status.startsWith('신고누적')) {
    return 'bg-[#FFF9E6] hover:bg-[#FFF2CC] border-b border-gray-100 transition-colors text-yellow-950';
  }
  switch (status) {
    case '삭제됨':
      return 'bg-[#FFF0F0] hover:bg-[#FFE3E3] border-b border-gray-100 transition-colors text-gray-500 opacity-90';
    case '관리자삭제':
      return 'bg-[#FFEBEB] hover:bg-[#FFD6D6] border-b border-gray-100 transition-colors text-red-950';
    case '관리자비공개':
      return 'bg-[#F5F7FA] hover:bg-[#E4E8ED] border-b border-gray-100 transition-colors text-slate-900';
    case '복구':
      return 'bg-[#EBF7EE] hover:bg-[#D5EEDC] border-b border-gray-100 transition-colors text-green-950';
    case '비공개해제':
      return 'bg-[#EBF3FC] hover:bg-[#D5E4F9] border-b border-gray-100 transition-colors text-blue-950';
    default:
      return 'bg-white hover:bg-gray-50/50 border-b border-gray-100 text-gray-800';
  }
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

// 게시글 상태 결정 헬퍼 함수
export const getPostStatus = (post: {
  isVisible?: boolean;
  deletedAt?: string | null;
  reportCount: number;
  adminCommonStatuses?: string[];
}): string => {
  const statuses = post.adminCommonStatuses || [];

  if (statuses.includes('ADMIN_DELETED') || post.deletedAt != null) {
    return '관리자삭제';
  }
  if (statuses.includes('USER_DELETED')) {
    return '유저 삭제';
  }
  if (statuses.includes('AUTO_HIDDEN')) {
    return '자동숨김';
  }
  if (statuses.includes('ADMIN_HIDDEN')) {
    return '관리자비공개';
  }
  if (statuses.includes('SANCTIONED')) {
    return '징계';
  }
  if (statuses.includes('DESANCTIONED')) {
    return '징계해제';
  }
  if (statuses.includes('REPORTED') || post.reportCount > 0) {
    return `신고누적 (${post.reportCount})`;
  }
  if (post.isVisible === false) {
    return '관리자비공개';
  }
  return '정상';
};

interface StatusBadgeInfo {
  text: string;
  className: string;
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
      text: '신고 다수',
      className:
        'bg-[#FEF9C3] text-[#A16207] border-none font-bold text-[11px] px-2 py-0.5 rounded hover:bg-[#FEF9C3]',
    });
  } else if (post.isVisible === false) {
    badges.push({
      text: '리자 비공개',
      className:
        'bg-[#FFEDD5] text-[#374151] border-none font-bold text-[11px] px-2 py-0.5 rounded hover:bg-[#FFEDD5]',
    });
  }

  // 2. 징계 여부
  if (statuses.includes('SANCTIONED')) {
    badges.push({
      text: '징계',
      className:
        'bg-[#FEE2E2] text-[#DC2626] border-none font-bold text-[11px] px-2 py-0.5 rounded hover:bg-[#FEE2E2]',
    });
  }

  // 3. 삭제 여부
  if (statuses.includes('ADMIN_DELETED') || post.deletedAt != null) {
    badges.push({
      text: '리자 삭제',
      className:
        'bg-[#F3F4F6] text-[#DC2626] border-none font-bold text-[11px] px-2 py-0.5 rounded hover:bg-[#F3F4F6]',
    });
  } else if (statuses.includes('USER_DELETED')) {
    badges.push({
      text: '유저 삭제',
      className:
        'bg-[#1F2937] text-white border-none font-bold text-[11px] px-2 py-0.5 rounded hover:bg-[#1F2937]',
    });
  }

  // 매칭되는 상태가 없는 경우 '노출' 표시
  if (badges.length === 0) {
    badges.push({
      text: '노출',
      className:
        'bg-[#F3F4F6] text-[#6B7280] border-none font-bold text-[11px] px-2 py-0.5 rounded hover:bg-[#F3F4F6]',
    });
  }

  return badges;
}

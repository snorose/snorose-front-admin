import type { AdminCommentResponse } from '../types/comment';

// 게시판 이름 매핑 및 배지 스타일 (함박눈방, 첫눈온방, 만년설방, 시험후기)
export const getBoardBadge = (boardId: number) => {
  const mapping: Record<number, { name: string; className: string }> = {
    1: {
      name: '함박눈방',
      className:
        'bg-[#F3E8FF] text-[#6B21A8] hover:bg-[#F3E8FF] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    11: {
      name: '함박눈방',
      className:
        'bg-[#F3E8FF] text-[#6B21A8] hover:bg-[#F3E8FF] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    21: {
      name: '함박눈방',
      className:
        'bg-[#F3E8FF] text-[#6B21A8] hover:bg-[#F3E8FF] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    2: {
      name: '첫눈온방',
      className:
        'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#E0F2FE] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    12: {
      name: '첫눈온방',
      className:
        'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#E0F2FE] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    22: {
      name: '첫눈온방',
      className:
        'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#E0F2FE] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    3: {
      name: '만년설방',
      className:
        'bg-[#E0F7FA] text-[#006064] hover:bg-[#E0F7FA] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    13: {
      name: '만년설방',
      className:
        'bg-[#E0F7FA] text-[#006064] hover:bg-[#E0F7FA] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    23: {
      name: '만년설방',
      className:
        'bg-[#E0F7FA] text-[#006064] hover:bg-[#E0F7FA] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    4: {
      name: '시험후기',
      className:
        'bg-[#FCE7F3] text-[#9D174D] hover:bg-[#FCE7F3] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    14: {
      name: '시험후기',
      className:
        'bg-[#FCE7F3] text-[#9D174D] hover:bg-[#FCE7F3] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
    24: {
      name: '시험후기',
      className:
        'bg-[#FCE7F3] text-[#9D174D] hover:bg-[#FCE7F3] border-none font-semibold px-2.5 py-0.5 rounded-full',
    },
  };
  return (
    mapping[boardId] || {
      name: `게시판 ${boardId}`,
      className:
        'bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-full',
    }
  );
};

// 2. 댓글 상태 분류 헬퍼 함수
export const getCommentStatus = (comment: AdminCommentResponse): string => {
  if (comment.statusType) {
    const mapping: Record<string, string> = {
      REPORTED: '신고누적',
      DELETED: '삭제됨',
      ADMIN_DELETED: '관리자삭제',
      ADMIN_HIDDEN: '관리자비공개',
      RESTORED: '복구',
      UNHIDDEN: '비공개해제',
      NONE: '정상',
    };
    return mapping[comment.statusType] || comment.statusType;
  }

  // 폴백용 클라이언트 유추 로직
  if (comment.reportCount >= 5 && !comment.isVisible) {
    return '신고누적';
  }
  if (comment.deletedAt != null) {
    return '삭제됨';
  }
  if (!comment.isVisible) {
    return '관리자비공개';
  }
  return '정상';
};

// 상태별 Row 배경색 매핑 함수
export const getRowStyle = (status: string) => {
  switch (status) {
    case '신고누적':
      return 'bg-[#FFF9E6] hover:bg-[#FFF2CC] border-b border-gray-100 transition-colors text-yellow-950';
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

// 상태별 배지 스타일 매핑 함수
export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case '정상':
      return 'bg-[#EBF7EE] text-[#2A7E3E] border-[#B2E2BD] hover:bg-[#EBF7EE] font-semibold text-[11px] px-2 py-0.5 rounded border';
    case '삭제됨':
      return 'bg-[#FFF0F0] text-[#D32F2F] border-[#FFCDD2] hover:bg-[#FFF0F0] font-semibold text-[11px] px-2 py-0.5 rounded border';
    case '관리자삭제':
      return 'bg-[#FFEBEB] text-[#C62828] border-[#EF9A9A] hover:bg-[#FFEBEB] font-semibold text-[11px] px-2 py-0.5 rounded border';
    case '복구':
      return 'bg-[#EBF7EE] text-[#2A7E3E] border-[#B2E2BD] hover:bg-[#EBF7EE] font-semibold text-[11px] px-2 py-0.5 rounded border';
    case '신고누적':
      return 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2] hover:bg-[#FFF3E0] font-semibold text-[11px] px-2 py-0.5 rounded border';
    case '관리자비공개':
      return 'bg-[#ECEFF1] text-[#37474F] border-[#CFD8DC] hover:bg-[#ECEFF1] font-semibold text-[11px] px-2 py-0.5 rounded border';
    case '비공개해제':
      return 'bg-[#E3F2FD] text-[#0D47A1] border-[#BBDEFB] hover:bg-[#E3F2FD] font-semibold text-[11px] px-2 py-0.5 rounded border';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50 font-semibold text-[11px] px-2 py-0.5 rounded border';
  }
};

// ID 포맷터
export const formatCommentId = (id: number) =>
  `C${String(id).padStart(3, '0')}`;
export const formatPostId = (id: number) => `P${String(id).padStart(3, '0')}`;

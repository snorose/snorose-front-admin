import {
  BookOpen,
  Download,
  FileText,
  type LucideIcon,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

export type DetailShortcut = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export const DETAIL_SHORTCUTS: DetailShortcut[] = [
  {
    title: '작성한 게시글 조회',
    description: '회원별 게시글 이력 API 연동 후 제공됩니다.',
    icon: FileText,
  },
  {
    title: '작성한 댓글 조회',
    description: '회원별 댓글 이력 API 연동 후 제공됩니다.',
    icon: MessageSquare,
  },
  {
    title: '다운로드 받은 시험후기',
    description: '다운로드 이력 API 연동 후 제공됩니다.',
    icon: Download,
  },
  {
    title: '문의/신고 접수 조회',
    description: '문의/신고 이력 API 연동 후 제공됩니다.',
    icon: ShieldAlert,
  },
  {
    title: '회원 활동 요약',
    description: '추가 활동 지표 API 연동 시 이 영역에 표시됩니다.',
    icon: BookOpen,
  },
];

export const WITHDRAWAL_WARNINGS = [
  '회원의 모든 데이터가 영구적으로 삭제됩니다.',
  '작성한 게시글, 댓글, 시험후기 등이 함께 삭제될 수 있습니다.',
  '보유 포인트가 모두 소멸됩니다.',
  '이 작업은 되돌릴 수 없습니다.',
];

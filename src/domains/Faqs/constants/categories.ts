import type { StatusBadgeTone } from '@/shared/components/StatusBadge';

export const FAQ_CATEGORIES = [
  '가입 · 인증',
  '시험후기',
  '포인트',
  '게시판 · 커뮤니티',
  '기능 이용',
  '스노로즈 운영',
] as const;

export const FAQ_CATEGORY_TONES: Record<string, StatusBadgeTone> = {
  '가입 · 인증': 'info',
  시험후기: 'accent',
  포인트: 'success',
  '게시판 · 커뮤니티': 'warning',
  '기능 이용': 'danger',
  '스노로즈 운영': 'neutral',
};

import type { PenaltyUserInfo } from '@/shared/types';

export const MEMBER_INFO_EDIT_FORM_ID = 'member-info-edit-form';

export const USER_ROLES = [
  { id: 1, name: '준회원' },
  { id: 2, name: '정회원' },
  { id: 4, name: '리자' },
  { id: 5, name: '공식' },
  { id: 6, name: '강등자' },
  { id: 7, name: '광고주' },
];

export const PENALTY_USER_INFO: {
  label: string;
  key: keyof PenaltyUserInfo;
}[] = [
  { label: '이름', key: 'userName' },
  { label: '경고 횟수', key: 'totalWarningCount' },
  { label: '학번', key: 'studentNumber' },
  { label: '강등여부', key: 'isBlacklist' },
  { label: '아이디', key: 'loginId' },
  { label: '강등 시작일', key: 'blacklistStartDate' },
  { label: '회원 등급', key: 'userRoleId' },
  { label: '강등 종료일', key: 'blacklistEndDate' },
];

// 경고 옵션
export const WARNING_REASON_OPTIONS = [
  { value: 'LOW_QUALITY_POST', label: '무성의 글', warnCount: 1 },
  { value: 'LOW_QUALITY_COMMENT', label: '무성의 댓글', warnCount: 1 },
  {
    value: 'EXAM_REVIEW_TYPO_EXCESS',
    label: '족보 문항/분반 오기재',
    warnCount: 1,
  },
  {
    value: 'EXAM_REVIEW_FRAGMENTED_UPLOAD',
    label: '상시시험 업로드',
    warnCount: 1,
  },
  { value: 'EXAM_RECALL_UNDER_50', label: '족보 50% 미만 복기', warnCount: 2 },
  { value: 'ETC', label: '기타', warnCount: 0 },
];

// 일반 강등 옵션
export const RELEGATION_DEMOTE_OPTIONS = [
  {
    value: 'FRESHMAN_EXAM_REVIEW_POSSESSION',
    label: '규정 외 족보 취득(새내기)',
    month: 6,
  },
  { value: 'CURRENT_WARNING_3_EXCEEDED', label: '누적 경고 3회', month: 12 },
  { value: 'EXAM_REVIEW_POSSESSION', label: '규정 외 족보 취득', month: 24 },
  {
    value: 'EXAM_REVIEW_PLAGIARIZED_UPLOAD',
    label: '타인 족보 업로드',
    month: 24,
  },
  { value: 'UNOFFICIAL_EXAM_UPLOAD', label: '정규 시험 외 업로드', month: 24 },
  {
    value: 'PASSWORD_PROTECTED_FILE',
    label: '암호가 걸려있는 파일',
    month: 24,
  },
  { value: 'ETC', label: '기타' },
];

// 영구 강등 옵션
export const BLACKLIST_DEMOTE_OPTIONS = [
  { value: 'EXAM_REVIEW_UNAUTHORIZED_DISTRIBUTION', label: '족보 무단 배포' },
  { value: 'ETC', label: '기타' },
];

import type { MemberInfo } from '@/types';

export const USER_ROLES = [
  { id: 1, name: '준회원' },
  { id: 2, name: '정회원' },
  { id: 4, name: '리자' },
  { id: 5, name: '공식 계정' },
  { id: 6, name: '강등 회원' },
  { id: 7, name: '기업' },
];

export const MEMBER_INFO: { label: string; key: keyof MemberInfo }[] = [
  { label: '이름', key: 'userName' },
  { label: '회원 ID', key: 'encryptedUserId' },
  { label: '학번', key: 'studentNumber' },
  { label: '회원 등급', key: 'userRoleId' },
  { label: '전공', key: 'major' },
  { label: '이메일', key: 'email' },
  { label: '아이디', key: 'loginId' },
  { label: '닉네임', key: 'nickname' },
  { label: '생년월일', key: 'birthday' },
  { label: '경고 횟수', key: 'totalWarningCount' },
  { label: '가입일', key: 'createdAt' },
  { label: '강등여부', key: 'isBlacklist' },
  { label: '등업일', key: 'authenticatedAt' },
  { label: '강등 날짜', key: 'blacklistStartDate' },
  { label: '현재 포인트', key: 'pointBalance' },
  { label: '강등 종료 날짜', key: 'blacklistEndDate' },
];

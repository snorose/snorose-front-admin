import {
  convertCategoryEnumToString,
  convertSourceEnumToString,
} from '@/domains/MemberInfo/utils/memberInfoFormatters';

export function getPointCategoryLabel(category: string) {
  // 명세 목록 외에 실제 dev 응답에서 확인된 시험후기 복구 유형.
  if (category === 'ADMIN_EXAM_REVIEW_RESTORE') {
    return '관리자 임의 시험후기 복구';
  }
  const label = convertCategoryEnumToString(category);
  if (category === 'EVENT' || category === 'ATTENDANCE') return label.category;
  if (label.category === '기타') return label.detail;
  return `${label.category} ${label.detail}`;
}

export function getPointSourceLabel(source: string) {
  return source === 'SYSTEM' ? '시스템' : convertSourceEnumToString(source);
}

// sourceDetail은 별도 메모나 관리자 이름이 아니라 출처와 관련된 상세 정보다.
export function getPointDetailLabel(category: string, source: string) {
  if (category === 'ADMIN_COMMENT_DELETE' || source === 'COMMENT') {
    return '관련 댓글 내용';
  }
  if (
    [
      'ADMIN_POST_DELETE',
      'ADMIN_EXAM_REVIEW_DELETE',
      'ADMIN_LECTURE_REVIEW_DELETE',
      'EXAM_REVIEW_DOWNLOAD',
    ].includes(category) ||
    /^POINT_REWARD_(5|10|20|50|100|1000)_LIKES$/.test(category)
  ) {
    return '관련 글 제목';
  }
  return '출처 상세 정보';
}

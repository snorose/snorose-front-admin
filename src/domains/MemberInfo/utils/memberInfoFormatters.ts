// memberInfo
/**
 *  userRoleId 숫자를 Enum으로 반환
 * @param userRoleId - 변환할 userRoleId 숫자 값
 * @return enum 문자열
 */

export const convertUserRoleIdToEnum = (userRoleId: number): string => {
  const userRoleIdMap: Record<number, string> = {
    1: '준회원',
    2: '정회원',
    4: '리자',
    5: '공식 계정',
    6: '강등 회원',
    7: '기업',
  };

  return userRoleIdMap[userRoleId] ?? String(userRoleId);
};

// BlacklistHistory Tab

/**
 * isBlacklist 문자열을 enum으로 변환
 * @param isBlacklist - 변환할 isBlacklist 문자열 값
 * @return enum 값
 */

export const convertBlackTypeToEnum = (isBlacklist: string): string => {
  const blacklistMap: Record<string, string> = {
    경고: 'WARNING',
    '일반 강등': 'RELEGATION',
    '영구 강등': 'BLACKLIST',
  };
  return blacklistMap[isBlacklist] || isBlacklist;
};

// PointHistoryTab

/**
 * PointSource Enum을 문자열로 변환
 * @param sourceEnum - 변환할 enum 값
 * @return 문자열
 */
export const convertSourceEnumToString = (sourceEnum: string): string => {
  const enumMap: Record<string, string> = {
    ATTENDANCE: '출석체크',
    POST: '게시글',
    REVIEW: '시험후기',
    COMMENT: '댓글',
    ADMIN: '관리자',
  };
  return enumMap[sourceEnum] || sourceEnum;
};

/**
 * PointCategory Enum → { category, detail } 문자열 변환
 * @param categoryEnum - 변환할 enum 값
 * @return 문자열(.category, .detail)
 */
export const convertCategoryEnumToString = (
  categoryEnum: string
): { category: string; detail: string } => {
  const map: Record<string, { category: string; detail: string }> = {
    // 출석체크
    ATTENDANCE: { category: '출석체크', detail: '보상' },

    // 게시글
    POST_CREATE: { category: '게시글', detail: '작성' },
    POST_DELETE: { category: '게시글', detail: '삭제' },

    // 댓글
    COMMENT_CREATE: { category: '댓글', detail: '작성' },
    COMMENT_DELETE: { category: '댓글', detail: '삭제' },

    // 시험후기
    EXAM_REVIEW_CREATE: { category: '시험후기', detail: '작성' },
    EXAM_REVIEW_DOWNLOAD: { category: '시험후기', detail: '다운로드' },
    EXAM_REVIEW_DELETE: { category: '시험후기', detail: '삭제' },

    // 강의후기
    LECTURE_REVIEW_CREATE: { category: '강의후기', detail: '작성' },
    LECTURE_REVIEW_DELETE: { category: '강의후기', detail: '삭제' },

    // 관리자 임의 삭제
    ADMIN_POST_DELETE: { category: '관리자 임의', detail: '게시글 삭제' },
    ADMIN_COMMENT_DELETE: { category: '관리자 임의', detail: '댓글 삭제' },
    ADMIN_EXAM_REVIEW_DELETE: {
      category: '관리자 임의',
      detail: '시험후기 삭제',
    },
    ADMIN_LECTURE_REVIEW_DELETE: {
      category: '관리자 임의',
      detail: '강의후기 삭제',
    },

    // 포인트 보상
    POINT_REWARD_REPORT_GENERAL: {
      category: '포인트 보상',
      detail: '일반 신고',
    },
    POINT_REWARD_REPORT_EXAM_REVIEW: {
      category: '포인트 보상',
      detail: '시험후기 신고',
    },
    POINT_REWARD_REPORT_OUTSIDER: {
      category: '포인트 보상',
      detail: '외부인 신고',
    },
    POINT_REWARD_REPORT_PERMANENT_DEMOTION: {
      category: '포인트 보상',
      detail: '영구강등 신고',
    },
    POINT_REWARD_5_LIKES: {
      category: '포인트 보상',
      detail: '좋아요 5개 달성',
    },
    POINT_REWARD_10_LIKES: {
      category: '포인트 보상',
      detail: '좋아요 10개 달성',
    },
    POINT_REWARD_20_LIKES: {
      category: '포인트 보상',
      detail: '좋아요 20개 달성',
    },
    POINT_REWARD_50_LIKES: {
      category: '포인트 보상',
      detail: '좋아요 50개 달성',
    },
    POINT_REWARD_100_LIKES: {
      category: '포인트 보상',
      detail: '좋아요 100개 달성',
    },
    POINT_REWARD_1000_LIKES: {
      category: '포인트 보상',
      detail: '좋아요 1000개 달성',
    },
    POINT_REWARD_USER_AUTH: {
      category: '포인트 보상',
      detail: '정회원 인증',
    },
    POINT_REWARD_ETC: { category: '포인트 보상', detail: '기타' },

    // 포인트 차감
    POINT_DEDUCTION_FLOODING: { category: '포인트 차감', detail: '도배' },
    POINT_DEDUCTION_ETC: { category: '포인트 차감', detail: '기타 사유' },

    // 이벤트
    EVENT: { category: '이벤트', detail: '이벤트 참여' },

    // 기타
    ETC: { category: '기타', detail: '기타' },
  };

  return map[categoryEnum] ?? { category: '기타', detail: categoryEnum };
};

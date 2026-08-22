/**
 * 문의·신고 목록과 상세에서 동일한 기준으로 탈퇴 작성자를 판정합니다.
 * 상세 API의 탈퇴 여부가 누락되어도 작성자 표시값을 보조 기준으로 사용합니다.
 */
const WITHDRAWN_USER_LOGIN_IDS = new Set(['탈퇴', '탈퇴한 사용자']);

type InquiryAuthor = {
  userLoginId: string;
  isWriterWithdrawn?: boolean;
};

export function isWithdrawnInquiryAuthor(author: InquiryAuthor) {
  return (
    author.isWriterWithdrawn === true ||
    WITHDRAWN_USER_LOGIN_IDS.has(author.userLoginId.trim())
  );
}

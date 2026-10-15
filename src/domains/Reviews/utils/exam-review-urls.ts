const USER_FRONT_BASE_URL = 'https://www.snorose.com';

export function buildOriginalExamReviewUrl(postId: number): string {
  return `${USER_FRONT_BASE_URL}/board/exam-review/post/${postId}`;
}

export function buildOriginalExamReviewUrl(postId: number): string {
  return `${import.meta.env.VITE_USER_FRONT_BASE_URL}/board/exam-review/post/${postId}`;
}

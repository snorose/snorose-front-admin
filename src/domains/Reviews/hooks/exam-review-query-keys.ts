export const examReviewDetailQueryKey = (postId: number | null) =>
  ['examReviewDetail', postId] as const;

export const EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY = [
  'examReviewAdminStatus',
] as const;

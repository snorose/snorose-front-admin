import { formatDateTimeToMinutes } from '@/shared/utils';

import { MOCK_EXAM_REVIEW_COMMENTS } from '@/domains/Reviews/mocks';

interface ExamReviewCommentSectionProps {
  postId: number | null;
}

export function ExamReviewCommentSection({
  postId,
}: ExamReviewCommentSectionProps) {
  if (!postId) return null;

  const comments = MOCK_EXAM_REVIEW_COMMENTS;

  return (
    <section className='rounded-md border'>
      <div className='flex items-center bg-gray-100 px-4 py-3'>
        <h3 className='text-base font-semibold'>댓글 목록</h3>
      </div>

      <div className='p-4 pt-2'>
        {comments.length === 0 ? (
          <div className='rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500'>
            표시할 댓글이 없습니다.
          </div>
        ) : (
          <div className='space-y-3'>
            {comments.map((comment) => (
              <article
                key={comment.commentId}
                className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3'
              >
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-medium text-gray-900'>
                    {comment.nickname}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {formatDateTimeToMinutes(comment.createdAt)}
                  </span>
                </div>
                <p className='mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-700'>
                  {comment.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

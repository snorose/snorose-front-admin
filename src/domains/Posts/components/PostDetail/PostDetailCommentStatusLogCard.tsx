import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { StatusHistoryCard } from '@/shared/components/StatusHistoryCard';

import { getCommentStatusHistories } from '@/apis';

interface PostDetailCommentStatusLogCardProps {
  commentId: number;
}

export default function PostDetailCommentStatusLogCard({
  commentId,
}: PostDetailCommentStatusLogCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isLoading } = useQuery({
    queryKey: ['commentStatusHistories', commentId, currentPage],
    queryFn: () => getCommentStatusHistories(commentId, currentPage),
    enabled: commentId > 0,
  });

  return (
    <StatusHistoryCard
      title='댓글 상태 변경 내역'
      statusLogs={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      currentPage={currentPage}
      totalPage={data?.totalPage}
      onPageChange={setCurrentPage}
    />
  );
}

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { StatusHistoryCard } from '@/shared/components/StatusHistoryCard';

import { getPostStatusHistories } from '@/apis';

interface PostDetailStatusLogCardProps {
  postId: number;
}

export default function PostDetailStatusLogCard({
  postId,
}: PostDetailStatusLogCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isLoading } = useQuery({
    queryKey: ['postStatusHistories', postId, currentPage],
    queryFn: () => getPostStatusHistories(postId, currentPage),
    enabled: postId > 0,
  });

  return (
    <StatusHistoryCard
      title='게시글 상태 변경 내역'
      statusLogs={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      currentPage={currentPage}
      totalPage={data?.totalPage}
      onPageChange={setCurrentPage}
    />
  );
}

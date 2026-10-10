import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { SanctionHistoryCard } from '@/shared/components/SanctionHistoryCard';

import { getCommentSanction } from '@/apis';

interface PostDetailCommentSanctionCardProps {
  commentId: number;
}

export default function PostDetailCommentSanctionCard({
  commentId,
}: PostDetailCommentSanctionCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isLoading } = useQuery({
    queryKey: ['commentSanctions', commentId, currentPage],
    queryFn: () => getCommentSanction(commentId, currentPage),
    enabled: commentId > 0,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [commentId]);

  return (
    <SanctionHistoryCard
      title='댓글 제재 내역'
      emptyMessage='이 댓글을 통한 제재 내역이 없습니다.'
      loadingMessage='제재 내역을 불러오는 중입니다.'
      errorMessage='제재 내역을 불러오지 못했습니다.'
      historyData={data?.data ?? []}
      currentPage={currentPage}
      totalPage={data?.totalPage}
      onPageChange={setCurrentPage}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

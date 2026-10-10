import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { SanctionHistoryCard } from '@/shared/components/SanctionHistoryCard';

import { getPostSanction } from '@/apis';

interface PostDetailBlacklistCardProps {
  postId: number;
}

export default function PostDetailBlacklistCard({
  postId,
}: PostDetailBlacklistCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isLoading } = useQuery({
    queryKey: ['postSanctions', postId, currentPage],
    queryFn: () => getPostSanction(postId, currentPage),
    enabled: postId > 0,
  });

  return (
    <SanctionHistoryCard
      title='징계 정보'
      emptyMessage='이 게시글을 통한 징계 내역이 없습니다.'
      loadingMessage='징계 내역을 불러오는 중입니다.'
      errorMessage='징계 내역을 불러오지 못했습니다.'
      historyData={data?.data ?? []}
      currentPage={currentPage}
      totalPage={data?.totalPage}
      onPageChange={setCurrentPage}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

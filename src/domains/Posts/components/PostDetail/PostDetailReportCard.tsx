import { useQuery } from '@tanstack/react-query';

import { ReportHistoryCard } from '@/shared/components/ReportHistoryCard';

import { getPostReports } from '@/apis';

interface PostDetailReportCardProps {
  postId: number;
}

export default function PostDetailReportCard({
  postId,
}: PostDetailReportCardProps) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['postReports', postId],
    queryFn: () => getPostReports(postId),
    enabled: postId > 0,
  });

  return (
    <ReportHistoryCard
      title='신고 내역'
      emptyMessage='신고 내역이 없습니다.'
      reportsList={data?.reports ?? []}
      totalCount={data?.totalCount ?? 0}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

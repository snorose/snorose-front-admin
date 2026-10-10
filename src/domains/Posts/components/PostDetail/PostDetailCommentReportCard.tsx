import { useQuery } from '@tanstack/react-query';

import { ReportHistoryCard } from '@/shared/components/ReportHistoryCard';

import { getCommentReports } from '@/apis';

interface PostDetailCommentReportCardProps {
  commentId: number;
}

export default function PostDetailCommentReportCard({
  commentId,
}: PostDetailCommentReportCardProps) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['commentReports', commentId],
    queryFn: () => getCommentReports(commentId),
    enabled: commentId > 0,
  });

  return (
    <ReportHistoryCard
      title='댓글 신고 내역'
      emptyMessage='이 댓글의 신고 내역이 없습니다.'
      reportsList={data?.reports ?? []}
      totalCount={data?.totalCount ?? 0}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

import { useUpdateCommentVisibility } from '../hooks/useUpdateCommentVisibility';

export const useCommentVisibility = (
  comments: { commentId: number; isVisible: boolean }[],
  selectedIds: number[]
) => {
  const { mutate } = useUpdateCommentVisibility();
  // 선택된 댓글들 중 하나라도 공개(isVisible: true) 상태인 게 있는지 확인
  const selectedComments = comments.filter((c) =>
    selectedIds.includes(c.commentId)
  );
  const anyVisible = selectedComments.some((c) => c.isVisible === true);
  const visibilityLabel: '비공개' | '공개' = anyVisible ? '비공개' : '공개';
  const handleBulkToggleVisibility = () => {
    if (selectedIds.length === 0) return;

    // 공개인 게 하나라도 있으면 모두 비공개(false)로, 아니면 모두 공개(true)로
    const nextVisibleValue = !anyVisible;
    const actionText = nextVisibleValue ? '공개' : '비공개';

    if (
      window.confirm(
        `선택한 ${selectedIds.length}개의 댓글을 일괄 ${actionText} 처리하시겠습니까?`
      )
    ) {
      mutate({
        commentIds: selectedIds,
        visible: nextVisibleValue,
      });
    }
  };

  const handleToggleVisibility = (
    commentId: number,
    currentVisible: boolean
  ) => {
    mutate({
      commentIds: [commentId],
      visible: !currentVisible,
    });
  };

  return {
    visibilityLabel,
    handleBulkToggleVisibility,
    handleToggleVisibility,
  };
};

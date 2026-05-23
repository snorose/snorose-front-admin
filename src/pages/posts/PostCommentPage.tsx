import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components';
import CommentTable from '@/domains/Comments/components/CommentTable';

export default function PostCommentPage() {
  const [searchParamsFromUrl, setSearchParamsFromUrl] = useSearchParams();
  const [refreshKey] = useState(0);
  const [searchParams, setSearchParams] = useState<{
    content?: string;
    postId?: number;
    parentId?: number | null;
    encryptedUserId?: string;
    boardId?: number;
    isVisible?: boolean;
    isKeywordExist?: boolean;
    startDate?: string;
    endDate?: string;
    status?: string;
  }>({});

  // URL에서 페이지 번호 복원
  const currentPageFromUrl = parseInt(
    searchParamsFromUrl.get('page') || '1',
    10
  );
  const [currentPage, setCurrentPage] = useState<number>(
    currentPageFromUrl || 1
  );

  // URL의 페이지 번호가 변경되면 state 업데이트
  useEffect(() => {
    const pageFromUrl = parseInt(searchParamsFromUrl.get('page') || '1', 10);
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParamsFromUrl, currentPage]);

  // URL에서 검색 옵션들 복원
  useEffect(() => {
    const params: typeof searchParams = {};

    const content = searchParamsFromUrl.get('content');
    if (content) params.content = content;

    const postId = searchParamsFromUrl.get('postId');
    if (postId) {
      const parsed = parseInt(postId, 10);
      if (!isNaN(parsed)) params.postId = parsed;
    }

    const parentId = searchParamsFromUrl.get('parentId');
    if (parentId) {
      if (parentId === 'null') {
        params.parentId = null;
      } else {
        const parsed = parseInt(parentId, 10);
        if (!isNaN(parsed)) params.parentId = parsed;
      }
    }

    const encryptedUserId = searchParamsFromUrl.get('encryptedUserId');
    if (encryptedUserId) params.encryptedUserId = encryptedUserId;

    const boardId = searchParamsFromUrl.get('boardId');
    if (boardId) {
      const parsed = parseInt(boardId, 10);
      if (!isNaN(parsed)) params.boardId = parsed;
    }

    const isVisible = searchParamsFromUrl.get('isVisible');
    if (isVisible === 'true') {
      params.isVisible = true;
    } else if (isVisible === 'false') {
      params.isVisible = false;
    }

    const isKeywordExist = searchParamsFromUrl.get('isKeywordExist');
    if (isKeywordExist === 'true') {
      params.isKeywordExist = true;
    } else if (isKeywordExist === 'false') {
      params.isKeywordExist = false;
    }

    const status = searchParamsFromUrl.get('status');
    if (status) params.status = status;

    const startDate = searchParamsFromUrl.get('startDate');
    if (startDate) params.startDate = startDate;

    const endDate = searchParamsFromUrl.get('endDate');
    if (endDate) params.endDate = endDate;

    setSearchParams(params);
  }, [searchParamsFromUrl]);

  const handlePageChange = (
    pageOrUpdater: number | ((prev: number) => number)
  ) => {
    setCurrentPage((prev) => {
      const next =
        typeof pageOrUpdater === 'function'
          ? pageOrUpdater(prev)
          : pageOrUpdater;
      const newSearchParams = new URLSearchParams(searchParamsFromUrl);
      newSearchParams.set('page', next.toString());
      setSearchParamsFromUrl(newSearchParams, { replace: true });
      return next;
    });
  };

  return (
    <div className='flex w-full flex-col gap-6 pb-12'>
      <PageHeader
        title='댓글 관리'
        description='커뮤니티에 등록된 댓글을 편집하거나 삭제하고, 더블클릭 및 필터 검색을 활용해 상세 내역을 파악할 수 있습니다.'
      />

      <div className='flex flex-col gap-4'>
        <CommentTable
          searchParams={searchParams}
          refreshKey={refreshKey}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

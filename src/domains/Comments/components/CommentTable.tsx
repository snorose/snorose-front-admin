import { Loader2 } from 'lucide-react';

import { Table } from '@/shared/components/ui';

import { ExamReviewTablePagination } from '@/domains/Reviews/components';

import { useCommentTableState } from '../hooks/useCommentTableState';
import CommentBulkActionBar from './CommentBulkActionBar';
import CommentTableRow from './CommentTableRow';

interface CommentTableProps {
  searchParams?: {
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
  };
  refreshKey?: number;
  currentPage: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export default function CommentTable({
  searchParams = {},
  refreshKey,
  currentPage,
  onPageChange,
}: CommentTableProps) {
  const {
    comments,
    isLoading,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    selectAllRef,
    handleSelectAll,
    activePopoverId,
    setActivePopoverId,
    popoverUser,
    isUserLoading,
    handleNicknameClick,
    handleSingleVisibility,
    handleFilterByPostId,
    handleFilterByParentId,
    handleBulkDelete,
    handleBulkVisibility,
    handleBulkRestore,
    isDeletePending,
    isVisibilityPending,
    hasNext,
  } = useCommentTableState({
    searchParams,
    refreshKey,
    currentPage,
    onPageChange,
  });

  const isEmpty = !isLoading && comments.length === 0;

  return (
    <div
      className='flex flex-col gap-3'
      onClick={() => setActivePopoverId(null)}
    >
      <CommentBulkActionBar
        selectedCount={selectedIds.length}
        isVisibilityPending={isVisibilityPending}
        isDeletePending={isDeletePending}
        onBulkVisibility={handleBulkVisibility}
        onBulkRestore={handleBulkRestore}
        onBulkDelete={handleBulkDelete}
      />

      <div className='overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm'>
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[1250px] table-fixed text-[13px]'>
            <Table.Header className='h-[42px] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700'>
              <Table.Head
                style={{ width: '40px' }}
                className='px-3 text-center'
              >
                <input
                  type='checkbox'
                  ref={selectAllRef}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className='cursor-pointer rounded border-gray-300'
                />
              </Table.Head>
              <Table.Head style={{ width: '180px' }} className='px-3 text-xs'>
                게시 시각 (비공개일)
              </Table.Head>
              <Table.Head style={{ width: '110px' }} className='px-3 text-xs'>
                게시판
              </Table.Head>
              <Table.Head style={{ width: '120px' }} className='px-3 text-xs'>
                닉네임 (클릭 드롭다운)
              </Table.Head>
              <Table.Head style={{ width: '80px' }} className='px-3 text-xs'>
                댓글 ID
              </Table.Head>
              <Table.Head style={{ width: '95px' }} className='px-3 text-xs'>
                상위 댓글 ID
              </Table.Head>
              <Table.Head style={{ width: '85px' }} className='px-3 text-xs'>
                게시글 ID
              </Table.Head>
              <Table.Head style={{ width: '330px' }} className='px-3 text-xs'>
                내용 (더블클릭 상세조회)
              </Table.Head>
              <Table.Head
                style={{ width: '120px' }}
                className='px-3 text-center text-xs'
              >
                상태
              </Table.Head>
              <Table.Head
                style={{ width: '100px' }}
                className='px-3 text-center text-xs'
              >
                의심 키워드
              </Table.Head>
            </Table.Header>

            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={10} className='h-48 text-center'>
                    <div className='flex items-center justify-center gap-2 text-gray-500'>
                      <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
                      <span>댓글 데이터를 불러오는 중입니다...</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : isEmpty ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={10}
                    className='h-48 text-center text-sm text-gray-400'
                  >
                    등록된 댓글이 없거나 검색 결과가 존재하지 않습니다.
                  </Table.Cell>
                </Table.Row>
              ) : (
                comments.map((comment) => (
                  <CommentTableRow
                    key={comment.commentId}
                    comment={comment}
                    isSelected={selectedIds.includes(comment.commentId)}
                    onSelectToggle={(id) => {
                      setSelectedIds((prev) =>
                        prev.includes(id)
                          ? prev.filter((item) => item !== id)
                          : [...prev, id]
                      );
                    }}
                    activePopoverId={activePopoverId}
                    onNicknameClick={handleNicknameClick}
                    popoverUser={popoverUser}
                    isUserLoading={isUserLoading}
                    onClosePopover={() => setActivePopoverId(null)}
                    onPageChange={onPageChange}
                    onSingleVisibilityToggle={handleSingleVisibility}
                    onFilterByPostId={handleFilterByPostId}
                    onFilterByParentId={handleFilterByParentId}
                  />
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      <ExamReviewTablePagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        hasNext={hasNext}
      />
    </div>
  );
}

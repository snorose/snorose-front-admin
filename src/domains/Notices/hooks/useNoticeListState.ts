import { useEffect, useState } from 'react';

import { useManagePageUrl } from '@/shared/hooks';
import { clampOneBasedPage } from '@/shared/utils';

import { NOTICE_SCHEMA } from '../constants';
import type { Notice, NoticeFilters } from '../types';
import { filterNotices, sortNotices } from '../utils/notice';
import { useNotices } from './useNotices';

export function useNoticeListState() {
  const { notices, pagination, isLoading, isError, retry, canEdit } =
    useNotices();
  const [authorSelectionVersion, setAuthorSelectionVersion] = useState(0);
  const {
    searchParams: filters,
    currentPage: requestedPage,
    handleSearchChange,
    handlePageChange,
  } = useManagePageUrl<NoticeFilters>(NOTICE_SCHEMA);
  const selectedAuthor = notices.find(
    (notice) => notice.authorId === filters.author
  );
  const authorSearch = filters.keywordAuthor || selectedAuthor?.author || '';
  const sorted = pagination
    ? notices
    : filterNotices(sortNotices(notices, filters.sort), filters);
  const totalPage = Math.max(
    1,
    pagination?.totalPage ?? Math.ceil(sorted.length / 10)
  );
  const currentPage = clampOneBasedPage(requestedPage, totalPage);
  const visible = pagination
    ? sorted
    : sorted.slice((currentPage - 1) * 10, currentPage * 10);
  useEffect(() => {
    if (pagination && requestedPage !== currentPage)
      handlePageChange(currentPage);
  }, [pagination, requestedPage, currentPage, handlePageChange]);
  const updateFilters = (updates: NoticeFilters) =>
    handleSearchChange({ ...filters, ...updates });

  return {
    filters,
    authorSearch,
    authorSelectionVersion,
    totalCount:
      isLoading || isError
        ? undefined
        : (pagination?.totalCount ?? sorted.length),
    countStatus: isLoading
      ? ('loading' as const)
      : isError
        ? ('error' as const)
        : ('ready' as const),
    updateFilters,
    resetFilters: () => handleSearchChange({}),
    notices: visible,
    isLoading,
    isError,
    onRetry: retry,
    canEdit,
    currentPage,
    totalPage,
    onPageChange: handlePageChange,
    selectedAuthorName: filters.author
      ? (selectedAuthor?.author ?? '선택한 관리자')
      : undefined,
    onClearAuthor: () => updateFilters({ author: '', keywordAuthor: '' }),
    onViewAuthorNotices: (notice: Notice) => {
      // 같은 작성자를 다시 선택한 경우에도 미적용 텍스트를 실제 조회 조건으로 되돌립니다.
      setAuthorSelectionVersion((version) => version + 1);
      updateFilters({ author: notice.authorId, keywordAuthor: notice.author });
    },
  };
}

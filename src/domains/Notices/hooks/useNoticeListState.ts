import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/shared/constants';
import { useManagePageUrl } from '@/shared/hooks';
import { clampOneBasedPage } from '@/shared/utils';

import { NOTICE_SCHEMA } from '../constants';
import type { Notice, NoticeFilters } from '../types';
import { filterNotices, sortNotices } from '../utils/notice';
import { useNotices } from './useNotices';

export function useNoticeListState() {
  const { notices, isLoading, isError, retry, canEdit } = useNotices();
  const navigate = useNavigate();
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
  const sorted = filterNotices(sortNotices(notices, filters.sort), filters);
  const totalPage = Math.max(1, Math.ceil(sorted.length / 10));
  const currentPage = clampOneBasedPage(requestedPage, totalPage);
  const visible = sorted.slice((currentPage - 1) * 10, currentPage * 10);
  const updateFilters = (updates: NoticeFilters) =>
    handleSearchChange({ ...filters, ...updates });

  const handleViewMemberInfo = (authorId: string) =>
    navigate(`${PATHS.MEMBER_INFO}/${encodeURIComponent(authorId)}`);
  return {
    filters,
    authorSearch,
    authorSelectionVersion,
    totalCount: isLoading || isError ? undefined : sorted.length,
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
    onViewMemberInfo: handleViewMemberInfo,
    onViewAuthorNotices: (notice: Notice) => {
      // 같은 작성자를 다시 선택한 경우에도 미적용 텍스트를 실제 조회 조건으로 되돌립니다.
      setAuthorSelectionVersion((version) => version + 1);
      updateFilters({ author: notice.authorId, keywordAuthor: notice.author });
    },
  };
}

import { useEffect, useMemo, useRef, useState } from 'react';

import type { AdminGetPostResponse, AdminPostSearchRequest } from '../types';
import { usePostList } from './usePostList';

interface PostListProps {
  selectedPostId: number | null;
  onSelectPost: (post: AdminGetPostResponse | null) => void;
}

export default function usePostListFilter({
  selectedPostId,
  onSelectPost,
}: PostListProps) {
  const [category, setCategory] = useState('전체');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [reportFilter, setReportFilter] = useState('전체');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const body = useMemo((): AdminPostSearchRequest => {
    const result: AdminPostSearchRequest = {};
    if (startDate) result.startDate = startDate;
    if (endDate) result.endDate = endDate;
    return result;
  }, [startDate, endDate]);

  const { data, hasNext, totalPage } = usePostList({ page, body });

  const categories = useMemo(() => {
    if (!data) return [];
    return [
      ...new Set(data.map((p) => p.category).filter(Boolean)),
    ] as string[];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((post) => {
      if (deletedIds.includes(post.postId)) return false;
      const matchesKeyword =
        post.title.includes(keyword) ||
        post.userDisplay?.includes(keyword) ||
        String(post.postId).includes(keyword);
      const matchesCategory = category === '전체' || post.category === category;
      const matchesReport =
        reportFilter === '전체' ||
        (reportFilter === '신고됨' && post.reportCount >= 5) ||
        (reportFilter === '삭제됨' && post.deletedAt !== null) ||
        (reportFilter === '리자삭제' && post.isVisible === false) ||
        (reportFilter === '리자비공개' &&
          post.isVisible === false &&
          post.deletedAt === null) ||
        (reportFilter === '해당없음' &&
          post.reportCount === 0 &&
          post.deletedAt === null &&
          post.isVisible === true);
      const matchesDate =
        (!startDate ||
          new Date(post.createdAt).getTime() >=
            new Date(startDate).getTime()) &&
        (!endDate ||
          new Date(post.createdAt).getTime() <= new Date(endDate).getTime());
      return matchesKeyword && matchesCategory && matchesReport && matchesDate;
    });
  }, [data, keyword, category, reportFilter, deletedIds, startDate, endDate]);

  const allIds = filtered.map((p) => p.postId);
  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    allIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : allIds);
  };

  const handleCheck = (postId: number) => {
    setSelectedIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleDelete = (postId: number) => {
    setDeletedIds((prev) => [...prev, postId]);
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
    if (selectedPostId === postId) onSelectPost(null);
  };

  const handleBulkDelete = () => {
    setDeletedIds((prev) => [...prev, ...selectedIds]);
    if (selectedPostId !== null && selectedIds.includes(selectedPostId))
      onSelectPost(null);
    setSelectedIds([]);
  };

  return {
    filtered,
    page,
    setPage,
    hasNext,
    totalPage,
    categories,
    category,
    setCategory,
    keyword,
    setKeyword,
    reportFilter,
    setReportFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedIds,
    setSelectedIds,
    handleCheck,
    selectAllRef,
    isAllSelected,
    handleSelectAll,
    handleDelete,
    handleBulkDelete,
  };
}

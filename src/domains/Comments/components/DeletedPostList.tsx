import { useMemo, useState } from 'react';

import { Input, Select } from '@/shared/components/ui';

import type { AdminGetPostResponse } from '@/domains/Comments/types';

import { useDeletedPostList } from '../hooks/useDeletedPostList';
import DeletedPostListItem from './DeletedPostListItem';

interface DeletedPostListProps {
  selectedPostId: number | null;
  onSelectPost: (post: AdminGetPostResponse | null) => void;
}

export default function DeletedPostList({
  selectedPostId,
  onSelectPost,
}: DeletedPostListProps) {
  const [category, setCategory] = useState('전체');
  const { data } = useDeletedPostList(1);
  const [keyword, setKeyword] = useState('');
  const [reportFilter, setReportFilter] = useState('전체');

  const rawPosts = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    if (!rawPosts) return [];
    return [
      ...new Set(
        rawPosts.map((p: AdminGetPostResponse) => p.category).filter(Boolean)
      ),
    ] as string[];
  }, [rawPosts]);

  const filtered = useMemo(() => {
    if (!rawPosts) return [];
    return rawPosts.filter((post: AdminGetPostResponse) => {
      const matchesKeyword =
        post.title?.includes(keyword) ||
        post.userDisplay?.includes(keyword) ||
        String(post.postId).includes(keyword);
      const matchesCategory = category === '전체' || post.category === category;
      const matchesReport = reportFilter === '전체' || post.reportCount > 0;
      return matchesKeyword && matchesCategory && matchesReport;
    });
  }, [rawPosts, keyword, category, reportFilter]);

  return (
    <div className='flex h-full min-h-[500px] flex-col rounded-lg border bg-white'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <h2 className='text-sm font-semibold'>삭제된 게시글</h2>
      </div>
      <div className='flex flex-col gap-4 p-4'>
        <Input
          placeholder='게시글 제목, 작성자(닉네임), 게시글 ID로 검색'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className='flex gap-2'>
          <Select value={category} onValueChange={setCategory}>
            <Select.Trigger className='flex-1 justify-between rounded-md border border-gray-200 bg-white px-3'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='전체'>전체</Select.Item>
              {categories.map((c) => (
                <Select.Item key={c} value={c}>
                  {c}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Select value={reportFilter} onValueChange={setReportFilter}>
            <Select.Trigger className='flex-1 justify-between rounded-md border border-gray-200 bg-white px-3'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='전체'>전체</Select.Item>
              <Select.Item value='신고됨'>신고됨만</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className='mt-2 flex-1 overflow-y-auto rounded-md border'>
          {filtered.length === 0 ? (
            <p className='py-10 text-center text-sm text-gray-400'>
              삭제된 게시글이 없습니다.
            </p>
          ) : (
            <div className='divide-y divide-gray-200'>
              {filtered.map((post: AdminGetPostResponse) => (
                <DeletedPostListItem
                  key={post.postId}
                  post={post}
                  isSelected={selectedPostId === post.postId}
                  onClick={(p) =>
                    onSelectPost(selectedPostId === p.postId ? null : p)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

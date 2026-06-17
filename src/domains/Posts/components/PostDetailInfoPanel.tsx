import React, { useState } from 'react';

import DOMPurify from 'dompurify';
import { Bookmark, Heart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import MemberInfoPopover from '@/shared/components/MemberInfoPopover';
import { Badge, Switch } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';
import { formatDateTimeWithAmPm } from '@/shared/utils';
import {
  getPostStatus,
  getPostStatusBadges,
} from '@/shared/utils/postCommentUtils';

import type { AdminGetPostResponse } from '../types/post';

interface PostDetailInfoPanelProps {
  post: AdminGetPostResponse;
  activePopoverId: number | null;
  onNicknameClick: (e: React.MouseEvent, post: AdminGetPostResponse) => void;
  popoverUser: MemberInfo | null;
  isUserLoading: boolean;
  onClosePopover: () => void;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export default function PostDetailInfoPanel({
  post,
  activePopoverId,
  onNicknameClick,
  popoverUser,
  isUserLoading,
  onClosePopover,
  onPageChange,
}: PostDetailInfoPanelProps) {
  const [isNotice, setIsNotice] = useState(post.isNotice);
  const status = getPostStatus(post);

  const handleNoticeToggle = (checked: boolean) => {
    setIsNotice(checked);
    toast.success(
      checked
        ? '해당 게시글이 공지로 등록되었습니다.'
        : '해당 게시글의 공지 등록이 해제되었습니다.'
    );
  };

  return (
    <div className='relative flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
      {/* 1. 패널 타이틀 */}
      <h2 className='text-lg font-bold text-gray-900'>게시글 상세 정보</h2>

      {/* 2. 기획안 일치 그리드 메타 데이터 */}
      <div className='grid grid-cols-2 gap-x-8 gap-y-4 border-b border-gray-100 pb-5 text-[13px]'>
        {/* 좌측 열 */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <span className='font-medium text-gray-400'>게시일자</span>
            <div className='flex flex-col font-mono text-[12px] leading-tight text-gray-800'>
              <span>{formatDateTimeWithAmPm(post.createdAt)}</span>
              {status !== '정상' && (post.deletedAt || post.updatedAt) && (
                <span className='mt-0.5 text-[10px] font-semibold text-gray-400'>
                  {status === '관리자삭제' &&
                    post.deletedAt &&
                    ` (어드민 삭제 ${post.deletedAt.substring(0, 19)}, ${formatDateTimeWithAmPm(post.deletedAt)})`}
                  {status === '관리자비공개' &&
                    post.updatedAt &&
                    ` (어드민 비공개 ${post.updatedAt.substring(0, 19)}, ${formatDateTimeWithAmPm(post.updatedAt)})`}
                </span>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <span className='font-medium text-gray-400'>카테고리</span>
            <div>
              {post.category ? (
                <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600'>
                  {post.category}
                </span>
              ) : (
                <span className='font-mono text-gray-300'>-</span>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <span className='font-medium text-gray-400'>게시글 상태</span>
            <div className='flex flex-wrap items-center gap-1.5'>
              {getPostStatusBadges(post).map((badge, idx) => (
                <Badge key={idx} variant='unstyled' className={badge.className}>
                  {badge.text}
                </Badge>
              ))}
              {post.isNotice && (
                <Badge className='rounded border-none bg-[#FEE2E2] px-1.5 py-0.5 text-[10px] font-bold text-[#991B1B] hover:bg-[#FEE2E2]'>
                  공지
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* 우측 열 */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <span className='font-medium text-gray-400'>게시판</span>
            <div>
              <Badge variant='unstyled'>{post.boardName}</Badge>
            </div>
          </div>

          <div className='relative flex flex-col gap-1'>
            <span className='font-medium text-gray-400'>작성자</span>
            <div>
              <span
                className='cursor-pointer text-sm font-bold text-blue-600 underline transition-colors hover:text-blue-800'
                onClick={(e) => onNicknameClick(e, post)}
              >
                {post.nickName || '익명'}
              </span>
              <span className='ml-1 text-xs text-gray-400'>
                (
                {post.encryptedUserId
                  ? post.encryptedUserId.substring(0, 8) + '...'
                  : '정보 없음'}
                )
              </span>
            </div>

            {/* 닉네임 팝오버 렌더링 */}
            {activePopoverId === post.postId && (
              <div
                className='absolute top-12 left-0 z-50'
                onClick={(e) => e.stopPropagation()}
              >
                <MemberInfoPopover
                  encryptedUserId={post.encryptedUserId}
                  popoverUser={popoverUser}
                  isUserLoading={isUserLoading}
                  onClose={onClosePopover}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 제목 & 내용 */}
      <div className='flex flex-col gap-4 border-b border-gray-100 pb-5'>
        <div className='flex flex-col gap-1'>
          <span className='text-xs font-semibold tracking-wider text-gray-400 uppercase'>
            제목
          </span>
          <h1 className='text-lg font-bold text-gray-900'>{post.title}</h1>
        </div>

        <div className='flex flex-col gap-1'>
          <span className='text-xs font-semibold tracking-wider text-gray-400 uppercase'>
            내용
          </span>
          <div className='text-sm leading-relaxed whitespace-pre-wrap text-gray-800 select-text'>
            {post.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content, {
                    ALLOWED_TAGS: [
                      'iframe',
                      'a',
                      'img',
                      'p',
                      'br',
                      'span',
                      'b',
                      'strong',
                      'i',
                      'u',
                    ],
                    ALLOWED_ATTR: ['src', 'href', 'sandbox', 'class', 'style'],
                  }),
                }}
                className='[&_a]:break-all [&_a]:text-blue-600 [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded'
              />
            ) : (
              <span className='text-gray-400 italic'>내용이 없습니다.</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. 통계 정보 (기획 이미지 형태) */}
      <div className='flex items-center gap-6 border-b border-gray-100 pb-5 text-[13px]'>
        <span className='flex items-center gap-1.5 font-medium text-gray-600'>
          <Heart className='h-4 w-4 shrink-0 fill-rose-50 text-rose-400' />
          공감수: <strong className='font-mono'>{post.likeCount ?? 0}</strong>
        </span>
        <span className='flex items-center gap-1.5 font-medium text-gray-600'>
          <MessageSquare className='h-4 w-4 shrink-0 text-blue-400' />
          댓글수:{' '}
          <strong className='font-mono'>{post.commentCount ?? 0}</strong>
        </span>
        <span className='flex items-center gap-1.5 font-medium text-gray-600'>
          <Bookmark className='h-4 w-4 shrink-0 fill-amber-50 text-amber-400' />
          스크랩수:{' '}
          <strong className='font-mono'>{post.scrapCount ?? 0}</strong>
        </span>
      </div>

      {/* 5. 공지 전환 토글 (기획 이미지 하단) */}
      <div className='flex items-center justify-between py-1'>
        <span className='text-sm font-semibold text-gray-700'>공지 전환</span>
        <Switch
          checked={isNotice}
          onCheckedChange={handleNoticeToggle}
          id='post-detail-notice-switch'
        />
      </div>
    </div>
  );
}

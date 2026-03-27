import { useEffect, useState } from 'react';

import { Paperclip, UserRound, X } from 'lucide-react';

import { Button, Skeleton } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import { useInquiryDetail } from '../hooks';
import type {
  Inquiry,
  InquiryAction,
  InquiryCategory,
  InquirySubCategory,
} from '../types';
import { SUB_CATEGORY_MAP } from '../types';
import InquiryStatusBadge from './InquiryStatusBadge';

interface InquiryDetailPanelProps {
  selectedInquiry: Inquiry | null;
  onClose?: () => void;
  onSaveSuccess?: (updated: Inquiry) => void;
}

export default function InquiryDetailPanel({
  selectedInquiry,
  onClose,
  onSaveSuccess,
}: InquiryDetailPanelProps) {
  const { data: detail, isLoading } = useInquiryDetail(
    selectedInquiry?.id ?? null
  );

  // 답변 작성 모드
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedAction, setSelectedAction] = useState<
    InquiryAction | undefined
  >();

  // 카테고리 편집 모드
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState<
    InquiryCategory | undefined
  >();
  const [editSubCategory, setEditSubCategory] = useState<
    InquirySubCategory | undefined
  >();

  // 행 변경 시 상태 초기화
  useEffect(() => {
    setIsReplyMode(false);
    setReplyText('');
    setSelectedAction(undefined);
    setIsCategoryEditMode(false);
    setEditCategory(undefined);
    setEditSubCategory(undefined);
  }, [selectedInquiry?.id]);

  useEffect(() => {
    if (detail) {
      setEditCategory(detail.category);
      setEditSubCategory(detail.subCategory);
    }
  }, [detail]);

  const save = (patch: Partial<Inquiry>) => {
    if (!detail) return;
    onSaveSuccess?.({
      ...detail,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleReplySave = () => {
    if (!replyText.trim()) return;
    save({
      adminReply: replyText.trim(),
      status: '진행완료',
      action: selectedAction,
    });
    setIsReplyMode(false);
    setReplyText('');
    setSelectedAction(undefined);
  };

  const handleCategorySave = () => {
    if (!editCategory || !editSubCategory) return;
    save({ category: editCategory, subCategory: editSubCategory });
    setIsCategoryEditMode(false);
  };

  if (!selectedInquiry) return null;

  return (
    <section className='w-full rounded-md border bg-white shadow-sm'>
      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <div className='flex items-center gap-3 border-b bg-blue-50 px-4 py-3'>
        <span className='flex-1 truncate font-semibold text-gray-800'>
          {isLoading ? (
            <Skeleton className='h-5 w-48' />
          ) : (
            (detail?.title ?? selectedInquiry.title)
          )}
        </span>

        {/* 현재 상태 — 읽기 전용 표시 */}
        {!isLoading && detail && <InquiryStatusBadge status={detail.status} />}

        {/* 현재 담당자 — 읽기 전용 표시 */}
        {!isLoading && detail?.assignee && (
          <span className='flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700'>
            <UserRound className='h-3 w-3' />
            {detail.assignee}
          </span>
        )}

        <button
          type='button'
          onClick={onClose}
          className='shrink-0 rounded-sm p-1 hover:bg-blue-100'
          aria-label='닫기'
        >
          <X className='h-4 w-4 text-gray-500' />
        </button>
      </div>

      {/* ── 바디 ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className='flex flex-col gap-3 p-4 md:flex-row'>
          {[1, 2].map((i) => (
            <div key={i} className='flex-1 space-y-3'>
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className='h-5 w-full' />
              ))}
            </div>
          ))}
        </div>
      ) : !detail ? null : (
        <div className='flex flex-col divide-y md:flex-row md:divide-x md:divide-y-0'>
          {/* ── 좌측: 글 내용 ──────────────────────────────────── */}
          <div className='flex flex-1 flex-col gap-3 p-4'>
            {/* 분류/중분류 */}
            <div className='flex items-center gap-2'>
              {isCategoryEditMode ? (
                <CategoryEditor
                  category={editCategory}
                  subCategory={editSubCategory}
                  onCategoryChange={(cat) => {
                    setEditCategory(cat);
                    setEditSubCategory(undefined);
                  }}
                  onSubCategoryChange={setEditSubCategory}
                  onSave={handleCategorySave}
                  onCancel={() => {
                    setIsCategoryEditMode(false);
                    setEditCategory(detail.category);
                    setEditSubCategory(detail.subCategory);
                  }}
                />
              ) : (
                <>
                  <CategoryBadge>{detail.category}</CategoryBadge>
                  <span className='text-gray-400'>›</span>
                  <CategoryBadge variant='sub'>
                    {detail.subCategory}
                  </CategoryBadge>
                  <button
                    type='button'
                    onClick={() => setIsCategoryEditMode(true)}
                    className='ml-1 rounded px-1.5 py-0.5 text-[11px] text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  >
                    수정
                  </button>
                </>
              )}
            </div>

            {/* 작성자 */}
            <div className='flex items-center gap-1.5 text-sm text-gray-600'>
              <UserRound className='h-4 w-4 shrink-0 text-gray-400' />
              <span className='font-medium'>{detail.userName}</span>
              <span className='text-gray-400'>({detail.userId})</span>
              <span className='ml-auto text-xs text-gray-400'>
                {new Date(detail.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* 신고 대상 링크 */}
            {detail.reportedLink && (
              <div className='rounded bg-orange-50 px-3 py-2 text-xs text-orange-700'>
                <span className='font-medium'>신고 대상: </span>
                {detail.reportedLink}
              </div>
            )}

            {/* 본문 */}
            <p className='min-h-[80px] rounded-md bg-gray-50 p-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>
              {detail.content}
            </p>

            {/* 첨부파일 */}
            {detail.attachments.length > 0 && (
              <div className='space-y-1'>
                <p className='text-xs font-medium text-gray-500'>
                  첨부파일 ({detail.attachments.length}개)
                </p>
                {detail.attachments.map((file) => (
                  <a
                    key={file.url}
                    href={file.url}
                    download
                    className='flex items-center gap-1.5 text-xs text-blue-600 underline-offset-2 hover:underline'
                  >
                    <Paperclip className='h-3.5 w-3.5 shrink-0' />
                    {file.name}
                  </a>
                ))}
              </div>
            )}

            {!detail.adminReply && (
              <p className='mt-auto pt-2 text-xs text-gray-400'>
                관리자 답변 등록 시 수정 및 삭제가 불가능합니다.
              </p>
            )}
          </div>

          {/* ── 우측: 관리자 답변 ──────────────────────────────── */}
          <div className='flex flex-1 flex-col gap-3 p-4'>
            <p className='text-sm font-semibold text-gray-700'>관리자 답변</p>

            {detail.adminReply ? (
              <>
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700'>
                    운영자
                  </span>
                  <span className='text-xs text-gray-400'>
                    {new Date(detail.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className='min-h-[80px] rounded-md bg-gray-50 p-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>
                  {detail.adminReply}
                </p>
                {detail.action && (
                  <div className='flex items-center gap-2 rounded bg-red-50 px-3 py-2 text-sm'>
                    <span className='font-medium text-red-600'>처리 조치</span>
                    <ActionBadge action={detail.action} />
                  </div>
                )}
              </>
            ) : isReplyMode ? (
              <>
                {detail.category === '신고' && (
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='text-xs font-medium text-gray-500'>
                      처리 조치
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                      {(
                        ['경고', '게시글 삭제', '계정 제재'] as InquiryAction[]
                      ).map((action) => (
                        <button
                          key={action}
                          type='button'
                          onClick={() =>
                            setSelectedAction((prev) =>
                              prev === action ? undefined : action
                            )
                          }
                          className={cn(
                            'rounded border px-2 py-0.5 text-xs transition-colors',
                            selectedAction === action
                              ? 'border-red-400 bg-red-100 text-red-700'
                              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder='답변 내용을 입력하세요.'
                  className='min-h-[120px] w-full resize-y rounded-md border border-gray-300 p-3 text-sm focus:border-blue-400 focus:outline-none'
                  autoFocus
                />
                <div className='mt-auto flex justify-end gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setIsReplyMode(false);
                      setReplyText('');
                      setSelectedAction(undefined);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    size='sm'
                    className='bg-gray-700 hover:bg-gray-800'
                    onClick={handleReplySave}
                    disabled={!replyText.trim()}
                  >
                    답변 저장
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className='flex flex-1 items-center justify-center rounded-md bg-gray-50 py-10 text-sm text-gray-400'>
                  아직 등록된 답변이 없습니다.
                </div>
                <div className='mt-auto flex justify-end pt-2'>
                  <Button
                    size='sm'
                    className='bg-gray-700 hover:bg-gray-800'
                    onClick={() => setIsReplyMode(true)}
                  >
                    답변 작성
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── 내부 유틸 컴포넌트 ────────────────────────────────────────────────────────

function CategoryBadge({
  children,
  variant = 'main',
}: {
  children: React.ReactNode;
  variant?: 'main' | 'sub';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        variant === 'main'
          ? 'bg-gray-200 text-gray-700'
          : 'bg-blue-100 text-blue-700'
      )}
    >
      {children}
    </span>
  );
}

function ActionBadge({ action }: { action: InquiryAction }) {
  const style: Record<InquiryAction, string> = {
    경고: 'bg-yellow-100 text-yellow-700',
    '게시글 삭제': 'bg-orange-100 text-orange-700',
    '계정 제재': 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        style[action]
      )}
    >
      {action}
    </span>
  );
}

function CategoryEditor({
  category,
  subCategory,
  onCategoryChange,
  onSubCategoryChange,
  onSave,
  onCancel,
}: {
  category: InquiryCategory | undefined;
  subCategory: InquirySubCategory | undefined;
  onCategoryChange: (v: InquiryCategory) => void;
  onSubCategoryChange: (v: InquirySubCategory) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const subOptions = category ? SUB_CATEGORY_MAP[category] : [];
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <select
        value={category ?? ''}
        onChange={(e) => onCategoryChange(e.target.value as InquiryCategory)}
        className='h-7 rounded border border-gray-300 px-1.5 text-xs focus:outline-none'
      >
        <option value='문의'>문의</option>
        <option value='신고'>신고</option>
      </select>
      <select
        value={subCategory ?? ''}
        onChange={(e) =>
          onSubCategoryChange(e.target.value as InquirySubCategory)
        }
        disabled={!category}
        className='h-7 rounded border border-gray-300 px-1.5 text-xs focus:outline-none disabled:bg-gray-100'
      >
        <option value=''>중분류 선택</option>
        {subOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <button
        type='button'
        onClick={onSave}
        disabled={!category || !subCategory}
        className='rounded bg-gray-700 px-2 py-0.5 text-xs text-white hover:bg-gray-800 disabled:opacity-50'
      >
        저장
      </button>
      <button
        type='button'
        onClick={onCancel}
        className='rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50'
      >
        취소
      </button>
    </div>
  );
}

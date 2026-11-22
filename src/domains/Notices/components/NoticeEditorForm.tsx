import { ArrowLeft, ImagePlus, Video } from 'lucide-react';

import { DateTimePicker, PageHeader, StatusBadge } from '@/shared/components';
import { Button, Card, Input, Label } from '@/shared/components/ui';

import { NOTICE_STATUS_LABELS } from '../constants';
import { useNoticeEditorState } from '../hooks/useNoticeEditorState';
import type { Notice } from '../types';
import { NOTICE_ATTACHMENT_ACCEPT } from '../utils/attachments';
import { hasNoticeContent } from '../utils/content';
import NoticeAttachmentList from './NoticeAttachmentList';
import NoticeBoardSelect from './NoticeBoardSelect';
import NoticeContentEditor from './NoticeContentEditor';
import NoticeEditorActions from './NoticeEditorActions';
import NoticeEditorDialogs from './NoticeEditorDialogs';

export default function NoticeEditorForm({ notice }: { notice?: Notice }) {
  const {
    form,
    updateForm,
    group,
    categories,
    mode,
    error,
    contentRef,
    titleRef,
    errorRef,
    imageInputRef,
    fileInputRef,
    date,
    time,
    onDateSelect,
    onTimeChange,
    canSaveDraft,
    canSchedule,
    visibilityAction,
    changeVisibility,
    canSave,
    isSaving,
    createdPostId,
    createOutcomeUnknown,
    formLocked,
    attachmentsUnavailable,
    preserveSchedule,
    scheduleUnknown,
    changeSchedule,
    keepSchedule,
    actionText,
    requestSave,
    attachFiles,
    requestLeave,
    handleBoardChange,
    handleCategoryChange,
    toggleSchedule,
    dialogProps,
  } = useNoticeEditorState(notice);
  return (
    <div className='mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 pb-4'>
      <div className='space-y-3'>
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 text-gray-500'
          onClick={requestLeave}
          disabled={isSaving}
        >
          <ArrowLeft className='size-4' />
          목록으로
        </Button>
        <PageHeader
          title={
            notice?.deletionStatus
              ? '공지사항 조회'
              : notice
                ? '공지사항 수정'
                : '공지사항 작성'
          }
          description={
            notice?.deletionStatus
              ? '삭제된 공지는 읽기 전용으로 표시됩니다.'
              : '모든 공지사항의 댓글 기능은 비활성화됩니다.'
          }
        />
      </div>
      {notice && (
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          게시글 ID {notice.id}
          <StatusBadge tone={notice.deletionStatus ? 'danger' : 'outline'}>
            {notice.deletionStatus === 'USER_DELETED'
              ? '유저 삭제'
              : notice.deletionStatus === 'ADMIN_DELETED'
                ? '어드민 삭제'
                : NOTICE_STATUS_LABELS[notice.status]}
          </StatusBadge>
        </div>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          requestSave(mode);
        }}
        className='flex min-w-0 flex-col gap-5'
        aria-busy={isSaving}
      >
        <fieldset disabled={formLocked} className='flex min-w-0 flex-col gap-5'>
          <Card className='bg-white p-5'>
            <NoticeBoardSelect
              group={group}
              board={form.board}
              onChange={handleBoardChange}
            />
          </Card>
          {categories.length > 0 && (
            <Card className='space-y-3 bg-white p-5'>
              <fieldset>
                <legend className='mb-3 text-sm font-semibold text-gray-700'>
                  카테고리
                </legend>
                <div className='flex flex-wrap gap-2'>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type='button'
                      size='sm'
                      variant={
                        form.category === category ? 'default' : 'outline'
                      }
                      aria-pressed={form.category === category}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </fieldset>
              <p className='text-xs text-gray-500'>
                선택한 카테고리는 게시글 제목 앞에 표시됩니다. 선택한 항목을
                다시 누르면 해제됩니다.
              </p>
            </Card>
          )}
          <Card className='space-y-3 bg-white p-5'>
            <Label htmlFor='notice-title' required>
              제목
            </Label>
            <Input
              ref={titleRef}
              id='notice-title'
              maxLength={127}
              aria-describedby='notice-title-help'
              placeholder='제목을 입력해 주세요.'
              value={form.title}
              className={
                notice?.deletionStatus ? 'disabled:opacity-100' : undefined
              }
              required
              aria-invalid={!!error && !form.title.trim()}
              onChange={(event) => updateForm({ title: event.target.value })}
            />
            <p
              id='notice-title-help'
              className='text-right text-xs text-gray-500'
            >
              {form.title.length} / 127자
            </p>
          </Card>
          <Card className='min-w-0 overflow-hidden bg-white'>
            <div className='p-5'>
              <Label htmlFor='notice-content'>내용</Label>
            </div>
            <NoticeContentEditor
              disabled={formLocked}
              ref={contentRef}
              id='notice-content'
              value={form.content}
              invalid={!!error && !hasNoticeContent(form.content)}
              onChange={(content) => updateForm({ content })}
            />
          </Card>
          <Card className='min-w-0 space-y-4 bg-white p-5'>
            <h2 className='text-sm font-semibold text-gray-700'>
              이미지 / 동영상 첨부
            </h2>
            <Input
              ref={imageInputRef}
              id='notice-image-upload'
              type='file'
              accept={NOTICE_ATTACHMENT_ACCEPT.image}
              multiple
              disabled={attachmentsUnavailable}
              className='hidden'
              aria-label='이미지 파일 선택'
              onChange={(event) => {
                attachFiles(event.target.files, 'image');
                event.target.value = '';
              }}
            />
            <Input
              ref={fileInputRef}
              id='notice-file-upload'
              accept={NOTICE_ATTACHMENT_ACCEPT.video}
              type='file'
              multiple
              disabled={attachmentsUnavailable}
              className='hidden'
              aria-label='동영상 파일 선택'
              onChange={(event) => {
                attachFiles(event.target.files, 'video');
                event.target.value = '';
              }}
            />
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={attachmentsUnavailable}
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className='size-4 text-blue-600' />
                이미지 업로드
              </Button>
              <Button
                type='button'
                variant='outline'
                disabled={attachmentsUnavailable}
                onClick={() => fileInputRef.current?.click()}
              >
                <Video className='size-4' />
                동영상 업로드
              </Button>
            </div>
            {attachmentsUnavailable ? (
              <p className='text-xs text-gray-500'>
                {notice?.deletionStatus
                  ? '기존 첨부파일은 이 화면에서 확인할 수 없습니다.'
                  : '첨부파일 수정은 현재 지원하지 않습니다. 스노로즈의 해당 게시글 수정 화면에서 변경해 주세요. 기존 첨부파일은 그대로 유지됩니다.'}
              </p>
            ) : (
              <NoticeAttachmentList
                disabled={formLocked}
                attachments={form.attachments}
                onChange={(attachments) => updateForm({ attachments })}
              />
            )}
          </Card>
          {mode === 'scheduled' && (
            <Card className='space-y-4 bg-white p-5'>
              <div className='max-w-lg space-y-2 border-t pt-4'>
                {preserveSchedule ? (
                  <div className='space-y-2'>
                    <p className='text-sm text-gray-700'>
                      기존 예약을 유지합니다.
                    </p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={changeSchedule}
                    >
                      예약 시각 변경
                    </Button>
                  </div>
                ) : (
                  <DateTimePicker
                    label='예약 게시 일시'
                    hour12
                    minuteStep={5}
                    editableMinutes
                    disabled={formLocked}
                    required={!preserveSchedule}
                    date={date}
                    time={time}
                    onDateSelect={onDateSelect}
                    onTimeChange={onTimeChange}
                  />
                )}
                <p className='text-xs text-gray-500'>
                  한국 시간(KST) 기준으로 선택합니다.
                  {preserveSchedule &&
                    ' 예약 시각을 변경하려면 날짜와 시간을 새로 지정해 주세요.'}
                </p>
                {scheduleUnknown && !preserveSchedule && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={keepSchedule}
                  >
                    기존 예약 유지
                  </Button>
                )}
              </div>
            </Card>
          )}
        </fieldset>
        {error && (
          <p
            ref={errorRef}
            role='alert'
            tabIndex={-1}
            className='rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700'
          >
            {error}
          </p>
        )}
        <NoticeEditorActions
          isDraft={notice?.status === 'draft'}
          isSaving={isSaving}
          createdPostId={createdPostId}
          createOutcomeUnknown={createOutcomeUnknown}
          canSave={canSave}
          mode={mode}
          canSaveDraft={canSaveDraft}
          canSchedule={canSchedule}
          visibilityAction={visibilityAction}
          onChangeVisibility={changeVisibility}
          actionText={actionText}
          onCancel={requestLeave}
          onToggleSchedule={toggleSchedule}
          onSaveDraft={() => requestSave('draft')}
        />
        {!canSave && (
          <p className='text-right text-xs text-gray-500'>
            {notice?.deletionStatus
              ? '삭제된 공지는 수정하거나 공개·예약 상태로 변경할 수 없습니다.'
              : '공지 작성·수정 기능은 준비 중입니다.'}
          </p>
        )}
      </form>
      <NoticeEditorDialogs {...dialogProps} />
    </div>
  );
}

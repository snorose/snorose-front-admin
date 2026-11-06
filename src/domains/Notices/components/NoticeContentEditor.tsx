import { type Ref, useImperativeHandle } from 'react';

import { EditorContent } from '@tiptap/react';

import { Button, Dialog, Input, Label } from '@/shared/components/ui';

import {
  type NoticeContentEditorOptions,
  useNoticeContentEditor,
} from '../hooks/useNoticeContentEditor';
import type { NoticeContentEditorHandle } from '../types';
import { isNoticeImageUrl } from '../utils/editor-media';
import NoticeEditorToolbar from './NoticeEditorToolbar';
import './notice-content.css';

interface NoticeContentEditorProps extends NoticeContentEditorOptions {
  ref?: Ref<NoticeContentEditorHandle>;
}

export default function NoticeContentEditor({
  id,
  value,
  onChange,
  invalid = false,
  ref,
}: NoticeContentEditorProps) {
  const {
    editor,
    linkOpen,
    setLinkOpen,
    linkUrl,
    setLinkUrl,
    linkError,
    setLinkError,
    openLink,
    applyLink,
    applyEmbed,
    canEmbed,
    hasLink,
    embedLink,
    keepLink,
    convertLinkToEmbed,
  } = useNoticeContentEditor({ id, value, onChange, invalid });
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (editor && !editor.isDestroyed) editor.commands.focus();
      },
    }),
    [editor]
  );
  return (
    <div className='notice-editor min-w-0'>
      <NoticeEditorToolbar editor={editor} onOpenLink={openLink} />
      {embedLink && (
        <div
          role='group'
          aria-label='링크 첨부 방식'
          className='flex flex-wrap items-center gap-2 border-b bg-blue-50 px-5 py-2 text-xs text-gray-600'
        >
          <span>첨부 방식</span>
          <Button
            type='button'
            variant='ghost'
            size='xs'
            onMouseDown={(event) => event.preventDefault()}
            onClick={keepLink}
          >
            링크로 유지
          </Button>
          <Button
            type='button'
            variant='outline'
            size='xs'
            onMouseDown={(event) => event.preventDefault()}
            onClick={convertLinkToEmbed}
          >
            임베드로 전환
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (editor && !editor.isDestroyed) editor.commands.focus();
          }}
        >
          <Dialog.Header>
            <Dialog.Title>링크 설정</Dialog.Title>
            <Dialog.Description>
              선택한 텍스트에 연결할 주소를 입력해 주세요.
            </Dialog.Description>
          </Dialog.Header>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              applyLink();
            }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor={`${id}-link`}>링크 주소</Label>
              <Input
                id={`${id}-link`}
                value={linkUrl}
                placeholder='https://snorose.com'
                aria-invalid={!!linkError}
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  setLinkError('');
                }}
              />
              {linkError && (
                <p role='alert' className='text-sm text-red-600'>
                  {linkError}
                </p>
              )}
            </div>
            <Dialog.Footer>
              {hasLink && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange('link')
                      .unsetLink()
                      .run();
                    setLinkOpen(false);
                  }}
                >
                  링크 해제
                </Button>
              )}
              <Button
                type='button'
                variant='outline'
                onClick={() => setLinkOpen(false)}
              >
                취소
              </Button>
              {canEmbed && (
                <Button type='button' variant='outline' onClick={applyEmbed}>
                  임베드로 삽입
                </Button>
              )}
              <Button type='submit'>
                {isNoticeImageUrl(linkUrl) ? '이미지 삽입' : '적용'}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

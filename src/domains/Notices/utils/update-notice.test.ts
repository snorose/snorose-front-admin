import { beforeEach, expect, test, vi } from 'vitest';

import {
  NoticeUpdateOutcomeUnknownError,
  createAdminNotice,
  createNoticeThumbnail,
  updateAdminNotice,
  uploadNoticeFile,
} from '@/apis/notices';
import { createSampleNotices } from '@/test/fixtures/notices';

import type { Notice, NoticeForm, NoticeSaveProgress } from '../types';
import { toUpdateNoticeRequest } from './api.mapper';
import { validateNotice } from './notice';
import { saveEditedNotice } from './save-notice';

vi.mock('@/apis/notices', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis/notices')>()),
  createAdminNotice: vi.fn(),
  updateAdminNotice: vi.fn(),
  uploadNoticeFile: vi.fn(),
  createNoticeThumbnail: vi.fn(),
}));
const original = createSampleNotices().find(
  (notice) => notice.status === 'published'
)!;
const progress = (): NoticeSaveProgress => ({});
const form: NoticeForm = { ...original };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(updateAdminNotice).mockResolvedValue({
    postId: original.id,
    status: 'PUBLISHED',
    scheduledAt: null,
    imageUploadUrls: [],
  });
  vi.mocked(uploadNoticeFile).mockResolvedValue(undefined);
  vi.mocked(createNoticeThumbnail).mockResolvedValue(undefined);
});

test.each(['USER_DELETED', 'ADMIN_DELETED'] as const)(
  '%s인 공지는 내용 수정·공개·예약 요청을 보내지 않는다',
  async (deletionStatus) => {
    const source = { ...original, deletionStatus };
    for (const status of ['published', 'private', 'scheduled'] as const)
      await expect(
        saveEditedNotice(
          source,
          { ...form, title: '변경 시도' },
          status,
          progress()
        )
      ).rejects.toThrow('삭제된 공지는 수정할 수 없습니다.');
    expect(updateAdminNotice).not.toHaveBeenCalled();
    expect(uploadNoticeFile).not.toHaveBeenCalled();
    expect(createNoticeThumbnail).not.toHaveBeenCalled();
  }
);

test('알 수 없는 첨부·예약 시각과 변경하지 않은 카테고리는 요청에서 생략해 보존한다', () => {
  const source: Notice = {
    ...original,
    status: 'scheduled',
    scheduledAt: '',
    category: '기존 말머리',
    attachmentsKnown: false,
  };
  const edited = { ...source, title: '수정한 제목' };
  expect(toUpdateNoticeRequest(source, edited, 'scheduled')).toEqual({
    title: '수정한 제목',
  });
  expect(
    validateNotice(edited, 'scheduled', [source], source.id, Date.now(), source)
  ).toBeNull();
  expect(() =>
    toUpdateNoticeRequest(
      source,
      {
        ...edited,
        attachments: [
          {
            id: 'new',
            name: 'new.png',
            type: 'image/png',
            size: 1,
            url: 'blob:x',
            file: new File(['x'], 'new.png', { type: 'image/png' }),
          },
        ],
      },
      'scheduled'
    )
  ).toThrow('기존 첨부');
});

test('기존 본문이 빈 공지도 미전달 값을 채우지 않고 비공개로 바꿀 수 있다', () => {
  const source = { ...original, content: '' };
  const edited = { ...source };
  expect(
    validateNotice(edited, 'private', [source], source.id, Date.now(), source)
  ).toBeNull();
  expect(toUpdateNoticeRequest(source, edited, 'private')).toEqual({
    isVisible: false,
  });
  expect(
    validateNotice(
      { ...form, content: '' },
      'draft',
      [original],
      original.id,
      Date.now(),
      original
    )
  ).toBe('본문을 입력해 주세요.');
});

test('카테고리 해제와 게시판 변경은 명시적으로 전달하며 조회하지 않은 첨부는 삭제하지 않는다', () => {
  expect(
    toUpdateNoticeRequest(
      original,
      { ...form, board: '이벤트', category: '' },
      'published'
    )
  ).toEqual({ boardId: 14, category: '' });
});

test.each(['published', 'scheduled'] as const)(
  '빈 본문으로 임시저장한 글은 %s 전환 전에 본문을 입력해야 한다',
  (status) => {
    const source = { ...original, status: 'draft' as const, content: '' };
    const edited = { ...source, scheduledAt: '2030-01-01T09:00' };
    expect(
      validateNotice(edited, status, [source], source.id, Date.now(), source)
    ).toBe('본문을 입력해 주세요.');
    expect(
      validateNotice(edited, 'draft', [source], source.id, Date.now(), source)
    ).toBeNull();
  }
);

test.each([
  ['draft', 'draft', {}],
  ['draft', 'published', { isVisible: true }],
  ['published', 'private', { isVisible: false }],
  ['private', 'published', { isVisible: true }],
  ['scheduled', 'published', { isVisible: true }],
  ['scheduled', 'private', { isVisible: false }],
] as const)(
  '%s → %s는 허용된 상태 필드만 전달한다',
  (before, after, expected) => {
    expect(
      toUpdateNoticeRequest({ ...original, status: before }, form, after)
    ).toEqual(expected);
  }
);

test('예약 전환에는 공개 여부를 함께 보내지 않고 KST 시각만 전달한다', () => {
  expect(
    toUpdateNoticeRequest(
      { ...original, status: 'draft' },
      { ...form, scheduledAt: '2030-01-01T09:23' },
      'scheduled'
    )
  ).toEqual({ scheduledAt: '2030-01-01T09:23:00' });
  expect(() => toUpdateNoticeRequest(original, form, 'scheduled')).toThrow(
    '예약할 수 없습니다'
  );
  expect(() =>
    toUpdateNoticeRequest({ ...original, status: 'draft' }, form, 'private')
  ).toThrow('변경할 수 없습니다');
});

test('첨부를 조회한 경우 최종 순서와 기존 ID·신규 null ID를 구분하고 빈 배열만 전체 삭제다', () => {
  const kept = {
    id: 'existing',
    attachmentId: 31,
    name: 'old.png',
    type: 'image/png',
    size: 1,
    url: 'https://cdn.test/old.png',
  };
  const added = {
    ...kept,
    id: 'new',
    attachmentId: undefined,
    name: 'new.png',
    file: new File(['x'], 'new.png', { type: 'image/png' }),
  };
  const source = { ...original, attachments: [kept] };
  expect(
    toUpdateNoticeRequest(
      source,
      { ...form, attachments: [added, kept] },
      'published'
    ).images
  ).toEqual([
    { id: null, type: 'PHOTO', fileName: 'new.png', fileComment: '' },
    { id: 31, type: 'PHOTO', fileName: 'old.png', fileComment: '' },
  ]);
  expect(
    toUpdateNoticeRequest(source, { ...form, attachments: [] }, 'published')
      .images
  ).toEqual([]);
  expect(
    toUpdateNoticeRequest(source, { ...form, attachments: [kept] }, 'published')
  ).not.toHaveProperty('images');
});

test('수정에서는 POST를 호출하지 않고 변경한 필드만 PATCH한다', async () => {
  await saveEditedNotice(
    original,
    { ...form, title: '새 제목' },
    'published',
    progress()
  );
  expect(updateAdminNotice).toHaveBeenCalledExactlyOnceWith(original.id, {
    title: '새 제목',
  });
  expect(createAdminNotice).not.toHaveBeenCalled();
  expect(uploadNoticeFile).not.toHaveBeenCalled();
  expect(createNoticeThumbnail).not.toHaveBeenCalled();
});

test.each(['draft', 'scheduled', 'private'] as const)(
  '%s에서 게시하면 기존 첨부를 재전송하지 않고 썸네일을 생성한다',
  async (status) => {
    await saveEditedNotice(
      { ...original, status, attachmentsKnown: false },
      form,
      'published',
      progress()
    );
    expect(updateAdminNotice).toHaveBeenCalledExactlyOnceWith(original.id, {
      isVisible: true,
    });
    expect(uploadNoticeFile).not.toHaveBeenCalled();
    expect(createNoticeThumbnail).toHaveBeenCalledExactlyOnceWith(
      original.boardId,
      original.id
    );
  }
);

test('신규 파일 업로드 실패 후 PATCH와 파일 업로드를 반복하지 않는다', async () => {
  const edited = {
    ...form,
    attachments: ['a', 'b'].map((name) => ({
      id: name,
      name: `${name}.png`,
      type: 'image/png',
      size: 1,
      url: `blob:${name}`,
      file: new File([name], `${name}.png`, { type: 'image/png' }),
    })),
  };
  vi.mocked(updateAdminNotice).mockResolvedValue({
    postId: original.id,
    status: 'PUBLISHED',
    scheduledAt: null,
    imageUploadUrls: ['https://upload.test/a', 'https://upload.test/b'],
  });
  vi.mocked(uploadNoticeFile).mockRejectedValueOnce(new Error('업로드 실패'));
  const state = progress();
  await expect(
    saveEditedNotice(original, edited, 'published', state)
  ).rejects.toThrow('일부 첨부');
  await expect(
    saveEditedNotice(original, edited, 'published', state)
  ).rejects.toThrow('이미 수정된');
  expect(updateAdminNotice).toHaveBeenCalledOnce();
  expect(uploadNoticeFile).toHaveBeenCalledTimes(2);
  expect(createNoticeThumbnail).not.toHaveBeenCalled();
  await expect(
    saveEditedNotice(
      original,
      { ...edited, title: '다른 내용' },
      'published',
      state
    )
  ).rejects.toThrow('이미 수정된');
});

test('수정 결과가 불명확하면 같은 PATCH를 자동 재전송하지 않는다', async () => {
  vi.mocked(updateAdminNotice).mockRejectedValue(
    new NoticeUpdateOutcomeUnknownError()
  );
  const state = progress();
  await expect(
    saveEditedNotice(original, form, 'published', state)
  ).rejects.toBeInstanceOf(NoticeUpdateOutcomeUnknownError);
  await expect(
    saveEditedNotice(original, form, 'published', state)
  ).rejects.toBeInstanceOf(NoticeUpdateOutcomeUnknownError);
  expect(state.updateOutcomeUnknown).toBe(true);
  expect(updateAdminNotice).toHaveBeenCalledOnce();
});

import { beforeEach, expect, test, vi } from 'vitest';

import {
  NoticeCreateOutcomeUnknownError,
  createAdminNotice,
  createNoticeThumbnail,
  uploadNoticeFile,
} from '@/apis/notices';

import type { NoticeForm, NoticeSaveProgress } from '../types';
import { saveNewNotice } from './save-notice';

vi.mock('@/apis/notices', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis/notices')>()),
  createAdminNotice: vi.fn(),
  createNoticeThumbnail: vi.fn(),
  uploadNoticeFile: vi.fn(),
}));
const form: NoticeForm = {
  title: '작성 연결',
  content: '<p>본문</p>',
  board: '공지사항',
  category: '',
  pinned: false,
  scheduledAt: '',
  attachments: [],
};
const mediaForm: NoticeForm = {
  ...form,
  attachments: [
    {
      id: 'photo',
      name: 'photo.png',
      type: 'image/png',
      size: 1,
      url: 'blob:photo',
      file: new File(['p'], 'photo.png', { type: 'image/png' }),
    },
    {
      id: 'video',
      name: 'video.mp4',
      type: 'video/mp4',
      size: 1,
      url: 'blob:video',
      file: new File(['v'], 'video.mp4', { type: 'video/mp4' }),
    },
  ],
};
const progress = (): NoticeSaveProgress => ({
  uploaded: new Set(),
  thumbnailReady: false,
});
const result = {
  postId: 123,
  imageUploadUrls: ['https://upload.test/photo', 'https://upload.test/video'],
  isDraft: false,
  isScheduled: false,
  scheduledAt: null,
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(createAdminNotice).mockResolvedValue(result);
  vi.mocked(uploadNoticeFile).mockResolvedValue(undefined);
  vi.mocked(createNoticeThumbnail).mockResolvedValue(undefined);
});

test.each(['published', 'draft', 'scheduled'] as const)(
  '%s 요청 상태와 첨부 순서를 유지한다',
  async (status) => {
    await saveNewNotice(
      {
        ...mediaForm,
        scheduledAt: status === 'scheduled' ? '2030-01-01T10:00' : '',
      },
      status,
      progress()
    );
    expect(createAdminNotice).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        boardId: 12,
        isDraft: status === 'draft',
        isScheduled: status === 'scheduled',
        scheduledAt: status === 'scheduled' ? '2030-01-01T10:00:00' : null,
        images: [
          { type: 'PHOTO', fileName: 'photo.png', fileComment: '' },
          { type: 'VIDEO', fileName: 'video.mp4', fileComment: '' },
        ],
      })
    );
    expect(uploadNoticeFile).toHaveBeenNthCalledWith(
      1,
      result.imageUploadUrls[0],
      mediaForm.attachments[0].file
    );
    expect(uploadNoticeFile).toHaveBeenNthCalledWith(
      2,
      result.imageUploadUrls[1],
      mediaForm.attachments[1].file
    );
    if (status === 'published')
      expect(createNoticeThumbnail).toHaveBeenCalledExactlyOnceWith(12, 123);
    else expect(createNoticeThumbnail).not.toHaveBeenCalled();
  }
);

test('파일 없는 공지는 업로드와 썸네일 호출 없이 저장한다', async () => {
  vi.mocked(createAdminNotice).mockResolvedValue({
    ...result,
    imageUploadUrls: [],
  });
  await saveNewNotice(form, 'draft', progress());
  expect(uploadNoticeFile).not.toHaveBeenCalled();
  expect(createNoticeThumbnail).not.toHaveBeenCalled();
});

test('일부 업로드 실패 후 공지를 다시 만들지 않고 실패한 파일만 재시도한다', async () => {
  const state = progress();
  vi.mocked(uploadNoticeFile).mockRejectedValueOnce(new Error('실패'));
  await expect(saveNewNotice(mediaForm, 'published', state)).rejects.toThrow(
    '일부 첨부'
  );
  expect(state.uploaded).toEqual(new Set([1]));
  await saveNewNotice(mediaForm, 'published', state);
  expect(createAdminNotice).toHaveBeenCalledOnce();
  expect(uploadNoticeFile).toHaveBeenCalledTimes(3);
  expect(uploadNoticeFile).toHaveBeenLastCalledWith(
    result.imageUploadUrls[0],
    mediaForm.attachments[0].file
  );
  expect(createNoticeThumbnail).toHaveBeenCalledOnce();
});

test('썸네일 실패는 POST와 파일 업로드를 반복하지 않고 해당 단계만 재시도한다', async () => {
  const state = progress();
  vi.mocked(createNoticeThumbnail).mockRejectedValueOnce(
    new Error('썸네일 실패')
  );
  await expect(saveNewNotice(mediaForm, 'published', state)).rejects.toThrow(
    '썸네일 실패'
  );
  await saveNewNotice(mediaForm, 'published', state);
  expect(createAdminNotice).toHaveBeenCalledOnce();
  expect(uploadNoticeFile).toHaveBeenCalledTimes(2);
  expect(createNoticeThumbnail).toHaveBeenCalledTimes(2);
});

test('생성 결과를 확인하지 못하면 같은 작성 화면에서 POST를 반복하지 않는다', async () => {
  const state = progress();
  vi.mocked(createAdminNotice).mockRejectedValueOnce(
    new NoticeCreateOutcomeUnknownError()
  );
  await expect(saveNewNotice(form, 'draft', state)).rejects.toThrow(
    '저장 결과'
  );
  expect(state.createOutcomeUnknown).toBe(true);
  await expect(saveNewNotice(form, 'draft', state)).rejects.toThrow(
    '중복 등록'
  );
  expect(createAdminNotice).toHaveBeenCalledOnce();
  expect(uploadNoticeFile).not.toHaveBeenCalled();
});

test('생성 후 잘못된 업로드 주소나 변경된 요청을 다시 POST하지 않는다', async () => {
  const state = progress();
  vi.mocked(createAdminNotice).mockResolvedValue({
    ...result,
    imageUploadUrls: [],
  });
  await expect(saveNewNotice(mediaForm, 'draft', state)).rejects.toThrow(
    '주소'
  );
  await expect(saveNewNotice(mediaForm, 'draft', state)).rejects.toThrow(
    '주소'
  );
  await expect(
    saveNewNotice({ ...mediaForm, title: '다른 제목' }, 'draft', state)
  ).rejects.toThrow('이미 생성된');
  expect(createAdminNotice).toHaveBeenCalledOnce();
});

test('실제 파일이 없거나 비공개 생성 요청이면 등록 전에 거절한다', async () => {
  await expect(
    saveNewNotice(
      {
        ...mediaForm,
        attachments: [{ ...mediaForm.attachments[0], file: undefined }],
      },
      'draft',
      progress()
    )
  ).rejects.toThrow('다시 첨부');
  await expect(saveNewNotice(form, 'private', progress())).rejects.toThrow(
    '새 공지'
  );
  expect(createAdminNotice).not.toHaveBeenCalled();
});

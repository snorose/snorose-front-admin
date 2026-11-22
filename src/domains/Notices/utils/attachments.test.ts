import { describe, expect, test } from 'vitest';

import type { NoticeAttachment } from '../types';
import { toCreateNoticeRequest } from './api.mapper';
import {
  getNoticeThumbnailId,
  moveNoticeAttachment,
  selectNoticeFiles,
  validateNoticeAttachments,
} from './attachments';

const attachments: NoticeAttachment[] = [
  {
    id: 'one',
    name: '첫사진.png',
    type: 'image/png',
    size: 10,
    url: 'blob:one',
  },
  {
    id: 'video',
    name: '영상.mp4',
    type: 'video/mp4',
    size: 20,
    url: 'blob:video',
  },
  {
    id: 'two',
    name: '둘째사진.png',
    type: 'image/png',
    size: 30,
    url: 'blob:two',
  },
];

describe('공지 첨부 순서', () => {
  test('누적 이미지 5개·동영상 1개 제한을 적용한다', () => {
    const images = Array.from({ length: 5 }, (_, index) => ({
      ...attachments[0],
      id: String(index),
    }));
    const image = new File(['x'], '추가.png', { type: 'image/png' });
    const video = new File(['x'], '추가.mp4', { type: 'video/mp4' });
    expect(selectNoticeFiles([image], images, 'image')).toMatchObject({
      files: [],
      error: expect.stringContaining('5개'),
    });
    expect(selectNoticeFiles([video], [attachments[1]], 'video')).toMatchObject(
      { files: [], error: expect.stringContaining('1개') }
    );
    expect(validateNoticeAttachments([...images, attachments[0]])).toContain(
      '5개'
    );
    expect(selectNoticeFiles([video], images, 'video')).toEqual({
      files: [video],
      error: null,
    });
  });

  test('용량 경계는 허용하고 초과·금지 파일명만 제외하여 정상 파일을 유지한다', () => {
    for (const [kind, type, extension, limit] of [
      ['image', 'image/png', 'png', 7],
      ['video', 'video/mp4', 'mp4', 50],
    ] as const) {
      const boundary = new File(['x'], `정상.${extension}`, { type });
      Object.defineProperty(boundary, 'size', { value: limit * 1024 * 1024 });
      expect(selectNoticeFiles([boundary], [], kind)).toEqual({
        files: [boundary],
        error: null,
      });
      const oversized = new File(['x'], `초과.${extension}`, { type });
      Object.defineProperty(oversized, 'size', {
        value: limit * 1024 * 1024 + 1,
      });
      expect(selectNoticeFiles([oversized], [], kind)).toMatchObject({
        files: [],
        error: expect.stringContaining(`${limit}MB`),
      });
      expect(
        validateNoticeAttachments([
          {
            ...attachments[0],
            name: oversized.name,
            type,
            size: oversized.size,
          },
        ])
      ).toContain(`${limit}MB`);
    }
    const valid = new File(['x'], '정상.png', { type: 'image/png' });
    const invalid = new File(['x'], '금지#파일.png', { type: 'image/png' });
    expect(selectNoticeFiles([valid, invalid], [], 'image')).toMatchObject({
      files: [valid],
      error: expect.stringContaining('파일 이름'),
    });
  });

  test('MIME이 없는 정상 확장자는 허용하고 다른 종류와 알 수 없는 파일은 거부한다', () => {
    const image = new File(['x'], '사진.PNG');
    const video = new File(['x'], '영상.mov');
    expect(selectNoticeFiles([image], [], 'image').files).toEqual([image]);
    expect(selectNoticeFiles([video], [], 'video').files).toEqual([video]);
    expect(selectNoticeFiles([video], [], 'image').files).toEqual([]);
    expect(
      selectNoticeFiles([new File(['x'], '알수없음.bin')], [], 'video').files
    ).toEqual([]);
  });

  test.each(['jpng', 'gif', 'svg', 'heic', 'avif'])(
    'MIME이 이미지여도 미지원 확장자 .%s는 선택과 저장 전에 거절한다',
    (extension) => {
      const file = new File(['invalid'], `사진.${extension}`, {
        type: 'image/png',
      });
      expect(selectNoticeFiles([file], [], 'image')).toMatchObject({
        files: [],
        error: expect.stringContaining('JPG, JPEG, PNG'),
      });
      expect(
        validateNoticeAttachments([
          { ...attachments[0], name: file.name, type: file.type },
        ])
      ).toContain('JPG, JPEG, PNG');
    }
  );

  test.each(['jpg', 'jpeg', 'png', 'jfif', 'bmp', 'webp'])(
    '유저단에서 허용하는 .%s 확장자는 대소문자와 관계없이 선택한다',
    (extension) => {
      const file = new File(['image'], `사진.${extension.toUpperCase()}`, {
        type: 'image/png',
      });
      expect(selectNoticeFiles([file], [], 'image')).toEqual({
        files: [file],
        error: null,
      });
    }
  );

  test.each(['avi', 'webm', 'wmv'])(
    '유저단에서 허용하지 않는 동영상 .%s는 선택하지 않는다',
    (extension) => {
      const file = new File(['video'], `영상.${extension}`, {
        type: 'video/mp4',
      });
      expect(selectNoticeFiles([file], [], 'video')).toMatchObject({
        files: [],
        error: expect.stringContaining('MP4, MOV'),
      });
    }
  );

  test.each([
    ['사진.jpg', 'video/mp4', 'image'],
    ['영상.mp4', 'image/jpeg', 'video'],
  ] as const)(
    '확장자와 MIME 종류가 맞지 않는 %s는 거절한다',
    (name, type, kind) => {
      const file = new File(['file'], name, { type });
      expect(selectNoticeFiles([file], [], kind).files).toEqual([]);
    }
  );

  test('이동한 순서가 썸네일 선택과 API 첨부 배열 순서에 반영된다', () => {
    const moved = moveNoticeAttachment(attachments, 'two', 0);
    expect(moved.map((attachment) => attachment.id)).toEqual([
      'two',
      'one',
      'video',
    ]);
    expect(attachments[0].id).toBe('one');
    expect(getNoticeThumbnailId(moved)).toBe('two');
    const request = toCreateNoticeRequest(
      {
        board: '이벤트',
        category: '',
        title: '순서 안내',
        content: '본문',
        attachments: moved,
        pinned: false,
        scheduledAt: '',
      },
      'published'
    );
    expect(request.images.map((image) => image.fileName)).toEqual([
      '둘째사진.png',
      '첫사진.png',
      '영상.mp4',
    ]);
    expect(request.images.map((image) => image.type)).toEqual([
      'PHOTO',
      'PHOTO',
      'VIDEO',
    ]);
  });

  test('서버와 동일하게 동영상을 포함한 첫 첨부가 썸네일이다', () => {
    const moved = moveNoticeAttachment(attachments, 'video', 0);
    expect(getNoticeThumbnailId(moved)).toBe('video');
    expect(
      getNoticeThumbnailId(
        moved.filter((attachment) => attachment.id !== 'one')
      )
    ).toBe('video');
    expect(getNoticeThumbnailId([attachments[1]])).toBe('video');
    expect(getNoticeThumbnailId([])).toBeUndefined();
  });

  test('없는 첨부나 범위 밖 이동으로 항목을 삭제하지 않는다', () => {
    for (const [id, position] of [
      ['one', -1],
      ['one', 3],
      ['missing', 0],
      ['one', 0],
    ] as const)
      expect(moveNoticeAttachment(attachments, id, position)).toBe(attachments);
  });
});

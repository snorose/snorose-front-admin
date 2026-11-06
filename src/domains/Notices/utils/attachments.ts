import type { NoticeAttachment } from '../types';

// snorose-front shared/constant/attachment.js와 동일한 첨부 정책입니다.
export const NOTICE_ATTACHMENT_LIMITS = {
  image: { quantity: 5, size: 7 * 1024 * 1024 },
  video: { quantity: 1, size: 50 * 1024 * 1024 },
} as const;
export type NoticeMediaKind = keyof typeof NOTICE_ATTACHMENT_LIMITS;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'jfif', 'bmp', 'webp'];
const VIDEO_EXTENSIONS = ['mp4', 'mov'];
const VALID_FILE_NAME = /^[\p{L}\p{N} ~!@$^&()\-_=[\]{};`',.]+$/u;

export function getNoticeFileType(file: Pick<File, 'name' | 'type'>) {
  if (file.type) return /^(image|video)\//.test(file.type) ? file.type : null;
  const extension = file.name.split('.').at(-1)?.toLowerCase() ?? '';
  if (IMAGE_EXTENSIONS.includes(extension))
    return `image/${extension === 'jpg' || extension === 'jfif' ? 'jpeg' : extension}`;
  if (VIDEO_EXTENSIONS.includes(extension))
    return extension === 'mov' ? 'video/quicktime' : 'video/mp4';
  return null;
}

function getAttachmentError(
  file: Pick<NoticeAttachment, 'name' | 'type' | 'size'>
) {
  const kind = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : null;
  if (!kind) return '이미지와 동영상만 첨부할 수 있습니다.';
  if (!VALID_FILE_NAME.test(file.name))
    return '파일 이름에 사용할 수 없는 문자가 있습니다. 파일 이름을 변경해 주세요.';
  if (file.size > NOTICE_ATTACHMENT_LIMITS[kind].size)
    return kind === 'image'
      ? '이미지는 파일당 7MB 이하로 첨부해 주세요.'
      : '동영상은 파일당 50MB 이하로 첨부해 주세요.';
  return null;
}

export function validateNoticeAttachments(attachments: NoticeAttachment[]) {
  for (const kind of ['image', 'video'] as const) {
    if (
      attachments.filter((file) => file.type.startsWith(`${kind}/`)).length >
      NOTICE_ATTACHMENT_LIMITS[kind].quantity
    )
      return kind === 'image'
        ? '이미지는 최대 5개까지 첨부할 수 있습니다.'
        : '동영상은 최대 1개까지 첨부할 수 있습니다.';
  }
  return attachments.map(getAttachmentError).find(Boolean) ?? null;
}

export function selectNoticeFiles(
  files: File[],
  current: NoticeAttachment[],
  kind: NoticeMediaKind
) {
  const types = files.map(getNoticeFileType);
  if (types.some((type) => !type?.startsWith(`${kind}/`)))
    return {
      files: [],
      error:
        kind === 'image'
          ? '이미지 파일을 선택해 주세요.'
          : '동영상 파일을 선택해 주세요.',
    };
  if (
    current.filter((file) => file.type.startsWith(`${kind}/`)).length +
      files.length >
    NOTICE_ATTACHMENT_LIMITS[kind].quantity
  )
    return {
      files: [],
      error:
        kind === 'image'
          ? '이미지는 최대 5개까지 첨부할 수 있습니다.'
          : '동영상은 최대 1개까지 첨부할 수 있습니다.',
    };
  const errors = files.map((file, index) =>
    getAttachmentError({
      name: file.name,
      size: file.size,
      type: types[index]!,
    })
  );
  return {
    files: files.filter((_, index) => !errors[index]),
    error: [...new Set(errors.filter(Boolean))].join(' ') || null,
  };
}

export function moveNoticeAttachment(
  attachments: NoticeAttachment[],
  id: string,
  to: number
) {
  const from = attachments.findIndex((attachment) => attachment.id === id);
  if (
    from < 0 ||
    !Number.isInteger(to) ||
    to < 0 ||
    to >= attachments.length ||
    from === to
  )
    return attachments;
  const next = [...attachments];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function getNoticeThumbnailId(attachments: NoticeAttachment[]) {
  return attachments.find((attachment) => attachment.type.startsWith('image/'))
    ?.id;
}

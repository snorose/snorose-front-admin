import type { PopupContent } from '@/domains/Operation/types';
import {
  extractMarkdownUrls,
  isAllowedMarkdownUrl,
} from '@/domains/Operation/utils';

const MAX_POPUP_BODY_MARKDOWN_LENGTH = 3000;
const ALLOWED_POPUP_IMAGE_EXTENSIONS = new Set([
  'gif',
  'jpeg',
  'jpg',
  'png',
  'webp',
]);

function hasAllowedImageExtension(fileName: string) {
  const extension = fileName.trim().split('.').pop()?.toLowerCase();

  return extension ? ALLOWED_POPUP_IMAGE_EXTENSIONS.has(extension) : false;
}

export function validatePopupContent(popup: PopupContent) {
  if (!popup.title.trim()) {
    return '팝업 제목을 입력해주세요.';
  }

  if (!popup.startDate || !popup.endDate) {
    return '게시 시작일과 종료일을 입력해주세요.';
  }

  if (popup.startDate > popup.endDate) {
    return '게시 종료일은 시작일보다 빠를 수 없습니다.';
  }

  if (popup.bodyMarkdown.length > MAX_POPUP_BODY_MARKDOWN_LENGTH) {
    return `본문은 ${MAX_POPUP_BODY_MARKDOWN_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  const invalidUrl = extractMarkdownUrls(popup.bodyMarkdown).find(
    (url) => !isAllowedMarkdownUrl(url)
  );

  if (invalidUrl) {
    return '본문 링크에는 http, https, mailto, tel 또는 내부 경로만 사용할 수 있습니다.';
  }

  if (popup.imageFileName && !hasAllowedImageExtension(popup.imageFileName)) {
    return '이미지는 jpg, jpeg, png, gif, webp 파일만 첨부할 수 있습니다.';
  }

  return null;
}

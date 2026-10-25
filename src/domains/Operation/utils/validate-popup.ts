import type { PopupContent } from '@/domains/Operation/types';
import {
  extractMarkdownUrls,
  isAllowedMarkdownUrl,
} from '@/domains/Operation/utils';

const ALLOWED_POPUP_IMAGE_EXTENSIONS = new Set(['jpeg', 'jpg', 'png', 'webp']);

function hasAllowedImageExtension(fileName: string) {
  const extension = fileName.trim().split('.').pop()?.toLowerCase();

  return extension ? ALLOWED_POPUP_IMAGE_EXTENSIONS.has(extension) : false;
}

export function validatePopupContent(
  popup: PopupContent,
  maxDisplayOrder?: number
) {
  if (!popup.title.trim()) {
    return '팝업 제목을 입력해주세요.';
  }

  if (!popup.startDate || !popup.endDate) {
    return '게시 시작일과 종료일을 입력해주세요.';
  }

  if (popup.startDate > popup.endDate) {
    return '게시 종료일은 시작일보다 빠를 수 없습니다.';
  }

  if (!Number.isInteger(popup.displayPriority) || popup.displayPriority < 0) {
    return '노출 순서는 0 이상의 정수로 입력해주세요.';
  }

  if (
    maxDisplayOrder !== undefined &&
    popup.displayPriority > maxDisplayOrder
  ) {
    return `노출 순서는 0부터 ${maxDisplayOrder}까지 입력해주세요.`;
  }

  const invalidUrl = extractMarkdownUrls(popup.bodyMarkdown).find(
    (url) => !isAllowedMarkdownUrl(url)
  );

  if (invalidUrl) {
    return '본문 링크에는 http, https, mailto, tel 또는 내부 경로만 사용할 수 있습니다.';
  }

  return null;
}

export function validatePopupImage(file: File) {
  if (
    !hasAllowedImageExtension(file.name) ||
    !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
  ) {
    return '이미지는 PNG, JPEG, WebP 파일만 첨부할 수 있습니다.';
  }
  if (file.size > 10 * 1024 * 1024) {
    return '파일 크기는 10MB를 초과할 수 없습니다.';
  }
  return null;
}

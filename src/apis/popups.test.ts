import { beforeEach, describe, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import {
  createPopup,
  deletePopup,
  getPopupDetail,
  getPopups,
  updatePopup,
} from './popups';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

async function readRequest(form: FormData) {
  const blob = form.get('request') as Blob;
  expect(blob.type).toBe('application/json');
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(blob);
  });
  return JSON.parse(text);
}

beforeEach(() => {
  vi.clearAllMocks();
  for (const method of [
    axiosInstance.get,
    axiosInstance.post,
    axiosInstance.patch,
    axiosInstance.delete,
  ]) {
    vi.mocked(method).mockResolvedValue({
      data: { isSuccess: true, result: { id: 1 } },
    });
  }
});

describe('팝업 API 계약', () => {
  test('목록은 0 기반 페이지로 조회한다', async () => {
    await getPopups(2);
    expect(axiosInstance.get).toHaveBeenCalledWith('/v1/admin/popups', {
      params: { page: 2 },
    });
  });
  test('상세와 삭제는 팝업 ID로 요청한다', async () => {
    await getPopupDetail(7);
    await deletePopup(7);
    expect(axiosInstance.get).toHaveBeenCalledWith('/v1/admin/popups/7');
    expect(axiosInstance.delete).toHaveBeenCalledWith('/v1/admin/popups/7');
  });
  test('등록은 JSON request와 이미지 파일을 별도 파트로 전송한다', async () => {
    const request = {
      title: '팝업',
      description: null,
      startDate: '2026-10-20',
      endDate: '2026-10-22',
      displayOrder: 0,
    };
    const image = new File(['image'], 'notice.png', { type: 'image/png' });
    await expect(createPopup(request, image)).resolves.toEqual({ id: 1 });
    const [url, form, config] = vi.mocked(axiosInstance.post).mock.calls[0];
    if (!(form instanceof FormData))
      throw new Error('multipart 요청이 아닙니다.');
    expect(url).toBe('/v1/admin/popups');
    expect(await readRequest(form)).toEqual(request);
    expect(form.get('image')).toBe(image);
    expect(config?.headers?.['Content-Type']).toBeUndefined();
  });
  test('본문·이미지 삭제는 null과 removeImage를 보내고 파일 파트는 생략한다', async () => {
    await updatePopup(1, { description: null, removeImage: true });
    const [url, form] = vi.mocked(axiosInstance.patch).mock.calls[0];
    if (!(form instanceof FormData))
      throw new Error('multipart 요청이 아닙니다.');
    expect(url).toBe('/v1/admin/popups/1');
    expect(await readRequest(form)).toEqual({
      description: null,
      removeImage: true,
    });
    expect(form.has('image')).toBe(false);
  });
  test('이미지 교체 요청은 삭제 플래그 없이 파일을 전송한다', async () => {
    const image = new File(['image'], 'notice.webp', { type: 'image/webp' });
    await updatePopup(1, {}, image);
    const form = vi.mocked(axiosInstance.patch).mock.calls[0][1];
    if (!(form instanceof FormData))
      throw new Error('multipart 요청이 아닙니다.');
    expect(await readRequest(form)).toEqual({});
    expect(form.get('image')).toBe(image);
  });
  test('실패 응답을 성공으로 처리하지 않는다', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { isSuccess: false, message: '유저의 권한이 없습니다.' },
    });
    await expect(getPopups(0)).rejects.toThrow('유저의 권한이 없습니다.');
  });
});

import { beforeEach, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import { createAdminMaintenance, uploadMaintenanceImage } from './maintenance';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
const body = {
  title: '점검',
  startAt: '2026-11-10 02:00:00',
  endAt: '2026-11-10 04:00:00',
  memo: '작업',
};
test('인증 axios로 생성 요청을 보내고 결과를 반환한다', async () => {
  const result = { id: 1, attachmentUrlList: [] };
  vi.mocked(axiosInstance.post).mockResolvedValue({
    data: { isSuccess: true, result },
  });
  expect(await createAdminMaintenance(body)).toEqual(result);
  expect(axiosInstance.post).toHaveBeenCalledWith(
    '/v1/admin/server-maintenances',
    body
  );
});
test('실패 응답의 서버 메시지를 전달한다', async () => {
  vi.mocked(axiosInstance.post).mockResolvedValue({
    data: { isSuccess: false, message: '중복 기간' },
  });
  await expect(createAdminMaintenance(body)).rejects.toThrow('중복 기간');
});
test('이미지는 관리자 인증 없이 presigned URL에 PUT하며 실패를 전파한다', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: false });
  vi.stubGlobal('fetch', fetchMock);
  const file = new File(['image'], 'a.png', { type: 'image/png' });
  await expect(
    uploadMaintenanceImage('https://example.com/upload', file)
  ).rejects.toThrow('이미지 업로드');
  expect(fetchMock).toHaveBeenCalledWith(
    'https://example.com/upload',
    expect.objectContaining({
      method: 'PUT',
      body: file,
      credentials: 'omit',
      headers: { 'Content-Type': 'image/png' },
    })
  );
  await expect(
    uploadMaintenanceImage('http://example.com/upload', file)
  ).rejects.toThrow('주소');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('성공 여부나 생성 번호가 누락된 응답은 결과 불명으로 처리한다', async () => {
  const { MaintenanceOutcomeUnknownError } = await import('./maintenance');
  for (const data of [{}, { isSuccess: true, result: {} }]) {
    vi.mocked(axiosInstance.post).mockResolvedValue({ data });
    await expect(createAdminMaintenance(body)).rejects.toBeInstanceOf(
      MaintenanceOutcomeUnknownError
    );
  }
});

test('목록은 인증 axios로 조회하고 배열을 그대로 반환한다', async () => {
  const { getAdminMaintenances } = await import('./maintenance');
  const result = [{ id: 12, number: 1, status: 'SCHEDULED' }];
  vi.mocked(axiosInstance.get).mockResolvedValue({
    data: { isSuccess: true, result },
  });
  expect(await getAdminMaintenances()).toEqual(result);
  expect(axiosInstance.get).toHaveBeenCalledWith(
    '/v1/admin/server-maintenances'
  );
  vi.mocked(axiosInstance.get).mockResolvedValue({
    data: { isSuccess: false, message: '조회 실패' },
  });
  await expect(getAdminMaintenances()).rejects.toThrow('조회 실패');
});

test('수정은 생략한 필드를 유지하고 명시적인 문구·이미지 삭제를 전송한다', async () => {
  const { updateAdminMaintenance } = await import('./maintenance');
  const result = { id: 12, attachmentUrlList: [] };
  vi.mocked(axiosInstance.patch).mockResolvedValue({
    data: { isSuccess: true, result },
  });
  expect(
    await updateAdminMaintenance(12, { noticeMessage: '', attachments: [] })
  ).toEqual(result);
  expect(axiosInstance.patch).toHaveBeenCalledWith(
    '/v1/admin/server-maintenances/12',
    { noticeMessage: '', attachments: [] }
  );
  vi.mocked(axiosInstance.patch).mockResolvedValue({
    data: { isSuccess: false, message: '중복 기간' },
  });
  await expect(updateAdminMaintenance(12, { title: '변경' })).rejects.toThrow(
    '중복 기간'
  );
});
test('삭제는 실제 id를 사용하고 진행 중 일정 거부 메시지를 전달한다', async () => {
  const { deleteAdminMaintenance } = await import('./maintenance');
  vi.mocked(axiosInstance.delete).mockResolvedValue({
    data: { isSuccess: true, result: { message: 'Complete' } },
  });
  expect(await deleteAdminMaintenance(12)).toEqual({ message: 'Complete' });
  expect(axiosInstance.delete).toHaveBeenCalledWith(
    '/v1/admin/server-maintenances/12'
  );
  vi.mocked(axiosInstance.delete).mockResolvedValue({
    data: {
      isSuccess: false,
      message: '진행 중인 서버 점검은 삭제할 수 없습니다.',
    },
  });
  await expect(deleteAdminMaintenance(12)).rejects.toThrow(
    '진행 중인 서버 점검'
  );
});

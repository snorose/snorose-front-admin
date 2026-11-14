import { expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import { getAdminInquiriesAPI } from './inquiries';

vi.mock('@/shared/axios/instance', () => ({ axiosInstance: { get: vi.fn() } }));

test('문의·신고 검색 조건과 취소 signal을 전달하고 응답의 그룹·담당자 정보를 보존한다', async () => {
  const row = {
    postId: 1,
    group: 'Report',
    manager: '관리송이',
    encryptedAdminId: 'admin-id',
  };
  vi.mocked(axiosInstance.get).mockResolvedValue({
    data: { result: { hasNext: true, data: [row] } },
  });
  const params = {
    page: 2,
    searchKey: '20260000',
    group: 'REPORT',
    subGroup: 'USER_REPORT',
  } as const;
  const { signal } = new AbortController();
  const result = await getAdminInquiriesAPI(params, signal);
  expect(axiosInstance.get).toHaveBeenCalledWith('/v1/admin/inquiries', {
    params,
    signal,
  });
  expect(result).toEqual({
    hasNext: true,
    data: [{ ...row, group: 'REPORT' }],
  });
});

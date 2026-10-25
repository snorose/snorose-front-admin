import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import { isPopupMockEnabled } from '@/domains/Operation/mocks/config';
import type {
  CreatePopupRequest,
  PopupDetail,
  PopupListResult,
  UpdatePopupRequest,
} from '@/domains/Operation/types/popup';

function getResult<T>(response: BaseResponse<T>): T {
  if (!response.isSuccess) throw new Error(response.message);
  return response.result;
}

function createPopupFormData(
  request: CreatePopupRequest | UpdatePopupRequest,
  image?: File
) {
  const formData = new FormData();
  formData.append(
    'request',
    new Blob([JSON.stringify(request)], { type: 'application/json' })
  );
  if (image) formData.append('image', image);
  return formData;
}

export async function getPopups(page: number): Promise<PopupListResult> {
  if (isPopupMockEnabled()) {
    const { mockPopupAPI } =
      await import('@/domains/Operation/mocks/popup-api');
    return getResult(await mockPopupAPI.list(page));
  }
  const response = await axiosInstance.get<BaseResponse<PopupListResult>>(
    '/v1/admin/popups',
    { params: { page } }
  );
  return getResult(response.data);
}

export async function getPopupDetail(id: number): Promise<PopupDetail> {
  if (isPopupMockEnabled()) {
    const { mockPopupAPI } =
      await import('@/domains/Operation/mocks/popup-api');
    return getResult(await mockPopupAPI.detail(id));
  }
  const response = await axiosInstance.get<BaseResponse<PopupDetail>>(
    `/v1/admin/popups/${id}`
  );
  return getResult(response.data);
}

export async function createPopup(request: CreatePopupRequest, image?: File) {
  if (isPopupMockEnabled()) {
    const { mockPopupAPI } =
      await import('@/domains/Operation/mocks/popup-api');
    return getResult(await mockPopupAPI.create(request, image));
  }
  const response = await axiosInstance.post<BaseResponse<{ id: number }>>(
    '/v1/admin/popups',
    createPopupFormData(request, image),
    { headers: { 'Content-Type': undefined } }
  );
  return getResult(response.data);
}

export async function updatePopup(
  id: number,
  request: UpdatePopupRequest,
  image?: File
) {
  if (isPopupMockEnabled()) {
    const { mockPopupAPI } =
      await import('@/domains/Operation/mocks/popup-api');
    return getResult(await mockPopupAPI.update(id, request, image));
  }
  const response = await axiosInstance.patch<BaseResponse<{ id: number }>>(
    `/v1/admin/popups/${id}`,
    createPopupFormData(request, image),
    { headers: { 'Content-Type': undefined } }
  );
  return getResult(response.data);
}

export async function deletePopup(id: number) {
  if (isPopupMockEnabled()) {
    const { mockPopupAPI } =
      await import('@/domains/Operation/mocks/popup-api');
    return getResult(await mockPopupAPI.delete(id));
  }
  const response = await axiosInstance.delete<BaseResponse<{ id: number }>>(
    `/v1/admin/popups/${id}`
  );
  return getResult(response.data);
}

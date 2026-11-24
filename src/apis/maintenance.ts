import { isAxiosError } from 'axios';

import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type {
  ServerMaintenanceDetail,
  ServerMaintenanceListItem,
} from '@/domains/Operation/types';

export interface CreateMaintenanceRequest {
  title: string;
  startAt: string;
  endAt: string;
  memo: string;
  noticeMessage?: string;
  attachments?: { type: 'PHOTO'; fileName: string; fileComment: string }[];
}

export interface CreateMaintenanceResult {
  id: number;
  attachmentUrlList: string[];
}

export class MaintenanceOutcomeUnknownError extends Error {}

export async function createAdminMaintenance(body: CreateMaintenanceRequest) {
  let data: BaseResponse<CreateMaintenanceResult>;
  try {
    ({ data } = await axiosInstance.post<BaseResponse<CreateMaintenanceResult>>(
      '/v1/admin/server-maintenances',
      body
    ));
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (isAxiosError(error) && (!status || status >= 500 || status === 408))
      throw new MaintenanceOutcomeUnknownError(
        '등록 결과를 확인할 수 없습니다.'
      );
    throw error;
  }
  if (!data || typeof data.isSuccess !== 'boolean')
    throw new MaintenanceOutcomeUnknownError('등록 응답을 확인할 수 없습니다.');
  if (!data.isSuccess) throw new Error(data.message);
  if (
    !data.result ||
    !Number.isSafeInteger(data.result.id) ||
    data.result.id <= 0
  )
    throw new MaintenanceOutcomeUnknownError('등록 번호를 확인할 수 없습니다.');
  return data.result;
}

export async function uploadMaintenanceImage(url: string, file: File) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.username || target.password)
    throw new Error('이미지 업로드 주소를 확인할 수 없습니다.');
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PUT',
      body: file,
      credentials: 'omit',
      redirect: 'error',
      headers: { 'Content-Type': file.type },
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new Error(
      '이미지 저장소에 연결하지 못했습니다. 네트워크 연결 또는 저장소의 업로드 허용 설정을 확인해 주세요. 일정은 이미 저장되었으므로 다시 등록하지 않아도 됩니다.'
    );
  }
  if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.');
}

export async function getAdminMaintenances() {
  const { data } = await axiosInstance.get<
    BaseResponse<ServerMaintenanceListItem[]>
  >('/v1/admin/server-maintenances');
  if (!data.isSuccess) throw new Error(data.message);
  return data.result;
}

export type UpdateMaintenanceRequest = Partial<CreateMaintenanceRequest>;

export async function updateAdminMaintenance(
  id: number,
  body: UpdateMaintenanceRequest
) {
  const { data } = await axiosInstance.patch<
    BaseResponse<CreateMaintenanceResult>
  >(`/v1/admin/server-maintenances/${id}`, body);
  if (!data.isSuccess) throw new Error(data.message);
  return data.result;
}

export async function deleteAdminMaintenance(id: number) {
  const { data } = await axiosInstance.delete<
    BaseResponse<{ message: string }>
  >(`/v1/admin/server-maintenances/${id}`);
  if (!data.isSuccess) throw new Error(data.message);
  return data.result;
}

export async function getAdminMaintenance(id: number) {
  const { data } = await axiosInstance.get<
    BaseResponse<ServerMaintenanceDetail>
  >(`/v1/admin/server-maintenances/${id}`);
  if (!data.isSuccess) throw new Error(data.message);
  return data.result;
}

export async function completeAdminMaintenance(id: number) {
  const { data } = await axiosInstance.patch<
    BaseResponse<{ id: number; endAt: string; status: 'COMPLETED' }>
  >(`/v1/admin/server-maintenances/${id}/complete`);
  if (!data.isSuccess) throw new Error(data.message);
  return data.result;
}

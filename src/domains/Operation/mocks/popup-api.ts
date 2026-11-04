import type { BaseResponse } from '@/shared/types';

import type {
  CreatePopupRequest,
  PopupDetail,
  PopupListResult,
  UpdatePopupRequest,
} from '@/domains/Operation/types/popup';
import { validatePopupImage } from '@/domains/Operation/utils/validate-popup';

import {
  createMockPopupDetails,
  getKstDateTime,
  getMockPopupStatus,
} from './popups';

function success<T>(result: T): BaseResponse<T> {
  return {
    isSuccess: true,
    code: 1000,
    message: '요청에 성공하였습니다.',
    result,
  };
}

async function readImage(image: File) {
  const error = validatePopupImage(image);
  if (error) throw new Error(error);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(image);
  });
}

function validateContent(request: CreatePopupRequest) {
  if (!request.title?.trim()) throw new Error('팝업 제목을 입력해주세요.');
  for (const value of [request.startDate, request.endDate]) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value
    ) {
      throw new Error('입력 값을 확인해주세요.');
    }
  }
  if (request.endDate < request.startDate)
    throw new Error('게시 종료일은 게시 시작일보다 빠를 수 없습니다.');
}

function validateOrder(order: number, maximum: number) {
  if (!Number.isInteger(order) || order < 0 || order > maximum) {
    throw new Error(`노출 순서는 0부터 ${maximum}까지의 정수로 입력해 주세요.`);
  }
}

export function createMockPopupAPI(initialData = createMockPopupDetails()) {
  let records = initialData
    .map((popup) => ({ ...popup }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  let nextId = Math.max(0, ...records.map((popup) => popup.id)) + 1;
  const reindex = () =>
    records.forEach((popup, index) => {
      popup.displayOrder = index;
    });
  const find = (id: number) => {
    const popup = records.find((item) => item.id === id);
    if (!popup) throw new Error('팝업을 찾을 수 없습니다.');
    return popup;
  };
  const withStatus = (popup: PopupDetail): PopupDetail => ({
    ...popup,
    status: getMockPopupStatus(popup.startDate, popup.endDate),
  });

  return {
    async list(page: number): Promise<BaseResponse<PopupListResult>> {
      if (!Number.isInteger(page) || page < 0)
        throw new Error('입력 값을 확인해주세요.');
      const sorted = [...records].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id
      );
      const data = sorted.slice(page * 10, (page + 1) * 10).map((popup) => {
        const {
          id,
          title,
          displayOrder,
          startDate,
          endDate,
          status,
          createdAt,
          updatedAt,
        } = withStatus(popup);
        return {
          id,
          title,
          displayOrder,
          startDate,
          endDate,
          status,
          createdAt,
          updatedAt,
        };
      });
      return success({
        data,
        totalCount: records.length,
        totalPage: Math.ceil(records.length / 10),
        currentCount: data.length,
        hasNext: (page + 1) * 10 < records.length,
      });
    },
    async detail(id: number) {
      return success(withStatus(find(id)));
    },
    async create(request: CreatePopupRequest, image?: File) {
      validateContent(request);
      const order =
        request.displayOrder === undefined
          ? records.length
          : request.displayOrder;
      validateOrder(order, records.length);
      const imageUrl = image ? await readImage(image) : null;
      const id = nextId++;
      records.splice(order, 0, {
        id,
        title: request.title,
        description: request.description ?? null,
        imageUrl,
        displayOrder: order,
        startDate: request.startDate,
        endDate: request.endDate,
        status: getMockPopupStatus(request.startDate, request.endDate),
        createdAt: getKstDateTime(),
        updatedAt: null,
      });
      reindex();
      return success({ id });
    },
    async update(id: number, request: UpdatePopupRequest, image?: File) {
      const current = find(id);
      if (image && request.removeImage)
        throw new Error('이미지 교체와 삭제를 동시에 요청할 수 없습니다.');
      const merged = { ...current, ...request };
      validateContent(merged);
      const order =
        request.displayOrder === undefined
          ? current.displayOrder
          : request.displayOrder;
      validateOrder(order, records.length - 1);
      const imageUrl = image
        ? await readImage(image)
        : request.removeImage
          ? null
          : current.imageUrl;
      const updated: PopupDetail = {
        ...current,
        title: merged.title,
        description: merged.description,
        startDate: merged.startDate,
        endDate: merged.endDate,
        displayOrder: order,
        imageUrl,
        updatedAt: getKstDateTime(),
      };
      records = records.filter((popup) => popup.id !== id);
      records.splice(order, 0, updated);
      reindex();
      return success({ id });
    },
    async delete(id: number) {
      find(id);
      records = records.filter((popup) => popup.id !== id);
      reindex();
      return success({ id });
    },
  };
}

export const mockPopupAPI = createMockPopupAPI();

import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  deletePointFreezeAPI,
  getPointFreezesAPI,
  patchPointFreezeAPI,
  postPointFreezeAPI,
} from '@/apis';

import {
  useCreatePointFreeze,
  useDeletePointFreeze,
  usePointFreezes,
  useUpdatePointFreeze,
} from './usePointFreezes';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getPointFreezesAPI: vi.fn(),
  postPointFreezeAPI: vi.fn(),
  patchPointFreezeAPI: vi.fn(),
  deletePointFreezeAPI: vi.fn(),
}));

const data = {
  title: '미지급 일정',
  startAt: '2026-10-01 00:00:00',
  endAt: '2026-10-02 00:00:00',
};
const item = {
  ...data,
  id: 1,
  createdAt: data.startAt,
  updatedAt: data.startAt,
};

function renderQueries() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return renderHook(
    () => ({
      list: usePointFreezes(),
      create: useCreatePointFreeze(),
      update: useUpdatePointFreeze(),
      delete: useDeletePointFreeze(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    }
  );
}

describe('포인트 미지급 일정 변경 후 목록 갱신', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPointFreezesAPI).mockResolvedValue([item]);
  });

  test.each(['create', 'update', 'delete'] as const)(
    '%s 성공 시 새 목록을 조회한다',
    async (action) => {
      const { result } = renderQueries();
      await waitFor(() => expect(result.current.list.data).toEqual([item]));
      vi.mocked(getPointFreezesAPI).mockResolvedValue([]);
      await act(async () => {
        if (action === 'create') await result.current.create.mutateAsync(data);
        if (action === 'update')
          await result.current.update.mutateAsync({ id: item.id, data });
        if (action === 'delete')
          await result.current.delete.mutateAsync(item.id);
      });
      await waitFor(() => expect(result.current.list.data).toEqual([]));
      expect(getPointFreezesAPI).toHaveBeenCalledTimes(2);
      if (action === 'create')
        expect(postPointFreezeAPI).toHaveBeenCalledWith(
          data,
          expect.anything()
        );
      if (action === 'update')
        expect(patchPointFreezeAPI).toHaveBeenCalledWith(item.id, data);
      if (action === 'delete')
        expect(deletePointFreezeAPI).toHaveBeenCalledWith(
          item.id,
          expect.anything()
        );
    }
  );

  test('변경 실패 시 기존 목록을 유지하고 다시 조회하지 않는다', async () => {
    vi.mocked(deletePointFreezeAPI).mockRejectedValue(new Error('삭제 실패'));
    const { result } = renderQueries();
    await waitFor(() => expect(result.current.list.data).toEqual([item]));
    await act(async () => {
      await expect(result.current.delete.mutateAsync(item.id)).rejects.toThrow(
        '삭제 실패'
      );
    });
    expect(result.current.list.data).toEqual([item]);
    expect(getPointFreezesAPI).toHaveBeenCalledTimes(1);
  });
});

import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import {
  deleteExamReviewPeriodAPI,
  getExamReviewPeriodsAPI,
  patchExamReviewPeriodAPI,
  postExamReviewPeriodAPI,
} from '@/apis';

import { useExamReviewAdminStatusPeriods } from './use-exam-review-admin-status-periods';

vi.mock('@/apis', () => ({
  getExamReviewPeriodsAPI: vi.fn(),
  postExamReviewPeriodAPI: vi.fn(),
  patchExamReviewPeriodAPI: vi.fn(),
  deleteExamReviewPeriodAPI: vi.fn(),
}));

const input = {
  title: '어드민 편집 기간',
  startAt: '2026-10-01T00:00:00',
  endAt: '2026-10-31T23:59:00',
};
const period = {
  ...input,
  type: 'ADMIN_EDIT' as const,
  id: 301,
  createdAt: '2026-10-01T00:00:00',
  updatedAt: '2026-10-01T00:00:00',
};
const request = {
  ...input,
  type: 'ADMIN_EDIT',
  startAt: '2026-10-01T00:00:00',
  endAt: '2026-10-31T23:59:00',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getExamReviewPeriodsAPI).mockResolvedValue([period]);
});

test('폼의 초 단위 날짜를 유지하며 기간 CRUD에 ADMIN_EDIT를 전달한다', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const { result } = renderHook(() => useExamReviewAdminStatusPeriods(true), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  await waitFor(() => expect(result.current.periodsQuery.isSuccess).toBe(true));
  expect(getExamReviewPeriodsAPI).toHaveBeenCalledWith('ADMIN_EDIT');

  await act(async () => {
    const created =
      await result.current.createPeriodMutation.mutateAsync(input);
    expect(created?.id).toBe(301);
  });
  expect(postExamReviewPeriodAPI).toHaveBeenCalledWith([request]);

  await act(async () => {
    await result.current.updatePeriodMutation.mutateAsync({
      periodId: 301,
      input,
    });
  });
  expect(patchExamReviewPeriodAPI).toHaveBeenCalledWith(301, request);

  client.setQueryData(
    ['examReviewAdminStatus', 301, input.startAt, input.endAt],
    {}
  );
  await act(async () => {
    await result.current.deletePeriodMutation.mutateAsync(301);
  });
  expect(deleteExamReviewPeriodAPI).toHaveBeenCalledWith(301, 'ADMIN_EDIT');
  await waitFor(() => expect(result.current.periodsQuery.data).toEqual([]));
  expect(
    client.getQueriesData({ queryKey: ['examReviewAdminStatus', 301] })
  ).toEqual([]);
});

test.each(['create', 'update'] as const)(
  '%s 저장 후 목록 조회가 실패해도 저장 성공을 유지하고 조회만 재시도한다',
  async (operation) => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useExamReviewAdminStatusPeriods(true), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() =>
      expect(result.current.periodsQuery.isSuccess).toBe(true)
    );
    client.setQueryData(['examReviewAdminStatus', period.id], {});
    vi.mocked(getExamReviewPeriodsAPI).mockRejectedValueOnce(
      new Error('목록 조회 실패')
    );

    await act(async () => {
      const saved =
        operation === 'create'
          ? result.current.createPeriodMutation.mutateAsync(input)
          : result.current.updatePeriodMutation.mutateAsync({
              periodId: period.id,
              input,
            });
      await expect(saved).resolves.toBeUndefined();
    });

    await waitFor(() =>
      expect(
        operation === 'create'
          ? result.current.createPeriodMutation.isSuccess
          : result.current.updatePeriodMutation.isSuccess
      ).toBe(true)
    );
    expect(result.current.periodsQuery.isError).toBe(true);
    expect(result.current.isMutating).toBe(false);
    if (operation === 'update') {
      expect(
        client.getQueryState(['examReviewAdminStatus', period.id])
          ?.isInvalidated
      ).toBe(true);
    }

    await act(async () => {
      await result.current.periodsQuery.refetch();
    });
    expect(result.current.periodsQuery.data).toEqual([period]);
    await waitFor(() =>
      expect(result.current.periodsQuery.isSuccess).toBe(true)
    );
    expect(getExamReviewPeriodsAPI).toHaveBeenCalledTimes(3);
    expect(postExamReviewPeriodAPI).toHaveBeenCalledTimes(
      operation === 'create' ? 1 : 0
    );
    expect(patchExamReviewPeriodAPI).toHaveBeenCalledTimes(
      operation === 'update' ? 1 : 0
    );
  }
);

test.each(['create', 'update'] as const)(
  '%s 저장한 기간이 갱신된 목록에 없어도 저장 실패로 처리하지 않는다',
  async (operation) => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useExamReviewAdminStatusPeriods(true), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() =>
      expect(result.current.periodsQuery.isSuccess).toBe(true)
    );
    vi.mocked(getExamReviewPeriodsAPI).mockResolvedValueOnce([]);

    await act(async () => {
      const saved =
        operation === 'create'
          ? result.current.createPeriodMutation.mutateAsync(input)
          : result.current.updatePeriodMutation.mutateAsync({
              periodId: period.id,
              input,
            });
      await expect(saved).resolves.toBeUndefined();
    });
    await waitFor(() => expect(result.current.periodsQuery.data).toEqual([]));
  }
);

test.each(['create', 'update'] as const)(
  '%s 저장 요청이 실패하면 오류를 전달하고 목록을 갱신하지 않는다',
  async (operation) => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useExamReviewAdminStatusPeriods(true), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() =>
      expect(result.current.periodsQuery.isSuccess).toBe(true)
    );
    const error = new Error('저장 실패');
    vi.mocked(postExamReviewPeriodAPI).mockRejectedValueOnce(error);
    vi.mocked(patchExamReviewPeriodAPI).mockRejectedValueOnce(error);

    await act(async () => {
      const saved =
        operation === 'create'
          ? result.current.createPeriodMutation.mutateAsync(input)
          : result.current.updatePeriodMutation.mutateAsync({
              periodId: period.id,
              input,
            });
      await expect(saved).rejects.toBe(error);
    });
    expect(getExamReviewPeriodsAPI).toHaveBeenCalledTimes(1);
    expect(result.current.periodsQuery.isSuccess).toBe(true);
  }
);

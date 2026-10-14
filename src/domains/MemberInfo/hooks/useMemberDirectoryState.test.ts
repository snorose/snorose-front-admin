import { type PropsWithChildren, createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  renderHook as originalRenderHook,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type {
  AdminUserListItem,
  AdminUserListResult,
  MemberInfo,
} from '@/shared/types';

import { getAllUsersAPI } from '@/apis';

import { useMemberDirectoryState } from './useMemberDirectoryState';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/apis', () => ({
  getAllUsersAPI: vi.fn(),
}));

function renderHook(
  callback: () => ReturnType<typeof useMemberDirectoryState>,
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
) {
  return originalRenderHook(callback, {
    wrapper: ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client }, children),
  });
}

const getAllUsersAPIMock = vi.mocked(getAllUsersAPI);

const createMember = (id: string): AdminUserListItem => ({
  encryptedUserId: `encrypted-${id}`,
  loginId: `login-${id}`,
  userName: `회원-${id}`,
  nickname: `닉네임-${id}`,
  email: `${id}@sookmyung.ac.kr`,
  studentNumber: id,
  major: '컴퓨터과학전공',
  userRoleId: 2,
  userRoleName: '정회원',
  pointBalance: 100,
  createdAt: '2026-01-01',
  authenticatedAt: null,
});

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe('useMemberDirectoryState 페이지 기준', () => {
  test('회원 등급 수정 후 캐시된 이전 등급 목록과 건수를 다시 조회한다', async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 5 * 60 * 1000 },
      },
    });
    const originalMember = createMember('role-change');
    const changedMember: MemberInfo = {
      ...originalMember,
      userRoleId: 3,
      birthday: '2000-01-01',
      totalWarningCount: 0,
      isBlacklist: false,
      blacklistStartDate: null,
      blacklistEndDate: null,
    };
    let isUpdated = false;
    getAllUsersAPIMock.mockImplementation(async (params) => {
      const data =
        isUpdated && params?.userRoleId === 2
          ? []
          : [{ ...originalMember, userRoleId: isUpdated ? 3 : 2 }];
      return { data, totalCount: data.length, totalPage: 1, hasNext: false };
    });
    const { result, unmount } = renderHook(
      () => useMemberDirectoryState(false),
      client
    );
    await waitFor(() => expect(result.current.totalCount).toBe(1));
    act(() => result.current.handleSelectedRoleChange('2'));
    await waitFor(() => expect(getAllUsersAPIMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isListLoading).toBe(false));
    act(() => result.current.handleSelectedRoleChange('ALL'));
    expect(getAllUsersAPIMock).toHaveBeenCalledTimes(2);

    isUpdated = true;
    await act(async () => {
      result.current.updateCachedMember(changedMember);
      await result.current.loadMembers(1);
    });
    expect(getAllUsersAPIMock).toHaveBeenCalledTimes(3);

    act(() => result.current.handleSelectedRoleChange('2'));
    await waitFor(() => expect(getAllUsersAPIMock).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(result.current.totalCount).toBe(0));
    expect(result.current.members).toEqual([]);
    expect(getAllUsersAPIMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ userRoleId: 2 })
    );
    unmount();
    client.clear();
  });

  beforeEach(() => {
    getAllUsersAPIMock.mockReset();
    getAllUsersAPIMock.mockResolvedValue({
      data: [],
      hasNext: false,
      totalCount: 0,
      totalPage: 3,
    });
  });

  test('응답 전 개수는 미조회 상태이고 성공한 빈 결과만 0건으로 저장한다', async () => {
    const request = createDeferred<AdminUserListResult>();
    getAllUsersAPIMock.mockReturnValueOnce(request.promise);
    const { result } = renderHook(() => useMemberDirectoryState(false));

    expect(result.current.totalCount).toBeUndefined();
    expect(result.current.isListLoading).toBe(true);
    expect(result.current.isListError).toBe(false);

    await act(async () => {
      request.resolve({
        data: [],
        hasNext: false,
        totalCount: 0,
        totalPage: 0,
      });
      await request.promise;
    });

    await waitFor(() => expect(result.current.totalCount).toBe(0));
    await waitFor(() => expect(result.current.isListLoading).toBe(false));
    expect(result.current.isListError).toBe(false);
  });

  test('현재 요청 오류를 기록하고 재시도 시작 시 해제한다', async () => {
    getAllUsersAPIMock.mockRejectedValueOnce(new Error('조회 실패'));
    const { result } = renderHook(() => useMemberDirectoryState(false));
    await waitFor(() => expect(result.current.isListError).toBe(true));
    expect(result.current.totalCount).toBeUndefined();
    await waitFor(() => expect(result.current.isListLoading).toBe(false));

    const retry = createDeferred<AdminUserListResult>();
    getAllUsersAPIMock.mockReturnValueOnce(retry.promise);
    act(() => {
      void result.current.loadMembers(1);
    });
    await waitFor(() => expect(result.current.isListLoading).toBe(true));
    expect(result.current.isListError).toBe(false);

    await act(async () => {
      retry.resolve({ data: [], hasNext: false, totalCount: 12, totalPage: 1 });
      await retry.promise;
    });
    await waitFor(() => expect(result.current.totalCount).toBe(12));
    expect(result.current.isListError).toBe(false);
    await waitFor(() => expect(result.current.isListLoading).toBe(false));
  });

  test.each(['진행 중', '성공', '실패'] as const)(
    '이전 요청 실패는 최신 요청의 %s 상태를 변경하지 않는다',
    async (latestState) => {
      const previousRequest = createDeferred<AdminUserListResult>();
      const latestRequest = createDeferred<AdminUserListResult>();
      getAllUsersAPIMock
        .mockReturnValueOnce(previousRequest.promise)
        .mockReturnValueOnce(latestRequest.promise);
      const { result } = renderHook(() => useMemberDirectoryState(false));
      act(() => {
        result.current.handleSelectedRoleChange('2');
      });

      if (latestState !== '진행 중') {
        await act(async () => {
          if (latestState === '실패') {
            latestRequest.reject(new Error('최신 요청 실패'));
          } else {
            latestRequest.resolve({
              data: [],
              hasNext: false,
              totalCount: 21,
              totalPage: 1,
            });
          }
        });
      }

      await act(async () =>
        previousRequest.reject(new Error('이전 요청 실패'))
      );

      await waitFor(() =>
        expect(result.current.isListLoading).toBe(latestState === '진행 중')
      );
      expect(result.current.isListError).toBe(latestState === '실패');
      expect(result.current.totalCount).toBe(
        latestState === '성공' ? 21 : undefined
      );

      if (latestState === '진행 중') {
        await act(async () => {
          latestRequest.resolve({
            data: [],
            hasNext: false,
            totalCount: 0,
            totalPage: 1,
          });
        });
      }
    }
  );

  test('페이지 이동 중 건수를 유지하고 필터 변경 시 이전 건수를 숨긴다', async () => {
    const pageRequest = createDeferred<AdminUserListResult>();
    const filterRequest = createDeferred<AdminUserListResult>();
    getAllUsersAPIMock
      .mockResolvedValueOnce({
        data: [],
        hasNext: true,
        totalCount: 30,
        totalPage: 3,
      })
      .mockReturnValueOnce(pageRequest.promise)
      .mockReturnValueOnce(filterRequest.promise);
    const { result } = renderHook(() => useMemberDirectoryState(false));
    await waitFor(() => expect(result.current.totalCount).toBe(30));
    act(() => result.current.setCurrentPage(2));
    expect(result.current.totalCount).toBe(30);
    await act(async () =>
      pageRequest.resolve({
        data: [],
        hasNext: false,
        totalCount: 29,
        totalPage: 3,
      })
    );
    await waitFor(() => expect(result.current.totalCount).toBe(29));
    act(() => result.current.handleSelectedRoleChange('2'));
    expect(result.current.totalCount).toBeUndefined();
    await act(async () =>
      filterRequest.resolve({
        data: [],
        hasNext: false,
        totalCount: 0,
        totalPage: 1,
      })
    );
    await waitFor(() => expect(result.current.totalCount).toBe(0));
  });

  test('화면 1페이지는 API 0페이지, 화면 2페이지는 API 1페이지를 요청한다', async () => {
    const { result } = renderHook(() => useMemberDirectoryState(false));

    expect(result.current.currentPage).toBe(1);
    await waitFor(() =>
      expect(getAllUsersAPIMock).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0 })
      )
    );

    act(() => result.current.setCurrentPage(2));

    await waitFor(() =>
      expect(getAllUsersAPIMock).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      )
    );
  });

  test('늦은 이전 성공 응답은 최신 요청의 오류와 개수를 덮어쓰지 않는다', async () => {
    const previousRequest = createDeferred<AdminUserListResult>();
    getAllUsersAPIMock
      .mockReturnValueOnce(previousRequest.promise)
      .mockRejectedValueOnce(new Error('최신 요청 실패'));
    const { result } = renderHook(() => useMemberDirectoryState(false));
    act(() => result.current.handleSelectedRoleChange('2'));
    await waitFor(() => expect(result.current.isListError).toBe(true));

    await act(async () => {
      previousRequest.resolve({
        data: [],
        hasNext: false,
        totalCount: 21,
        totalPage: 1,
      });
      await previousRequest.promise;
    });
    expect(result.current.isListError).toBe(true);
    await waitFor(() => expect(result.current.isListLoading).toBe(false));
    expect(result.current.totalCount).toBeUndefined();
  });

  test('응답의 마지막 페이지를 벗어나면 유효한 마지막 페이지로 이동해 다시 조회한다', async () => {
    getAllUsersAPIMock
      .mockResolvedValueOnce({
        data: [],
        hasNext: true,
        totalCount: 30,
        totalPage: 3,
      })
      .mockResolvedValue({
        data: [],
        hasNext: false,
        totalCount: 20,
        totalPage: 2,
      });

    const { result } = renderHook(() => useMemberDirectoryState(false));

    await waitFor(() => expect(result.current.totalPage).toBe(3));

    act(() => result.current.setCurrentPage(3));

    await waitFor(() => expect(result.current.currentPage).toBe(2));
    await waitFor(() =>
      expect(getAllUsersAPIMock).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ page: 1 })
      )
    );
  });

  test('늦게 완료된 이전 요청은 최신 페이지 상태를 덮어쓰지 않는다', async () => {
    const previousRequest = createDeferred<AdminUserListResult>();
    const latestRequest = createDeferred<AdminUserListResult>();
    getAllUsersAPIMock
      .mockResolvedValueOnce({
        data: [],
        hasNext: true,
        totalCount: 30,
        totalPage: 3,
      })
      .mockReturnValueOnce(previousRequest.promise)
      .mockReturnValueOnce(latestRequest.promise);

    const { result } = renderHook(() => useMemberDirectoryState(false));
    await waitFor(() => expect(result.current.totalPage).toBe(3));

    act(() => result.current.setCurrentPage(2));
    await waitFor(() => expect(getAllUsersAPIMock).toHaveBeenCalledTimes(2));

    act(() => result.current.setCurrentPage(3));
    await waitFor(() => expect(getAllUsersAPIMock).toHaveBeenCalledTimes(3));

    await act(async () => {
      latestRequest.resolve({
        data: [createMember('latest')],
        hasNext: false,
        totalCount: 21,
        totalPage: 3,
      });
      await latestRequest.promise;
    });

    expect(result.current.currentPage).toBe(3);
    await waitFor(() =>
      expect(result.current.members).toEqual([createMember('latest')])
    );
    expect(result.current.totalCount).toBe(21);
    await waitFor(() => expect(result.current.isListLoading).toBe(false));

    await act(async () => {
      previousRequest.resolve({
        data: [createMember('previous')],
        hasNext: false,
        totalCount: 1,
        totalPage: 1,
      });
      await previousRequest.promise;
    });

    expect(result.current.currentPage).toBe(3);
    await waitFor(() =>
      expect(result.current.members).toEqual([createMember('latest')])
    );
    expect(result.current.totalPage).toBe(3);
    expect(result.current.totalCount).toBe(21);
    expect(getAllUsersAPIMock).toHaveBeenCalledTimes(3);
  });

  test('이전 요청이 먼저 완료되어도 최신 요청 중에는 로딩 상태를 유지한다', async () => {
    const previousRequest = createDeferred<AdminUserListResult>();
    const latestRequest = createDeferred<AdminUserListResult>();
    getAllUsersAPIMock
      .mockResolvedValueOnce({
        data: [],
        hasNext: true,
        totalCount: 30,
        totalPage: 3,
      })
      .mockReturnValueOnce(previousRequest.promise)
      .mockReturnValueOnce(latestRequest.promise);

    const { result } = renderHook(() => useMemberDirectoryState(false));
    await waitFor(() => expect(result.current.totalPage).toBe(3));

    act(() => result.current.setCurrentPage(2));
    await waitFor(() => expect(getAllUsersAPIMock).toHaveBeenCalledTimes(2));

    act(() => result.current.setCurrentPage(3));
    await waitFor(() => expect(getAllUsersAPIMock).toHaveBeenCalledTimes(3));

    await act(async () => {
      previousRequest.resolve({
        data: [createMember('previous')],
        hasNext: false,
        totalCount: 1,
        totalPage: 1,
      });
      await previousRequest.promise;
    });

    expect(result.current.isListLoading).toBe(true);
    expect(result.current.currentPage).toBe(3);
    expect(result.current.members).toEqual([]);

    await act(async () => {
      latestRequest.resolve({
        data: [createMember('latest')],
        hasNext: false,
        totalCount: 21,
        totalPage: 3,
      });
      await latestRequest.promise;
    });

    await waitFor(() => expect(result.current.isListLoading).toBe(false));
    await waitFor(() =>
      expect(result.current.members).toEqual([createMember('latest')])
    );
  });

  test('검색·필터·정렬·초기화 시 화면 1페이지로 돌아간다', () => {
    const { result } = renderHook(() => useMemberDirectoryState(true));
    const moveToSecondPage = () => {
      act(() => result.current.setCurrentPage(2));
      expect(result.current.currentPage).toBe(2);
    };

    moveToSecondPage();
    act(() => result.current.setSearchQuery('회원'));
    act(() => result.current.handleSearch());
    expect(result.current.currentPage).toBe(1);

    moveToSecondPage();
    act(() => result.current.handleSelectedRoleChange('2'));
    expect(result.current.currentPage).toBe(1);

    moveToSecondPage();
    act(() => result.current.handleSelectedAdmissionYearChange('2026'));
    expect(result.current.currentPage).toBe(1);

    moveToSecondPage();
    act(() => result.current.handleSelectedMajorChange('컴퓨터과학전공'));
    expect(result.current.currentPage).toBe(1);

    moveToSecondPage();
    act(() => result.current.handleHeaderSort('POINT_BALANCE'));
    expect(result.current.currentPage).toBe(1);

    moveToSecondPage();
    act(() => result.current.handleRefreshDirectory());
    expect(result.current.currentPage).toBe(1);
  });
});

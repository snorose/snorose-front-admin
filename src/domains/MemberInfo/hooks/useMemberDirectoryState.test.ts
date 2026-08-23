import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AdminUserListItem, AdminUserListResult } from '@/shared/types';

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
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe('useMemberDirectoryState 페이지 기준', () => {
  beforeEach(() => {
    getAllUsersAPIMock.mockReset();
    getAllUsersAPIMock.mockResolvedValue({
      data: [],
      hasNext: false,
      totalCount: 0,
      totalPage: 3,
    });
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
    expect(result.current.members).toEqual([createMember('latest')]);
    expect(result.current.totalCount).toBe(21);
    expect(result.current.isListLoading).toBe(false);

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
    expect(result.current.members).toEqual([createMember('latest')]);
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

    expect(result.current.isListLoading).toBe(false);
    expect(result.current.members).toEqual([createMember('latest')]);
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

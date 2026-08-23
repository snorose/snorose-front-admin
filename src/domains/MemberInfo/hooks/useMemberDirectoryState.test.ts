import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

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

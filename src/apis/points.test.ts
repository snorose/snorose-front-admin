import { beforeEach, describe, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';
import type { AdminUserListItem } from '@/shared/types';

import { searchSinglePointMemberAPI } from './points';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: { get: vi.fn() },
}));

const member = (
  overrides: Partial<AdminUserListItem> = {}
): AdminUserListItem => ({
  encryptedUserId: 'encrypted-member-id',
  loginId: 'member-login',
  userName: '테스트 회원',
  nickname: '테스트',
  email: 'member@example.com',
  studentNumber: '2110423',
  major: '컴퓨터과학전공',
  userRoleId: 2,
  userRoleName: '정회원',
  pointBalance: 0,
  createdAt: '2026-01-01',
  authenticatedAt: null,
  ...overrides,
});

function respond(data: AdminUserListItem[], hasNext = false) {
  vi.mocked(axiosInstance.get).mockResolvedValueOnce({
    data: {
      result: {
        data,
        hasNext,
        totalPage: hasNext ? 2 : 1,
        totalCount: data.length,
      },
    },
  });
}

describe('단일 포인트 지급 대상 검색', () => {
  beforeEach(() => vi.clearAllMocks());

  test('회원 목록 API로 학번을 검색하고 부분 일치 회원을 제외한다', async () => {
    const target = member();
    respond([
      member({ encryptedUserId: 'other', studentNumber: '21104230' }),
      target,
    ]);

    await expect(searchSinglePointMemberAPI(' 2110423 ')).resolves.toEqual(
      target
    );
    expect(axiosInstance.get).toHaveBeenCalledWith('/v2/admin/users', {
      params: { keyword: '2110423', page: 0 },
    });
  });

  test('아이디가 정확히 일치하는 회원도 검색한다', async () => {
    const target = member();
    respond([target]);
    await expect(searchSinglePointMemberAPI('member-login')).resolves.toEqual(
      target
    );
  });

  test('다음 페이지의 정확히 일치하는 회원을 찾는다', async () => {
    respond([member({ studentNumber: '21104230' })], true);
    const target = member();
    respond([target]);

    await expect(searchSinglePointMemberAPI('2110423')).resolves.toEqual(
      target
    );
    expect(axiosInstance.get).toHaveBeenLastCalledWith('/v2/admin/users', {
      params: { keyword: '2110423', page: 1 },
    });
  });

  test('다음 페이지에 다른 일치 회원이 있으면 대상을 확정하지 않는다', async () => {
    respond([member()], true);
    respond([
      member({
        encryptedUserId: 'another-member',
        studentNumber: '9999999',
        loginId: '2110423',
      }),
    ]);

    await expect(searchSinglePointMemberAPI('2110423')).rejects.toThrow(
      '일치하는 회원이 여러 명'
    );
  });

  test('부분 일치만 있거나 결과가 없으면 검색에 실패한다', async () => {
    respond([member({ studentNumber: '21104230' })]);
    await expect(searchSinglePointMemberAPI('2110423')).rejects.toThrow(
      '정확히 일치하는 회원이 없습니다'
    );
    respond([]);
    await expect(searchSinglePointMemberAPI('2110423')).rejects.toThrow(
      '정확히 일치하는 회원이 없습니다'
    );
  });

  test('빈 검색어는 서버로 보내지 않는다', async () => {
    await expect(searchSinglePointMemberAPI(' ')).rejects.toThrow(
      '검색어를 입력해주세요'
    );
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });
});

import { format } from 'date-fns';

import type { ServerMaintenance } from '../types/maintenance';

// 페이지 진입 시점을 기준으로 예정·진행중·종료 예시를 각 2개씩 제공한다.
export function createMockMaintenances(): ServerMaintenance[] {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const titles = [
    '정기 서버점검',
    '데이터베이스 성능 개선',
    '보안 업데이트',
    '시험후기 파일 저장소 점검',
    '네트워크 장비 교체',
    '서비스 안정화 점검',
  ];
  const startOffsets = [24, 48, -1, -0.5, -24, -48];

  return startOffsets.map((offset, index) => {
    const start = now + offset * hour;
    return {
      id: 1006 - index,
      title: titles[index],
      startAt: format(start, "yyyy-MM-dd'T'HH:mm"),
      endAt: format(start + 2 * hour, "yyyy-MM-dd'T'HH:mm"),
      createdAt: format(now - (index + 1) * 24 * hour, "yyyy-MM-dd'T'HH:mm"),
      updatedAt: format(now - (index + 1) * 24 * hour, "yyyy-MM-dd'T'HH:mm"),
    };
  });
}

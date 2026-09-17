import type {
  ExamReviewAdminStatusManager,
  ExamReviewAdminStatusPeriod,
  ExamReviewAdminStatusPeriodInput,
  ExamReviewAdminStatusResult,
} from '@/domains/Reviews/types';

const MOCK_DELAY_MS = 180;

type MockManager = Omit<ExamReviewAdminStatusManager, 'processedCount'>;

interface MockExamReviewStatusRecord {
  createdAt: string;
  isConfirmed: boolean;
  manager: MockManager | null;
}

const MANAGERS = {
  snow: {
    encryptedAdminId: 'encrypted-admin-snow',
    nickname: '눈송관리자',
  },
  rose: {
    encryptedAdminId: 'encrypted-admin-rose',
    nickname: '로즈매니저',
  },
  admin: {
    encryptedAdminId: 'encrypted-admin-main',
    nickname: '관리자A',
  },
} satisfies Record<string, MockManager>;

const INITIAL_PERIODS: ExamReviewAdminStatusPeriod[] = [
  {
    id: 1,
    title: '2026-1학기 중간고사',
    startAt: '2026-04-01T00:00:00',
    endAt: '2026-05-15T23:59:00',
    createdAt: '2026-03-20T09:00:00',
    updatedAt: '2026-03-20T09:00:00',
  },
  {
    id: 2,
    title: '2026-1학기 기말고사',
    startAt: '2026-06-01T00:00:00',
    endAt: '2026-07-15T23:59:00',
    createdAt: '2026-05-20T09:00:00',
    updatedAt: '2026-05-20T09:00:00',
  },
  {
    id: 3,
    title: '2026 여름학기',
    startAt: '2026-07-16T00:00:00',
    endAt: '2026-08-31T23:59:00',
    createdAt: '2026-07-10T09:00:00',
    updatedAt: '2026-07-10T09:00:00',
  },
  {
    id: 4,
    title: '2026-2학기 중간고사',
    startAt: '2026-10-01T00:00:00',
    endAt: '2026-11-15T23:59:00',
    createdAt: '2026-08-10T09:00:00',
    updatedAt: '2026-08-10T09:00:00',
  },
];

const MOCK_REVIEW_STATUS_RECORDS: MockExamReviewStatusRecord[] = [
  {
    createdAt: '2026-04-03T10:12:00',
    isConfirmed: true,
    manager: MANAGERS.admin,
  },
  {
    createdAt: '2026-04-08T14:20:00',
    isConfirmed: true,
    manager: MANAGERS.admin,
  },
  {
    createdAt: '2026-04-19T09:40:00',
    isConfirmed: true,
    manager: MANAGERS.admin,
  },
  {
    createdAt: '2026-05-01T16:05:00',
    isConfirmed: true,
    manager: MANAGERS.rose,
  },
  {
    createdAt: '2026-04-12T11:30:00',
    isConfirmed: false,
    manager: null,
  },
  {
    createdAt: '2026-04-28T18:10:00',
    isConfirmed: false,
    manager: null,
  },
  {
    createdAt: '2026-05-10T12:25:00',
    isConfirmed: false,
    manager: null,
  },
  {
    createdAt: '2026-06-04T10:00:00',
    isConfirmed: true,
    manager: MANAGERS.snow,
  },
  {
    createdAt: '2026-06-09T15:15:00',
    isConfirmed: true,
    manager: MANAGERS.snow,
  },
  {
    createdAt: '2026-06-21T13:30:00',
    isConfirmed: true,
    manager: MANAGERS.rose,
  },
  {
    createdAt: '2026-07-02T09:05:00',
    isConfirmed: true,
    manager: MANAGERS.admin,
  },
  {
    createdAt: '2026-07-06T17:40:00',
    isConfirmed: true,
    manager: null,
  },
  {
    createdAt: '2026-06-16T11:11:00',
    isConfirmed: false,
    manager: null,
  },
  {
    createdAt: '2026-07-12T19:20:00',
    isConfirmed: false,
    manager: null,
  },
  {
    createdAt: '2026-07-18T08:45:00',
    isConfirmed: true,
    manager: MANAGERS.snow,
  },
  {
    createdAt: '2026-07-28T12:10:00',
    isConfirmed: true,
    manager: MANAGERS.snow,
  },
  {
    createdAt: '2026-08-04T14:55:00',
    isConfirmed: true,
    manager: MANAGERS.rose,
  },
  {
    createdAt: '2026-08-14T09:35:00',
    isConfirmed: false,
    manager: null,
  },
  {
    createdAt: '2026-08-20T16:45:00',
    isConfirmed: false,
    manager: null,
  },
];

let periods = INITIAL_PERIODS.map((period) => ({ ...period }));
let nextPeriodId = Math.max(...INITIAL_PERIODS.map((period) => period.id)) + 1;

const waitForMockResponse = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS);
  });

const clonePeriod = (period: ExamReviewAdminStatusPeriod) => ({ ...period });

const validatePeriod = (
  input: ExamReviewAdminStatusPeriodInput,
  editingPeriodId?: number
) => {
  const title = input.title.trim();

  if (!title || !input.startAt || !input.endAt) {
    throw new Error('기간 이름과 시작·종료 일시를 모두 입력해주세요.');
  }

  const startTimestamp = new Date(input.startAt).getTime();
  const endTimestamp = new Date(input.endAt).getTime();

  if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
    throw new Error('올바른 시작·종료 일시를 입력해주세요.');
  }

  if (startTimestamp >= endTimestamp) {
    throw new Error('종료 일시는 시작 일시보다 늦어야 합니다.');
  }

  const hasDuplicateTitle = periods.some(
    (period) => period.id !== editingPeriodId && period.title.trim() === title
  );

  if (hasDuplicateTitle) {
    throw new Error('같은 이름의 기간이 이미 등록되어 있습니다.');
  }

  return { ...input, title };
};

export async function getMockExamReviewAdminStatusPeriods() {
  await waitForMockResponse();
  return periods.map(clonePeriod);
}

export async function createMockExamReviewAdminStatusPeriod(
  input: ExamReviewAdminStatusPeriodInput
) {
  await waitForMockResponse();

  const validatedInput = validatePeriod(input);
  const now = new Date().toISOString();
  const createdPeriod: ExamReviewAdminStatusPeriod = {
    id: nextPeriodId,
    ...validatedInput,
    createdAt: now,
    updatedAt: now,
  };

  nextPeriodId += 1;
  periods = [...periods, createdPeriod];

  return clonePeriod(createdPeriod);
}

export async function updateMockExamReviewAdminStatusPeriod({
  periodId,
  input,
}: {
  periodId: number;
  input: ExamReviewAdminStatusPeriodInput;
}) {
  await waitForMockResponse();

  const targetPeriod = periods.find((period) => period.id === periodId);

  if (!targetPeriod) {
    throw new Error('수정할 기간을 찾을 수 없습니다.');
  }

  const validatedInput = validatePeriod(input, periodId);
  const updatedPeriod: ExamReviewAdminStatusPeriod = {
    ...targetPeriod,
    ...validatedInput,
    updatedAt: new Date().toISOString(),
  };

  periods = periods.map((period) =>
    period.id === periodId ? updatedPeriod : period
  );

  return clonePeriod(updatedPeriod);
}

export async function deleteMockExamReviewAdminStatusPeriod(periodId: number) {
  await waitForMockResponse();

  if (!periods.some((period) => period.id === periodId)) {
    throw new Error('삭제할 기간을 찾을 수 없습니다.');
  }

  periods = periods.filter((period) => period.id !== periodId);
  return periodId;
}

export async function getMockExamReviewAdminStatus(
  periodId: number
): Promise<ExamReviewAdminStatusResult> {
  await waitForMockResponse();

  const period = periods.find((item) => item.id === periodId);

  if (!period) {
    throw new Error('현황을 조회할 기간을 찾을 수 없습니다.');
  }

  const startTimestamp = new Date(period.startAt).getTime();
  const endTimestamp = new Date(period.endAt).getTime();
  const records = MOCK_REVIEW_STATUS_RECORDS.filter((record) => {
    const createdAt = new Date(record.createdAt).getTime();
    return startTimestamp <= createdAt && createdAt <= endTimestamp;
  });
  const confirmedRecords = records.filter((record) => record.isConfirmed);
  const managerCounts = new Map<string, ExamReviewAdminStatusManager>();

  confirmedRecords.forEach((record) => {
    if (!record.manager) return;

    const manager = managerCounts.get(record.manager.encryptedAdminId);
    managerCounts.set(record.manager.encryptedAdminId, {
      ...record.manager,
      processedCount: (manager?.processedCount ?? 0) + 1,
    });
  });

  const managers = [...managerCounts.values()].sort(
    (a, b) =>
      b.processedCount - a.processedCount ||
      a.nickname.localeCompare(b.nickname, 'ko')
  );

  return {
    period: clonePeriod(period),
    summary: {
      totalCount: records.length,
      confirmedCount: confirmedRecords.length,
      unconfirmedCount: records.length - confirmedRecords.length,
      unassignedCount: confirmedRecords.filter((record) => !record.manager)
        .length,
    },
    managers,
  };
}

export function resetMockExamReviewAdminStatusPeriods() {
  periods = INITIAL_PERIODS.map(clonePeriod);
  nextPeriodId = Math.max(...INITIAL_PERIODS.map((period) => period.id)) + 1;
}

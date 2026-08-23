# 프런트엔드 공통화 및 리팩터링 제안

> 조사 기준: 2026-08-17의 `src` 구현
>
> 갱신: 2026-08-24, 페이지네이션·기간 상태 계산·상태 배지·테이블 상태 공통화 현황 반영

## 한눈에 보기

현재 프로젝트에서 다음 개선 대상으로 남아 있는 영역은 세 가지다.

1. **바로 통합해도 되는 중복**
   - 포인트 미지급 일정과 시험후기 작성 기간
2. **공통 골격만 분리하면 좋은 영역**
   - 게시글/댓글 관리 화면
3. **사용처가 더 늘 때 공통화하면 좋은 영역**
   - 폼 섹션

다음 공통화 작업은 완료되었다.

- 실제 사용 중인 7개 화면의 페이지네이션을 [`PaginationBar`](../src/shared/components/PaginationBar.tsx)로 통합했다.
- 기간 상태 계산을 [`getPeriodStatus`](../src/shared/utils/periodStatusUtils.ts)로 분리하고 경계 조건을 테스트했다.
- 주요 관리 도메인의 상태·분류 표시를 [`StatusBadge`](../src/shared/components/StatusBadge.tsx)로 통합했다.
- 두 포인트 화면의 안내 구조를 [`NoticePanel`](../src/shared/components/NoticePanel.tsx)로 통합했다.
- 주요 관리 테이블의 로딩·빈 결과 행을 [`TableStateRow`](../src/shared/components/TableStateRow.tsx)로 통합했다.

현재 가장 먼저 진행할 작업으로는 포인트 미지급 일정과 시험후기 작성 기간의 공통 UI 분리를 권장한다.

### 우선순위

| 우선순위 | 개선 대상        | 현재 문제                              | 권장 방향                           |
| -------- | ---------------- | -------------------------------------- | ----------------------------------- |
| 1        | 기간 관리        | 생성·목록·수정·삭제가 두 도메인에 중복 | UI 공통화, API 동작은 도메인에 유지 |
| 2        | 게시글/댓글 관리 | 필터·선택·테이블 골격이 반복           | 작은 컴포넌트와 훅부터 분리         |
| 3        | 날짜/시간        | 빈 값·초 단위·API 형식 정책이 다름     | 표시용과 전송용 함수 분리           |
| 4        | 폼 섹션          | 비슷한 마크업 반복                     | 사용처가 늘 때 얇게 공통화          |
| 완료     | 페이지네이션     | 전용 구현과 페이지 기준이 분산됨       | `PaginationBar`로 통합              |
| 완료     | 테이블 상태      | 로딩·빈 결과 UI가 화면마다 다름        | `TableStateRow` 공통화              |
| 완료     | 상태 배지        | 상태별 색상과 크기가 제각각            | 의미 기반 `StatusBadge`로 통합      |
| 완료     | 안내 사항        | 두 포인트 화면의 안내 구조가 반복      | `NoticePanel`로 통합                |

## 공통화 기준

공통화할 때는 아래 경계를 유지하는 것이 중요하다.

```text
shared가 담당하는 것
  └─ 모양, 배치, 색상, 공통 상호작용

domain이 담당하는 것
  └─ 업무 문구, 상태 의미, API 요청, 성공/실패 처리
```

예를 들어 `StatusBadge`는 `success`, `warning` 같은 색상 규칙만 알고, `SANCTIONED`, `CONFIRMED` 같은 업무 상태 코드는 각 도메인이 관리하는 방식이다.

## 1. 페이지네이션 통합 (완료)

> 현재 사용 화면, 기준 컴포넌트, 교체 범위와 단계별 체크리스트는 [`pagination-consolidation-plan.md`](./pagination-consolidation-plan.md)에 정리되어 있다.

### 현재 상태

- 실제 라우트에서 사용하는 7개 화면이 모두 [`PaginationBar`](../src/shared/components/PaginationBar.tsx)를 사용한다.
- `ExamReviewTablePagination`, `ExamTablePagination`, `MemberDirectoryPagination`, `MemberInfoTablePagenation`과 관련 export를 삭제했다.
- UI와 URL의 페이지 번호는 1 기반으로 통일하고, 서버의 0 기반 페이지 변환은 API 함수나 조회 훅 경계에서 처리한다.
- 전체 페이지 수는 필수 `totalPage`로 전달하고, 페이지 번호 묶음 크기는 `pageBlockSize`로 분리했다.
- 회원 목록에는 전체 페이지 수 감소 시 마지막 유효 페이지로 이동하는 보정과 요청 경합 방지를 추가했다.

### 검증 상태

- 첫·마지막 페이지 묶음의 이전/다음 버튼 비활성화
- 전체 페이지가 묶음 크기의 배수인 경우의 마지막 묶음
- 기본 10개와 선택적 5개 페이지 묶음
- `totalPage`가 0 또는 1인 경우의 노출 정책
- 1 기반 페이지 전달과 서버 요청 직전 0 기반 변환
- 회원 목록의 페이지 범위 보정과 요청 경합

공통화 구현과 단위 테스트는 완료되었다. 실제 사용 화면의 브라우저 회귀 검증과 dev API E2E 실행을 위한 인증 환경 설정은 별도 검증 작업으로 남아 있다.

## 2. 기간 관리 기능 공통화

포인트 미지급 일정과 시험후기 작성 기간은 현재 가장 명확한 공통화 후보다.

### 현재 문제

두 데이터 타입의 필드가 같다.

```ts
interface PeriodRecord {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}
```

관련 UI도 거의 동일하다.

| 기능 | 포인트                                                                                                | 시험후기                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 생성 | [`PointFreezeScheduleForm`](../src/domains/Points/components/PointFreezeScheduleForm.tsx)             | [`ExamReviewPeriodScheduleForm`](../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx)             |
| 목록 | [`PointFreezeListSection`](../src/domains/Points/components/PointFreezeListSection.tsx)               | [`ExamReviewPeriodListSection`](../src/domains/Reviews/components/ExamReviewPeriodListSection.tsx)               |
| 수정 | [`PointFreezeUpdateConfirmModal`](../src/domains/Points/components/PointFreezeUpdateConfirmModal.tsx) | [`ExamReviewPeriodUpdateConfirmModal`](../src/domains/Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx) |
| 삭제 | [`PointFreezeDeleteConfirmModal`](../src/domains/Points/components/PointFreezeDeleteConfirmModal.tsx) | [`ExamReviewPeriodDeleteConfirmModal`](../src/domains/Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx) |

실제 차이는 다음 정도다.

- 화면 제목과 안내 문구
- 호출하는 API
- 성공/실패 메시지
- API가 요구하는 날짜 형식
- 시험후기 생성 API의 배열 payload

### 제안

UI만 공통화하고 API 처리는 각 도메인에 남긴다.

```text
Points / Reviews
  ├─ 도메인 훅
  │    └─ API 요청, 날짜 변환, toast
  │
  └─ 공통 기간 UI
       ├─ PeriodScheduleForm
       ├─ PeriodTable
       ├─ PeriodEditDialog
       └─ PeriodDeleteDialog
```

공통 UI에는 다음 값만 전달한다.

- `labels`: 제목, 항목명, 빈 목록 문구
- `items`: 기간 목록
- `onCreate`, `onUpdate`, `onDelete`: 도메인 동작
- `isSubmitting`: 중복 제출 방지 상태

### 주의점

공통 컴포넌트 안에서 `POINTS` 또는 `REVIEWS`를 확인해 API를 분기하지 않는다. 그런 구조는 새로운 기간 기능이 추가될 때마다 공통 컴포넌트의 조건문을 늘리게 된다.

## 3. 예약·진행중·종료 상태 정리 (계산 로직 완료)

[`PeriodStatusBadge`](../src/shared/components/PeriodStatusBadge.tsx)가 담당하던 날짜 변환과 상태 계산을 [`getPeriodStatus`](../src/shared/utils/periodStatusUtils.ts)로 분리했다. 컴포넌트는 상태별 문구와 tone을 선택해 공통 `StatusBadge`로 렌더링한다.

```ts
type PeriodStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'ENDED';

getPeriodStatus(startAt, endAt, now): PeriodStatus;
```

현재 경계 정책은 다음과 같이 테스트로 고정했다.

- `now < startAt`: 예정
- `startAt <= now <= endAt`: 진행중
- `now > endAt`: 종료

### 남은 정책

| 상황               | 확인할 내용                                         |
| ------------------ | --------------------------------------------------- |
| 잘못된 날짜 문자열 | 기본 상태를 표시할지 오류 처리할지                  |
| 타임존             | 관리자 브라우저 시간과 서버 시간 중 무엇이 기준인지 |

`getPeriodStatus` 단위 테스트와 [`PeriodStatusBadge.test.tsx`](../src/shared/components/PeriodStatusBadge.test.tsx)에서 예정·진행중·종료를 검증한다.

## 4. 전체 상태 배지 체계 정리 (완료)

### 현재 상태

기존 UI 원시 컴포넌트인 [`Badge`](../src/shared/components/ui/badge.tsx)는 유지하고, 의미 기반 [`StatusBadge`](../src/shared/components/StatusBadge.tsx)를 추가했다. 공통 컴포넌트는 크기·형태·색상만 관리하며, 상태 코드에서 문구와 tone으로 변환하는 규칙은 관련 도메인 컴포넌트와 유틸에 유지한다.

| 적용 영역   | 공통화한 표시                                                      |
| ----------- | ------------------------------------------------------------------ |
| 기간 상태   | 예정·진행중·종료                                                   |
| 시험후기    | 확인·논의·신고·처리 상태와 상세 편집                               |
| 게시글·댓글 | 관리 상태, 공지, 의심 키워드, 게시판·카테고리, 상세 신고·징계 정보 |
| 회원 관리   | 회원 등급, 현재 제재, 제재 종류와 진행 상태                        |
| 문의·신고   | 대·중분류, 답변 상태, 작성자·댓글 상태                             |

공통 tone은 상태용 `neutral`, `info`, `success`, `warning`, `danger`, `accent`와 분류용 `outline`으로 제한했다. 공통 형태와 모든 tone의 스타일은 [`StatusBadge.test.tsx`](../src/shared/components/StatusBadge.test.tsx)에서 검증하고, 각 도메인의 매핑과 선택 동작은 관련 단위 테스트로 고정했다.

상세한 tone 선택 기준과 도메인별 매핑은 [`status-badge-guidelines.md`](./status-badge-guidelines.md)를 따른다.

## 5. 게시글/댓글 관리 화면 공통화

### 현재 문제

[`PostFilterPanel`](../src/domains/Posts/components/PostFilterPanel.tsx)과 [`CommentFilterPanel`](../src/domains/Comments/components/CommentFilterPanel.tsx)은 다음 필터를 대부분 공유한다.

- 작성일 범위
- 작성자 검색
- 본문 또는 ID 검색
- 정렬
- 의심 키워드
- 게시판
- 관리 상태
- 초기화/검색 버튼

[`PostTable`](../src/domains/Posts/components/PostTable.tsx)과 [`CommentTable`](../src/domains/Comments/components/CommentTable.tsx)도 일괄 작업, 전체 선택, 페이지네이션 구조가 같다.

### 제안

화면 전체를 하나의 거대한 컴포넌트로 합치지 않고 작은 단위부터 분리한다.

| 공통화 후보            | 역할                          |
| ---------------------- | ----------------------------- |
| `DateRangeFilterField` | 시작일·종료일 입력            |
| `FilterChipGroup`      | 게시판·관리 상태 선택         |
| `FilterActions`        | 초기화·검색 버튼              |
| `useTableSelection`    | 행 선택과 전체 선택           |
| `TableStateRow`        | 로딩·빈 결과·오류 표시 (완료) |

행 렌더링, 댓글의 상위 댓글 탐색, 게시글 전용 검색 조건 등은 각 도메인에 남긴다.

### `useTableSelection` 예시

```ts
useTableSelection({ visibleIds, resetKeys });

// 반환값
// selectedIds, isAllSelected, selectAllRef,
// toggleOne, toggleAll, clearSelection
```

데이터 요청이나 삭제 API까지 이 훅에 넣지 않고 선택 상태만 담당하게 한다.

## 6. 테이블 로딩·빈 상태 통일 (완료)

### 이전 상태

다음 화면들이 로딩 또는 빈 결과 행을 각각 구현한다.

- [`PostTable`](../src/domains/Posts/components/PostTable.tsx)
- [`CommentTable`](../src/domains/Comments/components/CommentTable.tsx)
- [`InquiryReportTable`](../src/domains/InquiryReport/components/InquiryReportTable.tsx)
- [`MemberDirectorySection`](../src/domains/MemberInfo/components/MemberDirectorySection.tsx)
- [`ExamTableFallback`](../src/domains/Reviews/components/ExamTableFallback.tsx)

화면마다 높이, 아이콘, 문구, 말줄임표 표기가 다르다.

### 제안

```tsx
<TableStateRow
  state='loading'
  colSpan={12}
  message='댓글 목록을 불러오는 중입니다.'
/>

<TableStateRow
  state='empty'
  colSpan={12}
  message='조건에 맞는 댓글이 없습니다.'
/>
```

공통 컴포넌트는 `loading`, `empty`, `error`의 기본 아이콘과 높이만 관리한다. 복잡한 스켈레톤이 필요한 테이블은 기존 `ExamTableFallback`처럼 별도로 유지한다.

### 현재 상태

- 게시글, 댓글, 문의·신고, 회원 목록의 로딩·빈 결과 행을 공통 [`TableStateRow`](../src/shared/components/TableStateRow.tsx)로 교체했다.
- `TableStateRow`는 `loading`, `empty`, `error`의 기본 문구·아이콘·높이와 상태별 접근성 역할을 관리한다.
- 화면별 문구와 동적으로 달라지는 `colSpan`은 각 도메인에서 전달한다.
- 여러 행으로 구성된 시험후기 스켈레톤은 기존 `ExamTableFallback`을 유지한다.

## 7. 안내 사항 공통화 (완료)

### 현재 상태

[`AdjustAllMemberPointPage`](../src/pages/points/AdjustAllMemberPointPage.tsx)와 [`ExcelPointUploadPage`](../src/pages/points/ExcelPointUploadPage.tsx)의 반복 안내 구조를 공통 [`NoticePanel`](../src/shared/components/NoticePanel.tsx)로 교체했다.

```tsx
<NoticePanel
  items={[
    '포인트 지급은 즉시 적용됩니다.',
    <>
      처리 전에 <strong>대상과 금액</strong>을 확인해 주세요.
    </>,
  ]}
/>
```

`NoticePanel`은 다음 표현만 담당한다.

- 기본 제목 `안내 사항`과 선택적 사용자 지정 제목
- 확성기 아이콘과 목록 레이아웃
- 문자열 또는 강조 요소를 포함한 안내 항목 렌더링

업무별 안내 문구는 각 페이지에 남겨 공통 UI와 도메인 문구의 경계를 유지한다. 기본 제목, 여러 안내 항목, 강조 요소, 사용자 지정 제목은 [`NoticePanel.test.tsx`](../src/shared/components/NoticePanel.test.tsx)에서 검증한다.

### 접근성 확인

현재 `Alert`는 항상 `role='alert'`를 사용한다. 정적인 안내 사항은 긴급 알림이 아니므로 `role='note'` 또는 일반 영역으로 표시할 수 있게 역할을 구분하는 것이 좋다.

## 8. 날짜/시간과 폼 섹션

이 두 영역은 앞선 작업보다 우선순위가 낮다.

### 날짜/시간

공통 [`date-time-formatter`](../src/shared/utils/date-time-formatter.ts) 외에도 회원 도메인에 별도 포맷터가 있다.

- [`domains/MemberInfo/utils/formatDateTime.ts`](../src/domains/MemberInfo/utils/formatDateTime.ts): 초 단위, 빈 값은 빈 문자열
- [`memberDirectory.ts`](../src/domains/MemberInfo/utils/memberDirectory.ts): 분 단위, 빈 값은 `-`

표시용과 API 전송용을 이름부터 구분하는 것을 권장한다.

```text
표시용       formatAdminDateTime
입력 필드용  toDateTimeLocalValue
API 전송용   각 API adapter의 serializeDateTime
```

기존 출력이 화면마다 다르므로 테스트 없이 한 번에 교체하지 않는다.

### 폼 섹션

다음 화면에는 `제목 + 테두리 + padding` 구조가 반복된다.

- [`PointDetailSection`](../src/domains/Points/components/PointDetailSection.tsx)
- [`MemberInfoSection`](../src/domains/Points/components/MemberInfoSection.tsx)
- 두 기간 생성 폼
- [`PushNotificationPage`](../src/pages/alerts/PushNotificationPage.tsx)

신규 화면에서도 같은 구조가 반복되면 `FormSection`을 도입한다.

```tsx
<FormSection title='필수 정보' description='알림 발송에 필요한 정보입니다.'>
  {children}
</FormSection>
```

`FormSection`은 제목, 설명, 액션 영역, 본문 간격만 담당한다. 회원 상세처럼 디자인 계열이 다른 카드까지 합치지 않는다.

## 권장 작업 순서

### 1차: 빠르게 제거할 수 있는 중복

- [x] `ExamReviewTablePagination`을 `PaginationBar`로 교체
- [x] 사용하지 않는 `ExamTablePagination` 제거
- [x] 페이지네이션 테스트 추가
- [x] `getPeriodStatus` 분리 및 경계 테스트 추가

### 2차: 기간 관리 공통화

- [ ] 공통 기간 타입과 UI 작성
- [ ] 포인트 화면을 먼저 공통 UI로 교체
- [ ] 기존 테스트 확인 후 시험후기 화면 교체
- [ ] 중복 생성·목록·수정·삭제 컴포넌트 제거

### 3차: 게시글/댓글 관리 공통화

- [ ] `useTableSelection` 분리
- [x] `TableStateRow` 분리
- [ ] 날짜 범위와 필터 chip 분리
- [ ] 필요할 때만 테이블 전체 골격 공통화

### 4차: 디자인 규칙 정리

- [x] `StatusBadge` tone 정의
- [x] 기간 상태부터 적용
- [x] 시험후기, 게시글/댓글, 회원 제재, 문의·신고 상태에 적용
- [x] 상태 배지 정책과 도메인별 매핑 문서화
- [x] 포인트 안내 UI를 `NoticePanel`로 통합
- [ ] 정적 안내에 사용할 `role` 정책 결정
- [ ] 같은 구조가 더 반복되면 `FormSection` 적용

## 피해야 할 공통화

- 모든 관리 화면을 설정 객체 하나로 렌더링하는 거대한 `ManagePage`
- 모든 도메인의 상태 코드를 직접 분기하는 전역 `StatusBadge`
- 생성·수정·삭제를 boolean props로 구분하는 단일 기간 모달
- 0 기반과 1 기반 페이지를 암묵적으로 함께 허용하는 페이지네이션
- API별 날짜 형식 차이를 화면 컴포넌트에서 처리하는 구조

## 결론

이 프로젝트는 이미 `PageHeader`, `PeriodStatusBadge`, `PaginationBar`, `BulkActionBar`, `ConfirmModal` 같은 좋은 공통 기반을 갖추고 있다.

페이지네이션, 기간 상태 계산, 상태 배지, 안내 사항, 테이블 상태 공통화는 완료되었다. 다음 작업은 새로운 공통 시스템을 크게 만드는 것보다 아래 순서로 진행하는 편이 효과적이다.

1. 구조가 거의 같은 두 기간 관리 화면을 통합한다.
2. 게시글/댓글 화면에서는 선택·필터처럼 작은 단위만 분리한다.
3. 날짜/시간 정책은 표시용과 API 전송용을 구분해 점진적으로 정리한다.
4. 상태 배지와 안내 사항은 현재의 얇은 공통 컴포넌트와 도메인 경계를 유지한다.
5. 폼 섹션은 같은 구조의 사용처가 더 늘 때 공통화한다.

핵심 원칙은 **공통 UI는 표현을 담당하고, 도메인은 업무 규칙과 API를 담당하는 것**이다.

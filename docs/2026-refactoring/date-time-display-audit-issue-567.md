# 날짜·시간 표시 전수조사 및 통일안 (이슈 #567)

조사일: 2026-11-05  
범위: `src` 전체의 사용자 화면 날짜·시간 표시, 날짜 선택 UI, 그리고 이슈 #567 대상인 문의·신고 및 시험후기 화면. 정렬·계산을 위한 `Date` 사용과 API 타입 선언은 표시 사용처와 구분했다.

## 1. 이슈 요구사항

문의·신고와 시험후기에서 목록·상세·댓글 등 같은 의미의 날짜 정보가 같은 형식과 글자 스타일로 보이도록 한다. 날짜 구분자, 시간 및 초 표시, 글꼴·크기·굵기·색상·숫자 정렬, 값이 없거나 유효하지 않은 경우를 공통 기준으로 정하고 기존 포맷 유틸을 재사용하는 것이 제안 방향이다.

## 2. 현재 공통 포맷터

정의는 [`date-time-formatter.ts`](../../src/shared/utils/date-time-formatter.ts)에 있다.

| 함수                      | 출력·동작                                                              | 현재 사용 성격                                         |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `formatDateTimeToMinutes` | 입력 앞 16자, `T`를 공백으로 치환. 예: `2026-10-10 12:00`; 빈 값은 `-` | 대부분의 관리 데이터·상태 이력                         |
| `formatDateTimeToSeconds` | `T`를 공백으로 바꾸고 소수 초 제거, 최대 초까지 표시                   | 정의되어 있으나 현재 `src`의 화면 호출은 검색되지 않음 |
| `formatDateTimeWithAmPm`  | `YYYY-MM-DD 오전/오후 h:mm`; 빈 값 또는 파싱 실패는 `-`                | 게시글·댓글과 이력 카드                                |
| `formatDateOnly`          | 입력 앞 10자(`YYYY-MM-DD`); 빈 값은 `-`                                | 회원 날짜                                              |

`formatDateTimeToMinutes`는 입력 문자열을 자르기만 하므로 잘못된 날짜 문자열을 `-`로 바꾸지 않는다. 반면 `formatDateTimeWithAmPm`는 `Date` 파싱 실패를 `-`로 처리한다. 두 함수는 서로 다른 시각대 변환 특성도 가지므로, 교체 전 API의 날짜 문자열 규약을 확인해야 한다.

## 3. 이슈 대상 화면 전수 목록

| 화면·정보                        | 위치                                                                                                                                                      | 현재 포맷                                                                                             | 현재 글자 스타일 및 빈 값                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 문의·신고 목록 작성일            | [`InquiryReportTable.tsx`](../../src/domains/InquiryReport/components/InquiryReportTable.tsx)                                                             | `formatDateTimeToMinutes`, `YYYY-MM-DD HH:mm`                                                         | `font-mono text-gray-600`, 가운데 정렬. 빈 값은 `-`             |
| 문의·신고 상세 작성일            | [`InquiryReportDetailPanel.tsx`](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx)                                                 | 동일                                                                                                  | 날짜 `text-gray-800`; 라벨 `text-muted-foreground`. 빈 값은 `-` |
| 문의·신고 상세 수정일            | 같은 파일                                                                                                                                                 | 동일                                                                                                  | 작성일과 같은 값 스타일. `updatedAt`이 없으면 행 자체를 숨김    |
| 문의 댓글 작성일                 | [`InquiryCommentItem.tsx`](../../src/domains/InquiryReport/components/InquiryCommentItem.tsx)                                                             | 동일                                                                                                  | `font-mono text-[11px] text-gray-400`; 빈 값은 `-`              |
| 시험후기 목록 작성일             | [`use-exam-reviews.ts`](../../src/domains/Reviews/hooks/use-exam-reviews.ts), [`ExamTable.tsx`](../../src/domains/Reviews/components/ExamTable.tsx)       | `contentDate`를 `formatDateTimeToMinutes`로 변환                                                      | 열 너비 150px. 별도 날짜 전용 클래스 확인 안 됨                 |
| 시험후기 상세 작성일/업로드 시각 | [`ExamDetailSection.tsx`](../../src/domains/Reviews/components/ExamDetailSection.tsx), [`ExamReviewPage.tsx`](../../src/pages/reviews/ExamReviewPage.tsx) | 상세 초기화 시 `new Date()`와 수동 조합으로 분까지 생성. 페이지 갱신 경로는 `formatDateTimeToMinutes` | 일반 입력 필드 값. 두 경로가 중복되어 있음                      |
| 시험후기 댓글 작성일             | [`ExamReviewCommentSection.tsx`](../../src/domains/Reviews/components/ExamReviewCommentSection.tsx)                                                       | `formatDateTimeToMinutes`                                                                             | `text-xs text-gray-500`; 빈 값은 `-`                            |
| 시험후기 변경 이력 변경일시      | [`ExamReviewLogSection.tsx`](../../src/domains/Reviews/components/ExamReviewLogSection.tsx)                                                               | `formatDateTimeToMinutes`                                                                             | 테이블 셀 기본 스타일; 빈 값은 `-`                              |

시험후기 운영 기간 화면도 도메인상 인접 사용처로 확인했다. [`ExamReviewPeriodListSection.tsx`](../../src/domains/Reviews/components/ExamReviewPeriodListSection.tsx), [`ExamReviewAdminStatusPeriodList.tsx`](../../src/domains/Reviews/components/ExamReviewAdminStatusPeriodList.tsx), [`ExamReviewAdminStatusDialog.tsx`](../../src/domains/Reviews/components/ExamReviewAdminStatusDialog.tsx), [`ExamReviewPeriodDeleteConfirmModal.tsx`](../../src/domains/Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx)는 시작·종료·생성·수정 시각을 분 단위 포맷터로 표시한다. 일정 편집은 공용 `DateTimePicker`를 쓴다.

## 4. `src` 전체의 추가 날짜·시간 표시 사용처

이슈 대상 외에도 같은 포맷 유틸이 넓게 사용되고 있고, 같은 의미의 시각 표시에 형식이 두 종류 이상 혼재한다. 아래 표는 화면에 실제로 렌더링되는 날짜 계열 사용처를 묶어 정리했다.

| 영역                  | 파일                                                                                                                                                                                                                                                                                                                                         | 표시 방식                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 게시글                | [`PostTableRow.tsx`](../../src/domains/Posts/components/PostTableRow.tsx), [`PostDetailInfoPanel.tsx`](../../src/domains/Posts/components/PostDetail/PostDetailInfoPanel.tsx), [`PostDetailCommentItem.tsx`](../../src/domains/Posts/components/PostDetail/PostDetailCommentItem.tsx)                                                        | `formatDateTimeWithAmPm`: `YYYY-MM-DD 오전/오후 h:mm`. 목록·댓글은 모노스페이스, 상세는 12px 모노스페이스 |
| 댓글 관리             | [`CommentTableRow.tsx`](../../src/domains/Comments/components/CommentTableRow.tsx)                                                                                                                                                                                                                                                           | `formatDateTimeWithAmPm`, 목록 `font-mono text-xs text-gray-600`                                          |
| 신고 이력             | [`ReportHistoryCard.tsx`](../../src/shared/components/ReportHistoryCard.tsx)                                                                                                                                                                                                                                                                 | `formatDateTimeWithAmPm`, `font-mono text-gray-600`                                                       |
| 제재 이력             | [`SanctionHistoryCard.tsx`](../../src/shared/components/SanctionHistoryCard.tsx)                                                                                                                                                                                                                                                             | `formatDateTimeWithAmPm`, `font-mono text-gray-600`                                                       |
| 상태 변경 이력        | [`StatusHistoryCard.tsx`](../../src/shared/components/StatusHistoryCard.tsx)                                                                                                                                                                                                                                                                 | `formatDateTimeToMinutes`; 요약·상세 시각                                                                 |
| 포인트 일정           | [`PointFreezeListSection.tsx`](../../src/domains/Points/components/PointFreezeListSection.tsx), [`PointFreezeDeleteConfirmModal.tsx`](../../src/domains/Points/components/PointFreezeDeleteConfirmModal.tsx)                                                                                                                                 | 시작·종료·생성·수정 시각 및 삭제 확인에서 `YYYY-MM-DD HH:mm`                                              |
| 회원 정보             | [`MemberDirectorySection.tsx`](../../src/domains/MemberInfo/components/MemberDirectorySection.tsx), [`MemberDetailInfoGrid.tsx`](../../src/domains/MemberInfo/components/MemberDetailInfoGrid.tsx), [`MemberInfoEditForm.tsx`](../../src/domains/MemberInfo/components/MemberInfoEditForm.tsx)                                               | 가입·인증·최근 로그인은 날짜만 `YYYY-MM-DD`; 수정일은 분 단위                                             |
| 회원 제재·포인트 이력 | [`MemberPenaltySummaryCard.tsx`](../../src/domains/MemberInfo/components/MemberPenaltySummaryCard.tsx), [`PenaltyHistoryTimelineDialog.tsx`](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog.tsx), [`PointHistoryCard.tsx`](../../src/domains/MemberInfo/components/point-history/PointHistoryCard.tsx) | 대부분 `YYYY-MM-DD HH:mm`; 일부 원본 값은 title로 별도 제공                                               |
| 블랙리스트 이력       | [`BlacklistHistoryTab.tsx`](../../src/domains/MemberInfo/components/BlacklistHistoryTab.tsx)                                                                                                                                                                                                                                                 | `history.createdAt` 원문을 그대로 표시. 날짜 규격이 포맷 유틸 사용처와 다를 수 있음                       |
| 운영 점검 일정        | [`MaintenanceListSection.tsx`](../../src/domains/Operation/components/MaintenanceListSection.tsx)                                                                                                                                                                                                                                            | `T`만 공백으로 바꿔 표시. 초·소수 초 제거와 유효성 처리 없음                                              |
| 팝업 관리             | [`PopupManagementTable.tsx`](../../src/domains/Operation/components/PopupManagementTable.tsx)                                                                                                                                                                                                                                                | 시작·종료는 `formatPopupDateTime`; 생성·수정은 API 문자열을 그대로 표시하거나 `-`                         |

목록 셀에서는 날짜 유틸 외에도 페이지별 정렬·너비·잘림 정책이 있다. 따라서 포맷 통일은 의미가 있지만, 스타일을 한 클래스로 강제하면 표 밀도나 댓글 메타 정보 계층이 깨질 수 있다.

## 5. 날짜 입력·필터 UI (표시 출력과 별도)

공용 [`DatePicker.tsx`](../../src/shared/components/DatePicker.tsx)와 [`DateTimePicker.tsx`](../../src/shared/components/DateTimePicker.tsx)가 달력 선택 UI를 제공한다. `DatePicker` 값은 `yyyy-MM-dd`; 달력 텍스트는 한국어이며, 날짜 트리거의 표시용 형식은 화면 속성이다. `DateTimePicker`는 날짜 선택과 시·분 선택을 합친다.

날짜 필터는 [`ExamSearch.tsx`](../../src/domains/Reviews/components/ExamSearch.tsx), [`PostFilterPanel.tsx`](../../src/domains/Posts/components/PostFilterPanel.tsx), [`CommentFilterPanel.tsx`](../../src/domains/Comments/components/CommentFilterPanel.tsx)에서 사용한다. 생년월일은 [`MemberInfoEditFormFields.tsx`](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx)에서 `DatePicker`를 사용한다. 예약·운영 시각 입력은 시험후기 기간 편집, 포인트 일정, 팝업, 서버 점검 일정, 엑셀 포인트 업로드 폼에서 `DateTimePicker`를 사용한다.

이 입력 UI는 목록·상세 메타 날짜 표시와 목적이 다르므로, 날짜 값의 저장 규약은 유지하면서 표시 포맷 공통화 대상과 달력 UI 개선 대상을 분리해 관리한다.

## 6. 현재 일관성 문제

1. 날짜와 시간의 의미가 같은데 분 단위 24시간제(`YYYY-MM-DD HH:mm`)와 오전·오후 12시간제가 혼재한다.
2. 날짜 스타일이 `font-mono`, 기본 폰트, 11px·12px·xs, 회색 400·500·600·800으로 화면마다 달라진다.
3. 포맷 유틸이 `-`를 반환해도 이를 감싸는 표시 스타일·배치·수정일 행 숨김 정책이 다르다.
4. 원문을 직접 출력하거나 `T`만 치환하는 화면이 남아 있다.
5. 시험후기 상세 작성 시각은 유틸을 거치지 않는 별도 변환 경로가 있다.
6. 분 단위 유틸은 입력 검증 없이 문자열 자르기를 하므로 잘못된 값 처리 기준이 AM/PM 유틸과 다르다.

## 7. 통일안

### 날짜·시간 값

- 관리자 데이터 메타 정보의 기본 표시는 `YYYY-MM-DD HH:mm` (24시간제, 분 단위, 초 미표시)로 통일한다. 이슈 대상 문의·신고·시험후기는 이 기준을 우선 적용한다.
- 생년월일·가입일처럼 시각 정보가 없는 값은 `YYYY-MM-DD`로 표시한다.
- 날짜 선택 필드의 달력 접근성 라벨·긴 날짜 텍스트는 현행 한국어 표현을 유지하고, 저장·검색 값은 `yyyy-MM-dd`로 유지한다.
- 파일명 타임스탬프와 API 송수신 문자열은 화면 표시 기준에 포함하지 않는다.

### 글자 스타일

- 기본 메타 날짜 스타일은 `text-xs text-gray-600 tabular-nums whitespace-nowrap`로 제안한다. 표 안은 가운데 정렬 등 기존 열 레이아웃을 유지한다.
- 상세 정보는 같은 크기·숫자 정렬을 유지하되 값 색상은 본문 대비에 맞춰 `text-gray-800` 변형을 허용한다.
- 댓글처럼 보조 정보인 날짜는 `text-[11px]` 변형을 허용하되 포맷·숫자 모양·색 계열은 공통 기준을 따른다.
- 라벨 색상, 정렬, 열 너비, 줄바꿈과 말줄임은 각 화면의 정보 구조이므로 날짜 값의 표현 규칙과 별도 속성으로 둔다.

### 공통 구현

- 엄격한 파싱과 invalid/null fallback을 갖는 단일 표시 포맷 함수를 둔다. `-`를 공통 fallback으로 사용한다.
- 포맷과 시각 표시 클래스를 재사용하는 작은 공통 표시 컴포넌트 또는 명시적인 variant를 제공한다. 전체 스타일을 강제하기보다 `table`, `detail`, `subtle` 같은 소수의 사용 맥락만 제공한다.
- 이슈 범위에서 수정일이 없을 때 숨길지 `-`로 표시할지 먼저 정책을 고정한다. 제안 기본값은 상세의 선택적 수정일 행 숨김을 유지하는 것이다.
- `Date` 파싱으로 바꿀 때 timezone 없는 API 날짜 문자열이 브라우저 현지 시각에서 변형되지 않는지 확인한다. `YYYY-MM-DD HH:mm`에 무조건 `new Date()`를 적용하지 않는다.

## 8. 구현 순서 제안

1. 이슈 대상 목록·상세·댓글·시험후기 수정 경로에 대해 `YYYY-MM-DD HH:mm`, fallback, 스타일 변형을 정한다.
2. 공용 포맷 함수가 유효하지 않은 값까지 처리하도록 보완하고 날짜 숫자 폭을 `tabular-nums`로 맞춘다.
3. 문의·신고와 시험후기 대상 컴포넌트를 공통 포맷 및 스타일로 변경한다.
4. 인접한 시험후기 운영 기간 화면에 같은 규칙을 적용한다.
5. 게시글·댓글·포인트·회원·운영 화면을 2차 범위로 분류해 AM/PM, raw 출력 및 직접 치환을 정리한다. 이 단계는 각 도메인의 기존 UI 밀도와 요구사항을 확인하며 확장한다.

## 9. 조사 방법 및 한계

`src`의 TS/TSX 구현 파일을 대상으로 포맷터 호출, 날짜 필드, `Date` 파싱, 로케일 포맷, 날짜 선택 컴포넌트 사용을 검색하고 실제 렌더링 위치를 확인했다. 테스트·문서·모의 데이터에만 있는 문자열은 사용자 화면 사용처 표에서 제외했다. 조사 범위는 프런트엔드 `src`이며, 서버 응답의 실제 timezone 계약과 운영 데이터의 모든 형식은 코드만으로 확정할 수 없다.

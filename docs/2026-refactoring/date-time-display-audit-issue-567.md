# 날짜·시간 표시 전수조사 및 통일안 (이슈 #567)

조사일: 2026-11-05  
범위: `src` 전체의 사용자 화면 날짜·시간 표시, 날짜 선택 UI, 그리고 이슈 #567 대상인 문의·신고 및 시험후기 화면. 정렬·계산을 위한 `Date` 사용과 API 타입 선언은 표시 사용처와 구분했다.

## 1. 이슈 요구사항

문의·신고와 시험후기에서 목록·상세·댓글 등 같은 의미의 날짜 정보가 같은 형식과 글자 스타일로 보이도록 한다. 날짜 구분자, 시간 및 초 표시, 글꼴·크기·굵기·색상, 값이 없거나 유효하지 않은 경우를 공통 기준으로 정하고 기존 포맷 유틸을 재사용했다.

## 2. 현재 공통 포맷터와 적용 결과

정의는 [`date-time-formatter.ts`](../../src/shared/utils/date-time-formatter.ts)에 있다.

| 함수                      | 출력·동작                                                                                    | 현재 사용 성격                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `formatDateTimeToMinutes` | 날짜·시간 형식과 달력상 날짜·시각을 검증한 뒤 `YYYY-MM-DD HH:mm` 반환. 빈 값·잘못된 값은 `-` | 관리 데이터·상태 이력의 공통 표시 함수                 |
| `formatDateTimeToSeconds` | `T`를 공백으로 바꾸고 소수 초 제거, 최대 초까지 표시                                         | 정의되어 있으나 현재 `src`의 화면 호출은 검색되지 않음 |
| `formatDateTimeWithAmPm`  | `YYYY-MM-DD 오전/오후 h:mm`; 빈 값 또는 파싱 실패는 `-`                                      | 정의는 남아 있으나 현재 화면 호출은 없음               |
| `formatDateOnly`          | 입력 앞 10자(`YYYY-MM-DD`); 빈 값은 `-`                                                      | 회원 날짜                                              |

`formatDateTimeToMinutes`는 입력 문자열을 `Date`로 변환하지 않고 형식·월별 일수·시·분 범위를 검사한다. 시간대 오프셋이 붙은 문자열도 입력의 시각을 현지 시간으로 변환하지 않고 분까지 표시한다. 화면에서 오전/오후 표기를 하던 사용처는 이 함수로 전환했다.

## 3. 이슈 대상 화면 전수 목록

| 화면·정보                        | 위치                                                                                                                                                      | 현재 포맷                                        | 현재 글자 스타일 및 빈 값                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| 문의·신고 목록 작성일            | [`InquiryReportTable.tsx`](../../src/domains/InquiryReport/components/InquiryReportTable.tsx)                                                             | `formatDateTimeToMinutes`, `YYYY-MM-DD HH:mm`    | 14px, 일반 글꼴, 회색. 빈 값은 `-`                           |
| 문의·신고 상세 작성일            | [`InquiryReportDetailPanel.tsx`](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx)                                                 | 동일                                             | 14px, 회색 본문 글자. 빈 값은 `-`                            |
| 문의·신고 상세 수정일            | 같은 파일                                                                                                                                                 | 동일                                             | 작성일과 같은 값 스타일. `updatedAt`이 없으면 행 자체를 숨김 |
| 문의 댓글 작성일                 | [`InquiryCommentItem.tsx`](../../src/domains/InquiryReport/components/InquiryCommentItem.tsx)                                                             | 동일                                             | 14px, 일반 글꼴, 보조 회색. 빈 값은 `-`                      |
| 시험후기 목록 작성일             | [`use-exam-reviews.ts`](../../src/domains/Reviews/hooks/use-exam-reviews.ts), [`ExamTable.tsx`](../../src/domains/Reviews/components/ExamTable.tsx)       | `contentDate`를 `formatDateTimeToMinutes`로 변환 | 14px, 열 너비 150px                                          |
| 시험후기 상세 작성일/업로드 시각 | [`ExamDetailSection.tsx`](../../src/domains/Reviews/components/ExamDetailSection.tsx), [`ExamReviewPage.tsx`](../../src/pages/reviews/ExamReviewPage.tsx) | 모두 `formatDateTimeToMinutes` 사용              | 상세 업로드 시각 14px                                        |
| 시험후기 댓글 작성일             | [`ExamReviewCommentSection.tsx`](../../src/domains/Reviews/components/ExamReviewCommentSection.tsx)                                                       | `formatDateTimeToMinutes`                        | 14px                                                         |
| 시험후기 변경 이력 변경일시      | [`ExamReviewLogSection.tsx`](../../src/domains/Reviews/components/ExamReviewLogSection.tsx)                                                               | `formatDateTimeToMinutes`                        | 14px                                                         |

시험후기 운영 기간 화면도 도메인상 인접 사용처로 확인했다. [`ExamReviewPeriodListSection.tsx`](../../src/domains/Reviews/components/ExamReviewPeriodListSection.tsx), [`ExamReviewAdminStatusPeriodList.tsx`](../../src/domains/Reviews/components/ExamReviewAdminStatusPeriodList.tsx), [`ExamReviewAdminStatusDialog.tsx`](../../src/domains/Reviews/components/ExamReviewAdminStatusDialog.tsx), [`ExamReviewPeriodDeleteConfirmModal.tsx`](../../src/domains/Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx)는 시작·종료·생성·수정 시각을 분 단위 포맷터로 표시한다. 일정 편집은 공용 `DateTimePicker`를 쓴다.

## 4. `src` 전체의 추가 날짜·시간 표시 사용처

이슈 대상 외에도 같은 포맷 유틸이 넓게 사용된다. 아래 표는 2차 정리 결과를 반영해 화면에 실제로 렌더링되는 날짜 계열 사용처를 묶었다.

| 영역                   | 파일                                                                                                                                                                                                                                                                                                                                         | 표시 방식                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 게시글                 | [`PostTableRow.tsx`](../../src/domains/Posts/components/PostTableRow.tsx), [`PostDetailInfoPanel.tsx`](../../src/domains/Posts/components/PostDetail/PostDetailInfoPanel.tsx), [`PostDetailCommentItem.tsx`](../../src/domains/Posts/components/PostDetail/PostDetailCommentItem.tsx)                                                        | `formatDateTimeToMinutes`: `YYYY-MM-DD HH:mm`; 날짜에서 `font-mono` 제거 |
| 댓글 관리              | [`CommentTableRow.tsx`](../../src/domains/Comments/components/CommentTableRow.tsx)                                                                                                                                                                                                                                                           | `formatDateTimeToMinutes`; 날짜에서 `font-mono` 제거                     |
| 신고 이력              | [`ReportHistoryCard.tsx`](../../src/shared/components/ReportHistoryCard.tsx)                                                                                                                                                                                                                                                                 | `formatDateTimeToMinutes`; 날짜에서 `font-mono` 제거                     |
| 제재 이력              | [`SanctionHistoryCard.tsx`](../../src/shared/components/SanctionHistoryCard.tsx)                                                                                                                                                                                                                                                             | `formatDateTimeToMinutes`; 날짜에서 `font-mono` 제거                     |
| 상태 변경 이력         | [`StatusHistoryCard.tsx`](../../src/shared/components/StatusHistoryCard.tsx)                                                                                                                                                                                                                                                                 | `formatDateTimeToMinutes`; 요약·상세 시각                                |
| 포인트 일정            | [`PointFreezeListSection.tsx`](../../src/domains/Points/components/PointFreezeListSection.tsx), [`PointFreezeDeleteConfirmModal.tsx`](../../src/domains/Points/components/PointFreezeDeleteConfirmModal.tsx)                                                                                                                                 | 시작·종료·생성·수정 시각 및 삭제 확인에서 `YYYY-MM-DD HH:mm`             |
| 회원 정보              | [`MemberDirectorySection.tsx`](../../src/domains/MemberInfo/components/MemberDirectorySection.tsx), [`MemberDetailInfoGrid.tsx`](../../src/domains/MemberInfo/components/MemberDetailInfoGrid.tsx), [`MemberInfoEditForm.tsx`](../../src/domains/MemberInfo/components/MemberInfoEditForm.tsx)                                               | 가입·인증·최근 로그인은 날짜만 `YYYY-MM-DD`; 수정일은 분 단위            |
| 회원 제재·포인트 이력  | [`MemberPenaltySummaryCard.tsx`](../../src/domains/MemberInfo/components/MemberPenaltySummaryCard.tsx), [`PenaltyHistoryTimelineDialog.tsx`](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog.tsx), [`PointHistoryCard.tsx`](../../src/domains/MemberInfo/components/point-history/PointHistoryCard.tsx) | 표시 날짜는 `formatDateTimeToMinutes`; 날짜에서 `font-mono` 제거         |
| 블랙리스트·포인트 이력 | [`BlacklistHistoryTab.tsx`](../../src/domains/MemberInfo/components/BlacklistHistoryTab.tsx), [`PointHistoryTab.tsx`](../../src/domains/MemberInfo/components/PointHistoryTab.tsx)                                                                                                                                                           | 원문·`T` 치환 표시를 `formatDateTimeToMinutes`로 변경                    |
| 운영 점검 일정         | [`MaintenanceListSection.tsx`](../../src/domains/Operation/components/MaintenanceListSection.tsx)                                                                                                                                                                                                                                            | 시작·종료·생성·수정을 `formatDateTimeToMinutes`로 표시                   |
| 팝업 관리              | [`PopupManagementTable.tsx`](../../src/domains/Operation/components/PopupManagementTable.tsx)                                                                                                                                                                                                                                                | 게시 기간·생성·수정을 `formatDateTimeToMinutes`로 표시                   |

날짜 형식은 공용 포맷터로 통일했지만 크기·색상은 영역의 맥락을 따른다. 문의·신고 일반 텍스트는 14px, 시험후기 날짜는 14px이며, 다른 화면은 주변 타이포그래피를 유지한다. `tabular-nums`는 사용하지 않는다. 공통 날짜 표시 컴포넌트는 추가하지 않았다.

## 5. 날짜 입력·필터 UI (표시 출력과 별도)

공용 [`DatePicker.tsx`](../../src/shared/components/DatePicker.tsx)와 [`DateTimePicker.tsx`](../../src/shared/components/DateTimePicker.tsx)가 달력 선택 UI를 제공한다. `DatePicker` 값은 `yyyy-MM-dd`; 달력 텍스트는 한국어이며, 날짜 트리거의 표시용 형식은 화면 속성이다. `DateTimePicker`는 날짜 선택과 시·분 선택을 합친다.

날짜 필터는 [`ExamSearch.tsx`](../../src/domains/Reviews/components/ExamSearch.tsx), [`PostFilterPanel.tsx`](../../src/domains/Posts/components/PostFilterPanel.tsx), [`CommentFilterPanel.tsx`](../../src/domains/Comments/components/CommentFilterPanel.tsx)에서 사용한다. 생년월일은 [`MemberInfoEditFormFields.tsx`](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx)에서 `DatePicker`를 사용한다. 예약·운영 시각 입력은 시험후기 기간 편집, 포인트 일정, 팝업, 서버 점검 일정, 엑셀 포인트 업로드 폼에서 `DateTimePicker`를 사용한다.

이 입력 UI는 목록·상세 메타 날짜 표시와 목적이 다르므로, 날짜 값의 저장 규약은 유지하면서 표시 포맷 공통화 대상과 달력 UI 개선 대상을 분리해 관리한다.

## 6. 반영한 기준과 남은 범위

1. 사용자 화면 날짜·시간 표시는 `YYYY-MM-DD HH:mm` 분 단위 형식으로 변경했다. 날짜만 의미하는 생년월일·가입일 등은 `YYYY-MM-DD`를 유지한다.
2. 날짜 요소의 `font-mono`와 `tabular-nums`는 제거했다. 문의·신고 일반 텍스트와 시험후기 날짜 글자는 14px로 맞췄다.
3. 빈 값·잘못된 날짜·범위를 벗어난 시각은 공용 분 단위 포맷터에서 `-`로 처리한다. 문의·신고 상세의 수정일은 값이 없으면 행을 숨기는 기존 동작을 유지한다.
4. 게시글·댓글·회원·포인트·운영 영역에서 확인한 원문 출력과 `T` 치환은 공용 포맷터 호출로 변경했다.
5. 글자 색상·크기는 화면별 정보 위계를 유지하며, 공통 날짜 표시 컴포넌트는 만들지 않았다.

## 7. 적용된 표시 기준

### 날짜·시간 값

- 관리자 데이터 메타 정보는 `YYYY-MM-DD HH:mm` (24시간제, 분 단위, 초 미표시)을 사용한다.
- 생년월일·가입일처럼 시각 정보가 없는 값은 `YYYY-MM-DD`로 유지한다.
- 날짜 선택 필드의 달력 접근성 라벨·긴 날짜 텍스트는 한국어이며, 저장·검색 값은 `yyyy-MM-dd`이다.
- 파일명 타임스탬프와 API 송수신 문자열은 화면 표시 기준과 별개다.

### 글자 스타일

- 문의·신고 화면의 일반 텍스트와 시험후기 날짜 글자는 14px (`text-sm`)로 적용했다. 문의·신고 목록 제목은 `font-semibold`이다.
- 게시글·댓글 목록과 상세의 날짜에서 `font-mono`를 제거하고 일반 글꼴을 사용한다.
- `tabular-nums`는 저장소 코드에서 제거했다. 숫자 모양은 주변 글꼴의 기본 설정을 따른다.
- 정렬·열 너비·줄바꿈과 말줄임은 기존 화면 레이아웃을 유지한다.

### 공통 구현

- `formatDateTimeToMinutes`에 형식·날짜·시각 검증과 `-` fallback을 적용했다.
- 화면은 공용 포맷터를 직접 사용하며, 공통 날짜 표시 컴포넌트나 variant는 없다.
- 수정일이 없는 상세 행은 기존처럼 숨긴다.
- 포맷터는 문자열의 날짜·시간을 직접 보여주며 timezone 변환을 하지 않는다.

## 8. 작업 결과와 검증 상태

1. 분 단위 공용 포맷터가 초와 UTC 오프셋 범위까지 검사하도록 보완했다. 잘못된 초·오프셋을 포함한 fallback 사례를 추가했으며, 포맷터 테스트 45개가 통과했다.
2. 문의·신고 및 시험후기 날짜 형식과 글자 크기를 조정했다. 문의·신고 일반 텍스트는 14px, 제목은 semibold이다.
3. 게시글·댓글·포인트·회원·운영 화면으로 포맷 변경을 확장하고 날짜의 `font-mono` 및 `tabular-nums` 스타일을 제거했다.
4. 관련 도메인 검증 결과: 테스트 46개 파일·365개 통과, 린트 통과, 빌드 통과, `git diff --check` 통과. 빌드에는 JavaScript 청크 크기 안내가 출력됐다.

## 9. 조사 방법 및 한계

`src`의 TS/TSX 구현 파일을 대상으로 포맷터 호출, 날짜 필드, `Date` 파싱, 로케일 포맷, 날짜 선택 컴포넌트 사용을 검색하고 실제 렌더링 위치를 확인했다. 테스트·문서·모의 데이터에만 있는 문자열은 사용자 화면 사용처 표에서 제외했다. 조사 범위는 프런트엔드 `src`이며, 서버 응답의 실제 timezone 계약과 운영 데이터의 모든 형식은 코드만으로 확정할 수 없다.

# Button 공통화 조사 및 작업 계획

> 2026-10-09 소스 기준. `App.tsx`에 연결된 화면과 그 화면에서 쓰는 도메인·공유 컴포넌트를 조사했다. **현재는 계획 문서만 작성했으며 UI 코드는 변경하지 않았다.**

## 결론

기존 [`Button`](../../src/shared/components/ui/button.tsx)을 공통 기준으로 확장한다. 이미 `variant` 6종(`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`)과 `size` 6종이 있으며, 새 범용 버튼을 하나 더 만들 필요는 없다. 문제는 같은 역할에 파랑·검정·빨강 스타일이 섞이고, 많은 호출부가 `className`으로 배경색·높이·모서리를 다시 정의한다는 점이다.

- **기본 강조 동작은 `default`(기존 `--primary`, 파랑)**, 취소·보조 동작은 `outline`, 삭제·탈퇴는 `destructive`로 통일한다.
- **결정: 이번 작업 대상의 주요 실행 버튼은 기존 `default`(파랑)로 통일한다.** 회원 수정·문의 댓글 등 검정 실색 버튼과 외곽선으로 표시된 주요 실행 버튼을 파랑으로 옮긴다. `neutral` 변형은 추가하지 않는다. 게시글·댓글 필터 섹션의 검정 검색 버튼은 이번 범위에서 제외한다.
- **필터 섹션 내부 버튼은 이번 공통화에서 제외한다.** 게시글·댓글 관리의 필터 선택·검색·초기화 버튼은 추후 시험후기 관리 화면처럼 드롭다운 중심으로 바꿀 계획이므로 현재 형태를 공통 컴포넌트로 굳히지 않는다.
- 날짜 선택기·드롭다운 트리거·정렬·탭·페이지네이션·파일 선택 등은 버튼처럼 보이더라도 자체 상호작용을 갖는다. 기본 Button으로 무조건 치환하지 않고 해당 컴포넌트의 스타일·접근성만 맞춘다.

## 작업 전 확정 기준

**사전 설계 결정은 모두 완료했다.** 아래 표는 확정된 기준이며, 실제 화면 배치와 동작 확인은 단계별 구현 체크리스트에 남겼다.

| 확정 항목                      | 현재 상태·영향                                                                                                                                                               | 확정 기준                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **확정** 높이                  | 기존 Button은 `sm` 32px·기본 36px·`lg` 40px. 호출부에는 목록 행 28px, 로그인 44px, 제재 모달 48px, 메뉴 24px도 있다. 전부 36px로 바꾸면 표 밀도와 입력·버튼 정렬이 달라진다. | **한 가지 높이로 통일하지 않는다.** 일반 폼 36px, 작은 목록/모달 32px, 큰 CTA 40px을 기준으로 한다. 반복되는 28px·48px은 각각 `xs`·`xl` 크기로 추가한다. 24px 메뉴는 클릭 영역을 32px로 넓히고, 로그인 44px은 화면 예외로 유지한다. 같은 행의 Input·Select 높이도 맞춘다.                          |
| **확정** 너비·간격·모서리      | `w-full` 폼 버튼, 고정 너비 초기화/적용, 작은 행 액션이 공존한다.                                                                                                            | Button은 기본 너비를 내용에 맞추고, 너비·컨테이너 간격은 화면에서 정한다. 일반 버튼 모서리는 기본 `rounded-md`를 사용하고, 별도 UI의 모서리는 해당 컴포넌트에서 관리한다.                                                                                                                          |
| **확정** 주요 버튼 색          | 기본 Button은 파랑이지만 게시글·댓글 검색, 회원 수정, 문의 댓글은 검정 실색이다.                                                                                             | 주요 실행은 기존 `default` 파랑으로 통일한다. 이번 대상에 검정 강조 변형을 추가하지 않는다. 필터 섹션의 검정 버튼은 현행 유지한다.                                                                                                                                                                 |
| **확정** 위험 행동 색          | 삭제 시작·삭제 확인·제재 적용·단순 초기화에 빨간색이 섞여 있다. 일부 삭제 확인은 현재 파랑이다.                                                                              | 최종 삭제·탈퇴 확인은 빨간 실색, 삭제 시작은 빨간 외곽선, 초기화는 중립 외곽선으로 정한다. 경고·강등 적용처럼 확인 모달을 여는 버튼은 빨간 외곽선, 최종 제재 확인은 빨간 실색으로 정한다.                                                                                                          |
| **확정** 선택·아이콘 버튼 범위 | 필터 선택, 정렬·탭·페이지네이션·날짜 선택은 각각 고유 동작이 있다.                                                                                                           | 필터 섹션은 이번 범위에서 제외한다. 나머지는 기존 전용 컴포넌트를 유지하며 버튼 토큰과 포커스 표시를 맞춘다.                                                                                                                                                                                       |
| **확정** 비활성·진행 중 상태   | 미연결 회원 일괄 행동, 조회·저장 중 버튼, 확인 모달의 비활성 조건이 화면별로 다르다.                                                                                         | 공통 Button은 시각·포커스·`disabled` 표현을 제공하고, **언제 비활성화할지는 호출부**가 결정한다. 중복 제출 방지와 로딩 문구 유지 여부를 각 화면에서 확인한다.                                                                                                                                      |
| **확정** 아이콘 버튼 크기·이름 | 16~28px 아이콘 버튼과 24px 더보기 메뉴가 있어 누르기 어렵거나 이름이 빠질 수 있다.                                                                                           | 표·좁은 영역은 32px, 일반 화면은 36px 클릭 영역을 기준으로 한다. 그림은 약 16px로 유지한다. 아이콘만 있는 버튼에는 `aria-label` 또는 화면 판독용 문구로 구체적인 행동 이름(예: `기간 수정 메뉴 열기`, `회원 아이디 복사`)을 붙인다. 기존 24px 버튼은 클릭 영역을 32px로 넓히고 표 배치를 확인한다. |
| **확정** 적용 강도             | 기존 `className`에 색·높이·radius가 많아 한 번에 제거하면 화면이 크게 바뀐다.                                                                                                | 공통 스타일을 먼저 만든 뒤 **공유 컴포넌트 → 목록 → 폼** 순서로 교체한다. 배치 클래스와 필요한 예외는 남기고 화면별 변경 전후를 확인한다.                                                                                                                                                          |

### 이번 범위에서 제외할 필터 버튼

게시글·댓글 관리의 [`PostFilterPanel`](../../src/domains/Posts/components/PostFilterPanel.tsx)·[`CommentFilterPanel`](../../src/domains/Comments/components/CommentFilterPanel.tsx)에 있는 **게시판/상태 선택, 검색, 초기화 버튼**은 현행 유지한다. [`ExamSearch`](../../src/domains/Reviews/components/ExamSearch.tsx)의 검색·조건 초기화 버튼과 문의·신고 표의 필터 지우기 버튼도 필터 UI이므로 이번 교체 대상에서 뺀다. 추후 필터 UI를 시험후기 관리 화면의 드롭다운 방식으로 바꿀 때 구성·상태·접근성을 함께 설계한다.

## 1. 확정 스타일 체계

| 용도        | 적용 API                                         | 모습·사용 규칙                                                                                    |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 주요 실행   | `variant='default'`                              | 파란 실색. 조회, 생성, 저장, 전송 등 화면의 주요 행동                                             |
| 보조·취소   | `variant='outline'`                              | 흰 바탕·중립 테두리. 초기화, 취소, 다운로드, 공개/비공개, 복구                                    |
| 낮은 강조   | 기존 `secondary`, `ghost`, `link`                | 연한 배경, 테두리 없는 행 액션·아이콘, 텍스트 링크. 실제 역할에 맞춰 사용                         |
| 파괴적 실행 | `variant='destructive'`                          | 빨간 실색. 삭제·회원 탈퇴와 최종 확인. 단순 상태 변경이나 초기화에는 사용하지 않음                |
| 파괴적 보조 | `variant='destructive-outline'` **구현 시 추가** | 흰 바탕·빨간 글자/테두리. 삭제 모달을 열거나 제재 적용처럼 주의를 주되 최종 파괴 확인은 아닌 행동 |

크기는 기존 `sm`(32px)·기본(36px)·`lg`(40px)·아이콘 크기를 먼저 사용한다. 반복되는 행 버튼에는 `xs`(28px), 제재 모달에는 `xl`(48px)을 추가한다. `w-full`, `min-w-*`, 정렬용 `gap`처럼 **배치에 필요한 클래스만 호출부에 남긴다.** 로그인 44px은 화면 예외로 유지한다. 아이콘 버튼은 표에서 32px, 일반 화면에서 36px 클릭 영역을 사용하고 기존 24px 메뉴는 32px로 넓힌 뒤 표 배치를 확인한다.

## 2. 페이지별 현황과 적용 표

표의 스타일은 현재 코드 기준의 대략적인 모습이다. 모달·목록 행처럼 페이지 파일 밖에 있는 버튼도 해당 화면에 포함했다. `P`=파란 주요 실행, `O`=외곽선, `D`=파괴적, `DO`=파괴적 보조, `G`=ghost/아이콘을 뜻한다. **필터 섹션 내부 버튼은 현황만 기록하고 적용 기준 대상에서는 제외한다.**

| 화면                                      | 현재 버튼과 스타일                                                                                                                                                                    | 적용 기준                                                                                                                                                              | 주요 수정 위치                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인 `/`                                | 로그인: 44px 흰 외곽선 전체 너비; 비밀번호 보기: 입력 안 아이콘                                                                                                                       | 로그인 **P**, 보기 버튼은 `InputGroup.Button` 유지                                                                                                                     | [`LogInPage`](../../src/pages/login/LogInPage.tsx)                                                                                                                                                                                                                                                                                                                         |
| 회원 정보 `/member/info`, `/:memberKey`   | 검색·초기화: 외곽선, 초기화는 큰 둥근 모서리; 일괄 행동: 알약 외곽선·비활성; 수정/완료·포인트 지급: 검정 실색과 외곽선; 복사·뒤로·메뉴: 작은 아이콘; 제재 이력 모달: 48px 검정/외곽선 | 검색·완료 **P**, 초기화·취소·일괄 행동 **O**, 지급/차감 확인 **P**, 탈퇴 **D**, 복사·뒤로·메뉴 **G**. 미연결 일괄 행동의 비활성 상태 유지                              | [`MemberDirectorySection`](../../src/domains/MemberInfo/components/MemberDirectorySection.tsx), [`MemberDetailSection`](../../src/domains/MemberInfo/components/MemberDetailSection.tsx), [`MemberDirectoryActionBar`](../../src/domains/MemberInfo/components/MemberDirectoryActionBar.tsx), [`penalty-history`](../../src/domains/MemberInfo/components/penalty-history) |
| 경고·강등 `/member/penalty`               | 검색·초기화: 외곽선; 경고/강등 적용: 빨간 실색; 최종 확인: 기본 파랑; 탭: 파란 밑줄                                                                                                   | 검색 **P**, 초기화 **O**, 제재 적용 **DO**, 최종 제재 확인 **D**. 탭은 탭 컴포넌트로 별도 유지                                                                         | [`MemberPenaltyManagementPage`](../../src/pages/member/MemberPenaltyManagementPage.tsx), [`WarnPenaltyTab`](../../src/domains/MemberInfo/components/WarnPenaltyTab.tsx), [`DemotionPenaltyTab`](../../src/domains/MemberInfo/components/DemotionPenaltyTab.tsx)                                                                                                            |
| 시험후기 `/reviews/exam`                  | 조회: 파란 기본; 조건 초기화·재시도: 외곽선; 상세 편집·저장: 파랑/연한 파랑; 삭제 시작: 빨간 외곽선; 파일명·파일 변경: 개별 외곽선                                                    | 상세 저장 **P**, 취소·재시도 **O**, 편집 전환 `secondary`, 삭제 시작 **DO**, 삭제 확인 **D**, 파일 변경 **O**, 파일명 다운로드 `link`. 검색·필터 섹션 내부 버튼은 제외 | [`ExamDetailSection`](../../src/domains/Reviews/components/ExamDetailSection.tsx), [`ExamReviewDetailInfoSection`](../../src/domains/Reviews/components/ExamReviewDetailInfoSection.tsx)                                                                                                                                                                                   |
| 시험후기 기간 `/reviews/exam-period`      | 생성·초기화: 작은 외곽선(초기화 글자만 빨강); 목록 더보기: 24px ghost; 수정·삭제 확인: 기본 파랑                                                                                      | 생성 **P**, 초기화 **O**, 더보기 **G**, 수정 확인 **P**, 삭제 확인 **D**                                                                                               | [`ExamReviewPeriodScheduleForm`](../../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx), [`ExamReviewPeriodListSection`](../../src/domains/Reviews/components/ExamReviewPeriodListSection.tsx), [삭제 확인 모달](../../src/domains/Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx)                                                              |
| 개별 포인트 `/point/single`               | 회원 검색: 작은 외곽선; 초기화: 빨간 글자 외곽선; 적용: 외곽선; 확인 모달: 파랑/외곽선                                                                                                | 검색·적용·확인 **P**, 초기화·취소 **O**                                                                                                                                | [`AdjustSinglePointPage`](../../src/pages/points/AdjustSinglePointPage.tsx), [`PointActionButtons`](../../src/domains/Points/components/PointActionButtons.tsx)                                                                                                                                                                                                            |
| 전체 포인트 `/point/all`                  | 초기화: 빨간 글자 외곽선; 적용: 외곽선; 확인 모달: 파랑/외곽선                                                                                                                        | 적용·확인 **P**, 초기화·취소 **O**                                                                                                                                     | [`AdjustAllMemberPointPage`](../../src/pages/points/AdjustAllMemberPointPage.tsx), [확인 모달](../../src/domains/Points/components/AllMemberPointAdjustmentConfirmModal.tsx)                                                                                                                                                                                               |
| 포인트 미지급 일정 `/point/freeze`        | 생성·초기화: 작은 외곽선; 목록 더보기: 24px ghost; 확인 모달의 삭제도 기본 파랑                                                                                                       | 생성·수정 확인 **P**, 초기화·취소 **O**, 더보기 **G**, 삭제 확인 **D**                                                                                                 | [`PointFreezeScheduleForm`](../../src/domains/Points/components/PointFreezeScheduleForm.tsx), [`PointFreezeListSection`](../../src/domains/Points/components/PointFreezeListSection.tsx), [삭제 확인 모달](../../src/domains/Points/components/PointFreezeDeleteConfirmModal.tsx)                                                                                          |
| 엑셀 포인트 업로드 `/point/excel-upload`  | 템플릿 다운로드·재업로드: 외곽선; 업로드 실행: 파랑; 미처리 명단 저장: 호박색 외곽선; 태그 삭제: 작은 아이콘                                                                          | 업로드 **P**, 다운로드·재업로드 **O**, 미처리 명단 저장은 경고색 외곽선 예외 유지, 태그 삭제 **G**                                                                     | [`ExcelPointUploadPage`](../../src/pages/points/ExcelPointUploadPage.tsx)                                                                                                                                                                                                                                                                                                  |
| 게시글 관리 `/posts/manage`               | 필터: 검정 선택 칩; 초기화: 회색 외곽선 전체 너비; 검색: 검정 실색; 일괄 삭제: 빨강, 공개/복구: 외곽선; 상태 모달 확인: 파랑/빨강                                                     | 필터 섹션 내부 버튼 제외. 공개·복구 **O**, 삭제 및 삭제 확인 **D**, 그 외 확인 **P**                                                                                   | [`BulkActionBar`](../../src/shared/components/BulkActionBar.tsx), [`StatusChangeModal`](../../src/shared/components/StatusChangeModal.tsx)                                                                                                                                                                                                                                 |
| 댓글 관리 `/posts/comments`               | 게시글 관리와 같은 필터·검색·일괄 행동; 행 상태 배지는 클릭 가능한 기본 `<button>`                                                                                                    | 필터 섹션 내부 버튼 제외. 공개·복구 **O**, 삭제 **D**. 상태 배지 버튼은 배지 클릭 동작·이름을 별도 점검                                                                | [`CommentTableRow`](../../src/domains/Comments/components/CommentTableRow.tsx), [`BulkActionBar`](../../src/shared/components/BulkActionBar.tsx)                                                                                                                                                                                                                           |
| 게시글 상세 `/posts/manage/:postId`       | 목록/이전: 파랑·외곽선 혼재; 관리 카드·댓글 행: 28~40px 흰 외곽선/빨간 삭제; 상태 모달: 파랑/빨강                                                                                     | 뒤로·목록 **O**, 공개·비공개·복구 **O**, 삭제 시작 **DO**·확인 **D**, 댓글 행 `xs`                                                                                     | [`PostDetailPage`](../../src/pages/posts/PostDetailPage.tsx), [`PostDetailManageCard`](../../src/domains/Posts/components/PostDetail/PostDetailManageCard.tsx), [`PostDetailCommentItem`](../../src/domains/Posts/components/PostDetail/PostDetailCommentItem.tsx)                                                                                                         |
| 문의·신고 `/report/inquiry`               | 댓글 등록·저장과 상태 변경 확인: 검정 실색; 취소·답글: 작은 외곽선/텍스트; 복사·닫기·필터 지우기: 16~28px 아이콘; 대상글 링크: 알약 외곽선                                            | 등록·저장·상태 확인 **P**, 편집 취소 **O**, 인라인 답글 취소 `link`, 답글 **O**, 아이콘 **G**. 대상글은 이동용 `<a>` 유지                                              | [`InquiryReportDetailPanel`](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx), [`InquiryCommentItem`](../../src/domains/InquiryReport/components/InquiryCommentItem.tsx), [`InquiryStatusSelect`](../../src/domains/InquiryReport/components/InquiryStatusSelect.tsx)                                                                              |
| 푸시 알림 `/operation/push-notification`  | 초기화: 빨간 글자 외곽선; 알림 전송: 외곽선; 확인 모달: 파랑/외곽선                                                                                                                   | 전송·최종 확인 **P**, 초기화·취소 **O**                                                                                                                                | [`PushNotificationPage`](../../src/pages/alerts/PushNotificationPage.tsx), [확인 모달](../../src/domains/Alerts/components/PushNotificationConfirmModal.tsx)                                                                                                                                                                                                               |
| 팝업 관리 `/operation/popup`              | 새 팝업·저장: 파랑; 행 수정·삭제: ghost(삭제 글자 빨강); 편집기 파일 선택·지우기: 개별 버튼; 확인 모달은 기본 파랑                                                                    | 등록·저장 **P**, 취소 **O**, 행 수정 **G**, 삭제 시작 **DO**·최종 확인 **D**, 파일 선택 **O**·지우기 **G**                                                             | [`PopupManagementPage`](../../src/pages/operation/PopupManagementPage.tsx), [`PopupManagementTable`](../../src/domains/Operation/components/PopupManagementTable.tsx), [`PopupEditorDialog`](../../src/domains/Operation/components/PopupEditorDialog.tsx)                                                                                                                 |
| 서버 점검 `/operation/server-maintenance` | 취소·초기화: 작은 외곽선; 등록/수정: 파랑; 행 삭제: ghost 아이콘; 확인 모달 삭제: 기본 파랑                                                                                           | 등록·수정 **P**, 취소·초기화 **O**, 행 삭제 **G**(빨간 강조), 최종 삭제 **D**                                                                                          | [`MaintenanceScheduleForm`](../../src/domains/Operation/components/MaintenanceScheduleForm.tsx), [`MaintenanceListSection`](../../src/domains/Operation/components/MaintenanceListSection.tsx), [`ConfirmModal`](../../src/shared/components/ui/confirm-modal.tsx)                                                                                                         |
| 404 `*`                                   | 이전 페이지로 이동: 큰 파란 버튼, 글자색 강제 지정                                                                                                                                    | **P**. 강제 글자색 제거 가능 여부 확인                                                                                                                                 | [`NotFoundPage`](../../src/pages/errors/NotFoundPage.tsx)                                                                                                                                                                                                                                                                                                                  |

`PointMultiplePage`는 현재 라우트에 연결되지 않은 자리표시자이므로 교체 대상이 없다. 공통 [`DatePicker`](../../src/shared/components/DatePicker.tsx), [`PaginationBar`](../../src/shared/components/PaginationBar.tsx), `InputGroup.Button`, 사이드바의 버튼은 여러 화면에 간접 적용된다. 날짜·페이지 이동·입력 내부 버튼은 해당 컴포넌트의 동작을 보존하면서 별도로 확인한다.

## 3. 구현 원칙과 주의할 곳

1. [`button.tsx`](../../src/shared/components/ui/button.tsx)의 `buttonVariants`를 단일 출처로 사용한다. `destructive-outline`과 `xs`/`xl`을 추가하되 `neutral`은 추가하지 않고, 기존 변형 이름·`asChild`·기본 크기는 유지한다. `type='button'`과 `type='submit'`은 폼 맥락에 맞게 호출부에서 명시한다.
2. [`ConfirmModal`](../../src/shared/components/ui/confirm-modal.tsx)의 `confirmButtonClassName` 색상 주입은 삭제 확인에 `variant='destructive'`를 전달할 수 있는 API로 바꾼다. 시험후기 삭제 등 기존 빨간 클래스 호출부와 팝업·서버 점검의 파란 삭제 확인을 함께 점검한다.
3. 검색·초기화·생성·삭제 등 **행동의 의미**로 변형을 고른다. `className`에는 너비와 배치만 남기고 `bg-*`, `text-*`, `hover:*`, `h-*`, `rounded-*` 중 중복되는 부분을 걷는다. 기존 경고색 다운로드나 파일명 링크처럼 의미가 다른 예외는 근거를 적고 유지한다.
4. 작은 아이콘 버튼에는 접근 가능한 이름을 붙인다. `size='icon'`만으로 충분한 클릭 영역이 확보되는지, 비활성·로딩·포커스 표시가 기존과 같은지 확인한다.
5. [`index.css`](../../src/index.css)의 전역 `button` 초기화와 Tailwind 클래스 우선순위를 확인한다. `DropdownMenu.Trigger asChild`, `InputGroup.Button`, `Pagination.Link`처럼 `buttonVariants`를 간접 쓰는 컴포넌트도 변경 영향 범위에 넣는다.

## 4. 단계별 체크리스트

1~4단계는 완료 상태다. 5단계의 체크는 코드 반영과 화면 확인까지 마쳤을 때 표시한다.

### 1단계 — 공통 기준 확정 완료

- [x] 버튼 높이는 용도별 28/32/36/40/48px, 너비·간격은 화면, 일반 모서리는 `rounded-md` 기준으로 결정했다. 24px 아이콘 버튼은 32px로 넓히고 로그인 44px은 예외로 유지한다.
- [x] 주요 실행 버튼은 기존 `default` 파랑으로 통일하고 검정 `neutral` 변형은 추가하지 않기로 결정했다. 필터 섹션은 제외한다.
- [x] 삭제·제재의 시작은 빨간 외곽선, 최종 확인은 빨간 실색, 초기화는 중립 외곽선으로 결정했다.
- [x] 공통 Button은 비활성 표현을 담당하고 비활성 조건·로딩 문구는 호출부에 유지하며, 공유 컴포넌트 → 목록 → 폼 순서로 적용하기로 결정했다.
- [x] 아이콘 버튼은 표 32px·일반 화면 36px 클릭 영역과 행동·대상이 드러나는 이름을 사용하기로 결정했다.

### 2단계 — 공유 컴포넌트 정리

- [x] 확정한 `Button` 변형·크기와 비활성/포커스 상태를 구현하고 예시 화면에서 확인한다.
- [x] 기존 24px 메뉴를 32px 클릭 영역으로 넓히고 표 배치가 유지되는지 확인한다.
- [x] `ConfirmModal`의 확인 버튼 변형을 명시적으로 전달하고, 삭제 모달들의 색상을 바로잡는다.
- [x] `BulkActionBar`, `StatusChangeModal`, 페이지네이션·날짜 선택·입력 내부 버튼의 스타일 충돌과 동작을 확인한다.
- [x] 아이콘 전용 버튼의 이름·포커스·누르기 영역을 확인한다.

2단계 검증: `npm run build`, `npm run lint`, 확인 모달·날짜 선택기·페이지네이션 단위 테스트를 통과했다. 서버 점검 화면에서 삭제 확인 버튼의 빨간 배경과 닫기 버튼의 클릭 영역을 브라우저로 확인했다. 입력 내부 아이콘 버튼은 36px 높이의 입력 행 안에서 32px 클릭 영역을 사용한다.

### 3단계 — 목록·검색 화면

- [x] 게시글/댓글 필터 패널의 선택·검색·초기화 버튼은 건드리지 않고, 목록의 일괄 처리·행 동작을 전환한다.
- [x] 회원 검색·일괄 행동과 문의·신고의 댓글 버튼을 전환한다. 시험후기 검색·필터 영역과 문의·신고의 필터 조작 버튼은 제외한다.
- [x] 게시글 상세·댓글 행·팝업/서버 점검 행의 작은 액션을 전환한다.

3단계 검증: `npm run lint`, `npm run build`, 회원 일괄 행동·게시글 댓글 목록·서버 점검 화면 테스트를 통과했다. 팝업 목록은 데스크톱·390px 화면에서 삭제 시작 버튼이 빨간 외곽선, 확인 버튼이 빨간 실색이며 좁은 화면에서는 표 내부 스크롤이 유지되는 것을 확인했다. 연결되지 않은 회원 일괄 행동은 선택 여부와 무관하게 비활성으로 표시한다.

### 4단계 — 폼·모달 화면

- [x] 포인트 개별/전체/미지급·엑셀 업로드의 적용·생성·초기화·확인 버튼을 전환한다.
- [x] 시험후기 상세/기간, 회원 수정·제재 이력, 경고·강등의 저장·취소·위험 동작을 전환한다.
- [x] 푸시 알림, 팝업 편집, 서버 점검 폼, 로그인·404를 전환한다.

4단계 검증: 폼·모달 관련 테스트와 `npm run lint`, `npm run build`를 통과했다. 브라우저에서 로그인 버튼의 파란 기본 변형·44px 예외 높이와 팝업 편집의 파일 선택 외곽선·저장 기본 변형을 확인했다. 시험후기 복구와 파일명 변경 버튼은 현재 화면에서 숨겨져 있어, 해당 기능을 기대하던 오래된 테스트를 현재 노출 상태에 맞게 수정했다. 미처리 명단 저장의 호박색 외곽선은 경고 성격의 예외로 유지한다.

### 5단계 — 회귀 확인 및 마무리

- [ ] 검색·Enter 제출·폼 초기화·저장/삭제 확인·비활성/로딩을 화면별로 확인한다.
- [ ] 변경한 버튼의 키보드 포커스, 아이콘 이름, 좁은 화면의 줄바꿈을 확인한다.
- [ ] 활성 화면의 불필요한 버튼 색상/크기 덮어쓰기를 검색해 정리하고, 유지한 예외를 문서에 기록한다.
- [ ] 관련 테스트와 `npm run lint`, `npm run build`를 통과시킨다.

완료 기준은 **동일한 역할의 버튼이 같은 변형과 크기를 쓰고**, 삭제 확인이 빨간색으로 구분되며, 기존 클릭·제출·비활성 동작이 그대로 작동하는 것이다.

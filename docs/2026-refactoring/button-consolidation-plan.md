# Button 공통화 조사 및 작업 계획

> 2026-10-09 소스 기준. `App.tsx`에 연결된 화면과 그 화면에서 쓰는 도메인·공유 컴포넌트를 조사하고, 아래 1~5단계를 적용했다.

## 결론

기존 [`Button`](../../src/shared/components/ui/button.tsx)을 공통 기준으로 확장한다. 이미 `variant` 6종(`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`)과 `size` 6종이 있으며, 새 범용 버튼을 하나 더 만들 필요는 없다. 문제는 같은 역할에 파랑·검정·빨강 스타일이 섞이고, 많은 호출부가 `className`으로 배경색·높이·모서리를 다시 정의한다는 점이다.

- **기본 강조 동작은 `default`(기존 `--primary`, 파랑)**, 취소·보조 동작은 `outline`, 삭제·탈퇴는 `destructive`로 통일한다.
- **결정: 이번 작업 대상의 주요 실행 버튼은 기존 `default`(파랑)로 통일한다.** 회원 수정·문의 댓글 등 검정 실색 버튼과 외곽선으로 표시된 주요 실행 버튼을 파랑으로 옮긴다. `neutral` 변형은 추가하지 않는다. 게시글·댓글 필터 섹션의 검색 버튼도 파랑으로 통일한다.
- **게시글·댓글 관리의 게시판/상태 선택 칩은 이번 공통화에서 제외한다.** 검색·초기화 버튼은 공통 Button을 적용하고, 선택 칩은 추후 필터 UI를 드롭다운 중심으로 개편할 때 함께 설계한다.
- 날짜 선택기·드롭다운 트리거·정렬·탭·페이지네이션·파일 선택 등은 버튼처럼 보이더라도 자체 상호작용을 갖는다. 기본 Button으로 무조건 치환하지 않고 해당 컴포넌트의 스타일·접근성만 맞춘다.

## 작업 전 확정 기준

**사전 설계 결정은 모두 완료했다.** 아래 표는 확정된 기준이며, 실제 화면 배치와 동작 확인은 단계별 구현 체크리스트에 남겼다.

| 확정 항목                      | 현재 상태·영향                                                                                                                                                               | 확정 기준                                                                                                                                                                                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **확정** 높이                  | 기존 Button은 `sm` 32px·기본 36px·`lg` 40px. 호출부에는 목록 행 28px, 로그인 44px, 제재 모달 48px, 메뉴 24px도 있다. 전부 36px로 바꾸면 표 밀도와 입력·버튼 정렬이 달라진다. | **한 가지 높이로 통일하지 않는다.** 일반 폼 36px, 작은 목록/모달 32px, 큰 CTA 40px을 기준으로 한다. 반복되는 행 버튼은 `xs`(28px)로 사용하고, 제재 이력·추가·최종 확인 모달의 일반 행동 버튼은 기본 36px로 통일한다. 24px 메뉴는 클릭 영역을 32px로 넓히고, 로그인 44px은 화면 예외로 유지한다. 같은 행의 Input·Select 높이도 맞춘다. |
| **확정** 너비·간격·모서리      | `w-full` 폼 버튼, 고정 너비 초기화/적용, 작은 행 액션이 공존한다.                                                                                                            | Button은 기본 너비를 내용에 맞추고, 너비·컨테이너 간격은 화면에서 정한다. 일반 버튼 모서리는 기본 `rounded-md`를 사용하고, 별도 UI의 모서리는 해당 컴포넌트에서 관리한다.                                                                                                                                                             |
| **확정** 주요 버튼 색          | 기본 Button은 파랑이지만 게시글·댓글 검색, 회원 수정, 문의 댓글은 검정 실색이다.                                                                                             | 주요 실행은 기존 `default` 파랑으로 통일한다. 이번 대상에 검정 강조 변형을 추가하지 않는다. 게시글·댓글 검색도 파랑으로 전환한다.                                                                                                                                                                                                     |
| **확정** 위험 행동 색          | 삭제 시작·삭제 확인·제재 적용·단순 초기화에 빨간색이 섞여 있다. 일부 삭제 확인은 현재 파랑이다.                                                                              | 최종 삭제·탈퇴 확인은 빨간 실색, 삭제 시작은 빨간 외곽선, 초기화는 중립 외곽선으로 정한다. 경고·강등 적용처럼 확인 모달을 여는 버튼은 빨간 외곽선, 최종 제재 확인은 빨간 실색으로 정한다.                                                                                                                                             |
| **확정** 선택·아이콘 버튼 범위 | 필터 선택, 정렬·탭·페이지네이션·날짜 선택은 각각 고유 동작이 있다.                                                                                                           | 게시판/상태 필터 선택 칩은 제외한다. 검색·초기화와 나머지 버튼은 기존 전용 컴포넌트의 동작을 유지하며 버튼 토큰과 포커스 표시를 맞춘다.                                                                                                                                                                                               |
| **확정** 비활성·진행 중 상태   | 미연결 회원 일괄 행동, 조회·저장 중 버튼, 확인 모달의 비활성 조건이 화면별로 다르다.                                                                                         | 공통 Button은 시각·포커스·`disabled` 표현을 제공하고, **언제 비활성화할지는 호출부**가 결정한다. 중복 제출 방지와 로딩 문구 유지 여부를 각 화면에서 확인한다.                                                                                                                                                                         |
| **확정** 아이콘 버튼 크기·이름 | 16~28px 아이콘 버튼과 24px 더보기 메뉴가 있어 누르기 어렵거나 이름이 빠질 수 있다.                                                                                           | 표·좁은 영역은 32px, 일반 화면은 36px 클릭 영역을 기준으로 한다. 그림은 약 16px로 유지한다. 아이콘만 있는 버튼에는 `aria-label` 또는 화면 판독용 문구로 구체적인 행동 이름(예: `기간 수정 메뉴 열기`, `회원 아이디 복사`)을 붙인다. 기존 24px 버튼은 클릭 영역을 32px로 넓히고 표 배치를 확인한다.                                    |
| **확정** 적용 강도             | 기존 `className`에 색·높이·radius가 많아 한 번에 제거하면 화면이 크게 바뀐다.                                                                                                | 공통 스타일을 먼저 만든 뒤 **공유 컴포넌트 → 목록 → 폼** 순서로 교체한다. 배치 클래스와 필요한 예외는 남기고 화면별 변경 전후를 확인한다.                                                                                                                                                                                             |

### 이번 범위에서 제외할 필터 버튼

게시글·댓글 관리의 [`PostFilterPanel`](../../src/domains/Posts/components/PostFilterPanel.tsx)·[`CommentFilterPanel`](../../src/domains/Comments/components/CommentFilterPanel.tsx)에 있는 **게시판/상태 선택 칩만** 현행 유지한다. 두 패널의 검색·초기화 버튼에는 공통 Button을 적용한다. [`ExamSearch`](../../src/domains/Reviews/components/ExamSearch.tsx)의 검색·조건 초기화 버튼은 기존 스타일·동작을 유지하되 후속 아이콘 통일에서 조건 초기화에 `RotateCcw`, 검색 실행에 `Search`를 추가하고 실행 문구를 `검색`으로 통일했다. 문의·신고 표의 필터 지우기 버튼은 기존 제외 범위를 유지한다. 추후 필터 UI를 드롭다운 방식으로 바꿀 때 선택 칩의 구성·상태·접근성을 함께 설계한다.

## 1. 확정 스타일 체계

| 용도        | 적용 API                                         | 모습·사용 규칙                                                                                    |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 주요 실행   | `variant='default'`                              | 파란 실색. 조회, 생성, 저장, 전송 등 화면의 주요 행동                                             |
| 보조·취소   | `variant='outline'`                              | 흰 바탕·중립 테두리. 초기화, 취소, 다운로드, 공개/비공개, 복구                                    |
| 낮은 강조   | 기존 `secondary`, `ghost`, `link`                | 연한 배경, 테두리 없는 행 액션·아이콘, 텍스트 링크. 실제 역할에 맞춰 사용                         |
| 파괴적 실행 | `variant='destructive'`                          | 빨간 실색. 삭제·회원 탈퇴와 최종 확인. 단순 상태 변경이나 초기화에는 사용하지 않음                |
| 파괴적 보조 | `variant='destructive-outline'` **구현 시 추가** | 흰 바탕·빨간 글자/테두리. 삭제 모달을 열거나 제재 적용처럼 주의를 주되 최종 파괴 확인은 아닌 행동 |

크기는 기존 `sm`(32px)·기본(36px)·`lg`(40px)·아이콘 크기를 먼저 사용한다. 반복되는 행 버튼에는 `xs`(28px)를 사용하고, 제재 이력 타임라인·경고/강등 추가·최종 확인 모달의 버튼은 기본(36px)을 사용한다. `xl`(48px)은 공용 컴포넌트에 남아 있지만 제재 모달에서는 사용하지 않는다. `w-full`, `min-w-*`, 정렬용 `gap`처럼 **배치에 필요한 클래스만 호출부에 남긴다.** 로그인 44px은 화면 예외로 유지한다. 아이콘 버튼은 표에서 32px, 일반 화면에서 36px 클릭 영역을 사용하고 기존 24px 메뉴는 32px로 넓힌 뒤 표 배치를 확인한다.

## 2. 페이지별 현황과 적용 표

표의 스타일은 작업 전 코드 기준의 대략적인 모습이다. 모달·목록 행처럼 페이지 파일 밖에 있는 버튼도 해당 화면에 포함했다. `P`=파란 주요 실행, `O`=외곽선, `D`=파괴적, `DO`=파괴적 보조, `G`=ghost/아이콘을 뜻한다. **게시글·댓글의 게시판/상태 선택 칩은 현황만 기록하고 적용 기준 대상에서는 제외한다.**

| 화면                                      | 현재 버튼과 스타일                                                                                                                                                                    | 적용 기준                                                                                                                                                            | 주요 수정 위치                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인 `/`                                | 로그인: 44px 흰 외곽선 전체 너비; 비밀번호 보기: 입력 안 아이콘                                                                                                                       | 로그인 **P**, 보기 버튼은 `InputGroup.Button` 유지                                                                                                                   | [`LogInPage`](../../src/pages/login/LogInPage.tsx)                                                                                                                                                                                                                                                                                                                         |
| 회원 정보 `/member/info`, `/:memberKey`   | 검색·초기화: 외곽선, 초기화는 큰 둥근 모서리; 일괄 행동: 알약 외곽선·비활성; 수정/완료·포인트 지급: 검정 실색과 외곽선; 복사·뒤로·메뉴: 작은 아이콘; 제재 이력 모달: 48px 검정/외곽선 | 검색·완료 **P**, 초기화·취소·일괄 행동 **O**, 지급/차감 확인 **P**, 탈퇴 **D**, 복사·뒤로·메뉴 **G**. 미연결 일괄 행동의 비활성 상태 유지                            | [`MemberDirectorySection`](../../src/domains/MemberInfo/components/MemberDirectorySection.tsx), [`MemberDetailSection`](../../src/domains/MemberInfo/components/MemberDetailSection.tsx), [`MemberDirectoryActionBar`](../../src/domains/MemberInfo/components/MemberDirectoryActionBar.tsx), [`penalty-history`](../../src/domains/MemberInfo/components/penalty-history) |
| 경고·강등 `/member/penalty`               | 검색·초기화: 외곽선; 경고/강등 적용: 빨간 실색; 최종 확인: 기본 파랑; 탭: 파란 밑줄                                                                                                   | 검색 **P**, 초기화 **O**, 제재 적용 **DO**, 최종 제재 확인 **D**. 탭은 탭 컴포넌트로 별도 유지                                                                       | [`MemberPenaltyManagementPage`](../../src/pages/member/MemberPenaltyManagementPage.tsx), [`WarnPenaltyTab`](../../src/domains/MemberInfo/components/WarnPenaltyTab.tsx), [`DemotionPenaltyTab`](../../src/domains/MemberInfo/components/DemotionPenaltyTab.tsx)                                                                                                            |
| 시험후기 `/reviews/exam`                  | 조회: 파란 기본; 조건 초기화·재시도: 외곽선; 상세 편집·저장: 파랑/연한 파랑; 삭제 시작: 빨간 외곽선; 파일명·파일 변경: 개별 외곽선                                                    | 상세 저장 **P**, 취소·재시도 **O**, 편집 전환 `secondary`, 삭제 시작 **DO**, 삭제 확인 **D**, 파일 변경·파일명 다운로드 **O**(36px). 검색·필터 섹션 내부 버튼은 제외 | [`ExamDetailSection`](../../src/domains/Reviews/components/ExamDetailSection.tsx), [`ExamReviewDetailInfoSection`](../../src/domains/Reviews/components/ExamReviewDetailInfoSection.tsx)                                                                                                                                                                                   |
| 시험후기 기간 `/reviews/exam-period`      | 생성·초기화: 작은 외곽선(초기화 글자만 빨강); 목록 더보기: 24px ghost; 수정·삭제 확인: 기본 파랑                                                                                      | 생성 **P**, 초기화 **O**, 더보기 **G**, 수정 확인 **P**, 삭제 확인 **D**                                                                                             | [`ExamReviewPeriodScheduleForm`](../../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx), [`ExamReviewPeriodListSection`](../../src/domains/Reviews/components/ExamReviewPeriodListSection.tsx), [삭제 확인 모달](../../src/domains/Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx)                                                              |
| 개별 포인트 `/point/single`               | 회원 검색: 작은 외곽선; 초기화: 빨간 글자 외곽선; 적용: 외곽선; 확인 모달: 파랑/외곽선                                                                                                | 검색·적용·확인 **P**, 초기화·취소 **O**                                                                                                                              | [`AdjustSinglePointPage`](../../src/pages/points/AdjustSinglePointPage.tsx), [`PointActionButtons`](../../src/domains/Points/components/PointActionButtons.tsx)                                                                                                                                                                                                            |
| 전체 포인트 `/point/all`                  | 초기화: 빨간 글자 외곽선; 적용: 외곽선; 확인 모달: 파랑/외곽선                                                                                                                        | 적용·확인 **P**, 초기화·취소 **O**                                                                                                                                   | [`AdjustAllMemberPointPage`](../../src/pages/points/AdjustAllMemberPointPage.tsx), [확인 모달](../../src/domains/Points/components/AllMemberPointAdjustmentConfirmModal.tsx)                                                                                                                                                                                               |
| 포인트 미지급 일정 `/point/freeze`        | 생성·초기화: 작은 외곽선; 목록 더보기: 24px ghost; 확인 모달의 삭제도 기본 파랑                                                                                                       | 생성·수정 확인 **P**, 초기화·취소 **O**, 더보기 **G**, 삭제 확인 **D**                                                                                               | [`PointFreezeScheduleForm`](../../src/domains/Points/components/PointFreezeScheduleForm.tsx), [`PointFreezeListSection`](../../src/domains/Points/components/PointFreezeListSection.tsx), [삭제 확인 모달](../../src/domains/Points/components/PointFreezeDeleteConfirmModal.tsx)                                                                                          |
| 엑셀 포인트 업로드 `/point/excel-upload`  | 템플릿 다운로드·재업로드: 외곽선; 업로드 실행: 파랑; 미처리 명단 저장: 호박색 외곽선; 태그 삭제: 작은 아이콘                                                                          | 업로드 **P**, 다운로드·재업로드 **O**, 미처리 명단 저장은 경고색 외곽선 예외 유지, 태그 삭제 **G**                                                                   | [`ExcelPointUploadPage`](../../src/pages/points/ExcelPointUploadPage.tsx)                                                                                                                                                                                                                                                                                                  |
| 게시글 관리 `/posts/manage`               | 필터: 검정 선택 칩; 초기화: 회색 외곽선 전체 너비; 검색: 검정 실색; 일괄 삭제: 빨강, 공개/복구: 외곽선; 상태 모달 확인: 파랑/빨강                                                     | 선택 칩 제외. 검색 **P**, 초기화·공개·복구 **O**, 삭제 및 삭제 확인 **D**, 그 외 확인 **P**                                                                          | [`PostFilterPanel`](../../src/domains/Posts/components/PostFilterPanel.tsx), [`BulkActionBar`](../../src/shared/components/BulkActionBar.tsx), [`StatusChangeModal`](../../src/shared/components/StatusChangeModal.tsx)                                                                                                                                                    |
| 댓글 관리 `/posts/comments`               | 게시글 관리와 같은 필터·검색·일괄 행동; 행 상태 배지는 클릭 가능한 기본 `<button>`                                                                                                    | 선택 칩 제외. 검색 **P**, 초기화·공개·복구 **O**, 삭제 **D**. 상태 배지 버튼은 배지 클릭 동작·이름을 별도 점검                                                       | [`CommentFilterPanel`](../../src/domains/Comments/components/CommentFilterPanel.tsx), [`CommentTableRow`](../../src/domains/Comments/components/CommentTableRow.tsx), [`BulkActionBar`](../../src/shared/components/BulkActionBar.tsx)                                                                                                                                     |
| 게시글 상세 `/posts/manage/:postId`       | 목록/이전: 파랑·외곽선 혼재; 관리 카드·댓글 행: 28~40px 흰 외곽선/빨간 삭제; 상태 모달: 파랑/빨강                                                                                     | 뒤로·목록 **O**, 공개·비공개·복구 **O**, 삭제 시작 **DO**·확인 **D**, 댓글 행 `xs`                                                                                   | [`PostDetailPage`](../../src/pages/posts/PostDetailPage.tsx), [`PostDetailManageCard`](../../src/domains/Posts/components/PostDetail/PostDetailManageCard.tsx), [`PostDetailCommentItem`](../../src/domains/Posts/components/PostDetail/PostDetailCommentItem.tsx)                                                                                                         |
| 문의·신고 `/report/inquiry`               | 댓글 등록·저장과 상태 변경 확인: 검정 실색; 취소·답글: 작은 외곽선/텍스트; 복사·닫기·필터 지우기: 16~28px 아이콘; 대상글 링크: 알약 외곽선                                            | 등록·저장·상태 확인 **P**, 편집 취소 **O**, 인라인 답글 취소 `link`, 답글 **O**, 아이콘 **G**. 대상글은 이동용 `<a>` 유지                                            | [`InquiryReportDetailPanel`](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx), [`InquiryCommentItem`](../../src/domains/InquiryReport/components/InquiryCommentItem.tsx), [`InquiryStatusSelect`](../../src/domains/InquiryReport/components/InquiryStatusSelect.tsx)                                                                              |
| 푸시 알림 `/operation/push-notification`  | 초기화: 빨간 글자 외곽선; 알림 전송: 외곽선; 확인 모달: 파랑/외곽선                                                                                                                   | 전송·최종 확인 **P**, 초기화·취소 **O**                                                                                                                              | [`PushNotificationPage`](../../src/pages/alerts/PushNotificationPage.tsx), [확인 모달](../../src/domains/Alerts/components/PushNotificationConfirmModal.tsx)                                                                                                                                                                                                               |
| 팝업 관리 `/operation/popup`              | 새 팝업·저장: 파랑; 행 수정·삭제: ghost(삭제 글자 빨강); 편집기 파일 선택·지우기: 개별 버튼; 확인 모달은 기본 파랑                                                                    | 등록·저장 **P**, 취소 **O**, 행 수정 **G**, 삭제 시작 **DO**·최종 확인 **D**, 파일 선택 **O**·지우기 **G**                                                           | [`PopupManagementPage`](../../src/pages/operation/PopupManagementPage.tsx), [`PopupManagementTable`](../../src/domains/Operation/components/PopupManagementTable.tsx), [`PopupEditorDialog`](../../src/domains/Operation/components/PopupEditorDialog.tsx)                                                                                                                 |
| 서버 점검 `/operation/server-maintenance` | 취소·초기화: 작은 외곽선; 등록/수정: 파랑; 행 삭제: ghost 아이콘; 확인 모달 삭제: 기본 파랑                                                                                           | 등록·수정 **P**, 취소·초기화 **O**, 행 삭제 **G**(빨간 강조), 최종 삭제 **D**                                                                                        | [`MaintenanceScheduleForm`](../../src/domains/Operation/components/MaintenanceScheduleForm.tsx), [`MaintenanceListSection`](../../src/domains/Operation/components/MaintenanceListSection.tsx), [`ConfirmModal`](../../src/shared/components/ui/confirm-modal.tsx)                                                                                                         |
| 404 `*`                                   | 이전 페이지로 이동: 큰 파란 버튼, 글자색 강제 지정                                                                                                                                    | **P**. 강제 글자색 제거 가능 여부 확인                                                                                                                               | [`NotFoundPage`](../../src/pages/errors/NotFoundPage.tsx)                                                                                                                                                                                                                                                                                                                  |

`PointMultiplePage`는 현재 라우트에 연결되지 않은 자리표시자이므로 교체 대상이 없다. 공통 [`DatePicker`](../../src/shared/components/DatePicker.tsx), [`PaginationBar`](../../src/shared/components/PaginationBar.tsx), `InputGroup.Button`, 사이드바의 버튼은 여러 화면에 간접 적용된다. 날짜·페이지 이동·입력 내부 버튼은 해당 컴포넌트의 동작을 보존하면서 별도로 확인한다.

## 3. 구현 원칙과 주의할 곳

1. [`button.tsx`](../../src/shared/components/ui/button.tsx)의 `buttonVariants`를 단일 출처로 사용한다. `destructive-outline`과 `xs`/`xl`을 추가하되 `neutral`은 추가하지 않고, 기존 변형 이름·`asChild`·기본 크기는 유지한다. `type='button'`과 `type='submit'`은 폼 맥락에 맞게 호출부에서 명시한다.
2. [`ConfirmModal`](../../src/shared/components/ui/confirm-modal.tsx)의 `confirmButtonClassName` 색상 주입은 삭제 확인에 `variant='destructive'`를 전달할 수 있는 API로 바꾼다. 시험후기 삭제 등 기존 빨간 클래스 호출부와 팝업·서버 점검의 파란 삭제 확인을 함께 점검한다.
3. 검색·초기화·생성·삭제 등 **행동의 의미**로 변형을 고른다. `className`에는 너비와 배치만 남기고 `bg-*`, `text-*`, `hover:*`, `h-*`, `rounded-*` 중 중복되는 부분을 걷는다. 기존 경고색 다운로드나 파일명 링크처럼 의미가 다른 예외는 근거를 적고 유지한다.
4. 작은 아이콘 버튼에는 접근 가능한 이름을 붙인다. `size='icon'`만으로 충분한 클릭 영역이 확보되는지, 비활성·로딩·포커스 표시가 기존과 같은지 확인한다.
5. [`index.css`](../../src/index.css)의 전역 `button` 초기화와 Tailwind 클래스 우선순위를 확인한다. `DropdownMenu.Trigger asChild`, `InputGroup.Button`, `Pagination.Link`처럼 `buttonVariants`를 간접 쓰는 컴포넌트도 변경 영향 범위에 넣는다.

## 4. 단계별 체크리스트

1~5단계는 완료 상태다.

### 1단계 — 공통 기준 확정 완료

- [x] 버튼 높이는 용도별 28/32/36/40/48px, 너비·간격은 화면, 일반 모서리는 `rounded-md` 기준으로 결정했다. 24px 아이콘 버튼은 32px로 넓히고 로그인 44px은 예외로 유지한다.
- [x] 주요 실행 버튼은 기존 `default` 파랑으로 통일하고 검정 `neutral` 변형은 추가하지 않기로 결정했다. 게시글·댓글의 게시판/상태 선택 칩은 제외한다.
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

- [x] 게시글/댓글 필터 패널의 선택 칩은 유지하고, 목록의 일괄 처리·행 동작을 전환한다. 필터 검색·초기화 버튼은 후속 요청에서 공통 Button으로 전환했다.
- [x] 회원 검색·일괄 행동과 문의·신고의 댓글 버튼을 전환한다. 시험후기 검색·필터 영역과 문의·신고의 필터 조작 버튼은 제외한다.
- [x] 게시글 상세·댓글 행·팝업/서버 점검 행의 작은 액션을 전환한다.

3단계 검증: `npm run lint`, `npm run build`, 회원 일괄 행동·게시글 댓글 목록·서버 점검 화면 테스트를 통과했다. 팝업 목록은 데스크톱·390px 화면에서 삭제 시작 버튼이 빨간 외곽선, 확인 버튼이 빨간 실색이며 좁은 화면에서는 표 내부 스크롤이 유지되는 것을 확인했다. 연결되지 않은 회원 일괄 행동은 선택 여부와 무관하게 비활성으로 표시한다.

### 4단계 — 폼·모달 화면

- [x] 포인트 개별/전체/미지급·엑셀 업로드의 적용·생성·초기화·확인 버튼을 전환한다.
- [x] 시험후기 상세/기간, 회원 수정·제재 이력, 경고·강등의 저장·취소·위험 동작을 전환한다.
- [x] 푸시 알림, 팝업 편집, 서버 점검 폼, 로그인·404를 전환한다.

4단계 검증: 폼·모달 관련 테스트와 `npm run lint`, `npm run build`를 통과했다. 브라우저에서 로그인 버튼의 파란 기본 변형·44px 예외 높이와 팝업 편집의 파일 선택 외곽선·저장 기본 변형을 확인했다. 시험후기 복구와 파일명 변경 버튼은 현재 화면에서 숨겨져 있어, 해당 기능을 기대하던 오래된 테스트를 현재 노출 상태에 맞게 수정했다. 미처리 명단 저장의 호박색 외곽선은 경고 성격의 예외로 유지한다.

### 5단계 — 회귀 확인 및 마무리

- [x] 검색·Enter 제출·폼 초기화·저장/삭제 확인·비활성/로딩을 화면별로 확인한다.
- [x] 변경한 버튼의 키보드 포커스, 아이콘 이름, 좁은 화면의 줄바꿈을 확인한다.
- [x] 활성 화면의 불필요한 버튼 색상/크기 덮어쓰기를 검색해 정리하고, 유지한 예외를 문서에 기록한다.
- [x] 관련 테스트와 `npm run lint`, `npm run build`를 통과시킨다.

5단계 검증: 경고·강등 관리 검색을 `form` 제출로 정리해 Enter와 클릭이 같은 경로를 사용하고, 검색 중 버튼을 비활성화했다. 제재 유형 선택의 강등 버튼은 `destructive-outline`으로 통일했다. 회원 이력 표의 복사·바로가기 아이콘은 32px 클릭 영역과 대상이 포함된 이름을 사용하며, 회원 정보 복사는 36px 클릭 영역을 사용한다. 정렬·검색 가능 선택 버튼에는 키보드 포커스 표시를 추가했다. 검색 Enter·비활성 테스트, 서버 점검 폼의 초기화·저장 및 삭제 모달 테스트, 푸시 전송·포인트 처리 등 기존 회귀 테스트를 확인했다. Chrome 390px·1440px에서 서버 점검 초기화, 32px 메뉴, 빨간 삭제 확인, Tab 포커스, 표 내부 가로 스크롤을 확인했고, 390px 경고·강등 검색 입력과 버튼은 한 행에서 36px 높이로 정렬된다.

유지한 예외: 로그인 제출의 44px 높이, 엑셀 업로드 미처리 명단 저장의 호박색 경고 외곽선, 회원 이력의 삭제 요청용 `ghost` 아이콘의 빨간 글자색을 유지한다. 게시글·댓글 필터의 게시판/상태 선택 칩, 시험후기 필터 조작, 문의·신고 필터 지우기는 제외 범위다. 숨겨진 시험후기 복구 버튼의 빨간 외곽선 클래스는 현재 렌더링되지 않는 코드에만 남아 있다.

후속 범위 조정: 게시글·댓글 필터 하단의 긴 검색 버튼은 `default`, 초기화 버튼은 `outline`으로 전환했다. 두 버튼의 전체 너비 배치와 클릭 동작은 유지하고 게시판/상태 선택 칩은 변경하지 않았다.

완료 기준은 **동일한 역할의 버튼이 같은 변형과 크기를 쓰고**, 삭제 확인이 빨간색으로 구분되며, 기존 클릭·제출·비활성 동작이 그대로 작동하는 것이다.

## 5. 버튼 아이콘 사용 현황과 통일안

> 2026-10-09 `App.tsx`에 연결된 화면과 공유 컴포넌트를 조사하고 아이콘 기준을 적용했다. 2026-10-10 편집·삭제 시작 버튼과 메뉴 항목을 아이콘+텍스트로 통일했다. 표의 현황은 **변경 전**을 기록하고, 적용 기준은 이번 변경에 사용한 규칙이다. 아직 기능이 연결되지 않은 버튼의 기준은 기능 연결 시 적용한다. 버튼 안의 행동 아이콘과 로딩 표시를 구분하고, 단순 장식 아이콘이 있는 제목·상태 배지는 버튼 목록에서 제외했다.

### 아이콘 표시 기준

| 형태              | 사용 기준                                                                                                                                                                                                                                               | 대표 사례                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **아이콘+텍스트** | 새 항목 생성·**편집 시작·삭제 시작**, **검색 도구 모음의 검색·조건 초기화**, 선택 항목의 **일괄 행동**, **이동 방향·새 창 열기**에 사용한다. 버튼과 메뉴 항목 모두 편집 시작은 `Pencil`, 삭제 시작은 `Trash2`로 통일하고 삭제의 파괴적 변형을 유지한다. | `Plus + 새 팝업 등록`, `Pencil + 수정/편집 모드`, `Trash2 + 삭제`, `Search + 검색`, `RotateCcw + 검색 조건 초기화`, `ArrowLeft + 목록으로`, `원본 게시글 + ExternalLink` |
| **텍스트만**      | 입력 초기화·저장·완료·취소·확인·적용·등록 등 **폼 실행 영역과 확인 모달의 최종 실행**에 사용한다. 문구가 `수정`·`삭제`여도 폼 제출이나 최종 확인이면 텍스트만 쓰고 삭제의 파괴적 변형을 유지한다.                                                       | 폼 `입력 초기화/생성/적용/전송`, 회원 정보 `취소/완료`, 삭제 확인 모달 `삭제`, 일정 수정 폼 `수정`, 댓글 `등록`                                                          |
| **아이콘만**      | 제목·값·입력·표 행 바로 옆의 **좁은 보조 행동**에 사용한다. 주변 맥락이 대상을 알려주더라도 버튼에는 행동과 대상이 드러나는 이름을 붙인다. 표·좁은 영역은 32px, 일반 화면은 36px 클릭 영역을 쓴다.                                                      | 회원 상세 제목 옆 뒤로가기, 값 복사, 행 더보기, 모달 닫기                                                                                                                |

검색어 **입력창 안의 돋보기**와 `Loader2` 같은 **진행 상태 표시**는 버튼의 아이콘+텍스트 분류에 넣지 않는다. 검색 버튼은 `Search + 검색`으로 표시하며, 입력과 버튼의 돋보기는 각각 입력 영역과 실행 행동을 나타낸다. 두 아이콘 모두 `aria-hidden='true'`로 둔다. 로딩 아이콘이 나타나도 행동을 알리는 텍스트와 기존 비활성 조건을 유지한다.

### 초기화 아이콘·문구 기준 — 적용 완료 (2026-10-10)

**초기화 범위는 문구로 설명하고, 아이콘 유무는 버튼 묶음의 역할로 결정한다.** 같은 묶음의 표시 방식을 맞추되 페이지 전체에 같은 아이콘 규칙을 강제하지 않는다. 모든 초기화에 아이콘을 넣었던 기준은 아래 기준으로 변경했다.

| 버튼 묶음                                | 아이콘·문구 기준                                                         | 적용 화면                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 검색 도구 모음                           | `Search + 검색`, `RotateCcw + 검색 조건 초기화`                          | 회원 목록, 게시글·댓글, 시험후기 검색                                                     |
| 폼 실행 영역                             | `입력 초기화`, `생성/적용/전송/저장` 모두 텍스트만                       | 경고·강등, 개별·전체 포인트, 푸시 전송, 서버 점검, 포인트 미지급 일정, 시험후기 작성 기간 |
| 특정 입력 옆 지우기                      | 맥락이 분명하면 `X` 아이콘만. 접근 가능한 이름에는 지우는 대상 포함      | 검색어 지우기                                                                             |
| 여러 영역 전체를 되돌리는 별도 도구 모음 | `전체 초기화`로 범위를 표현하고 같은 도구 모음의 아이콘 표시 방식에 맞춤 | 향후 해당 기능이 생길 때 적용                                                             |

- **검색 조건 초기화**는 검색어·필터·정렬 등의 검색 상태, **입력 초기화**는 해당 폼의 입력값, **전체 초기화**는 여러 영역 전체를 대상으로 한다. 실제 범위에 맞게 문구를 선택한다.
- 개별 포인트처럼 한 페이지 안에 검색과 입력 폼이 함께 있으면 상단 검색은 아이콘+텍스트, 하단 입력 초기화·적용은 텍스트만 사용한다.
- 검색 영역의 초기화 아이콘 4개는 유지하고 폼 실행 영역 8개의 초기화 아이콘은 제거했다. 초기화 문구와 관련 테스트도 새 기준에 맞췄다. 기존 중립 외곽선·높이·실행 동작·비활성 조건은 유지한다.
- 게시글·댓글의 검색·검색 조건 초기화 버튼은 긴 문구가 좁은 화면에서 넘치지 않도록 `sm` 미만에서는 세로로 배치하고, 넓은 화면에서는 기존 가로 배치를 유지한다.
- **복구 버튼은 `RotateCcw + 텍스트`를 유지한다.** 검색 조건 초기화와는 문구·위치로 구분하며, 확인 모달의 최종 실행은 텍스트만 사용한다.
- 아이콘은 `aria-hidden='true'`로 처리한다. 시험후기 필터의 선택·지우기 및 제외된 필터 칩은 기존 범위를 유지한다.

검증: 검색·조건 초기화, 일정 폼 초기화, 푸시 입력 초기화 등의 기존 테스트 5개 파일·71개 테스트를 통과했다.

### 검색 아이콘·문구 기준 — 적용 완료 (2026-10-10)

- **검색어를 입력하는 필드 안쪽 시작 위치에 `Search` 아이콘을 둔다.** 아이콘은 입력 내용이 아닌 장식이므로 `aria-hidden='true'`로 처리하고, 입력의 접근 가능한 이름은 기존 `Label`·`aria-label`로 유지한다.
- **검색 실행 버튼은 `Search + 검색`으로 통일한다.** 시험후기 `조회`와 회원 목록 `회원 검색` 문구도 `검색`으로 변경했다. 검색 입력 안의 돋보기는 유지하며, 비동기 검색 상태가 있는 버튼은 `Loader2 + 검색 중...`으로 표시하고 기존 비활성 조건을 유지한다. 목록 제목·설명·조회수 등의 `조회` 표현은 검색 실행 버튼 문구 통일 대상이 아니다.
- 게시글·댓글 관리처럼 한 줄에 게시자 검색과 게시글/댓글 검색 필드가 각각 있는 경우 **두 검색어 입력 필드 모두**에 돋보기를 둔다. 검색 범위 선택 드롭다운, 날짜·상태 필터, 읽기 전용 회원 정보 필드에는 붙이지 않는다. 시험후기 검색 필드의 끝쪽 지우기 버튼은 그대로 둔다.

| 화면·입력 위치                                                                                                                                                                       | 작업 전 상태                                                                         | 적용 기준                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 회원 목록 — [`MemberDirectorySection`](../../src/domains/MemberInfo/components/MemberDirectorySection.tsx)                                                                           | 입력 안과 `회원 검색` 버튼 양쪽에 `Search`가 있다.                                   | 입력·버튼 모두 `Search`를 사용한다. 버튼 문구는 `검색`, 로딩 상태는 `Loader2 + 검색 중...`으로 통일한다.                                              |
| 게시글·댓글 관리 — [`PostFilterPanel`](../../src/domains/Posts/components/PostFilterPanel.tsx), [`CommentFilterPanel`](../../src/domains/Comments/components/CommentFilterPanel.tsx) | 게시자·게시글/댓글 검색어 입력에는 아이콘이 없고 긴 검색 버튼은 텍스트만 있다.       | 각 검색어 입력의 시작 위치에 `Search`를 추가한다. 검색 범위 Select는 유지하고 하단 버튼은 `Search + 검색`, `RotateCcw + 검색 조건 초기화`로 표시한다. |
| 경고·강등 관리 — [`MemberPenaltyManagementPage`](../../src/pages/member/MemberPenaltyManagementPage.tsx)                                                                             | 회원 검색 입력에는 아이콘이 없고 버튼은 텍스트만 있다.                               | 입력·버튼에 `Search`를 표시한다. 버튼은 `검색`/`검색 중...`을 사용하고 Enter 제출·비활성 동작을 유지한다.                                             |
| 개별 포인트 조정 — [`AdjustSinglePointPage`](../../src/pages/points/AdjustSinglePointPage.tsx)                                                                                       | 회원 검색 입력에는 아이콘이 없고 버튼은 텍스트만 있다.                               | 입력·버튼에 `Search`를 표시한다. 버튼은 `검색`/`검색 중...`을 사용하고 검색·초기화 동작을 유지한다.                                                   |
| 시험후기 관리 — [`ExamSearch`](../../src/domains/Reviews/components/ExamSearch.tsx)                                                                                                  | 시험후기명/postId·작성자 검색 입력에는 시작 아이콘이 없고 끝쪽에 지우기 버튼이 있다. | 두 입력과 검색 버튼에 `Search`를 표시한다. 실행 문구는 `조회`에서 `검색`으로 통일하고 끝쪽 지우기 버튼의 위치·동작·접근 가능한 이름을 유지한다.       |
| 검색 가능한 선택 목록 — [`SearchableSelect`](../../src/domains/MemberInfo/components/SearchableSelect.tsx)                                                                           | 팝오버 안 검색 입력의 시작 위치에 이미 `Search`가 있다.                              | 현재 상태를 유지한다. 선택 트리거의 펼침 화살표와 옵션 체크 표시는 검색 아이콘 대상이 아니다.                                                         |

### 작업 전 아이콘과 텍스트를 함께 쓰던 버튼

| 화면·위치                                                                                                                                                                                                                                                          | 작업 전 버튼과 역할                                                                                                                                       | 적용 기준                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 회원 목록 — [`MemberDirectoryActionBar`](../../src/domains/MemberInfo/components/MemberDirectoryActionBar.tsx)                                                                                                                                                     | `BookOpen + 포인트 지급`, `ShieldAlert + 제재 부여`, `UserRoundX + 회원 탈퇴`, `Bell + 알림 전송`: 현재 모두 비활성인 일괄 행동 자리표시자.               | 실제 기능을 연결할 때 **일괄 행동 묶음의 아이콘+텍스트** 규칙을 적용한다. 기능 연결 전에는 현재 비활성 상태를 유지한다.                                                                             |
| 회원 상세 `/member/info/:memberKey` — [`MemberDetailSection`](../../src/domains/MemberInfo/components/MemberDetailSection.tsx)                                                                                                                                     | `Pencil + 수정`, `X + 취소`, `Check + 완료`: 회원 정보 편집 전환·취소·저장.                                                                               | **수정은 `Pencil + 텍스트`**, 취소·완료는 텍스트만 사용한다. 제목 옆 뒤로가기는 아이콘만 유지한다.                                                                                                  |
| 회원 상세 — [`MemberPointAdjustmentDialog`](../../src/domains/MemberInfo/components/MemberPointAdjustmentDialog.tsx)                                                                                                                                               | `Coins + 지급`: 포인트 조정 폼 실행.                                                                                                                      | **텍스트만** 남긴다. 포인트 개별·전체 적용, 다른 모달의 확인 버튼과 맞춘다.                                                                                                                         |
| 회원 상세 제재 이력 — [`PenaltyHistoryTimelineDialog`](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog.tsx), [`PenaltyHistoryAddDialog`](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog.tsx) | `Plus + 경고 추가/강등 추가`: 이력 모달에서 추가 폼 열기. 추가 폼의 제출 버튼에도 `Plus + 경고 추가/강등 추가`가 있다.                                    | 폼을 **여는** 두 버튼은 `Plus + 텍스트`를 유지한다. 폼 안의 제출 버튼은 **텍스트만** 남겨 확인 동작과 구별한다. 제출 중 `Loader2`는 유지한다.                                                       |
| 게시글 관리 `/posts/manage`·댓글 관리 `/posts/comments` — [`BulkActionBar`](../../src/shared/components/BulkActionBar.tsx)                                                                                                                                         | `Trash2 + 삭제`, `RotateCcw + 복구`, `EyeOff + 비공개`, `Eye + 공개`: 선택한 항목의 일괄 처리.                                                            | 같은 도구 모음 안에서 모두 **아이콘+텍스트**를 유지한다. 여러 행동을 빠르게 구분하는 데 도움이 되며, 삭제 확인 모달은 텍스트만 사용한다.                                                            |
| 게시글 상세 `/posts/manage/:postId` — [`PostDetailPage`](../../src/pages/posts/PostDetailPage.tsx)                                                                                                                                                                 | `ArrowLeft + 목록으로`: 상단 단독 이동 버튼. `원본 게시글 + ExternalLink`: 새 창 이동 링크를 Button 모양으로 표시.                                        | 둘 다 **아이콘+텍스트**를 유지한다. 이동 방향과 외부 이동을 나타낸다. 회원 상세의 뒤로가기는 제목 바로 옆의 작은 컨트롤이라 아이콘만 사용한다.                                                      |
| 시험후기 관리 `/reviews/exam` — [`ExamDetailSection`](../../src/domains/Reviews/components/ExamDetailSection.tsx)                                                                                                                                                  | `Pencil + 편집 모드`, `Trash2 + 삭제`: 상세 편집 진입·삭제 확인 열기. 저장 중에만 `Loader2 + 저장 중` 표시.                                               | 편집 시작은 **`Pencil + 편집 모드`**, 삭제 시작은 **`Trash2 + 삭제`**로 표시한다. `Loader2 + 저장 중`은 진행 상태 표시로 유지한다. 주석 처리된 복구 버튼은 현재 화면 대상에서 제외한다.             |
| 엑셀 포인트 업로드 `/point/excel-upload` — [`ExcelPointUploadPage`](../../src/pages/points/ExcelPointUploadPage.tsx)                                                                                                                                               | `Download + 미처리 명단 엑셀 저장`: 결과 파일 내려받기.                                                                                                   | **텍스트만** 남겼다. 파일 행동은 문구와 경고색 외곽선으로 이미 구분된다.                                                                                                                            |
| 문의·신고 `/report/inquiry` — [`InquiryReportDetailPanel`](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx), [`InquiryCommentItem`](../../src/domains/InquiryReport/components/InquiryCommentItem.tsx)                                     | `Send + 댓글 등록/대댓글 등록`: 댓글 폼 제출. `MessageSquare + 숫자`: 답글 작성 버튼과 답글 수 표시. 댓글 메뉴의 `Pencil + 수정`, `Trash2 + 삭제`도 있다. | 댓글 제출은 **텍스트만** 남겨 다른 등록·저장 버튼과 맞춘다. 답글 수 버튼은 아이콘+숫자와 대상이 포함된 `aria-label`을 유지한다. 메뉴의 수정·삭제는 같은 메뉴 안에서 둘 다 아이콘+텍스트를 유지한다. |
| 문의·신고 상세, 게시글 상세 — [`InquiryReportDetailPanel`](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx), [`PostDetailPage`](../../src/pages/posts/PostDetailPage.tsx)                                                                  | `ExternalLink + 대상글/원본 게시글`: 다른 게시글로 이동. 문의·신고의 매핑 없는 대상글 버튼은 비활성이다.                                                  | **아이콘+텍스트**를 유지한다. 외부·새 창 이동을 나타내며, 매핑 없는 버튼의 비활성 상태를 유지한다.                                                                                                  |
| 팝업 관리 `/operation/popup` — [`PopupManagementPage`](../../src/pages/operation/PopupManagementPage.tsx)                                                                                                                                                          | `Plus + 새 팝업 등록`: 편집기 열기.                                                                                                                       | **아이콘+텍스트**를 유지한다. 제재 이력의 추가 버튼과 같은 생성 진입 역할이다.                                                                                                                      |

[`NavUser`](../../src/shared/components/NavUser.tsx)의 외부 링크·로그아웃 메뉴, [`AppSidebar`](../../src/shared/components/AppSidebar.tsx)의 탐색 항목에도 아이콘과 텍스트가 함께 있다. 이들은 페이지 작업 버튼이 아닌 탐색 메뉴이므로 메뉴 안의 패턴을 유지한다. 정렬·선택 트리거의 화살표와 체크 표시도 현재 값·열림 상태를 알리는 전용 컨트롤로 취급한다.

### 편집·삭제 시작 버튼 — 적용 완료 (2026-10-10)

편집·삭제를 **시작하는 행동**에는 아이콘+텍스트를 쓰고, 편집한 내용을 **제출하거나 삭제를 최종 확인하는 행동**에는 텍스트만 쓴다. 같은 `수정`·`삭제` 문구라도 역할에 따라 구분한다. 아이콘은 `aria-hidden='true'`로 처리해 버튼·메뉴의 기존 이름을 유지한다.

| 화면·위치                                                     | 적용 결과                                       | 텍스트만 유지하는 최종 실행   |
| ------------------------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| 회원 상세 — `MemberDetailSection`                             | `Pencil + 수정`                                 | `취소`, `완료`                |
| 시험후기 상세 — `ExamDetailSection`                           | `Pencil + 편집 모드`, `Trash2 + 삭제`           | 저장·취소, 삭제 확인 모달     |
| 게시글 상세 — `PostDetailManageCard`, `PostDetailCommentItem` | `Trash2 + 게시글 삭제`, 댓글 `Trash2 + 삭제`    | 게시글·댓글 삭제 확인 모달    |
| 팝업 관리 — `PopupManagementTable`                            | `Pencil + 수정`, `Trash2 + 삭제`                | 등록·수정·삭제 확인 모달      |
| 서버 점검 — `MaintenanceListSection`                          | 메뉴 `Pencil + 수정`, `Trash2 + 삭제`           | 일정 수정 폼, 삭제 확인 모달  |
| 포인트 미지급 — `PointFreezeListSection`                      | 메뉴 `Pencil + 수정`, `Trash2 + 삭제`           | 일정 수정·삭제 확인 모달      |
| 시험후기 작성 기간 — `ExamReviewPeriodListSection`            | 메뉴 `Pencil + 수정`, `Trash2 + 삭제`           | 작성 기간 수정·삭제 확인 모달 |
| 문의 댓글 — `InquiryCommentItem`                              | 기존 메뉴 `Pencil + 수정`, `Trash2 + 삭제` 유지 | 댓글 편집 저장·취소           |

문의 댓글 메뉴의 삭제는 기존처럼 즉시 실행된다. 아이콘 통일로 확인 단계를 추가하거나 삭제 실행 방식을 바꾸지 않는다. 첨부 제거·제재 삭제 안내 같은 맥락이 분명한 보조 행동은 아래 아이콘 전용 기준을 유지한다.

편집·삭제 아이콘 적용 검증: `npm run lint`, `npm run build`를 통과했다. 시험후기 상세와 서버 점검의 기존 테스트 2개 파일·11개 테스트를 통과해 편집 시작, 삭제 확인, 버튼·메뉴의 접근 가능한 이름이 유지되는 것을 확인했다.

### 아이콘만 쓰는 버튼과 예외

| 화면·역할                  | 현재 예                                                                                                     | 권장 기준                                                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 회원 상세 제목 옆 뒤로가기 | [`MemberDetailSection`](../../src/domains/MemberInfo/components/MemberDetailSection.tsx)의 `ArrowLeft`      | **아이콘만 유지**. 제목 바로 옆의 작은 이동 컨트롤이다. 36px 클릭 영역과 `회원 목록으로 돌아가기` 이름을 유지한다.                                               |
| 복사·보조 정보·포인트 조정 | 회원 정보·포인트/시험후기 이력의 `Copy`, 제재 상태의 `History`, 포인트 조정의 `Coins`, 엑셀 업로드의 `Info` | **아이콘만 유지**. 주변 값이나 카드에 붙어 대상이 분명한 보조 행동이다. 표는 32px, 일반 화면은 36px 클릭 영역을 기준으로 하고, 접근 가능한 이름에 대상을 적는다. |
| 행 메뉴·닫기·첨부 제거     | 팝업·서버 점검·시험후기 기간의 더보기, 문의 댓글 메뉴, 상세 닫기, 팝업 첨부 이미지 삭제                     | **아이콘만 유지**. 표·좁은 영역은 32px 클릭 영역을 사용한다. `메뉴 열기`, `상세 닫기`, `첨부 이미지 삭제`처럼 행동과 대상을 이름에 포함한다.                     |
| 입력·날짜·페이지 이동      | 로그인 비밀번호 보기/숨기기, 날짜 선택기, 입력 내부 지우기, 페이지네이션의 이전/다음                        | 전용 상호작용을 유지한다. 비밀번호와 입력 지우기는 의미가 바뀌면 이름도 바꾸고, 날짜·페이지 이동은 현재 값과 화면 크기에 따른 텍스트 표시를 유지한다.            |

### 적용할 때의 순서

1. **같은 역할·같은 위치**를 먼저 맞춘다. 검색어 입력에는 돋보기를 넣고 검색 도구 모음은 `Search + 검색`, `RotateCcw + 검색 조건 초기화`로 표시한다. 폼 실행 영역의 입력 초기화·저장·취소·확인·제출은 텍스트만 쓴다. 게시글·댓글 관리의 긴 검색·초기화 버튼에도 같은 기준을 적용한다.
2. **생성 진입·편집 시작·삭제 시작·검색 도구 모음·일괄 행동·이동 링크**는 위 표에 적은 범위에서 아이콘+텍스트를 사용한다. 편집은 `Pencil`, 삭제는 `Trash2`로 통일하며, 문구보다 역할을 기준으로 판단한다. 같은 도구 모음에서는 아이콘 유무를 섞지 않고 같은 행동에는 같은 그림을 쓴다. 예를 들어 회원 일괄 행동의 포인트 지급 아이콘은 기능 연결 시 다른 포인트 화면의 `Coins`와 맞춘다. 확인 모달의 최종 실행은 텍스트만 쓴다.
3. **아이콘 전용 버튼**은 공간·맥락상 의미가 분명한 보조 행동으로 제한한다. `aria-label` 또는 화면 판독용 텍스트, 포커스 표시, 32/36px 클릭 영역을 확인한다. 회원 상세 뒤로가기를 임의로 텍스트 버튼으로 늘리지 않는다.
4. `Loader2` 같은 **진행 상태 아이콘은 별도 규칙**으로 둔다. 로딩 중에도 `저장 중`, `검색 중`처럼 행동을 알리는 텍스트를 남기고, 중복 제출을 막는 기존 `disabled` 조건을 보존한다.
5. 변경 전에 해당 화면의 버튼·메뉴·링크를 다시 확인하고, 같은 역할의 다른 화면과 비교한다. 변경 후에는 클릭/Enter, 비활성·로딩, 키보드 포커스, 좁은 화면의 줄바꿈을 검증한다.

아이콘 통일 적용: 회원 상세 취소·완료·포인트 지급, 제재 추가 폼 제출, 엑셀 미처리 명단 저장, 문의 댓글 등록 버튼에서 장식 아이콘을 제거했다. 게시글·댓글·경고·강등·개별 포인트·시험후기 검색어 입력에는 돋보기를 추가했다. 생성 진입·편집 시작·삭제 시작·일괄 행동·이동 링크와 제목 옆 뒤로가기·복사·더보기 같은 아이콘 전용 행동은 위 기준대로 유지했다. 게시글·댓글의 검색 입력은 390px에서 세로로 배치하고 넓은 화면에서는 기존 두 열을 유지한다.

검색 아이콘 적용 검증(2026-10-09): `npm run lint`, `npm run build`, `npm run test:run -- --maxWorkers=2`를 통과했다(59개 테스트 파일, 417개 테스트). Chrome에서 게시글·댓글·제재·개별 포인트·시험후기 검색 화면을 390px/1440px로 확인해 입력 내부 돋보기와 텍스트 검색 버튼을 검증했고, 게시글·댓글의 좁은 화면 검색 입력 배치도 재확인했다.

제재 모달 높이 보정(2026-10-10): 기존 공용화에서 유지했던 `xl`(48px)을 기본(36px)로 변경했다. 타임라인의 경고 추가·강등 추가, 추가 폼의 취소·추가, 최종 확인 모달의 취소·확인 총 6개 버튼에 적용했다. 생성 진입의 Plus와 제출 중 로딩 아이콘은 공용 버튼의 기본 16px 크기를 사용한다. 제재 삭제 안내 아이콘 버튼은 기존 32px를 유지한다.

### 버튼 높이 재점검 (2026-10-10)

`src`의 TSX에서 Button·InputGroup.Button·일반 button 호출부와 공용 컴포넌트의 높이 정의를 확인했다. 활성 화면의 호출부에 남은 높이 덮어쓰기와 기본값을 점검하고 다음 항목을 보정했다. 이번 점검은 코드 기준이며, 전체 화면의 실제 렌더링 높이를 브라우저에서 다시 측정한 것은 아니다.

| 화면·역할                                                          | 점검 결과                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 푸시 전송 확인 모달의 취소·즉시 발송                               | `lg` 40px → `default` 36px. 일반 확인 모달의 버튼과 맞춤.                                   |
| 엑셀 파일 선택 영역의 명단 업로드                                  | InputGroup.Button `xs` 24px 유지. 36px 입력 안에서 위아래 여백을 확보하는 텍스트 버튼 예외. |
| 개별·전체 포인트, 푸시 화면 하단의 실행·초기화 묶음                | 큰 CTA의 `lg` 40px 유지. 같은 행의 보조 버튼도 같은 높이를 사용.                            |
| 게시글 상세 관리 카드, 오류 화면의 주요 이동                       | 큰 CTA의 `lg` 40px 유지.                                                                    |
| 로그인 제출                                                        | 문서에 정한 화면 예외인 44px 유지.                                                          |
| 작은 목록·모달, 댓글 행, 아이콘 전용 행동                          | 각각 `sm` 32px, `xs` 28px, 맥락에 따라 32/36px 유지. 제재 모달의 일반 행동은 36px.          |
| 입력 내부 아이콘·날짜 선택·사이드바·선택 목록·탐색 메뉴            | 입력 내부 아이콘은 32px. 날짜 셀·선택 옵션·탐색 메뉴는 전용 컨트롤의 배치를 유지.           |
| 게시글·댓글의 게시판/상태 칩, 시험후기 필터, 문의·신고 필터 지우기 | 기존에 합의한 제외 범위 유지.                                                               |

입력 내부의 **텍스트 버튼**은 바깥 입력 높이와 내부 여백에 맞춰 크기를 정한다. 엑셀 명단 업로드처럼 36px 입력 안의 `InputGroup.Button`은 `xs` 24px을 사용할 수 있으며, 입력 내부 **아이콘 전용 버튼**의 32px 클릭 영역 기준을 동일하게 적용하지 않는다. 명단 업로드에 일시 적용했던 32px은 재검토 후 기존 24px로 되돌렸다.

이번 점검에서 확인한 적용 범위 안의 추가 높이 불일치는 푸시 전송 확인 모달의 2개 버튼이었다. 명단 업로드는 입력 내부 텍스트 버튼 예외로 분류한다. `xl` 48px 버튼 호출은 남아 있지 않다.

시험후기 첨부파일 표시 보정(2026-10-10): 파일명 다운로드 버튼의 `link` 스타일로 입력란 경계가 보이지 않던 부분을 `outline`으로 변경했다. 파일명 영역은 주변 Input과 같은 border-input 테두리·투명 배경·좌우 12px 여백·일반 굵기·반응형 글자 크기를 사용한다. 파일명 영역과 파일 변경 버튼은 기본 36px 높이를 사용하고, 긴 파일명은 말줄임과 전체 이름 툴팁으로 표시한다. 다운로드 가능한 파일명은 파란 `text-primary`와 hover 밑줄로 표시하고, 파일이 없으면 중립 글자색과 비활성 상태를 사용한다. 기존 다운로드·파일 선택 동작은 유지한다.

검색 실행 통일(2026-10-10): 게시글·댓글·회원 목록·경고/강등·개별 포인트·시험후기의 검색 실행 버튼 총 6개에 `Search`를 적용했다. 버튼 문구는 `검색`, 비동기 검색 중에는 `검색 중...`으로 통일했다. 검색 상태가 있는 회원 목록·경고/강등·개별 포인트 버튼은 진행 중 돋보기 대신 Loader2를 표시한다. 경고/강등·개별 포인트 버튼은 로딩 문구와 아이콘이 들어가도록 최소 너비를 확보했다. 기존 클릭·Enter·비활성 동작과 입력 내부 돋보기는 유지한다.

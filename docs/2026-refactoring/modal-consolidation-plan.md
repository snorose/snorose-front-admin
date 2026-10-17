# 모달 공통화 조사 및 수정 계획

> 조사 기준: 2026-10-17, `src` 전체 구현과 호출 참조. 코드 수정 없이 현황과 수정 방향만 정리한다.

**기존 `Dialog`를 기반으로 유지하고, 확인·취소형은 `ConfirmModal`로 모으는 방향을 권장한다.** 모든 모달을 하나의 거대한 컴포넌트로 합칠 필요는 없다. 폼·이력 조회는 `Dialog`를 사용하되 기본 스타일과 닫기 정책을 맞춘다.

## 1. 전체 현황

| 구현 방식 | 조사 결과 | 판단 |
| --- | --- | --- |
| 직접 만든 오버레이 모달 | 컴포넌트 2개 | 공통 기반으로 교체 우선 |
| 공통 `Dialog` 직접 조합 | 컴포넌트 17개 중 1개 미사용 | 확인형은 `ConfirmModal`로 전환, 폼·조회형은 유지 |
| 공통 `ConfirmModal` | JSX 선언 9곳, 8개 파일 | 이미 공통화됨. 처리 중 상태 등 보완 |
| 브라우저 `confirm` | 코드 3곳 중 2곳은 호출 참조 없음 | 실제 사용 1곳 교체, 나머지는 정리 검토 |
| 브라우저 `alert` | 코드 2곳 중 1곳은 훅 사용 참조 없음 | 오류 알림이므로 `toast.error`로 통일 권장 |

집계는 화면에 뜨는 횟수가 아닌 **구현 위치 기준**이다. 같은 모달의 여러 호출은 중복 집계하지 않는다. `ConfirmModal` 내부의 `Dialog`는 기반 구현이므로 별도 집계하지 않았다. 미사용 판단은 테스트를 제외한 현재 `src` 참조 기준이다.

## 2. 공통 기반을 쓰지 않는 모달

| 컴포넌트 | 사용 화면 / 호출부 | 현재 문제 | 수정 방향 |
| --- | --- | --- | --- |
| [StatusChangeModal](../../src/shared/components/StatusChangeModal.tsx) | 게시글 목록 `PostTable`, 댓글 목록 `CommentTable`, 게시글 상세 댓글 `PostDetailCommentItem` | `fixed` 오버레이·제목·버튼 직접 구현. 포커스 제한·복귀, Esc 닫기 구현 없음 | `ConfirmModal`로 교체. 사유 필수 검증, 삭제 버튼 색상, 호출부의 열기·닫기 상태 유지 |
| [PostDetailActionModal](../../src/domains/Posts/components/PostDetail/PostDetailActionModal.tsx) | 게시글 상세 `PostDetailManageCard` | 위와 같은 모달 골격 중복 | `ConfirmModal`로 교체. 현재 모든 작업의 사유 필수 입력과 삭제 시 댓글 동시 삭제 옵션 유지 |

두 컴포넌트의 입력 상태 소유자는 다르다. 우선 모달 골격만 통일하고, 사유 입력 부분까지 반복되면 작은 공통 본문으로 추출한다.

## 3. 이미 `Dialog`를 쓰는 모달 전체

`Dialog`를 사용하므로 공통 기반이 없는 것은 아니다. 아래는 그 위의 반복 구조를 정리하는 대상이다.

| 컴포넌트 | 용도 / 사용처 | 수정 방향 |
| --- | --- | --- |
| [PointAdjustmentConfirmModal](../../src/domains/Points/components/PointAdjustmentConfirmModal.tsx) | 개별 포인트 지급·차감 페이지의 최종 확인 | `ConfirmModal`로 전환. 회원·금액·메모 표시는 본문으로 유지 |
| [AllMemberPointAdjustmentConfirmModal](../../src/domains/Points/components/AllMemberPointAdjustmentConfirmModal.tsx) | 전체 회원 포인트 지급·차감 최종 확인 | `ConfirmModal`로 전환. 대상과 증감량 강조 유지 |
| [PointFreezeDeleteConfirmModal](../../src/domains/Points/components/PointFreezeDeleteConfirmModal.tsx) | 포인트 미지급 일정 삭제 | `ConfirmModal`로 전환. 삭제 변형과 `isPending` 연결 유지 |
| [ExamReviewPeriodDeleteConfirmModal](../../src/domains/Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx) | 시험후기 작성 기간 삭제 | `ConfirmModal`로 전환. 요청 중 상태와 중복 실행 방지 추가 |
| [PushNotificationConfirmModal](../../src/domains/Alerts/components/PushNotificationConfirmModal.tsx) | 푸시 알림 발송 확인 | 공통 처리 중 정책 보완 후 `ConfirmModal`로 전환. 발송 중 닫기 차단과 상태 문구 유지 |
| [PenaltyHistoryAddConfirmDialog](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddConfirmDialog.tsx) | 경고·강등 추가의 2차 확인 | `ConfirmModal`로 전환. 짧은 제목 + 강조된 확인 본문으로 구성하고, 처리 중 제어 연결 |
| [PointFreezeUpdateConfirmModal](../../src/domains/Points/components/PointFreezeUpdateConfirmModal.tsx) | 포인트 미지급 일정 수정 폼 | `Dialog` 유지. 일정 제목·시작·종료 입력 유지, 높이·스크롤·처리 중 닫기 정책 정리 |
| [ExamReviewPeriodUpdateConfirmModal](../../src/domains/Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx) | 시험후기 작성 기간 수정 폼 | 이름은 확인 모달이지만 실제 폼이므로 `Dialog` 유지. 요청 중 상태 추가, 위 일정 폼과 반복 부분만 추출 검토 |
| [ExamReviewFileNameModal](../../src/domains/Reviews/components/ExamReviewFileNameModal.tsx) | 시험후기 상세 파일명 수정 | `Dialog` 유지. 폼 제출, 오류 표시, 저장 중 닫기 차단, 명시적 포커스 복귀 유지 |
| [MemberPointAdjustmentDialog](../../src/domains/MemberInfo/components/MemberPointAdjustmentDialog.tsx) | 회원 상세 포인트 수정 폼 | `Dialog` 유지. `rounded-2xl`·큰 제목 등 기본 스타일 덮어쓰기 정리, 처리 중 닫기·초기화 정책 적용 |
| [PenaltyHistoryAddDialog](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog.tsx) | 회원 제재 이력 및 회원 메뉴에서 경고·강등 추가 | `Dialog` 유지. 별도 패딩·제목 스타일 정리, 긴 폼 스크롤 보장. 2차 확인과 부모 창의 닫기·입력 유지 정책 연결 |
| [MemberPointHistoryDialog](../../src/domains/MemberInfo/components/MemberPointHistoryDialog.tsx) | 회원 상세 포인트 이력 조회 | `Dialog` 유지. 이력 본문의 무한 스크롤·재시도 유지, 바깥 모서리·헤더 스타일만 통일 |
| [PenaltyHistoryTimelineDialog](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog.tsx) | 제재 이력 조회 | `Dialog` 유지. 본문 스크롤·더 불러오기·제재 추가 동작 유지, 바깥 스타일 통일 |
| [MemberInfoModal](../../src/shared/components/MemberInfoModal.tsx) | `MemberInfoPopover`의 회원 정보 조회 | `Dialog` 유지. 닫기·회원 상세 이동 동작 유지. 설명을 추가하거나 설명 연결을 의도적으로 생략 |
| [SanctionModal](../../src/shared/components/SanctionModal.tsx) | `MemberInfoPopover`의 제재 유형 선택 | `Dialog` 유지. 경고·강등 선택 후 입력창으로 전환하는 흐름 유지 |
| [PopupEditorDialog](../../src/domains/Operation/components/PopupEditorDialog.tsx) | 팝업 관리의 등록·수정 폼 | `Dialog` 유지. 넓은 편집·미리보기 영역 유지. 현재 전체 창 스크롤을 본문 스크롤로 정리 |
| [MemberPointAdjustmentConfirmDialog](../../src/domains/MemberInfo/components/MemberPointAdjustmentConfirmDialog.tsx) | 현재 미사용. 호출부와 import가 주석 처리됨 | 공통화 작업보다 삭제 여부 검토 우선. 확인 단계를 되살리기로 한 경우에만 `ConfirmModal` 적용 |

`MemberPenaltyHistoryDialog`는 별도 창 골격이 아니라 `PenaltyHistoryTimelineDialog`와 `PenaltyHistoryAddDialog`를 연결하는 컴포넌트다. 위 두 창을 수정하면 함께 적용된다.

## 4. 이미 `ConfirmModal`을 쓰는 곳 전체

| 파일 / 선언 수 | 용도 | 수정 방향 |
| --- | --- | --- |
| [ExamReviewDeleteModal](../../src/domains/Reviews/components/ExamReviewDeleteModal.tsx) · 1 | 시험후기 삭제 | 유지. 사유 검증·단축키 유지, 삭제 중 닫기 정책 연결 |
| [ExamReviewRestoreModal](../../src/domains/Reviews/components/ExamReviewRestoreModal.tsx) · 1 | 시험후기 복구 | 유지. 사유 검증·단축키 유지, 복구 중 닫기 정책 연결 |
| [ExamReviewUpdateConfirmModal](../../src/domains/Reviews/components/ExamReviewUpdateConfirmModal.tsx) · 1 | 시험후기 변경 전후 비교·저장 | 유지. 비교표용 넓은 폭 유지, 저장 요청 상태 연결 검토 |
| [InquiryStatusSelect](../../src/domains/InquiryReport/components/InquiryStatusSelect.tsx) · 1 | 문의 상태 변경 | 유지. 닫기는 콜백에서 차단하지만 확인 버튼에 `confirmDisabled` 미연결. 처리 중 상태를 함께 연결 |
| [WarnPenaltyTab](../../src/domains/MemberInfo/components/WarnPenaltyTab.tsx) · 1 | 제재 관리의 경고 적용 | 유지. 기존 확인 비활성화에 처리 중 닫기 제어 추가 |
| [DemotionPenaltyTab](../../src/domains/MemberInfo/components/DemotionPenaltyTab.tsx) · 1 | 제재 관리의 강등 적용 | 위와 동일 |
| [PopupManagementPage](../../src/pages/operation/PopupManagementPage.tsx) · 2 | 팝업 등록·수정 저장 확인 / 삭제 확인 | 유지. 편집창 위 확인창을 닫을 때 입력과 포커스 유지 확인 |
| [ServerMaintenancePage](../../src/pages/operation/ServerMaintenancePage.tsx) · 1 | 서버 점검 일정 삭제 | 유지. 현재 로컬 상태 변경이므로 불필요한 비동기 상태 추가 없음 |

## 5. 브라우저 기본 창 및 유사 UI

| 위치 | 현재 상태 | 수정 방향 |
| --- | --- | --- |
| [PostDetailInfoPanel](../../src/domains/Posts/components/PostDetail/PostDetailInfoPanel.tsx) | 공지 등록·해제를 `window.confirm`으로 확인 | `ConfirmModal`로 교체. 변경할 값을 상태로 보관하고 확인 후에만 요청 |
| [usePostTableState](../../src/domains/Posts/hooks/usePostTableState.ts)의 `handleSingleDelete` | `window.confirm` 존재. 반환 함수의 소비 참조 없음 | 미사용 함수 정리 검토. 실제 삭제 경로는 기존 사유 입력 모달 유지 |
| [useCommentVisibility](../../src/domains/Comments/components/useCommentVisibility.ts) | 일괄 공개·비공개에 `window.confirm` 사용. 훅 사용 참조 없음 | 미사용 훅 정리 검토. 유지한다면 호출 화면에서 `ConfirmModal` 제어 |
| [useUpdateCommentVisibility](../../src/domains/Comments/hooks/useUpdateCommentVisibility.ts) | 실제 사용하는 훅의 오류 `alert` | `toast.error`로 교체 권장. 확인 모달로 바꿀 대상은 아님 |
| [useDeleteComment](../../src/domains/Comments/hooks/useDeleteComment.ts) | 오류 `alert` 존재. 훅 사용 참조 없음 | 미사용 훅 정리 검토. 유지 시 `toast.error`로 교체 |
| [MemberInfoPopover](../../src/shared/components/MemberInfoPopover.tsx) | 직접 Portal·배경을 사용하는 회원 액션 메뉴 | 모달 집계에서 제외. 별도 작업에서 `DropdownMenu` 또는 `Popover` 적용 검토 |
| [ui/sidebar](../../src/shared/components/ui/sidebar.tsx)의 모바일 `Sheet` | 공통 `Sheet` 기반 사이드 내비게이션 | 유지. 중앙 모달과 용도가 달라 `ConfirmModal`로 합치지 않음 |

운영 메뉴의 ‘팝업’은 사용자 홈에 게시할 콘텐츠를 뜻한다. 관리자 화면의 모달은 `PopupEditorDialog`와 저장·삭제 확인창이며 위 표에 포함했다. 그 외 `Popover`·툴팁·선택 메뉴는 모달 공통화 대상에서 제외한다.

## 6. 공통 컴포넌트 보완과 작업 순서

| 순서 | 작업 | 기준 |
| --- | --- | --- |
| 1 | [ConfirmModal](../../src/shared/components/ui/confirm-modal.tsx) 보완 | 현재 `confirmDisabled`는 확인 버튼만 비활성화한다. 별도 `isPending`을 추가해 확인·취소·X·Esc·바깥 클릭을 함께 제어하고, `onOpenChange`는 닫힐 때만 `onClose` 호출. 입력 미완성과 요청 중 상태는 구분 |
| 2 | 직접 구현 2개와 실제 사용 `window.confirm` 1곳 교체 | 기존 문구·사유 필수 여부·댓글 동시 삭제·요청 데이터 유지. 행 클릭 이벤트 전파도 확인 |
| 3 | 확인형 `Dialog` 6개를 `ConfirmModal`로 전환 | 도메인 컴포넌트와 API 처리는 유지하고 헤더·버튼·닫기 골격만 공통화 |
| 4 | 폼·조회형의 기본 스타일·스크롤 정리 | [Dialog](../../src/shared/components/ui/dialog.tsx)의 모서리·제목·패딩을 기본값으로 사용. 좁은 선택창, 넓은 비교표·편집창 등 필요한 폭 차이는 유지. 긴 내용은 본문만 스크롤하도록 공통 패턴 적용 |
| 5 | 기존 `ConfirmModal`에 요청 상태 연결, 미사용 코드 정리 검토 | 요청 성공 시 닫기, 실패 시 입력 유지. 중첩 창은 자식만 닫히고 부모의 입력·포커스가 유지되도록 확인 |

`Dialog`는 기본 동작을 담당하고 `ConfirmModal`은 확인·취소 구성을 담당한다. API·사유·제재 종류별 분기는 도메인에 둔다. 폼·조회형까지 공통 래퍼를 새로 만드는 일은 위 정리 후 남는 반복을 보고 결정한다.

구현 시 확인할 항목: **Tab 포커스 제한·닫은 뒤 포커스 복귀, Esc·바깥 클릭 정책, 처리 중 중복 실행·닫기 방지, 작은 화면의 긴 본문 스크롤, 중첩 모달의 취소·실패 후 입력 유지.** 이번 조사는 정적 코드와 참조 확인 기준이며 실제 화면 동작 검증은 구현 단계에서 진행한다.

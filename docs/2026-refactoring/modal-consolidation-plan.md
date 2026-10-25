# 모달 공통화 조사 및 전환 계획

> 2026-10-25 소스 기준. 0~5단계를 완료했다. 범용 `Modal`과 `ConfirmModal` 기반을 적용하고 단순 조회·선택·확인 모달을 전환했다. 폼 모달 7개와 복잡한 조회 모달 4개를 Modal로 전환했다. 반복 본문 공통화와 최종 점검을 마쳤다. 아래 사용처는 테스트와 주석 처리된 호출을 제외한 소스 연결 기준이며, 화면 동작 검증은 전환 단계에서 진행한다.

## 목표와 범위

[`Modal`](../../src/shared/components/Modal.tsx)을 모달의 기본 틀로 사용한다. 제목·선택 설명·X 버튼·기본 여백·크기·본문 스크롤을 통일한다. 본문과 그 외 화면별 동작은 children으로 구성한다. 표준 확인·취소 버튼은 ConfirmModal이 제공한다. 확인·취소 형태는 기존 `ConfirmModal`을 `Modal` 기반으로 전환해 재사용한다.

API 요청, 입력 검증, 성공·실패 처리, 입력 초기화, 변경사항 폐기 확인은 도메인 컴포넌트에 유지한다. 전역 모달 저장소 도입과 전체 모달의 단일 크기 강제는 범위에 포함하지 않는다.

## 공통 기반의 현재 상태와 변경 계획

| 파일                                         | 현재 상태                                                                                                              | 변경 계획                                                       | 상태                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------ |
| `src/shared/components/ui/dialog.tsx`        | Radix 기반 shadcn Dialog. X 버튼 기본 제공, 헤더·제목·설명·하단을 호출부에서 조합                                      | 접근성·포털·포커스 등 기본 동작을 담당하는 하위 컴포넌트로 유지 | 유지                     |
| `src/shared/components/Modal.tsx`            | `title`, 선택 `subtitle`, `headerExtra`, `size`, `closeDisabled`, `contentProps` 제공. children 전달 및 공통 외곽 제공 | 기존 모달의 공통 외곽 틀로 적용                                 | 추가 완료 / 0~5단계 적용 |
| `src/shared/components/index.ts`             | `Modal`과 `ModalProps` export 제공                                                                                     | 화면은 `@/shared/components`에서 가져오기                       | 완료                     |
| `src/shared/components/ui/confirm-modal.tsx` | Modal을 감싸는 확인창. 확인·취소 버튼·로딩·비활성화·닫기 제한 제공                                                     | Modal을 감싸고 공통 확인·취소 버튼과 처리 상태 제공             | 완료                     |

`ConfirmModal`의 기존 경로와 props는 호환성을 유지한다. 내부에서는 `Modal`을 `@/shared/components/Modal`에서 직접 import해 공유·UI 배럴 간 순환 참조를 피한다. 이번 계획에서 파일 이동은 하지 않는다.

## 공통화 기준

| 항목         | 현재 차이                                             | 적용 기준                                                                                                                               |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 제목·설명    | 기본 크기와 `text-xl`·`text-2xl`, 별도 색상·간격 혼용 | `Modal` 기본 제목·설명 스타일 사용. 아이콘·강조는 `ReactNode`로 전달                                                                    |
| X 버튼 주변  | 일부 화면만 오른쪽 패딩을 확보                        | 공통 헤더에서 X 영역 확보. `subtitle`은 선택이며 없을 때 설명 참조 제거                                                                 |
| 너비         | `xs`·`sm`·`md`·`xl`·임의 픽셀 혼용                    | 기본 `md`, 작은 확인은 `sm`, 큰 폼은 `lg`, 넓은 조회는 `xl`. 필수 너비는 `className` 예외로 유지                                        |
| 여백·모서리  | `p-6`, 내부 `px-8 py-8`, `rounded-2xl` 등 반복        | 공통 여백과 기본 모서리 사용. 중복 패딩 제거                                                                                            |
| 긴 내용      | 전체 스크롤과 본문 스크롤 혼용                        | ConfirmModal 본문은 내부에서 스크롤. Modal을 직접 쓰는 화면은 children에서 필요한 스크롤을 구성                                         |
| 하단 버튼    | 화면마다 Footer·일반 div로 정렬                       | 표준 확인·취소는 `ConfirmModal`, 그 외 화면별 동작은 `Modal` children 안에서 구성. 기본 강조·취소·삭제 버튼 역할 유지                   |
| 처리 중 닫기 | 닫기 제한 유무·방법이 다름                            | 변경 요청 중 `closeDisabled` 적용. 커스텀 취소 버튼도 화면에서 비활성화해야 함                                                          |
| 처리 중 실행 | 로딩 문구·아이콘·비활성화가 제각각                    | `ConfirmModal`에 `isPending`·선택 처리 문구를 추가해 확인·취소 비활성화, 로딩 표시, 닫기 제한을 연결. 실행 함수의 중복 요청 방지도 유지 |
| 폼 제출      | 실제 form 제출과 onClick 제출 혼용                    | 기존 제출 의미 유지. 본문 form과 제출 버튼을 함께 구성                                                                                  |
| 미저장 변경  | 기간 편집에서 폐기 확인을 별도 구현                   | `onOpenChange`의 기존 닫기 요청 함수를 유지. `closeDisabled`로 폐기 확인을 대체하지 않음                                                |
| 포커스       | 파일명·기간 폼에서 복귀 대상을 직접 지정              | `contentProps.onCloseAutoFocus`와 `contentProps.ref`로 기존 동작 유지                                                                   |

## 직접 Dialog 또는 자체 오버레이를 사용하는 모달

파일 경로의 `shared/…`는 `src/shared/…`, 나머지 `도메인/components/…`는 `src/domains/도메인/components/…`를 의미한다. 단계 번호는 아래 실행 순서에 대응한다.

| 모달 파일                                                                  | 사용 화면·호출부                                                             | 현재 구조                                                                   | 변경 계획                                                                                                                                               | 단계 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `domains/MemberInfo/components/MemberInfoPopover.tsx`                      | 회원 팝오버 `MemberInfoPopover`                                              | Dialog, 제목만 표시, 회원 정보 그리드, 닫기·상세 이동                       | `Modal` + children. 설명 생략, 회원 정보·이동 로직 유지. 기존 `max-w-md`는 너비 예외 적용. 닫기·상세 이동 버튼은 children 안에 배치                     | 2    |
| `domains/MemberInfo/components/MemberInfoPopover.tsx`                      | `MemberInfoPopover`의 제재 선택                                              | 작은 Dialog, 경고·강등 선택 후 추가 모달 열기                               | 작은 `Modal`의 children에 선택 버튼 배치, 선택 → 닫기 → 추가 모달 흐름 유지                                                                             | 2    |
| `shared/components/StatusChangeModal.tsx`                                  | `PostTable`, `CommentTable`, `PostDetailManageCard`, `PostDetailCommentItem` | 직접 만든 fixed 오버레이, 제목·설명·사유·댓글 동시 삭제 옵션. Dialog/X 없음 | `ConfirmModal` 기반으로 전환. 사유·옵션은 본문에 유지. `isPending` 연결, 새 X·ESC·바깥 클릭 및 포커스 동작 검증                                         | 2    |
| `Points/components/PointAdjustmentConfirmModal.tsx`                        | `AdjustSinglePointPage`                                                      | Dialog에 회원·포인트·메모 요약, 취소·확인 직접 구현                         | `ConfirmModal`로 전환. 요약은 children 유지, 요청 중 상태를 페이지에서 전달                                                                             | 2    |
| `Points/components/AllMemberPointAdjustmentConfirmModal.tsx`               | `AdjustAllMemberPointPage`                                                   | Dialog에 전체 지급 요약, 취소·확인 직접 구현                                | `ConfirmModal`로 전환. 지급 대상·수량·메모 보존, 요청 중 상태 전달                                                                                      | 2    |
| `Alerts/components/PushNotificationConfirmModal.tsx`                       | `PushNotificationPage`                                                       | Dialog, 전송 요약, 가로 2열 버튼. 발송 중 X 숨김·닫기 제한                  | `ConfirmModal`로 전환. 기존 발송 중 제한 유지, 버튼은 공통 버튼 정렬로 통일                                                                             | 2    |
| `Points/components/PointFreezeDeleteConfirmModal.tsx`                      | `PointFreezePage` → `PointFreezeListSection`                                 | 작은 Dialog, 일정 요약, 삭제 요청의 `isPending`은 확인 버튼에만 적용        | `ConfirmModal size='sm'`로 전환. 요약 유지, 처리 중 닫기·취소도 제한                                                                                    | 2    |
| `Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx`                | `ExamReviewPeriodPage` → `ExamReviewPeriodListSection`                       | 작은 Dialog, 기간 요약, 별도 요청 중 상태 없음                              | `ConfirmModal size='sm'`로 전환. 요청 중 상태·중복 실행 방지 추가, 성공 콜백 유지                                                                       | 2    |
| `MemberInfo/components/penalty-history/PenaltyHistoryAddConfirmDialog.tsx` | `PenaltyHistoryAddDialog`                                                    | 큰 여백·강조 제목, 취소·확인. 처리 중에도 Dialog 닫기 가능                  | `ReactNode` 제목을 지원하는 `ConfirmModal`로 전환. 강조 문구 유지, `isSubmitting` 연결                                                                  | 2    |
| `Points/components/PointFreezeUpdateConfirmModal.tsx`                      | `PointFreezePage` → `PointFreezeListSection`                                 | 이름은 Confirm이지만 제목·시작·종료를 입력하는 수정 폼. 작은 Dialog         | 폼과 제출 버튼을 `Modal` children 안에 배치. `isPending` 연결, 날짜 상태·검증·저장 로직 유지                                                            | 3    |
| `Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx`                | `ExamReviewPeriodPage` → `ExamReviewPeriodListSection`                       | 기간 제목·시작·종료 입력 Dialog, 별도 요청 중 상태 없음                     | 자유형 `Modal size='sm'`로 전환. 요청 중 상태 추가, 성공·새로고침 흐름 유지                                                                             | 3    |
| `MemberInfo/components/MemberPointAdjustmentDialog.tsx`                    | 회원 상세 `MemberDetailSection`                                              | `rounded-2xl`, 큰 제목·설명, 포인트 폼, 자체 초기화                         | `Modal` + children. 기존 약 36rem 너비 예외 유지, `isSubmitting`으로 닫기 제한, 직접 지급 흐름 유지                                                     | 3    |
| `MemberInfo/components/penalty-history/PenaltyHistoryAddDialog.tsx`        | `SanctionModal`, `MemberPenaltyHistoryDialog`                                | 큰 제목·여백, content ref로 포커스 처리, 추가 확인 모달 중첩                | `Modal`로 전환하고 중복 패딩 제거. `contentProps.ref` 전달, 제재 제한·검증·확인 후 제출 유지                                                            | 3    |
| `Reviews/components/ExamReviewFileNameModal.tsx`                           | 시험후기 상세 `ExamDetailSection`                                            | 실제 form 제출, 저장 중 닫기 차단, 닫힌 뒤 트리거로 포커스 복귀             | `Modal` children 안에 form과 제출 버튼 구성. `closeDisabled`, `contentProps.onCloseAutoFocus` 연결. 확장자·검증·Enter 제출 유지                         | 3    |
| `Reviews/components/ExamReviewAdminStatusPeriodFormModal.tsx`              | `ExamReviewAdminStatusPeriodList`                                            | Dialog 전체 스크롤, 저장 중 닫기 차단, 미저장 폐기 확인 중첩                | `Modal size='lg'`로 전환. 공통 본문 내부 스크롤, 기존 `requestClose`·`onAfterClose`·폐기 확인 유지                                                      | 3    |
| `Operation/components/PopupEditorDialog.tsx`                               | `PopupManagementPage`                                                        | 약 760px Dialog 전체 스크롤, 입력·이미지·미리보기·저장 버튼                 | `Modal` + children. 760px 너비 예외 유지, 본문만 스크롤. 저장 확인으로 이어지는 흐름 유지                                                               | 3    |
| `MemberInfo/components/MemberPointHistoryDialog.tsx`                       | 회원 상세 `MemberDetailSection`                                              | 헤더 구분선·도움말, 본문 스크롤 기반 무한 조회                              | `Modal` + children. 도움말은 `headerExtra`, 필요 구분선은 본문 경계에 유지. scroll handler·오류·재조회·더 보기 유지                                     | 4    |
| `MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog.tsx`   | `MemberPenaltySummaryCard` → `MemberPenaltyHistoryDialog`                    | 헤더·추가 버튼·건수 고정, 타임라인만 스크롤                                 | `Modal`로 전환. 상단 액션·건수는 고정 영역, 타임라인은 스크롤 본문으로 구성. 고정 영역·본문 속성 전달 API는 전환 시 조정. 기존 무한 조회·제재 제한 유지 | 4    |
| `Reviews/components/ExamReviewAdminStatusDialog.tsx`                       | `ExamReviewPage`                                                             | 960px 상한, 컨테이너 쿼리, 지정 높이, 본문 스크롤                           | `Modal size='xl'` + children. 960px·반응형 높이·`@container`는 예외 유지. 차트·탭·기간 편집 이동 유지                                                   | 4    |
| `Reviews/components/ExamReviewAdminStatusPeriodDialog.tsx`                 | `ExamReviewPage`                                                             | 큰 Dialog 전체 스크롤, 헤더 내 현황 보기, 기간 목록·폐기 확인               | `Modal`로 전환. 48rem 너비 예외 유지, 현황 보기는 `headerExtra`, 목록은 children. 미저장 변경 확인 유지                                                 | 4    |

`MemberPenaltyHistoryDialog`는 직접 Dialog를 렌더링하지 않는 조정 컴포넌트다. 타임라인·제재 추가 모달에 대한 상태와 데이터 전달은 유지한다.

## 기존 ConfirmModal 사용처와 간접 적용 계획

아래 모달들은 공통 `ConfirmModal`의 내부 교체로 외곽 틀이 함께 변경된다. 요청 중 상태 연결 등 필요한 호출부만 수정한다.

| 사용 파일                                                     | 화면·기능                           | 현재 상태                                             | 변경 계획                                                                    | 단계 |
| ------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | ---- |
| `Reviews/components/ExamReviewDeleteModal.tsx`                | 시험후기 상세 삭제                  | 사유·기존 메모, 삭제 중 확인 비활성화                 | `isDeleting`을 공통 처리 중 상태에 연결. 포인트 차감 안내·단축키 유지        | 1    |
| `Reviews/components/ExamReviewRestoreModal.tsx`               | 시험후기 상세 복구                  | 사유·기존 메모, 복구 중 확인 비활성화                 | `isRestoring` 연결. 포인트 복구 안내·단축키 유지                             | 1    |
| `Reviews/components/ExamReviewUpdateConfirmModal.tsx`         | 시험후기 상세 저장 확인             | `max-w-3xl`, 수정 전후 비교표                         | 너비 예외·비교표 유지. 상세 저장 요청 중 상태를 호출부에서 전달              | 1    |
| `Reviews/components/ExamReviewAdminStatusPeriodList.tsx`      | 현황 집계 기간 삭제                 | 기간 요약, `isSubmitting`으로 확인 비활성화           | 처리 중 상태에 연결해 취소·닫기도 제한                                       | 1    |
| `Reviews/components/ExamReviewAdminStatusPeriodFormModal.tsx` | 기간 폼 미저장 변경 폐기            | 중첩 ConfirmModal                                     | 공통 틀만 간접 적용. 버리기·계속 편집과 포커스 복귀 유지                     | 1    |
| `Reviews/components/ExamReviewAdminStatusPeriodDialog.tsx`    | 기간 편집 종료 전 변경 폐기         | 중첩 ConfirmModal                                     | 공통 틀만 간접 적용. 현황 복귀와 편집 유지 분기 보존                         | 1    |
| `MemberInfo/components/WarnPenaltyTab.tsx`                    | 경고 관리 탭 적용 확인              | 회원명·경고 수 표시, 처리 중 확인 비활성화            | `isSubmitting` 연결, 기존 경고 증가 안내 유지                                | 1    |
| `MemberInfo/components/DemotionPenaltyTab.tsx`                | 강등 관리 탭 적용 확인              | 기간·종료일 표시, 처리 중 확인 비활성화               | `isSubmitting` 연결, 기간 계산·확정 문구 유지                                | 1    |
| `InquiryReport/components/InquiryStatusSelect.tsx`            | 문의·신고 상태 변경                 | 처리 중 onClose 방어, 확인 버튼의 처리 중 상태 미연결 | `isStatusUpdating` 연결, 상태 변경 함수의 중복 요청 방지도 점검              | 1    |
| `src/pages/operation/PopupManagementPage.tsx`                 | 팝업 등록·수정 확인 / 삭제 확인 2곳 | 제목·설명·버튼만 전달                                 | 공통 틀 간접 적용. 현재 로컬 상태의 동기 저장·삭제이므로 로딩 상태 추가 없음 | 1    |
| `src/pages/operation/ServerMaintenancePage.tsx`               | 서버 점검 일정 삭제                 | 로컬 상태에서 즉시 삭제                               | 공통 틀만 간접 적용. 동기 동작에 불필요한 로딩 상태 추가하지 않음            | 1    |

## 현재 사용하지 않는 모달

| 파일                                                           | 조사 결과                                                      | 처리 계획                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MemberInfo/components/MemberPointAdjustmentConfirmDialog.tsx` | 유일한 호출이 `MemberPointAdjustmentDialog` 안에서 주석 처리됨 | 활성 전환 대상에서 제외. 확인 단계를 다시 도입할 때 `ConfirmModal`로 전환. 이번 작업에서 재활성화하거나 삭제하지 않음 |

## 반복 본문 공통화 결과

| 후보               | 결정·소유 위치                                     | 적용 범위                                                   | 호출부가 유지하는 책임                                               |
| ------------------ | -------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| 라벨·값 요약 목록  | shared/components/DetailList.tsx 추가              | 개별·전체 포인트, 푸시, 미지급 일정 삭제·작성 기간 삭제 5곳 | 회원·카테고리 구성, 포인트 색상, 날짜 포맷                           |
| 기간 입력 영역     | shared/components/PeriodFields.tsx 추가            | 미지급 일정 수정·작성 기간 수정 2곳                         | 값·초기화·검증·저장·요청 데이터 변환                                 |
| 메모·처리 사유     | Reviews/components/ExamReviewReasonFields.tsx 추가 | 시험후기 삭제·복구 2곳                                      | 경고 문구·포인트 안내·API 요청·처리 중 상태                          |
| 변경사항 폐기 확인 | 기존 ConfirmModal 호출 유지                        | 기간 폼·기간 편집 2곳                                       | 짧은 문구 설정 외에 공유할 본문이 없어 별도 컴포넌트는 추가하지 않음 |

DetailList는 dl·dt·dd로 항목과 값을 연결하고 줄바꿈을 처리한다. PeriodFields는 고유 레이블 ID와 시작·종료 입력 배치만 맡는다. ExamReviewReasonFields는 Reviews 안에 두며 기존 메모·사유·도움말 연결과 Ctrl/Cmd+Enter 단축키를 공유한다.

## 실행 순서와 완료 조건

| 단계 | 작업                                                         | 완료 조건                                                                 |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 0    | 범용 Modal 및 export 추가                                    | 완료. 설명 연결·닫기 제한 테스트가 있고 기존 모달은 미전환                |
| 1    | ConfirmModal을 Modal 기반으로 전환하고 기존 사용처 상태 연결 | 기존 import/props 호환, 확인·취소·처리 중 상태와 설명 없는 경우 검증      |
| 2    | 단순 조회·선택·확인 및 StatusChangeModal 전환                | 모든 진입 화면의 문구·행동 유지. 자체 오버레이 제거 및 포커스·키보드 검증 |
| 3    | 폼 모달 전환                                                 | Enter 제출·검증·저장 후 초기화·중첩 확인·포커스 복귀 유지                 |
| 4    | 조회·타임라인·넓은 모달 전환                                 | 작은 화면/긴 내용에서도 본문만 스크롤, 무한 조회·탭·차트 유지             |
| 5    | 반복 본문 추출 및 최종 점검                                  | 확인된 중복만 추출, 필요한 너비·높이 예외를 문서에 기록                   |

- [x] 범용 `Modal` 추가
- [x] 소스 사용처 조사 및 전환 계획 작성
- [x] ConfirmModal 기반 교체와 기존 사용처 처리 중 상태 연결
- [x] 2단계 단순 조회·선택·확인 모달과 자체 오버레이 전환
- [x] 3단계 폼 모달 7개 전환
- [x] 4단계 복잡한 조회 모달 4개 전환
- [x] 폼·중첩 모달·조회 모달의 관련 자동 테스트 및 대표 브라우저 흐름 검증
- [x] 반복 본문 추출 및 최종 소스 점검

## 검증 계획

| 검증 항목   | 확인할 동작                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| 접근성·닫기 | 제목·설명 연결, 설명 생략, X·ESC·바깥 클릭, 처리 중 닫기 제한, Tab 포커스 이동·복귀                         |
| 중첩 모달   | 최상위 모달만 닫힘, 폐기 취소 시 입력 유지, 최종 확인 취소 시 부모 폼 유지, 외부 클릭·ESC 제한의 상호작용   |
| 폼          | Enter 제출·IME 입력·단축키, 유효성 오류, 중복 요청 방지, 성공 시 닫기·초기화, 실패 시 입력 유지             |
| 크기·스크롤 | 모바일 390px·데스크톱 1440px 및 낮은 화면에서 긴 제목·메모·URL·이력 확인. 헤더·하단 잘림과 이중 스크롤 점검 |
| 목록 조회   | 무한 스크롤·더 보기·로딩·빈 상태·오류·재시도 및 조회 건수 유지                                              |
| 자동 검사   | 변경 모달과 관련 도메인 테스트, ESLint, `npm run build`. 공통 동작 변경은 회귀 테스트로 확인                |

이 문서는 소스 조사에 기반한 작업 계획이다. 기존 화면 전체를 브라우저에서 확인했거나 모달 전환을 완료했다는 의미는 아니다.

## 1단계 적용 결과

위 조사 표의 현재 구조는 전환 전 상태를 설명한다. 1단계의 실제 적용 결과는 다음과 같다.

| 적용 대상                                     | 변경 결과                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ConfirmModal                                  | 기존 Modal 위에 확인·취소 영역을 구성하고 처리 상태를 제공. 기존 경로·props 유지, ReactNode 제목·설명과 size·isPending·pendingText 추가 |
| 요청 중 공통 동작                             | 확인·취소 비활성화, 로딩 아이콘·문구, X 숨김 및 ESC·바깥 클릭 닫기 차단                                                                 |
| 시험후기 삭제·복구, 기간 삭제, 경고·강등 적용 | 기존 비동기 상태를 isPending에 연결                                                                                                     |
| 문의·신고 상태 변경                           | isStatusUpdating 연결 및 처리 함수의 재진입 방어 추가                                                                                   |
| 시험후기 수정 확인                            | isSaving 전달. 요청 전에 확인창을 닫던 흐름을 성공 후 닫기로 변경. 실패 시 확인창과 변경 내용 유지                                      |
| 팝업 등록·수정·삭제, 서버 점검 삭제           | 현재 동기 처리이므로 공통 외곽만 간접 적용                                                                                              |
| 미저장 변경 폐기                              | 기존 dirty 판정·닫기 분기 유지, 공통 외곽만 간접 적용                                                                                   |

자동 검사와 실제 브라우저 검증은 구분한다. 관련 컴포넌트 테스트, ESLint 및 빌드로 검증하며 화면별 시각·중첩 포커스 동작 확인은 후속 전환 단계의 검증 항목으로 남긴다.

## 2단계 적용 결과

직접 Dialog를 사용하는 모달 표의 **2단계 대상 9개**를 전환했다. 표의 현재 구조는 조사 당시 상태이며, 아래 내용이 적용 후 상태다.

| 대상                    | 적용 결과                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MemberInfoModal         | Modal children에 회원 정보와 화면 전용 버튼 배치. 기존 너비·회원 정보·상세 페이지 이동 유지, 긴 값 줄바꿈 적용                                                |
| SanctionModal           | 작은 Modal + children으로 전환. 경고·강등 선택 후 추가 폼을 여는 흐름 유지                                                                                    |
| StatusChangeModal       | 자체 fixed 오버레이를 ConfirmModal로 전환. 사유·댓글 동시 삭제 옵션·문구 유지. 부모 클릭 전파 방지, 처리 중 사유 입력도 비활성화                              |
| 개별·전체 포인트 확인   | ConfirmModal로 전환. 페이지에 isSubmitting과 재진입 방어 추가, 요청 중 상태 연결. 기존 성공·실패 후 확인창을 닫는 흐름 유지                                   |
| 푸시 전송 확인          | ConfirmModal로 전환. 발송 중 닫기 제한 유지, 공통 확인·취소 버튼 배치 적용. 긴 내용·URL 줄바꿈 보완                                                           |
| 포인트 미지급 일정 삭제 | 작은 ConfirmModal로 전환, 기존 mutation의 isPending 연결                                                                                                      |
| 시험후기 작성 기간 삭제 | 작은 ConfirmModal로 전환, isPending·중복 실행 방어 추가. 실패 후 재시도 및 성공 시 닫기·목록 갱신 유지                                                        |
| 경고·강등 최종 확인     | ConfirmModal로 전환. 강조 제목·기존 너비 유지, isSubmitting으로 취소·닫기·재실행 제한                                                                         |
| 게시글·댓글 호출부      | 목록 복구·공개/비공개·댓글 삭제 및 상세 댓글 처리의 기존 요청 상태를 StatusChangeModal에 전달                                                                 |
| 공통 Modal 포커스       | Dialog.Trigger 없이 상태로 여는 모달에서 열기 직전 요소를 기억하고 닫을 때 복귀. contentProps.onCloseAutoFocus에서 preventDefault한 경우 호출부의 처리를 우선 |

### 2단계 검증

| 범위           | 결과                                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 자동 테스트    | 관련 12개 파일 112개 테스트 통과. 공통 모달, 상태 변경, 포인트 페이지, 푸시 페이지, 제재 이력, 댓글 상세, 미지급 일정, 기간 삭제, 파일명 변경, 관리자 현황 포함                    |
| 추가 회귀 검증 | 포인트 요청 중 재실행·닫기 차단, 상태 변경 이벤트 전파·X/ESC, 기간 삭제 실패 후 재시도, Trigger 없는 모달의 포커스 복귀 확인                                                       |
| 정적 검사      | 전체 ESLint·프로덕션 빌드 통과. 빌드에는 번들 크기 경고가 남아 있음                                                                                                                |
| 브라우저       | 로컬 전체 포인트 확인 모달을 1440×900·390×700에서 긴 메모로 확인. 가로 넘침 없음, 모달·확인 버튼 화면 안 배치, ESC 닫기·적용 버튼 포커스 복귀 확인. 실제 지급 요청은 실행하지 않음 |
| 후속 검증      | 전체 화면별 시각 검증과 제재 선택→추가→최종 확인의 브라우저 포커스 흐름은 후속 폼 전환 단계에서 확인                                                                               |

5단계 반복 본문 공통화와 최종 점검을 완료했다. 현재 사용하지 않는 MemberPointAdjustmentConfirmDialog는 계획대로 유지했다.

## 공통 구조 확정: Modal과 ConfirmModal 유지

확인창을 모두 Modal 직접 호출로 바꾸는 중간 변경은 정리했다. 이전 1·2단계 적용분과 기존 확인창 사용처는 아래 기준을 따른다. 3단계 폼 모달과 4단계 복잡한 조회 모달 전환을 완료했다.

| 구분         | 역할                                                     | 사용 방법                                                                                                           |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Modal        | 공통 헤더·X·크기·포커스·본문 스크롤·화면별 children 구성 | 자유로운 본문을 children으로 전달. 확인·취소 버튼이 필요하면 ConfirmModal 사용. 화면 전용 동작은 children 안에 구성 |
| ConfirmModal | Modal을 조합해 확인·취소 버튼과 처리 중 상태 제공        | title·description·onConfirm·onClose·isPending 등 전달. 버튼 JSX와 처리 중 동작을 각 사용처에 반복하지 않음          |
| 화면별 모달  | 도메인 내용·검증·요청·상태 연결                          | 회원 정보·제재 선택은 Modal 사용. 삭제·지급·전송·최종 확인·변경사항 폐기는 ConfirmModal 사용                        |

Modal에는 footer prop이 없다. ConfirmModal이 Modal 위에 확인·취소 버튼 영역을 구성하고 본문 스크롤을 관리한다. Modal을 직접 쓰는 화면은 자체 children 안에 화면별 내용을 구성한다. 기존 ConfirmModal 경로와 props는 유지한다. 처리 중 닫기 제한과 비활성화, 포커스 복귀도 유지한다.

검증 갱신: 구조 확정 후 관련 13개 파일 134개 테스트와 전체 ESLint·빌드 통과. 전체 포인트 확인 모달의 데스크톱·모바일 배치 및 ESC·포커스 복귀도 재확인했다.

## 회원 팝오버 소유 위치 변경

회원 정보·제재 선택 모달은 shared에 개별 컴포넌트로 두지 않는다. 두 모달은 회원 팝오버에서만 사용하고 제재 추가 폼은 MemberInfo 도메인에 의존하므로, 팝오버와 함께 `domains/MemberInfo/components/MemberInfoPopover.tsx`에서 관리한다. 정보 보기와 제재 선택은 `Modal`을 직접 사용하며 화면 전용 버튼은 children 안에서 구성한다.

`src/shared/components/MemberInfoModal.tsx`, `SanctionModal.tsx`, `MemberInfoPopover.tsx`와 해당 shared export를 제거했다. 게시글 목록·상세 및 댓글 목록의 네 사용처는 `domains/MemberInfo/components/MemberInfoPopover`를 직접 import한다.

## 3단계 폼 모달 적용 결과

Modal은 제목·설명·X와 외곽만 제공하고, 각 폼은 children 안에 스크롤 가능한 본문과 제출 버튼을 구성한다. footer prop은 추가하지 않았다. 별도의 최종 확인·변경사항 폐기 확인에는 ConfirmModal을 사용한다.

| 대상                                 | 적용 결과                                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| PointFreezeUpdateConfirmModal        | 작은 Modal로 전환. 기존 날짜 초기화·mutation·검증 유지. 요청 중 입력·취소·닫기 제한                                        |
| ExamReviewPeriodUpdateConfirmModal   | 작은 Modal로 전환. 요청 중 상태·재실행 방어 추가, 성공 후 닫기·갱신 유지                                                   |
| MemberPointAdjustmentDialog          | Modal로 전환. 기존 약 36rem 너비 유지, 큰 제목·모서리·여백 재정의 제거. 직접 지급·초기화 흐름 유지, 제출 중 입력·닫기 제한 |
| PenaltyHistoryAddDialog              | Modal로 전환. contentRef를 contentProps.ref로 전달해 오류 필드 포커스 유지. 최종 확인과 제출 중 입력·닫기 제한 유지        |
| ExamReviewFileNameModal              | Modal 내부의 실제 form 제출 유지. 기존 검증·확장자·저장 실패 처리와 트리거 포커스 복귀 유지                                |
| ExamReviewAdminStatusPeriodFormModal | Modal size lg로 전환. 본문만 스크롤, 미저장 폐기 확인·저장 중 닫기 제한·닫힌 후 포커스 복귀 유지                           |
| PopupEditorDialog                    | 760px 너비 예외 유지. 입력·이미지·미리보기와 저장 확인으로 이어지는 흐름 유지, 본문만 스크롤                               |

### 3단계 자동 검사

관련 9개 파일의 75개 테스트가 통과했다. 파일명 제출·검증·포커스, 기간 입력 초기화·요청 형식, 제재 중첩 확인, 시험후기 상세 및 공통 모달 회귀를 포함한다. 전체 ESLint와 프로덕션 빌드도 통과했으며 번들 크기 경고는 남아 있다.

테스트 기대값에서 빠져 있던 기존 작성 기간 요청의 type WRITE를 반영했고, footer prop을 제거한 이전 변경에서 빠진 Modal 테스트의 본문 버튼을 복구했다. 도메인 요청 데이터 형식은 변경하지 않았다.

### 3단계 브라우저 확인

로컬 팝업 입력 모달을 1440×900·390×700에서 긴 제목·본문으로 확인했다. 모달이 화면 안에 배치되고 본문을 스크롤해 저장 버튼에 접근할 수 있으며, ESC로 닫은 뒤 새 팝업 등록 버튼으로 포커스가 복귀했다. 저장 요청은 실행하지 않았다.

이 과정에서 숨긴 파일 입력의 공통 w-full 스타일이 모달 밖으로 너비를 늘리는 문제를 발견해 sr-only 대신 hidden으로 변경했다. 이미지 첨부 버튼이 ref로 파일 선택창을 여는 방식은 유지한다.

## 4단계 조회 모달 적용 결과

| 대상                              | 적용 결과                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| MemberPointHistoryDialog          | 공통 Modal 헤더로 전환. 도움말은 headerExtra로 전달. 기존 약 36rem 너비·최대 높이·본문 스크롤·추가 조회·오류·재시도·중복 로그 제거 유지               |
| PenaltyHistoryTimelineDialog      | 공통 Modal 헤더로 전환. 제재 추가 버튼·안내·전체 건수는 고정 영역에 두고 타임라인만 스크롤. 기존 추가 제한·무한 조회 유지                             |
| ExamReviewAdminStatusDialog       | 공통 Modal로 전환. 960px 너비 예외·컨테이너 쿼리·반응형 높이 유지. 기간 탭·차트·관리자 목록은 본문 내부에서 스크롤                                    |
| ExamReviewAdminStatusPeriodDialog | 공통 Modal로 전환. 현황 보기 버튼은 headerExtra, 목록은 스크롤 본문에 배치. 저장 중 closeDisabled 적용. 기간 추가·수정·삭제와 변경사항 폐기 확인 유지 |

공통 Modal에는 footer 옵션을 추가하지 않았다. 각 조회 화면이 children 안에서 필요한 고정 영역과 스크롤 영역을 구성한다.

관련 기존 테스트 6개 파일의 45개 항목과 새 포인트 이력 테스트 1개 항목이 통과했다. 포인트 이력 테스트는 스크롤·더 보기의 다음 페이지 요청 및 조회 중 중복 요청 제한을 확인한다. 전체 ESLint·프로덕션 빌드도 통과했으며 번들 크기 경고는 남아 있다.

### 4단계 브라우저 확인

관리자 현황·기간 편집을 모의 기간 12개·관리자 25명으로 1440×900·390×700에서 확인했다. 모달의 가로 넘침이 없으며 기간 편집의 현황 보기 버튼은 고정 헤더에 배치된다. 기간 추가 후 ESC를 누르면 폐기 확인이 열리고, 취소 시 입력이 유지되며 변경사항 버리기 시 기간 폼만 닫혀 편집 목록으로 돌아온다. 실제 저장·삭제 요청은 실행하지 않았다.

## 5단계 최종 점검

- 활성 모달의 제목·설명·X는 Modal을 통해 구성한다. 표준 확인·취소 버튼은 ConfirmModal이 담당한다.
- Modal에는 footer 옵션이 없으며, 자유형 모달의 입력·동작은 각 화면의 children에 배치한다.
- shared의 회원 정보·제재 선택 전용 모달은 제거했고 MemberInfo 도메인의 팝오버에서 직접 Modal을 사용한다.
- 기존 Dialog 직접 조합은 사용하지 않는 MemberPointAdjustmentConfirmDialog 한 개에만 남아 있다. 이 파일은 기존 계획에 따라 재활성화·삭제하지 않았다.
- 너비 예외는 작은 제재 선택 약 20rem, 회원 정보·파일명 약 28rem, 회원 폼·이력 약 36rem, 기간 편집 약 48rem, 팝업 760px, 관리자 현황 960px를 유지한다. 나머지는 Modal의 size 옵션을 사용한다.
- API 요청·검증·초기화·포인트 표시·날짜 포맷은 기존 도메인에서 관리한다. 공통 컴포넌트로 옮기지 않았다.

관련 11개 파일의 125개 테스트와 새 사유 입력 단축키 테스트 2개가 통과했다. 사유 테스트는 삭제·복구 각각 일반 Enter·IME 조합·처리 중·빈 사유에서는 실행하지 않고 Ctrl/Cmd+Enter에서 확인하는 동작을 검증한다.

공통 요약 목록 적용 후 전체 포인트 확인 모달을 1440×900·390×700에서 긴 메모로 재확인했다. 가로 넘침 없이 확인·취소 버튼이 보이고 ESC 닫기·열기 버튼 포커스 복귀가 유지된다. 실제 지급 요청은 실행하지 않았다.

전체 ESLint·프로덕션 빌드 점검을 포함한다. 모든 화면을 실제 서버 데이터로 E2E 검증했다는 의미는 아니며, 브라우저 검증 범위는 단계별 기록을 따른다. 기존 번들 크기 경고는 남아 있다.

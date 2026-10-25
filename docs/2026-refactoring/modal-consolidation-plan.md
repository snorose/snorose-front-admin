# 모달 공통화 조사 및 전환 계획

> 2026-10-25 소스 기준. 범용 `Modal` 추가까지 완료했으며, 기존 모달 전환은 아직 진행하지 않았다. 아래 사용처는 테스트와 주석 처리된 호출을 제외한 소스 연결 기준이며, 화면 동작 검증은 전환 단계에서 진행한다.

## 목표와 범위

[`Modal`](../../src/shared/components/Modal.tsx)을 모달의 기본 틀로 사용한다. 제목·선택 설명·X 버튼·기본 여백·크기를 통일하고 본문과 하단 버튼은 화면에서 구성한다. 확인·취소 형태는 기존 `ConfirmModal`을 `Modal` 기반으로 전환해 재사용한다.

API 요청, 입력 검증, 성공·실패 처리, 입력 초기화, 변경사항 폐기 확인은 도메인 컴포넌트에 유지한다. 전역 모달 저장소 도입과 전체 모달의 단일 크기 강제는 범위에 포함하지 않는다.

## 공통 기반의 현재 상태와 변경 계획

| 파일                                         | 현재 상태                                                                                                               | 변경 계획                                                                                                                 | 상태                  |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `src/shared/components/ui/dialog.tsx`        | Radix 기반 shadcn Dialog. X 버튼 기본 제공, 헤더·제목·설명·하단을 호출부에서 조합                                       | 접근성·포털·포커스 등 기본 동작을 담당하는 하위 컴포넌트로 유지                                                           | 유지                  |
| `src/shared/components/Modal.tsx`            | `title`, 선택 `subtitle`, `headerExtra`, `size`, `closeDisabled`, `contentProps` 제공. `Modal.Body`·`Modal.Footer` 제공 | 기존 모달의 공통 외곽 틀로 적용                                                                                           | 추가 완료 / 전환 대기 |
| `src/shared/components/index.ts`             | `Modal`과 `ModalProps` export 제공                                                                                      | 화면은 `@/shared/components`에서 가져오기                                                                                 | 완료                  |
| `src/shared/components/ui/confirm-modal.tsx` | Dialog 직접 조합. 제목·설명은 문자열. 확인 버튼 비활성화만 지원하며 취소·X·ESC·외부 클릭은 별도 처리 필요               | `Modal`을 조합하도록 변경. `description`을 `subtitle`에 연결. 처리 중 상태와 크기 옵션 추가, 제목·설명은 `ReactNode` 허용 | 예정                  |

`ConfirmModal`의 기존 경로와 props는 호환성을 유지한다. 내부에서는 `Modal`을 `@/shared/components/Modal`에서 직접 import해 공유·UI 배럴 간 순환 참조를 피한다. 이번 계획에서 파일 이동은 하지 않는다.

## 공통화 기준

| 항목         | 현재 차이                                             | 적용 기준                                                                                                                               |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 제목·설명    | 기본 크기와 `text-xl`·`text-2xl`, 별도 색상·간격 혼용 | `Modal` 기본 제목·설명 스타일 사용. 아이콘·강조는 `ReactNode`로 전달                                                                    |
| X 버튼 주변  | 일부 화면만 오른쪽 패딩을 확보                        | 공통 헤더에서 X 영역 확보. `subtitle`은 선택이며 없을 때 설명 참조 제거                                                                 |
| 너비         | `xs`·`sm`·`md`·`xl`·임의 픽셀 혼용                    | 기본 `md`, 작은 확인은 `sm`, 큰 폼은 `lg`, 넓은 조회는 `xl`. 필수 너비는 `className` 예외로 유지                                        |
| 여백·모서리  | `p-6`, 내부 `px-8 py-8`, `rounded-2xl` 등 반복        | 공통 여백과 기본 모서리 사용. 중복 패딩 제거                                                                                            |
| 긴 내용      | 전체 스크롤과 본문 스크롤 혼용                        | 기본은 헤더·하단 유지, `Modal.Body` 내부 스크롤. `onScroll`, `aria-busy` 등 본문 속성 유지                                              |
| 하단 버튼    | 화면마다 Footer·일반 div로 정렬                       | 자유형은 `Modal.Footer`, 확인형은 `ConfirmModal` 사용. 기본 강조·취소·삭제 버튼 역할 유지                                               |
| 처리 중 닫기 | 닫기 제한 유무·방법이 다름                            | 변경 요청 중 `closeDisabled` 적용. 커스텀 취소 버튼도 화면에서 비활성화해야 함                                                          |
| 처리 중 실행 | 로딩 문구·아이콘·비활성화가 제각각                    | `ConfirmModal`에 `isPending`·선택 처리 문구를 추가해 확인·취소 비활성화, 로딩 표시, 닫기 제한을 연결. 실행 함수의 중복 요청 방지도 유지 |
| 폼 제출      | 실제 form 제출과 onClick 제출 혼용                    | 기존 제출 의미 유지. form으로 Body·Footer를 감싸면 `flex min-h-0 flex-col` 및 필요 시 `flex-1` 적용                                     |
| 미저장 변경  | 기간 편집에서 폐기 확인을 별도 구현                   | `onOpenChange`의 기존 닫기 요청 함수를 유지. `closeDisabled`로 폐기 확인을 대체하지 않음                                                |
| 포커스       | 파일명·기간 폼에서 복귀 대상을 직접 지정              | `contentProps.onCloseAutoFocus`와 `contentProps.ref`로 기존 동작 유지                                                                   |

## 직접 Dialog 또는 자체 오버레이를 사용하는 모달

파일 경로의 `shared/…`는 `src/shared/…`, 나머지 `도메인/components/…`는 `src/domains/도메인/components/…`를 의미한다. 단계 번호는 아래 실행 순서에 대응한다.

| 모달 파일                                                                  | 사용 화면·호출부                                                             | 현재 구조                                                                   | 변경 계획                                                                                                         | 단계 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---- |
| `shared/components/MemberInfoModal.tsx`                                    | 회원 팝오버 `MemberInfoPopover`                                              | Dialog, 제목만 표시, 회원 정보 그리드, 닫기·상세 이동                       | `Modal` + Body + Footer. 설명 생략, 회원 정보·이동 로직 유지. 기존 `max-w-md`는 너비 예외 적용                    | 2    |
| `shared/components/SanctionModal.tsx`                                      | `MemberInfoPopover`의 제재 선택                                              | 작은 Dialog, 경고·강등 선택 후 추가 모달 열기                               | 작은 `Modal`과 Body로 전환. 선택 버튼은 본문에 유지, 선택 → 닫기 → 추가 모달 흐름 유지                            | 2    |
| `shared/components/StatusChangeModal.tsx`                                  | `PostTable`, `CommentTable`, `PostDetailManageCard`, `PostDetailCommentItem` | 직접 만든 fixed 오버레이, 제목·설명·사유·댓글 동시 삭제 옵션. Dialog/X 없음 | `ConfirmModal` 기반으로 전환. 사유·옵션은 본문에 유지. `isPending` 연결, 새 X·ESC·바깥 클릭 및 포커스 동작 검증   | 2    |
| `Points/components/PointAdjustmentConfirmModal.tsx`                        | `AdjustSinglePointPage`                                                      | Dialog에 회원·포인트·메모 요약, 취소·확인 직접 구현                         | `ConfirmModal`로 전환. 요약은 children 유지, 요청 중 상태를 페이지에서 전달                                       | 2    |
| `Points/components/AllMemberPointAdjustmentConfirmModal.tsx`               | `AdjustAllMemberPointPage`                                                   | Dialog에 전체 지급 요약, 취소·확인 직접 구현                                | `ConfirmModal`로 전환. 지급 대상·수량·메모 보존, 요청 중 상태 전달                                                | 2    |
| `Alerts/components/PushNotificationConfirmModal.tsx`                       | `PushNotificationPage`                                                       | Dialog, 전송 요약, 가로 2열 버튼. 발송 중 X 숨김·닫기 제한                  | `ConfirmModal`로 전환. 기존 발송 중 제한 유지, 버튼은 공통 Footer 정렬로 통일                                     | 2    |
| `Points/components/PointFreezeDeleteConfirmModal.tsx`                      | `PointFreezePage` → `PointFreezeListSection`                                 | 작은 Dialog, 일정 요약, 삭제 요청의 `isPending`은 확인 버튼에만 적용        | `ConfirmModal size='sm'`로 전환. 요약 유지, 처리 중 닫기·취소도 제한                                              | 2    |
| `Reviews/components/ExamReviewPeriodDeleteConfirmModal.tsx`                | `ExamReviewPeriodPage` → `ExamReviewPeriodListSection`                       | 작은 Dialog, 기간 요약, 별도 요청 중 상태 없음                              | `ConfirmModal size='sm'`로 전환. 요청 중 상태·중복 실행 방지 추가, 성공 콜백 유지                                 | 2    |
| `MemberInfo/components/penalty-history/PenaltyHistoryAddConfirmDialog.tsx` | `PenaltyHistoryAddDialog`                                                    | 큰 여백·강조 제목, 취소·확인. 처리 중에도 Dialog 닫기 가능                  | `ReactNode` 제목을 지원하는 `ConfirmModal`로 전환. 강조 문구 유지, `isSubmitting` 연결                            | 2    |
| `Points/components/PointFreezeUpdateConfirmModal.tsx`                      | `PointFreezePage` → `PointFreezeListSection`                                 | 이름은 Confirm이지만 제목·시작·종료를 입력하는 수정 폼. 작은 Dialog         | 자유형 `Modal size='sm'` + Body + Footer로 전환. `isPending` 연결, 날짜 상태·검증·저장 로직 유지                  | 3    |
| `Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx`                | `ExamReviewPeriodPage` → `ExamReviewPeriodListSection`                       | 기간 제목·시작·종료 입력 Dialog, 별도 요청 중 상태 없음                     | 자유형 `Modal size='sm'`로 전환. 요청 중 상태 추가, 성공·새로고침 흐름 유지                                       | 3    |
| `MemberInfo/components/MemberPointAdjustmentDialog.tsx`                    | 회원 상세 `MemberDetailSection`                                              | `rounded-2xl`, 큰 제목·설명, 포인트 폼, 자체 초기화                         | `Modal` + Body + Footer. 기존 약 36rem 너비 예외 유지, `isSubmitting`으로 닫기 제한, 직접 지급 흐름 유지          | 3    |
| `MemberInfo/components/penalty-history/PenaltyHistoryAddDialog.tsx`        | `SanctionModal`, `MemberPenaltyHistoryDialog`                                | 큰 제목·여백, content ref로 포커스 처리, 추가 확인 모달 중첩                | `Modal`로 전환하고 중복 패딩 제거. `contentProps.ref` 전달, 제재 제한·검증·확인 후 제출 유지                      | 3    |
| `Reviews/components/ExamReviewFileNameModal.tsx`                           | 시험후기 상세 `ExamDetailSection`                                            | 실제 form 제출, 저장 중 닫기 차단, 닫힌 뒤 트리거로 포커스 복귀             | `Modal` + form 안 Body·Footer. `closeDisabled`, `contentProps.onCloseAutoFocus` 연결. 확장자·검증·Enter 제출 유지 | 3    |
| `Reviews/components/ExamReviewAdminStatusPeriodFormModal.tsx`              | `ExamReviewAdminStatusPeriodList`                                            | Dialog 전체 스크롤, 저장 중 닫기 차단, 미저장 폐기 확인 중첩                | `Modal size='lg'`로 전환. Body 내부 스크롤, 기존 `requestClose`·`onAfterClose`·폐기 확인 유지                     | 3    |
| `Operation/components/PopupEditorDialog.tsx`                               | `PopupManagementPage`                                                        | 약 760px Dialog 전체 스크롤, 입력·이미지·미리보기·저장 버튼                 | `Modal` + Body + Footer. 760px 너비 예외 유지, 본문만 스크롤. 저장 확인으로 이어지는 흐름 유지                    | 3    |
| `MemberInfo/components/MemberPointHistoryDialog.tsx`                       | 회원 상세 `MemberDetailSection`                                              | 헤더 구분선·도움말, 본문 스크롤 기반 무한 조회                              | `Modal` + Body. 도움말은 `headerExtra`, 필요 구분선은 본문 경계에 유지. scroll handler·오류·재조회·더 보기 유지   | 4    |
| `MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog.tsx`   | `MemberPenaltySummaryCard` → `MemberPenaltyHistoryDialog`                    | 헤더·추가 버튼·건수 고정, 타임라인만 스크롤                                 | `Modal`로 전환. 상단 액션·건수는 Body 밖 고정 영역, 타임라인은 Body. 기존 무한 조회·제재 제한 유지                | 4    |
| `Reviews/components/ExamReviewAdminStatusDialog.tsx`                       | `ExamReviewPage`                                                             | 960px 상한, 컨테이너 쿼리, 지정 높이, 본문 스크롤                           | `Modal size='xl'` + Body. 960px·반응형 높이·`@container`는 예외 유지. 차트·탭·기간 편집 이동 유지                 | 4    |
| `Reviews/components/ExamReviewAdminStatusPeriodDialog.tsx`                 | `ExamReviewPage`                                                             | 큰 Dialog 전체 스크롤, 헤더 내 현황 보기, 기간 목록·폐기 확인               | `Modal`로 전환. 48rem 너비 예외 유지, 현황 보기는 `headerExtra`, 목록은 Body. 미저장 변경 확인 유지               | 4    |

`MemberPenaltyHistoryDialog`는 직접 Dialog를 렌더링하지 않는 조정 컴포넌트다. 타임라인·제재 추가 모달에 대한 상태와 데이터 전달은 유지한다.

## 기존 ConfirmModal 사용처와 간접 적용 계획

아래 모달들은 공통 `ConfirmModal`의 내부 교체로 외곽 틀이 함께 변경된다. 요청 중 상태 연결 등 필요한 호출부만 수정한다.

| 사용 파일                                                     | 화면·기능                           | 현재 상태                                             | 변경 계획                                                             | 단계 |
| ------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| `Reviews/components/ExamReviewDeleteModal.tsx`                | 시험후기 상세 삭제                  | 사유·기존 메모, 삭제 중 확인 비활성화                 | `isDeleting`을 공통 처리 중 상태에 연결. 포인트 차감 안내·단축키 유지 | 1    |
| `Reviews/components/ExamReviewRestoreModal.tsx`               | 시험후기 상세 복구                  | 사유·기존 메모, 복구 중 확인 비활성화                 | `isRestoring` 연결. 포인트 복구 안내·단축키 유지                      | 1    |
| `Reviews/components/ExamReviewUpdateConfirmModal.tsx`         | 시험후기 상세 저장 확인             | `max-w-3xl`, 수정 전후 비교표                         | 너비 예외·비교표 유지. 상세 저장 요청 중 상태를 호출부에서 전달       | 1    |
| `Reviews/components/ExamReviewAdminStatusPeriodList.tsx`      | 현황 집계 기간 삭제                 | 기간 요약, `isSubmitting`으로 확인 비활성화           | 처리 중 상태에 연결해 취소·닫기도 제한                                | 1    |
| `Reviews/components/ExamReviewAdminStatusPeriodFormModal.tsx` | 기간 폼 미저장 변경 폐기            | 중첩 ConfirmModal                                     | 공통 틀만 간접 적용. 버리기·계속 편집과 포커스 복귀 유지              | 1    |
| `Reviews/components/ExamReviewAdminStatusPeriodDialog.tsx`    | 기간 편집 종료 전 변경 폐기         | 중첩 ConfirmModal                                     | 공통 틀만 간접 적용. 현황 복귀와 편집 유지 분기 보존                  | 1    |
| `MemberInfo/components/WarnPenaltyTab.tsx`                    | 경고 관리 탭 적용 확인              | 회원명·경고 수 표시, 처리 중 확인 비활성화            | `isSubmitting` 연결, 기존 경고 증가 안내 유지                         | 1    |
| `MemberInfo/components/DemotionPenaltyTab.tsx`                | 강등 관리 탭 적용 확인              | 기간·종료일 표시, 처리 중 확인 비활성화               | `isSubmitting` 연결, 기간 계산·확정 문구 유지                         | 1    |
| `InquiryReport/components/InquiryStatusSelect.tsx`            | 문의·신고 상태 변경                 | 처리 중 onClose 방어, 확인 버튼의 처리 중 상태 미연결 | `isStatusUpdating` 연결, 상태 변경 함수의 중복 요청 방지도 점검       | 1    |
| `src/pages/operation/PopupManagementPage.tsx`                 | 팝업 등록·수정 확인 / 삭제 확인 2곳 | 제목·설명·버튼만 전달                                 | 공통 틀 간접 적용. 비동기 저장·삭제 흐름은 각 요청 상태 연결          | 1    |
| `src/pages/operation/ServerMaintenancePage.tsx`               | 서버 점검 일정 삭제                 | 로컬 상태에서 즉시 삭제                               | 공통 틀만 간접 적용. 동기 동작에 불필요한 로딩 상태 추가하지 않음     | 1    |

## 현재 사용하지 않는 모달

| 파일                                                           | 조사 결과                                                      | 처리 계획                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MemberInfo/components/MemberPointAdjustmentConfirmDialog.tsx` | 유일한 호출이 `MemberPointAdjustmentDialog` 안에서 주석 처리됨 | 활성 전환 대상에서 제외. 확인 단계를 다시 도입할 때 `ConfirmModal`로 전환. 이번 작업에서 재활성화하거나 삭제하지 않음 |

## 추가 공통화 후보

외곽 틀 전환 후 실제 중복이 남는 경우에 추출한다. API와 도메인 타입까지 공통 컴포넌트에 넣지 않는다.

| 후보                | 중복 사용처                                      | 추출할 범위                                 | 유지할 부분                                     |
| ------------------- | ------------------------------------------------ | ------------------------------------------- | ----------------------------------------------- |
| 라벨·값 요약 목록   | 개별·전체 포인트, 푸시 전송, 일정·작성 기간 삭제 | 라벨/값 배열 렌더링, 줄바꿈, 긴 값 처리     | 포인트 색상·회원 정보 구성·날짜 포맷            |
| 기간 입력 영역      | 포인트 미지급 일정 수정, 시험후기 작성 기간 수정 | 제목 + 시작·종료 DateTimePicker 배치·레이블 | 요청 데이터 변환, 상태 초기화, 도메인별 검증    |
| 메모·처리 사유 영역 | 시험후기 삭제·복구                               | 기존 메모, 사유 입력, 도움말·오류 연결      | 삭제/복구 문구, 포인트 안내, 요청·단축키 처리   |
| 변경사항 폐기 확인  | 기간 폼, 기간 편집                               | 반복되는 확인 문구·버튼 설정                | dirty 판정, 닫기 요청, 저장 성공 후 상태 초기화 |

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
- [ ] ConfirmModal 기반 교체와 기존 사용처 처리 중 상태 연결
- [ ] 직접 Dialog 사용 모달과 자체 오버레이 전환
- [ ] 폼·중첩 모달·조회 모달 동작 검증
- [ ] 반복 본문 추출 여부 재평가

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

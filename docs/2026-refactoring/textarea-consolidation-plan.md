# Textarea 공통화 검토

> 조사 기준: 2026-09-27, 저장소 `src` 전체의 textarea 관련 구현과 사용 참조
>
> 목적: 공통 컴포넌트로 페이지별 입력 경험과 스타일을 통일한다. 이 문서는 조사와 리팩토링 계획이며, 실제 UI 변경은 포함하지 않는다.

## 핵심 결론

**이미 있는 shadcn 기반 `Textarea`를 기준으로 통일하면 된다.** 새 컴포넌트를 설치하거나 별도 래퍼부터 만들 필요는 없다.

- 화면 입력부는 **18곳**이다. 직접 작성한 `<textarea>` 6곳, 공통 `<Textarea>` 12곳으로 나뉜다. 조건부 렌더링과 읽기 전용 필드도 포함한 코드 기준 집계다.
- 직접 작성한 입력부를 교체하고, 기존 사용처의 모서리·배경·글꼴·포커스 덮어쓰기를 정리해야 통일성이 생긴다.
- 입력 높이, 글자 수 제한, 읽기 전용 여부 등 **용도에 따른 차이는 유지**한다.

## 1. 직접 작성한 textarea: 교체 대상

| 파일                                                                                             | 용도                       | 개선 방향                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [StatusChangeModal](../../src/shared/components/StatusChangeModal.tsx)                           | 게시글·댓글 상태 변경 사유 | `Textarea`로 교체. 회색 테두리, 큰 모서리, 파란 포커스 스타일 제거. 현재 최소 높이 100px과 빈 사유 확인 버튼 비활성화 유지 |
| [PostDetailActionModal](../../src/domains/Posts/components/PostDetail/PostDetailActionModal.tsx) | 게시글 상세 상태 변경 사유 | 위와 동일. 복구 시 사유 입력을 숨기는 조건과 댓글 동시 삭제 옵션 유지                                                      |
| [ExamDeletePanel](../../src/domains/Reviews/components/ExamDeletePanel.tsx)                      | 시험후기 삭제 사유         | 사용 여부 확인 후 유지한다면 교체. 최소 높이 200px과 자동 높이 조절 검토                                                   |
| [ExamDiscussionPanel](../../src/domains/Reviews/components/ExamDiscussionPanel.tsx)              | 시험후기 논의사항          | 사용 여부 확인 후 유지한다면 교체. 최소 높이 200px과 자동 높이 조절 검토                                                   |
| [ExamDegradePanel](../../src/domains/Reviews/components/ExamDegradePanel.tsx)                    | 기타 강등 사유             | 사용 여부 확인 후 유지한다면 교체. 기타 선택 시 노출 조건과 최소 높이 100px 유지                                           |
| [ExamWarningPanel](../../src/domains/Reviews/components/ExamWarningPanel.tsx)                    | 기타 경고 사유             | 사용 여부 확인 후 유지한다면 교체. 기타 선택 시 노출 조건과 최소 높이 100px 유지                                           |

`StatusChangeModal`은 게시글 목록, 댓글 목록, 게시글 상세 댓글에서 재사용된다. 한 번 교체하면 여러 화면에 적용된다.

**시험후기 패널 4개는 우선순위를 낮춘다.** 현재 `src`에서 정의와 barrel export 외에 사용 참조가 없다. 불필요한 코드라면 삭제를 별도 검토하고, 유지할 코드라면 공통 컴포넌트를 적용한다. 실제 노출 화면의 통일 작업보다 먼저 손볼 필요는 없다.

## 2. 이미 공통 Textarea를 사용하는 곳

| 파일 / 입력부 수                                                                                                     | 판단                   | 정리할 부분 / 유지할 부분                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [PushNotificationPage](../../src/pages/alerts/PushNotificationPage.tsx) · 1곳                                        | 유지 가능              | 기본 스타일과 연결된 라벨을 이미 사용. 100자 제한·카운터·내용 변경 처리 유지. 고정 `h-28`은 높이 정책을 정할 때만 검토            |
| [ExcelPointUploadPage](../../src/pages/points/ExcelPointUploadPage.tsx) · 1곳                                        | 유지 가능              | 최소 높이, 세로 크기 조절, 제출 중 비활성화, 연결된 라벨 유지                                                                     |
| [ExamReviewDetailInfoSection](../../src/domains/Reviews/components/ExamReviewDetailInfoSection.tsx) · 2곳            | 스타일 유지, 라벨 보완 | 최소 높이 110px과 수정 불가 시 비활성화 유지. `Field.Label`에 `htmlFor`, 입력부에 `id` 연결 필요                                  |
| [ExamReviewDeleteModal](../../src/domains/Reviews/components/ExamReviewDeleteModal.tsx) · 2곳                        | 대부분 유지            | 라벨 연결·기존 메모 `readOnly`·처리 중 사유 입력 비활성화 유지. 기존 메모의 `bg-gray-50`은 공통 읽기 전용 배경 토큰으로 정리 권장 |
| [ExamReviewRestoreModal](../../src/domains/Reviews/components/ExamReviewRestoreModal.tsx) · 2곳                      | 대부분 유지            | 삭제 모달과 같은 기준 적용. 기존 메모와 복구 사유의 높이 차이는 유지 가능                                                         |
| [InquiryReportDetailPanel](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx) · 1곳            | 스타일·라벨 보완       | `bg-white`, `text-[13px]` 덮어쓰기 정리. 댓글/대댓글 입력의 접근 가능한 이름 추가. 글자 수 제한·카운터 유지                       |
| [InquiryCommentItem](../../src/domains/InquiryReport/components/InquiryCommentItem.tsx) · 1곳                        | 스타일·라벨 보완       | 위와 동일. 댓글 수정용 이름 추가. 수정/취소 동작과 최소 높이 유지                                                                 |
| [MemberPointAdjustmentDialog](../../src/domains/MemberInfo/components/MemberPointAdjustmentDialog.tsx) · 1곳         | 스타일 보완            | `rounded-xl`, `bg-slate-50` 덮어쓰기 정리. 입력을 감싼 `label`과 필수 메모 검증 유지                                              |
| [PenaltyHistoryAddDialog](../../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog.tsx) · 1곳 | 스타일·라벨 보완       | `rounded-xl`, `border-0`, `bg-slate-100`, 큰 패딩·글꼴, 별도 포커스 링 덮어쓰기 정리. 메모 라벨 연결. 글자 수 제한·카운터 유지    |

라벨이 화면에 보여도 입력과 연결되지 않으면 보조 기술에서 입력 이름으로 사용되지 않을 수 있다. `Field`로 감쌌다는 이유만으로 연결이 자동 생성되지는 않는다. 직접 작성된 6곳에도 교체 시 `id`와 `htmlFor`를 연결하고, 공간상 라벨을 숨겨야 하는 댓글 입력은 `sr-only` 라벨 또는 `aria-label`을 사용한다.

## 3. 공통 컴포넌트 자체는 유지

| 파일                                                                 | 판단                                                                                                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ui/textarea.tsx](../../src/shared/components/ui/textarea.tsx)       | 공통 기준으로 유지. 테두리·모서리·패딩·반응형 글꼴·포커스·비활성·오류 스타일이 이미 있다. 내부 `<textarea>`는 실제 HTML 요소이므로 교체 대상이 아니다     |
| [ui/input-group.tsx](../../src/shared/components/ui/input-group.tsx) | `InputGroup.Textarea`는 이미 공통 `Textarea`를 사용한다. 테두리·모서리·포커스를 그룹 단위로 표현하기 위한 재정의이므로 유지. 현재 화면에서 사용 참조 없음 |

## 4. 통일할 기준과 유지할 차이

| 공통으로 통일                                                   | 화면별로 유지                                        |
| --------------------------------------------------------------- | ---------------------------------------------------- |
| `@/shared/components/ui`의 `Textarea` 사용                      | `value`, `onChange`, API 요청, 저장·취소 동작        |
| 기본 테두리, 모서리, 패딩, 글꼴, 포커스 링                      | 내용 길이에 맞는 최소 높이·고정 높이                 |
| 배경·읽기 전용 배경에 의미 기반 토큰 사용                       | `maxLength`, 글자 수 카운터, 필수값 정책             |
| 라벨 연결과 오류가 있을 때의 `aria-invalid`, `aria-describedby` | `disabled`, `readOnly`, 조건부 노출                  |
| 같은 용도의 입력에서 일관된 크기 조절 방식                      | 긴 메모의 `resize-y`, 짧은 사유 입력의 `resize-none` |

통일성은 모든 입력의 높이를 같게 만드는 것이 아니다. 같은 기본 스타일을 공유하면서 필요한 동작만 다르게 유지하는 것이 목표다. 기본 오류 스타일은 이미 있으므로, 실제 필드 오류가 있는 곳에서 상태와 메시지를 연결하면 된다.

시험후기 패널 4개에는 `scrollHeight`로 높이를 변경하는 코드가 반복된다. 공통 `Textarea`에는 이미 `field-sizing-content`가 있으므로 지원 브라우저에서 입력·붙여넣기·초기값·취소 후 높이를 확인한 뒤 중복 코드를 제거한다. CSS만으로 요구를 충족하지 못한다면 자동 높이 조절만 작은 공통 훅으로 분리한다.

## 5. 작업 체크리스트

실제 변경과 확인을 마친 항목을 체크한다. 변경이 필요 없는 사용처는 위 표의 유지 기준을 따른다.

### 1단계: 직접 작성 입력 교체

- [x] `StatusChangeModal`: 공통 `Textarea` 적용, 기본 스타일 사용, 라벨 연결
- [x] `PostDetailActionModal`: 공통 `Textarea` 적용, 기본 스타일 사용, 라벨 연결

### 2단계: 기존 사용처 스타일 정리

- [ ] `MemberPointAdjustmentDialog`: 모서리·배경 덮어쓰기 정리
- [ ] `PenaltyHistoryAddDialog`: 모서리·테두리·배경·패딩·글꼴·포커스 덮어쓰기 정리
- [ ] `InquiryReportDetailPanel`: 배경·글꼴 덮어쓰기 정리
- [ ] `InquiryCommentItem`: 배경·글꼴 덮어쓰기 정리
- [ ] `ExamReviewDeleteModal`, `ExamReviewRestoreModal`: 기존 메모 배경을 같은 읽기 전용 토큰으로 통일

### 3단계: 라벨과 상태 연결

- [ ] `ExamReviewDetailInfoSection`: 입력 2곳에 `id`와 `htmlFor` 연결
- [ ] `PenaltyHistoryAddDialog`: 메모 라벨과 입력 연결
- [ ] `InquiryReportDetailPanel`: 댓글/대댓글 입력의 접근 가능한 이름 추가
- [ ] `InquiryCommentItem`: 댓글 수정 입력의 접근 가능한 이름 추가
- [ ] 실제 필드 오류가 있는 사용처에서 `aria-invalid`, `aria-describedby`와 오류 메시지 연결 확인

### 4단계: 사용 참조 없는 패널 정리

아래 항목은 유지 후 교체하거나, 불필요한 코드로 판단하여 삭제한 경우 완료로 표시한다.

- [ ] `ExamDeletePanel`: 유지 여부 결정 및 처리
- [ ] `ExamDiscussionPanel`: 유지 여부 결정 및 처리
- [ ] `ExamDegradePanel`: 유지 여부 결정 및 처리
- [ ] `ExamWarningPanel`: 유지 여부 결정 및 처리
- [ ] 유지한 패널의 자동 높이 조절을 확인하고 중복 `scrollHeight` 코드 정리

### 완료 확인

- [ ] 변경한 입력의 테두리·모서리·글꼴·포커스 스타일이 공통 기준과 일치
- [ ] 키보드 포커스가 보이고 입력의 라벨이 연결됨
- [ ] 긴 내용·줄바꿈·붙여넣기·크기 조절이 정상 동작
- [ ] 글자 수 제한·카운터·필수값 검증이 기존대로 동작
- [ ] 읽기 전용·비활성·조건부 노출이 기존대로 동작
- [ ] 저장·취소·입력 초기화 동작이 기존대로 유지됨
- [ ] 좁은 화면에서 입력과 주변 요소가 넘치지 않음
- [ ] 기존 시험후기 상세 테스트의 최소 높이 110px 확인 통과. 높이 정책을 바꿨다면 기대값도 조정

현재는 기본 `Textarea`와 기존 필드 구조만으로 충분하다. 라벨·설명·카운터·오류 조합까지 동일하게 반복될 때만 별도 `TextareaField`를 검토하고, 도메인 검증이나 저장 로직은 넣지 않는다.

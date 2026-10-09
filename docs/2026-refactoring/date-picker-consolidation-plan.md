# 전체 날짜·시간 선택 UI 통일 작업 계획

> 조사 기준: 2026-10-09 현재 소스
>
> 상태: 계획 작성. 이 문서의 추가 공통화와 기본 입력 교체는 아직 구현하지 않았다.
>
> 선행 작업: [게시글·댓글 Calendar 교체와 전체 사용처 조사](./post-comment-calendar-plan.md)

## 1. 권장 방향

**모든 날짜 선택은 공용 `DatePicker`를 사용하고, 날짜·시간 선택은 `DatePicker + 시·분 Select`를 조합한 `DateTimePicker`를 사용한다.** 달력 표시와 열기·닫기 동작은 DatePicker 한곳에서 관리한다.

전체 통일은 아이콘만 맞추는 작업을 넘어 한국어 달력, 선택칸 전체 클릭, 날짜 표시, 선택 해제, 월 이동, 키보드 조작, 모바일 배치를 공통으로 제공하는 작업이다. 화면별 placeholder와 필수값·기간 검증은 각 사용처의 요구를 유지한다.

이번 범위는 날짜를 **선택하는 UI**다. 목록의 날짜 출력 형식이나 API별 요청 형식을 한 번에 바꾸지 않는다. 날짜만 선택하는 필드에 시·분 입력을 추가하거나, 기존 시작·종료 필드를 하나의 범위 달력으로 합치지도 않는다.

## 2. 현재 상태와 전체 대상

현재 DatePicker와 DateTimePicker는 같은 shadcn Calendar·Popover·Button과 CalendarIcon을 사용하지만, 달력을 조합하는 코드가 따로 있다. DatePicker의 한국어 표시·개별 해제·재열기 월 처리는 DateTimePicker에 공유되지 않는다.

| 화면·기능                    | 현재 구현                  | 필드 수                | 목표 구현                                            |
| ---------------------------- | -------------------------- | ---------------------- | ---------------------------------------------------- |
| 게시글 작성일 검색           | DatePicker                 | 시작·종료 2개          | 확장된 공용 DatePicker 유지                          |
| 댓글 작성일 검색             | DatePicker                 | 시작·종료 2개          | 확장된 공용 DatePicker 유지                          |
| 미지급 일정 생성·수정        | DateTimePicker             | 각각 시작·종료, 총 4개 | 공용 DatePicker를 내부에서 재사용하는 DateTimePicker |
| 시험후기 작성 기간 생성·수정 | DateTimePicker             | 각각 시작·종료, 총 4개 | 동일한 DateTimePicker                                |
| 팝업 등록·수정               | DateTimePicker             | 시작·종료 2개          | 동일한 DateTimePicker                                |
| 엑셀 포인트 예약 지급        | 조건부 DateTimePicker      | 예약 일시 1개          | 동일한 DateTimePicker                                |
| 시험후기 검색                | 기본 `date` 입력           | 시작·종료 2개          | DatePicker                                           |
| 회원 생년월일 수정           | 기본 `date` 입력           | 1개                    | DatePicker                                           |
| 서버 점검 일정 생성·수정     | 기본 `datetime-local` 입력 | 시작·종료 2개          | DateTimePicker                                       |

대상은 소스 기준으로 **날짜 전용 7개 필드, 날짜·시간 13개 필드, 총 20개 필드**다. 생성·수정이 같은 컴포넌트를 공유하는 팝업과 서버 점검 폼은 필드를 중복 집계하지 않았다.

팝업 메뉴와 엑셀 업로드 예약 지급 선택 항목은 현재 주석 처리되어 있다. 해당 컴포넌트도 공용 변경의 영향을 받으므로 검증에 포함하되, 메뉴나 기능을 다시 노출하는 작업은 하지 않는다.

## 3. 공통 구조

```text
날짜 전용 화면
  Label 또는 aria-label
  DatePicker
    Popover.Trigger > Button(전체 클릭, CalendarIcon)
    Popover.Content > Calendar(한국어, 날짜 선택·이동)
    날짜 선택 해제

날짜·시간 화면
  DateTimePicker
    Label
    DatePicker              ← 위와 같은 날짜 선택 UI
    Select(시)
    Select(분)

날짜 값 처리
  date-picker-utils        ← 로컬 날짜 파싱·변환
  useDateTimeField         ← 날짜·시간 상태와 조합, 기존 콜백 유지
  도메인 요청 빌더         ← 기존 API별 문자열 형식 유지
```

`Calendar`, `Popover`, `Button`의 UI 원형은 재사용한다. 언어와 날짜 선택 정책은 DatePicker에서 설정하고, 개별 화면은 Calendar를 직접 렌더링하지 않는다.

DateTimePicker는 자체 Popover·Calendar와 달력 열림 상태를 제거한다. 날짜 표시와 변환을 DatePicker에 위임하고 시간 선택만 추가한다.

## 4. 통일할 동작과 모양

| 항목        | 공통 기준                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------- |
| 클릭 범위   | 날짜 글자·여백·아이콘을 포함한 선택칸 전체                                                          |
| 트리거      | `type='button'`, `h-9`, 전체 너비, 왼쪽 날짜·오른쪽 CalendarIcon                                    |
| 언어·표시   | 한국어 월·요일·접근성 안내, 선택 날짜는 `yyyy-MM-dd`                                                |
| placeholder | DatePicker의 `placeholder`로 전달. 기존 DateTimePicker의 `datePlaceholder`를 내부에서 연결          |
| 열기        | 선택한 날짜의 월, 미선택이면 현재 월. 최소·최대 제한이 있으면 유효한 이동 범위도 고려               |
| 재열기      | 닫기 애니메이션 중 다시 열어도 기준 월을 다시 설정                                                  |
| 선택        | 날짜 값 갱신 후 닫기. 검색·저장 요청은 실행하지 않음                                                |
| 해제        | 선택값이 있으면 Popover 안에서 해당 날짜만 해제. 날짜·시간 필드는 날짜 해제 시 시간 선택값을 유지   |
| 전체 초기화 | 화면의 기존 초기화 정책 유지. DatePicker가 부모 초기화를 즉시 반영                                  |
| 키보드      | Tab 접근, Enter·Space 열기, 날짜 이동·선택, Escape 닫기, 포커스 복귀                                |
| 비활성·오류 | 날짜 버튼과 시·분 Select에 비활성·오류·설명 연결을 전달                                             |
| 좁은 화면   | 트리거 말줄임, Popover 화면 경계 보정. 날짜·시간 그룹은 공간이 부족하면 날짜와 시·분을 두 줄로 배치 |

### 생년월일의 빠른 연도 이동

생년월일을 월 이동 버튼만으로 고르면 수백 번 이동해야 할 수 있다. 공용 DatePicker에 shadcn Calendar의 월·연도 드롭다운 탐색을 적용해 과거 연도로 바로 이동할 수 있게 한다.

드롭다운의 이동 범위는 업무상 선택 제한과 구분해서 설계한다. 기존 선택값과 미래 일정이 탐색 범위에 들어가도록 하고, 드롭다운의 기본 범위 때문에 미래 날짜 선택이 막히지 않는지 검증한다. 생년월일의 미래 날짜 제한 등 현재 없는 업무 규칙을 UI 통일을 이유로 새로 추가하지 않는다.

### 선택 해제와 필수값

날짜 해제는 UI 동작이고 필수값 검증은 폼의 책임이다. 필수 필드도 값을 비운 뒤 다시 선택할 수 있게 하며, 비운 상태로 저장하면 기존 검증 메시지를 표시한다. `required` 레이블이나 버튼으로 대체한 날짜 선택칸만으로 브라우저의 기본 폼 검증이 실행된다고 가정하지 않는다.

선택값을 다시 클릭하는 방식으로 해제되는 동작은 `clearable` 정책과 맞춘다. 해제를 허용하지 않는 사용처가 생기면 해제 버튼과 Calendar의 선택 해제 동작을 모두 막아야 한다.

## 5. 공용 컴포넌트 계약

### DatePicker: 기존 계약을 확장

| prop                                   | 계획                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`, `value`, `onValueChange`         | 기존 유지. `value`는 `yyyy-MM-dd` 또는 `undefined`                                  |
| `placeholder`, `className`, `disabled` | 기존 유지                                                                           |
| `minDate`, `maxDate`                   | `yyyy-MM-dd` 문자열을 선택적으로 전달. 경계 날짜는 선택 가능하며 경계 밖은 비활성화 |
| `clearable`                            | 선택적으로 전달. 기본값 `true`. 모든 해제 경로에 같은 정책 적용                     |
| `aria-label`, `aria-labelledby`        | 외부 Label이 없는 검색 필드도 접근성 이름 전달 가능                                 |
| `aria-describedby`, `aria-invalid`     | 사용처의 설명·오류를 날짜 트리거에 연결                                             |

최소·최대 범위를 벗어난 기존 값이나 잘못된 값은 자동으로 부모 상태를 바꾸지 않는다. 달력이 렌더링 오류를 내지 않도록 방어하고, 화면의 검증 및 사용자의 수정으로 처리한다.

버튼의 모든 HTML prop을 무제한으로 노출해 사용처가 공통 열기 동작이나 아이콘을 덮어쓰게 하지 않는다. 실제 사용처에 필요한 레이블·오류·범위 계약만 명시적으로 제공한다.

### DateTimePicker: 기존 사용처를 유지하는 어댑터

- `label`, `date: Date | undefined`, `time: string`, `onDateSelect`, `onTimeChange`, `datePlaceholder`, `required`, `className`을 유지한다.
- `useId`로 날짜 버튼과 시·분 Select에 고유 id를 만든다. 날짜 Label과 버튼을 연결하고 시·분에도 `시작 일시 시`, `시작 일시 분`처럼 이름을 제공한다.
- 유효한 `Date`를 로컬 `yyyy-MM-dd`로 바꿔 DatePicker에 전달하고, 반환 문자열을 로컬 Date로 변환해 기존 `onDateSelect`를 호출한다.
- 날짜 해제는 `onDateSelect(undefined)`로 전달한다. 기존 시간값을 임의로 초기화하지 않는다.
- `disabled`, `aria-describedby`, `aria-invalid`를 추가해 날짜와 시·분 입력에 함께 전달한다. 기존 required 레이블은 유지한다.
- 기본 시간은 기존처럼 `00:00`이다. 시간만 바꾸고 날짜를 선택하지 않은 상태에서 임의의 날짜를 채워 넣지 않는다.

외부 값 계약을 모두 문자열로 바꾸는 큰 변경은 하지 않는다. 기존 DateTimePicker 사용처의 훅과 요청 빌더를 유지하면서 내부 날짜 UI부터 공통화한다.

## 6. 수정할 파일

| 구분              | 파일                                                                                                 | 작업                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 신규              | `src/shared/utils/date-picker-utils.ts` 및 테스트                                                    | 날짜 전용 문자열의 엄격한 로컬 파싱·형식 변환과 로컬 날짜·시간 파싱 제공         |
| 수정              | [shared/utils/index.ts](../../src/shared/utils/index.ts)                                             | 날짜 선택용 변환 함수 export                                                     |
| 수정              | [DatePicker.tsx](../../src/shared/components/DatePicker.tsx)                                         | 범위·오류·접근성 prop, 월·연도 탐색, 해제 정책 추가. 파싱은 공용 함수 재사용     |
| 수정              | [DatePicker.test.tsx](../../src/shared/components/DatePicker.test.tsx)                               | 범위 경계·연도 이동·오류 연결·기존 클릭 동작 검증                                |
| 수정              | [DateTimePicker.tsx](../../src/shared/components/DateTimePicker.tsx)                                 | 내부 달력을 DatePicker로 교체. 레이블·시·분 이름과 비활성·오류 전달 추가         |
| 신규              | `src/shared/components/DateTimePicker.test.tsx`                                                      | 날짜·시간 선택·해제·초기값·콜백·폼 내부 동작 검증                                |
| 수정              | [use-date-time-field.ts](../../src/shared/hooks/use-date-time-field.ts)                              | 로컬 날짜 파싱 사용, 잘못된 값 방어. 반환값과 콜백 계약 유지                     |
| 신규              | `src/shared/hooks/use-date-time-field.test.ts`                                                       | 초기값·재설정·해제·시간 유지와 시간대별 날짜 조합 검증                           |
| 수정              | [ExamSearch.tsx](../../src/domains/Reviews/components/ExamSearch.tsx)                                | 기본 날짜 입력 2개를 DatePicker로 교체                                           |
| 신규              | `src/domains/Reviews/components/ExamSearch.test.tsx`                                                 | 날짜 범위와 검색·초기화·초기값 검증                                              |
| 수정              | [MemberInfoEditFormFields.tsx](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx) | EditableField에서 `type === 'date'`일 때 DatePicker 사용                         |
| 수정              | [MemberInfoEditForm.tsx](../../src/domains/MemberInfo/components/MemberInfoEditForm.tsx)             | 생년월일 안내 문구 지정, 날짜 버튼으로도 기존 오류 이동·포커스가 동작하는지 확인 |
| 수정              | [MemberInfoEditForm.test.tsx](../../src/domains/MemberInfo/components/MemberInfoEditForm.test.tsx)   | 생년월일 선택·해제·저장값·오류 포커스 검증                                       |
| 수정              | [MaintenanceScheduleForm.tsx](../../src/domains/Operation/components/MaintenanceScheduleForm.tsx)    | 기본 날짜·시간 입력 2개를 DateTimePicker로 교체                                  |
| 수정              | [ServerMaintenancePage.test.tsx](../../src/pages/operation/ServerMaintenancePage.test.tsx)           | 기본 input 직접 변경을 실제 날짜·시간 선택으로 교체하고 CRUD·검증 유지 확인      |
| 점검·필요 시 수정 | 기존 DateTimePicker 사용처 6개 파일                                                                  | 새로운 공용 UI에서 초기값·모달·레이아웃·필수 검증·시간 선택 확인                 |
| 수정              | [기존 작업 문서](./post-comment-calendar-plan.md)                                                    | 후속 공통화 완료 후 최신 구조와 사용처 갱신                                      |
| 정리 후보         | [index.css](../../src/index.css)                                                                     | 기본 날짜 입력이 모두 제거된 뒤 미사용 `calendar-picker-indicator` 규칙 제거     |

기존 DateTimePicker 사용처:

- [PointFreezeScheduleForm.tsx](../../src/domains/Points/components/PointFreezeScheduleForm.tsx)
- [PointFreezeUpdateConfirmModal.tsx](../../src/domains/Points/components/PointFreezeUpdateConfirmModal.tsx)
- [ExamReviewPeriodScheduleForm.tsx](../../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx)
- [ExamReviewPeriodUpdateConfirmModal.tsx](../../src/domains/Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx)
- [PopupEditorDialog.tsx](../../src/domains/Operation/components/PopupEditorDialog.tsx)
- [ExcelPointUploadPage.tsx](../../src/pages/points/ExcelPointUploadPage.tsx)

## 7. 화면별 값과 검증 보존

### 게시글·댓글 검색

DatePicker의 기존 사용을 유지한다. 해제 시 필터에는 `undefined`를 저장하고, 날짜를 골라도 검색 버튼을 누르기 전까지 요청하지 않는다. 기존에 없는 기간 역전 제한을 추가하지 않는다.

### 시험후기 검색

- 시작일의 기존 `max={endDate}`를 `maxDate`, 종료일의 `min={startDate}`를 `minDate`로 연결한다. 같은 날짜는 선택할 수 있다.
- 기존 문자열 state는 빈 값을 `''`로 관리하므로 DatePicker의 `undefined`를 `''`로 변환해 전달한다.
- `검색 시작일`, `검색 종료일`의 접근성 이름을 유지한다.
- 검색 실행 시 시작일이 종료일보다 늦으면 거부하는 기존 toast 검증을 유지한다. 달력 비활성화만으로 검증을 대체하지 않는다.

### 회원 생년월일

- 외부 값은 기존 `yyyy-MM-dd` 문자열을 유지하고, 해제는 기존 문자열 state의 `''`로 변환한다.
- EditableField의 텍스트·이메일 필드는 기존 Input을 유지하고 날짜 필드만 분기한다.
- `id`, 레이블, `aria-invalid`, `aria-describedby`를 날짜 버튼에 연결한다.
- 필드 오류가 생기면 첫 오류 항목으로 스크롤·포커스하는 기존 로직이 input 대신 button에서도 작동하게 한다.
- 필수값과 기존 회원 수정 검증을 유지한다. 과거 연도 이동이 빠른지 브라우저에서 확인한다.

### 서버 점검 일정

- 폼의 `draft.startAt`, `draft.endAt`는 기존 로컬 날짜·시간 문자열로 유지한다. DateTimePicker와 `useDateTimeField`로 선택값을 조합해 draft를 갱신한다.
- 생성·수정 초기값, 초기화, 취소에서 draft와 날짜·시간 훅이 함께 동기화되어야 한다.
- 현재 `setDateTime()`은 훅 상태만 갱신하고 `onDateTimeChange` 콜백을 호출하지 않는다. 초기화·초기값 주입 시 콜백이 draft까지 갱신한다고 가정하지 않는다.
- 필수값 누락, 유효하지 않은 날짜·시간, `종료 > 시작` 검증과 제목 trim을 유지한다. 같은 일시나 빠른 종료 일시는 계속 거부한다.
- Button 기반 날짜 선택으로 native `required` 검증이 사라지는 부분은 기존 submit 검증으로 처리한다. 날짜·시·분 버튼 때문에 form이 제출되지 않게 한다.

### 미지급 일정·작성 기간·팝업·예약 지급

- DateTimePicker의 외부 계약을 유지해 기존 `useDateTimeField`와 요청 빌더를 계속 사용한다.
- 수정 모달을 다른 일정으로 다시 열면 새 날짜·시간이 표시되는지 확인한다.
- 팝업의 기존 기간 검증은 종료가 시작보다 빠른 경우만 거부하며 같은 일시는 허용한다. 서버 점검의 검증 규칙을 팝업에 일괄 적용하지 않는다.
- 팝업의 `onDateTimeChange`와 엑셀 업로드의 조건부 예약 일시가 정상적으로 갱신되는지 확인한다.

## 8. 날짜 처리와 시간대

현재 `useDateTimeField`는 날짜 부분을 `new Date('yyyy-MM-dd')`로 파싱한다. 날짜 전용 문자열은 UTC 기준으로 해석되어, 음수 오프셋 시간대에서 로컬 형식으로 다시 표시할 때 전날이 될 수 있다. 공통화하면서 로컬 날짜 파싱으로 교체한다.

- DatePicker, DateTimePicker 어댑터, useDateTimeField가 같은 날짜 선택용 함수를 사용한다.
- 날짜 형식과 실제 날짜 유효성을 검증한다. 잘못된 초기값으로 `format`을 호출해 렌더링 오류가 발생하지 않게 한다.
- 날짜 선택 결과에 `toISOString().slice(0, 10)`을 사용하지 않는다. 날짜와 시간을 UTC로 바꿔 저장하는 새 정책을 도입하지 않는다.
- 날짜 해제 시 날짜·시간 조합 문자열은 `''`이며, 기존 시간은 유지한다. 전체 reset은 기존처럼 날짜 없음·시간 `00:00`으로 돌아간다.
- 미지급 일정·포인트 예약 요청의 공백 구분 초 단위 형식과 작성 기간 요청의 `T` 구분 초 단위 형식은 기존 도메인 요청 빌더에서 유지한다.

참조: [포인트 요청 빌더](../../src/domains/Points/utils/point-request-builders.ts), [작성 기간 요청 빌더](../../src/domains/Reviews/utils/exam-review-period-request-builders.ts)

## 9. 적용 순서와 체크리스트

### 1단계: 값 처리와 공용 날짜 선택기

- [ ] 공용 로컬 날짜 파싱·변환 함수를 추가하고 유효성·윤년·빈 값·시간대 검증을 작성한다.
- [ ] useDateTimeField의 UTC 날짜 파싱을 교체하고 초기값·해제·reset·setDateTime 계약을 검증한다.
- [ ] DatePicker에 범위·접근성·오류·해제 정책과 월·연도 탐색을 추가한다.
- [ ] 기존 게시글·댓글 테스트와 실제 클릭 동작이 유지되는지 확인한다.

### 2단계: 날짜·시간 선택기의 내부 공통화

- [ ] DateTimePicker의 달력 표시를 DatePicker로 교체한다.
- [ ] 날짜 레이블 연결, 시·분 이름, 버튼 type, 비활성·오류 전달, 좁은 화면 배치를 적용한다.
- [ ] 미지급 일정과 작성 기간의 생성·수정부터 확인하고 팝업·예약 지급까지 검증한다.

### 3단계: 남은 기본 입력 교체

- [ ] 시험후기 검색에 DatePicker를 적용하고 기존 min/max·기간 검증을 보존한다.
- [ ] 회원 생년월일에 DatePicker를 적용하고 과거 연도 이동·오류 포커스·저장값을 검증한다.
- [ ] 서버 점검에 DateTimePicker를 적용하고 생성·수정·초기화·필수값·시간 순서 검증을 보존한다.

### 4단계: 전체 확인과 문서 갱신

- [ ] `src`에 기본 date·datetime-local 입력과 동적 `inputType: 'date'`의 기본 입력 경로가 남지 않았는지 검색한다.
- [ ] Calendar를 직접 렌더링하는 제품 컴포넌트가 DatePicker 한곳인지 확인한다.
- [ ] 미사용 기본 날짜 아이콘 CSS를 정리한다.
- [ ] 관련 테스트, 린트, 타입 검사·빌드를 실행한다.
- [ ] 실제 브라우저에서 화면·모달·모바일·키보드·시간대를 확인한다.
- [ ] 기존 교체 문서와 이 문서의 사용처·완료 체크리스트를 갱신한다.

각 단계의 관련 검증이 통과한 뒤 다음 단계로 진행한다. DateTimePicker의 외부 계약을 유지해 전체 사용처의 상태와 요청 처리를 한꺼번에 다시 작성하는 것을 피한다.

## 10. 검증 기준

| 범위                | 필수 검증                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 공용 DatePicker     | 글자·여백·아이콘 클릭, 한국어 표시, 날짜 선택·해제, 연도·월 이동, 재열기 기준 월, min/max 경계, 부모 초기화, 잘못된 값 |
| 공용 DateTimePicker | DatePicker와 동일한 날짜 UI, 시·분 변경 콜백, 날짜 해제 후 시간 유지, 빈 날짜에 시간만 선택, 레이블·오류·disabled 전달 |
| 키보드·폼           | Enter·Space·방향키·Escape·외부 클릭, 포커스 복귀, 날짜·월·시·분 조작 중 폼이 제출되지 않음                             |
| 기존 필터           | 게시글·댓글 검색과 댓글 CONTENT 기본값 유지, 시험후기 범위·초기값·검색·초기화 유지                                     |
| 회원                | 생년월일 변경 결과 저장, 과거 연도 이동, 해제 후 기존 검증, 오류 스크롤·포커스                                         |
| 일정                | 미지급·작성 기간·서버 점검 생성·수정·초기화, 모달 재열기 값 갱신, 팝업·예약 지급 콜백                                  |
| API 값              | 선택일과 시간이 기존 요청 빌더 결과에서 그대로 유지됨. API별 구분자·초 단위 유지                                       |
| 시간대              | Asia/Seoul과 America/Los_Angeles에서 같은 초기 날짜·선택일·요청 날짜 유지                                              |
| 화면 너비           | 390px·768px·1440px에서 선택칸·시·분 배치·Popover 경계·모달 스크롤 확인                                                 |

구현 후 공용 변경과 각 화면의 관련 테스트를 실행하고, 전체 작업 마무리 시 다음 검사를 실행한다.

```bash
npm run test:run
npm run lint
npm run build
```

서버 점검의 기존 테스트는 `datetime-local` input을 `fireEvent.change`로 직접 바꾼다. 교체 후에는 실제 달력과 시·분 선택을 조작하도록 수정한다. 테스트를 통과시키기 위해 화면에 사용하지 않는 기본 날짜 input을 남겨 두지 않는다.

실서버에 일정을 생성하거나 회원 정보를 저장하지 않아도 컴포넌트 콜백과 요청 빌더 결과를 검증할 수 있다. 숨겨진 팝업·예약 지급 UI는 테스트 또는 임시 확인 화면에서 실제 컴포넌트를 렌더링해 확인한다.

## 11. 작업 완료 기준

- 모든 날짜 선택 화면이 공용 DatePicker를 통해 shadcn Calendar를 사용한다.
- 날짜·시간 화면은 DateTimePicker 안에서 같은 DatePicker를 재사용한다.
- 한국어 달력·CalendarIcon·전체 클릭·해제·재열기·포커스 동작이 일관된다.
- placeholder와 범위·필수값·기간 검증은 사용처의 요구에 맞게 전달된다.
- 남은 기본 날짜 입력과 중복된 Popover·Calendar 조합이 제거된다.
- 기존 검색·회원 수정·일정 생성 및 수정의 값과 API 요청 형식을 보존한다.
- 관련 테스트와 실제 브라우저 검증 결과를 문서에 기록한다.

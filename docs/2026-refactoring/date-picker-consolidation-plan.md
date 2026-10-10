# 전체 날짜·시간 선택 UI 통일 작업 계획

> 조사 기준: 2026-10-09 현재 소스
>
> 상태: 1~4단계 완료. 총 20개 날짜 필드 공통화와 관련 검증을 완료했다. 전체 테스트의 기존 시험후기 상세 실패 6개는 16절에 기록한다.
>
> 선행 작업: [게시글·댓글 Calendar 교체와 전체 사용처 조사](./post-comment-calendar-plan.md)

## 1. 권장 방향

**모든 날짜 선택은 공용 `DatePicker`를 사용하고, 날짜·시간 선택은 `DatePicker + 시·분 Select`를 조합한 `DateTimePicker`를 사용한다.** 달력 표시와 열기·닫기 동작은 DatePicker 한곳에서 관리한다.

전체 통일은 아이콘만 맞추는 작업을 넘어 한국어 달력, 선택칸 전체 클릭, 날짜 표시, 선택 해제, 월 이동, 키보드 조작, 모바일 배치를 공통으로 제공하는 작업이다. 화면별 placeholder와 필수값·기간 검증은 각 사용처의 요구를 유지한다.

이번 범위는 날짜를 **선택하는 UI**다. 목록의 날짜 출력 형식이나 API별 요청 형식을 한 번에 바꾸지 않는다. 날짜만 선택하는 필드에 시·분 입력을 추가하거나, 기존 시작·종료 필드를 하나의 범위 달력으로 합치지도 않는다.

## 2. 현재 상태와 전체 대상

모든 대상 화면은 DatePicker 또는 DatePicker를 내부에서 재사용하는 DateTimePicker를 사용한다. 한국어 달력·CalendarIcon·전체 클릭·개별 해제·재열기 동작을 공유하며, 일반 날짜는 좌우 화살표로 월을 이동하고 생년월일은 월·연도 드롭다운을 사용한다.

| 화면·기능                    | 현재 구현             | 필드 수                | 목표 구현                                            |
| ---------------------------- | --------------------- | ---------------------- | ---------------------------------------------------- |
| 게시글 작성일 검색           | DatePicker            | 시작·종료 2개          | 확장된 공용 DatePicker 유지                          |
| 댓글 작성일 검색             | DatePicker            | 시작·종료 2개          | 확장된 공용 DatePicker 유지                          |
| 미지급 일정 생성·수정        | DateTimePicker        | 각각 시작·종료, 총 4개 | 공용 DatePicker를 내부에서 재사용하는 DateTimePicker |
| 시험후기 작성 기간 생성·수정 | DateTimePicker        | 각각 시작·종료, 총 4개 | 동일한 DateTimePicker                                |
| 팝업 등록·수정               | DateTimePicker        | 시작·종료 2개          | 동일한 DateTimePicker                                |
| 엑셀 포인트 예약 지급        | 조건부 DateTimePicker | 예약 일시 1개          | 동일한 DateTimePicker                                |
| 시험후기 검색                | DatePicker            | 시작·종료 2개          | DatePicker                                           |
| 회원 생년월일 수정           | DatePicker            | 1개                    | DatePicker(월·연도 드롭다운)                         |
| 서버 점검 일정 생성·수정     | DateTimePicker        | 시작·종료 2개          | DateTimePicker                                       |

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

DateTimePicker는 자체 Popover·Calendar와 달력 열림 상태를 제거했다. 공용 유틸로 외부 Date와 날짜 문자열을 변환하고, 날짜 UI는 DatePicker에 위임하며 시간 선택만 추가한다.

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

일반 검색과 일정 선택은 `2026년 10월`처럼 월·연도를 제목으로 표시하고 좌우 화살표로 월을 이동한다. 공용 DatePicker의 기본값은 `captionLayout='label'`이다.

생년월일을 월 이동 버튼만으로 고르면 수백 번 이동해야 할 수 있다. 생년월일 사용처에서는 같은 DatePicker에 `captionLayout='dropdown'`을 전달해 과거 연도로 바로 이동할 수 있게 한다. 3단계에서 실제 회원 생년월일 화면에도 이 옵션을 연결했다.

일반 일정의 탐색 범위에는 기존 선택값과 미래 일정을 포함한다. 생년월일은 후속 요청에 따라 `maxDate`를 현재 연도의 12월 31일로 설정해 연도 목록이 올해까지만 표시되도록 한다. 올해 안의 월·일은 모두 선택할 수 있으며 오늘 이후 날짜를 별도로 제한하지 않는다.

### 선택 해제와 필수값

날짜 해제는 UI 동작이고 필수값 검증은 폼의 책임이다. 필수 필드도 값을 비운 뒤 다시 선택할 수 있게 하며, 비운 상태로 저장하면 기존 검증 메시지를 표시한다. `required` 레이블이나 버튼으로 대체한 날짜 선택칸만으로 브라우저의 기본 폼 검증이 실행된다고 가정하지 않는다.

선택값을 다시 클릭하는 방식으로 해제되는 동작은 `clearable` 정책과 맞춘다. 해제를 허용하지 않는 사용처가 생기면 해제 버튼과 Calendar의 선택 해제 동작을 모두 막아야 한다.

## 5. 공용 컴포넌트 계약

### DatePicker: 기존 계약을 확장

| prop                                   | 계획                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`, `value`, `onValueChange`         | 기존 유지. `value`는 `yyyy-MM-dd` 또는 `undefined`                                  |
| `name`                                 | 선택적으로 날짜 버튼에 전달. 회원 폼의 기존 필드 이름과 오류 포커스 검색 유지       |
| `placeholder`, `className`, `disabled` | 기존 유지                                                                           |
| `minDate`, `maxDate`                   | `yyyy-MM-dd` 문자열을 선택적으로 전달. 경계 날짜는 선택 가능하며 경계 밖은 비활성화 |
| `clearable`                            | 선택적으로 전달. 기본값 `true`. 모든 해제 경로에 같은 정책 적용                     |
| `captionLayout`                        | 기본값 `label`: 제목과 좌우 화살표. 생년월일은 `dropdown`: 월·연도 선택             |
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
| 수정              | [ui/calendar.tsx](../../src/shared/components/ui/calendar.tsx)                                       | Calendar 루트 컴포넌트를 고정해 월·연도 변경 시 드롭다운 포커스 유지             |
| 수정              | [DateTimePicker.tsx](../../src/shared/components/DateTimePicker.tsx)                                 | 내부 달력을 DatePicker로 교체. 레이블·시·분 이름과 비활성·오류 전달 추가         |
| 신규              | `src/shared/components/DateTimePicker.test.tsx`                                                      | 날짜·시간 선택·해제·초기값·콜백·폼 내부 동작 검증                                |
| 신규              | `src/test/date-time-picker-usage.test.tsx`                                                           | 미지급·작성 기간의 생성·수정 요청과 모달 재열기, 팝업 변경 콜백 검증             |
| 수정              | [use-date-time-field.ts](../../src/shared/hooks/use-date-time-field.ts)                              | 로컬 날짜 파싱 사용, 잘못된 값 방어. 반환값과 콜백 계약 유지                     |
| 신규              | `src/shared/hooks/use-date-time-field.test.ts`                                                       | 초기값·재설정·해제·시간 유지와 시간대별 날짜 조합 검증                           |
| 수정              | [ExamSearch.tsx](../../src/domains/Reviews/components/ExamSearch.tsx)                                | 기본 날짜 입력 2개를 DatePicker로 교체                                           |
| 신규              | `src/domains/Reviews/components/ExamSearch.test.tsx`                                                 | 날짜 범위와 검색·초기화·초기값 검증                                              |
| 수정              | [MemberInfoEditFormFields.tsx](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx) | EditableField에서 `type === 'date'`일 때 DatePicker 사용                         |
| 수정              | [MemberInfoEditForm.tsx](../../src/domains/MemberInfo/components/MemberInfoEditForm.tsx)             | 생년월일 안내 문구 지정, 날짜 버튼으로도 기존 오류 이동·포커스가 동작하는지 확인 |
| 수정              | [MemberInfoEditForm.test.tsx](../../src/domains/MemberInfo/components/MemberInfoEditForm.test.tsx)   | 생년월일 선택·해제·저장값·오류 포커스 검증                                       |
| 수정              | [MaintenanceScheduleForm.tsx](../../src/domains/Operation/components/MaintenanceScheduleForm.tsx)    | 기본 날짜·시간 입력 2개를 DateTimePicker로 교체                                  |
| 신규              | `src/domains/Operation/components/MaintenanceScheduleForm.test.tsx`                                  | 필수값·시간 순서·수정 초기값·생성 및 수정 초기화·저장 문자열 검증                |
| 수정              | [ServerMaintenancePage.test.tsx](../../src/pages/operation/ServerMaintenancePage.test.tsx)           | 기본 input 직접 변경을 실제 날짜·시간 선택으로 교체하고 CRUD·검증 유지 확인      |
| 점검·필요 시 수정 | 기존 DateTimePicker 사용처 6개 파일                                                                  | 새로운 공용 UI에서 초기값·모달·레이아웃·필수 검증·시간 선택 확인                 |
| 수정              | [기존 작업 문서](./post-comment-calendar-plan.md)                                                    | 후속 공통화 완료 후 최신 구조와 사용처 갱신                                      |
| 수정              | [index.css](../../src/index.css)                                                                     | 기본 날짜 입력 제거 후 미사용 `calendar-picker-indicator` 규칙 제거 완료         |
| 수정              | [ExamReviewPeriodPage.test.tsx](../../src/pages/reviews/ExamReviewPeriodPage.test.tsx)               | 목록 오류와 상시 안내 영역 구분, 테스트 간 모의 응답 격리                        |

현재 DateTimePicker 사용처는 아래 7개 파일이다. 기존 6개 파일에 3단계에서 서버 점검 폼을 추가했다.

- [PointFreezeScheduleForm.tsx](../../src/domains/Points/components/PointFreezeScheduleForm.tsx)
- [PointFreezeUpdateConfirmModal.tsx](../../src/domains/Points/components/PointFreezeUpdateConfirmModal.tsx)
- [ExamReviewPeriodScheduleForm.tsx](../../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx)
- [ExamReviewPeriodUpdateConfirmModal.tsx](../../src/domains/Reviews/components/ExamReviewPeriodUpdateConfirmModal.tsx)
- [PopupEditorDialog.tsx](../../src/domains/Operation/components/PopupEditorDialog.tsx)
- [ExcelPointUploadPage.tsx](../../src/pages/points/ExcelPointUploadPage.tsx)
- [MaintenanceScheduleForm.tsx](../../src/domains/Operation/components/MaintenanceScheduleForm.tsx)

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
- `captionLayout='dropdown'`과 현재 연도 12월 31일의 `maxDate`를 전달한다. 연도 목록은 올해에서 끝난다. 필수값과 기존 회원 수정 검증을 유지한다.

### 서버 점검 일정

- 폼의 `draft.startAt`, `draft.endAt`는 기존 로컬 날짜·시간 문자열로 유지한다. DateTimePicker와 `useDateTimeField`의 상태에서 draft를 파생해 저장한다. 날짜·시간 값을 별도 draft state에 중복 저장하지 않는다.
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

교체 전 `useDateTimeField`는 날짜 부분을 `new Date('yyyy-MM-dd')`로 파싱했다. 날짜 전용 문자열은 UTC 기준으로 해석되어, 음수 오프셋 시간대에서 로컬 형식으로 다시 표시할 때 전날이 될 수 있었다. 1단계에서 공용 로컬 날짜 파싱으로 교체했다.

- DatePicker, DateTimePicker 어댑터, useDateTimeField가 같은 날짜 선택용 함수를 사용한다.
- 날짜 형식과 실제 날짜 유효성을 검증한다. 잘못된 초기값으로 `format`을 호출해 렌더링 오류가 발생하지 않게 한다.
- 날짜 선택 결과에 `toISOString().slice(0, 10)`을 사용하지 않는다. 날짜와 시간을 UTC로 바꿔 저장하는 새 정책을 도입하지 않는다.
- 날짜 해제 시 날짜·시간 조합 문자열은 `''`이며, 기존 시간은 유지한다. 전체 reset은 기존처럼 날짜 없음·시간 `00:00`으로 돌아간다.
- 미지급 일정·포인트 예약 요청의 공백 구분 초 단위 형식과 작성 기간 요청의 `T` 구분 초 단위 형식은 기존 도메인 요청 빌더에서 유지한다.

참조: [포인트 요청 빌더](../../src/domains/Points/utils/point-request-builders.ts), [작성 기간 요청 빌더](../../src/domains/Reviews/utils/exam-review-period-request-builders.ts)

## 9. 적용 순서와 체크리스트

### 1단계: 값 처리와 공용 날짜 선택기

- [x] 공용 로컬 날짜 파싱·변환 함수를 추가하고 유효성·윤년·빈 값·시간대 검증을 작성한다.
- [x] useDateTimeField의 UTC 날짜 파싱을 교체하고 초기값·해제·reset·setDateTime 계약을 검증한다.
- [x] DatePicker에 범위·접근성·오류·해제 정책과 월·연도 탐색을 추가한다.
- [x] 기존 게시글·댓글 테스트와 실제 클릭 동작이 유지되는지 확인한다.

### 2단계: 날짜·시간 선택기의 내부 공통화

- [x] DateTimePicker의 달력 표시를 DatePicker로 교체한다.
- [x] 날짜 레이블 연결, 시·분 이름, 버튼 type, 비활성·오류 전달, 좁은 화면 배치를 적용한다.
- [x] 미지급 일정과 작성 기간의 생성·수정부터 확인하고 팝업·예약 지급까지 검증한다.

### 3단계: 남은 기본 입력 교체

- [x] 시험후기 검색에 DatePicker를 적용하고 기존 min/max·기간 검증을 보존한다.
- [x] 회원 생년월일에 DatePicker를 적용하고 과거 연도 이동·오류 포커스·저장값을 검증한다.
- [x] 서버 점검에 DateTimePicker를 적용하고 생성·수정·초기화·필수값·시간 순서 검증을 보존한다.

### 4단계: 전체 확인과 문서 갱신

- [x] `src`에 기본 date·datetime-local 입력과 동적 `inputType: 'date'`의 기본 입력 경로가 남지 않았는지 검색한다.
- [x] Calendar를 직접 렌더링하는 제품 컴포넌트가 DatePicker 한곳인지 확인한다.
- [x] 미사용 기본 날짜 아이콘 CSS를 정리한다.
- [x] 관련 테스트, 린트, 타입 검사·빌드를 실행한다.
- [x] 실제 브라우저에서 화면·모달·모바일·키보드·시간대를 확인한다.
- [x] 기존 교체 문서와 이 문서의 사용처·완료 체크리스트를 갱신한다.

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

서버 점검의 교체 전 테스트는 `datetime-local` input을 `fireEvent.change`로 직접 바꿨다. 3단계에서 실제 달력과 시간 Select를 조작하도록 수정했다. 테스트를 통과시키기 위해 화면에 사용하지 않는 기본 날짜 input을 남겨 두지 않는다.

실서버에 일정을 생성하거나 회원 정보를 저장하지 않아도 컴포넌트 콜백과 요청 빌더 결과를 검증할 수 있다. 숨겨진 팝업·예약 지급 UI는 테스트 또는 임시 확인 화면에서 실제 컴포넌트를 렌더링해 확인한다.

## 11. 작업 완료 기준

- 모든 날짜 선택 화면이 공용 DatePicker를 통해 shadcn Calendar를 사용한다.
- 날짜·시간 화면은 DateTimePicker 안에서 같은 DatePicker를 재사용한다.
- 한국어 달력·CalendarIcon·전체 클릭·해제·재열기·포커스 동작이 일관된다.
- placeholder와 범위·필수값·기간 검증은 사용처의 요구에 맞게 전달된다.
- 남은 기본 날짜 입력과 중복된 Popover·Calendar 조합이 제거된다.
- 기존 검색·회원 수정·일정 생성 및 수정의 값과 API 요청 형식을 보존한다.
- 관련 테스트와 실제 브라우저 검증 결과를 문서에 기록한다.

## 12. 1단계 작업 결과

### 값 처리와 훅

[date-picker-utils.ts](../../src/shared/utils/date-picker-utils.ts)에 `parseDateValue`, `formatDateValue`, `parseLocalDateTime`을 추가했다. 날짜는 `yyyy-MM-dd` 형식과 실제 날짜 유효성을 함께 검사하고 로컬 자정으로 파싱한다. 날짜·시간 입력은 날짜 전용 값 또는 `T`로 구분한 로컬 일시를 받으며, 초·소수 초가 있으면 기존 훅처럼 분 단위 시간만 사용한다. UTC 오프셋이나 `Z`가 붙은 값은 로컬 일시 계약에 맞지 않으므로 유효하지 않은 입력으로 처리한다.

[useDateTimeField](../../src/shared/hooks/use-date-time-field.ts)는 공용 함수를 사용한다. 날짜 해제 후 시간 유지, reset의 `00:00` 복귀, `setDateTime`과 개별 setter의 콜백 미호출 계약을 유지했다. 잘못된 초기값이나 `Invalid Date`는 빈 날짜로 처리해 렌더링 오류를 방지한다.

### 공용 DatePicker

- `minDate`, `maxDate`는 경계를 포함하며 범위 밖 날짜를 비활성화한다. 범위 밖 기존 값은 부모 상태를 자동 변경하지 않고, 달력을 열 때 표시 월만 유효 범위로 이동한다. 최소일이 최대일보다 늦으면 모든 날짜 선택을 막는다.
- `clearable`의 기본값은 `true`다. `false`이면 해제 버튼과 선택한 날짜 재클릭을 통한 해제를 모두 막는다.
- `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`를 날짜 버튼에 전달한다. 달력 팝업에도 이름과 설명을 연결한다.
- 한국어 월·연도 드롭다운을 추가했다. 이후 14절의 조정으로 기본은 좌우 화살표이며 드롭다운은 사용처가 선택하는 옵션이다. 업무 제한이 없으면 현재 연도·선택 연도·탐색 연도에서 앞뒤 100년을 제공하고, 탐색에 따라 확장한다. 연도는 1~9999 안에서 이동하며, 이 탐색 범위를 업무상 최소·최대일 제한으로 사용하지 않는다.
- [Calendar 루트](../../src/shared/components/ui/calendar.tsx)를 별도 컴포넌트로 고정했다. 월·연도 변경 때 달력 전체가 다시 마운트되어 드롭다운 포커스를 잃던 동작을 수정했다.

### 검증 결과

| 검증                                                                       | 결과                                                                                                                                     |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 공용 날짜 유틸·훅·DatePicker, 게시글·댓글 필터, 포인트·작성 기간 요청 빌더 | 7개 파일 74개 테스트가 `Asia/Seoul`, `America/Los_Angeles`에서 각각 통과                                                                 |
| 추가 일정 페이지 테스트                                                    | 두 시간대 모두 미지급 일정 2개 통과, 작성 기간 1개 통과·3개 실패. 실패 3개는 변경 전 `HEAD` 소스에서도 동일하게 재현                     |
| 린트·공백 검사                                                             | `npm run lint`, `git diff --check` 통과                                                                                                  |
| 타입 검사·빌드                                                             | `npm run build` 통과. 기존 번들 크기 경고 발생                                                                                           |
| 실제 Chromium                                                              | 1440px·768px·390px 서울, 390px 로스앤젤레스의 4개 환경에서 게시글·댓글 날짜 글자·여백·아이콘 클릭 총 48건 통과                           |
| 추가 브라우저 동작                                                         | 월·연도 이동과 포커스 유지, 범위 경계, 해제 금지, 오류 설명 연결, 선택·초기화·재열기·Escape·외부 클릭·키보드 선택·Popover 화면 경계 확인 |

1단계 대상 테스트 명령은 다음과 같다. `TZ`를 `America/Los_Angeles`로 바꿔 같은 검증을 실행했다.

```bash
TZ=Asia/Seoul npm run test:run -- \
  src/shared/utils/date-picker-utils.test.ts \
  src/shared/hooks/use-date-time-field.test.ts \
  src/shared/components/DatePicker.test.tsx \
  src/domains/Posts/components/PostFilterPanel.test.tsx \
  src/domains/Comments/components/CommentFilterPanel.test.tsx \
  src/domains/Points/utils/point-request-builders.test.ts \
  src/domains/Reviews/utils/exam-review-period-request-builders.test.ts
```

추가 실행한 [ExamReviewPeriodPage.test.tsx](../../src/pages/reviews/ExamReviewPeriodPage.test.tsx)의 기존 실패는 1단계 당시 별도 보수가 필요했다. 첫 실패는 조회 오류 대신 상시 노출되는 안내 영역의 `alert`를 선택해 발생했다. 빈 목록 및 일정 표시 검증도 변경 전 소스에서 동일하게 실패했다. 1단계에서는 해당 테스트를 수정하지 않았으며, 4단계에서 오류 영역 선택과 모의 응답 격리를 보정해 해결했다(16절 참조).

## 13. 2단계 작업 결과

### 내부 공통화와 접근성

[DateTimePicker.tsx](../../src/shared/components/DateTimePicker.tsx)는 DatePicker와 시·분 Select를 조합한다. 기존 `Date | undefined`, `HH:mm`, `onDateSelect`, `onTimeChange`, `datePlaceholder`, `required`, `className` 계약을 유지한다. `formatDateValue`와 `parseDateValue`로 날짜만 변환하므로 음수 오프셋 시간대에서도 선택일이 바뀌지 않는다.

- 날짜 전체 클릭, 한국어 달력, 월 이동, 선택·해제 후 닫기, 재열기 기준 월, CalendarIcon은 DatePicker가 담당한다. 기본 탐색 방식은 14절의 조정에 따라 좌우 화살표다.
- `useId`로 날짜·시·분에 고유 id를 부여하고 Label을 날짜 버튼에 연결했다. 날짜는 해당 label, 시간은 `${label} 시`, `${label} 분`으로 접근성 이름을 제공한다.
- `disabled`, `aria-describedby`, `aria-invalid`를 추가해 날짜와 시·분 입력에 함께 전달한다.
- 날짜·시·분 버튼은 `type='button'`이며 선택 중 폼을 제출하지 않는다. 필수 레이블은 기존처럼 표시하고, 필수 날짜도 비운 뒤 화면의 기존 저장 검증을 사용한다.
- 날짜 해제는 `onDateSelect(undefined)`로 전달하며 시·분을 유지한다. 시간만 바꿨을 때 날짜를 임의로 채워 넣지 않는다.

### 공간에 따른 배치

DateTimePicker 자체의 가용 너비를 container query로 확인한다. 24rem 이상이면 날짜와 시간 그룹을 한 줄에 두고, 좁으면 날짜를 첫 줄·시와 분을 둘째 줄에 둔다. 화면 전체가 넓어도 폭이 좁은 수정 모달에서는 두 줄을 사용한다.

[PointFreezeScheduleForm.tsx](../../src/domains/Points/components/PointFreezeScheduleForm.tsx)와 [ExamReviewPeriodScheduleForm.tsx](../../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx)는 시작·종료 필드를 모바일에서 세로로 배치하고 `sm` 이상에서 두 열로 배치한다. 날짜 placeholder와 저장·초기화 정책은 유지한다.

### 사용처 검증

[DateTimePicker.test.tsx](../../src/shared/components/DateTimePicker.test.tsx)에 10개 테스트를 추가했다. 날짜·시간 선택, 로컬 Date 콜백, 두 해제 경로, 시·분 보존, 빈 날짜, 외부 값 변경, 잘못된 Date, 고유 id·레이블, 비활성·오류, 폼 제출 방지를 검증한다. 예약 지급은 현재 화면의 선택 옵션이 숨겨져 있어 같은 DateTimePicker·훅·요청 빌더 조합으로 선택 결과와 `reservedAt` 형식을 확인한다.

[date-time-picker-usage.test.tsx](../../src/test/date-time-picker-usage.test.tsx)에 실제 사용처를 렌더링하는 5개 테스트를 추가했다. 미지급 일정·작성 기간의 필수값 검증, 생성 후 초기화, 수정 모달을 다른 일정으로 다시 열 때 초기값, 저장 요청의 공백·`T` 구분과 초 단위를 확인했다. 팝업은 날짜·시간 변경과 해제 콜백, 외부 초기값 변경을 확인했다. API와 mutation은 테스트에서 모의 처리한다.

1단계 대상 7개 파일에 위 두 파일을 추가한 **9개 파일 89개 테스트**가 `Asia/Seoul`, `America/Los_Angeles`에서 각각 통과했다. `npm run lint`, `npm run build`도 통과했으며 빌드에는 기존 번들 크기 경고가 남아 있다. 1단계에서 확인한 작성 기간 페이지의 기존 테스트 실패는 이번 검증 대상에 포함하지 않았다.

실제 Chromium에서도 다음 검증을 완료했다.

| 검증          | 결과                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 환경          | 1440px·768px·390px 서울, 390px 로스앤젤레스의 4개 환경 통과                                                                       |
| 클릭 영역     | 생성 폼 4개·수정 모달 4개·팝업 2개·예약 지급 1개 날짜 필드에서 글자·여백·아이콘 클릭 총 132건 통과                                |
| 달력·키보드   | 한국어 월·연도 탐색, 선택·해제, Escape 닫기와 포커스 복귀, 방향키·Enter 날짜 선택, 선택 중 폼 제출 없음 확인                      |
| 상태·값       | 생성 폼 초기화, 수정 모달을 다른 일정으로 다시 열기, 날짜 해제 후 시·분 유지, 예약 지급 요청값, 오류 설명·비활성 전달 확인        |
| 배치          | 생성 폼의 화면별 열 수, DateTimePicker의 가용 너비에 따른 줄바꿈, 날짜·시간과 팝업의 화면 경계 확인. 모바일 모달과 달력 캡처 확인 |
| 브라우저 오류 | 발생 없음                                                                                                                         |

브라우저 검증은 실제 생성 폼·수정 모달·팝업 컴포넌트와 예약 지급용 DateTimePicker·훅·요청 빌더 조합을 임시 확인 화면에서 렌더링해 수행했다. 실서버 저장은 실행하지 않았으며 임시 확인 화면은 제거했다.

## 14. 기본 달력 탐색 방식 조정

일반 날짜 선택에는 월·연도 드롭다운이 필요하지 않다는 사용자 의견을 반영해 DatePicker의 기본 `captionLayout`을 `label`로 변경했다. 현재 게시글·댓글과 모든 DateTimePicker 사용처는 제목과 좌우 화살표를 표시한다. 같은 공용 DatePicker의 `captionLayout='dropdown'` 옵션은 생년월일처럼 먼 과거 연도를 선택할 때 사용할 수 있다.

기존 드롭다운 테스트는 옵션을 명시해 유지하고, 기본 제목·드롭다운 미표시·좌우 이동·12월에서 다음 해 1월 이동을 검증했다. DateTimePicker와 일정 사용처 테스트도 화살표로 날짜를 고르도록 변경했다. 날짜 값·시간 선택·해제 정책은 유지한다.

관련 5개 파일의 46개 테스트가 서울·로스앤젤레스 시간대에서 각각 통과했고, 타입 검사·빌드도 통과했다. 12~13절의 테스트 수와 드롭다운 브라우저 결과는 각 단계 당시의 검증 기록이다.

Chromium의 1440px·768px·390px 서울과 390px 로스앤젤레스 환경에서 날짜 전용·날짜와 시간 필드의 글자·여백·아이콘 클릭 24건, 좌우 월 이동과 연도 경계, 날짜 선택·시간 유지·포커스 복귀를 확인했다. 생년월일용 드롭다운 옵션과 모바일 화면 경계도 정상 동작했으며 브라우저 오류는 없었다. 임시 확인 화면은 제거했다.

## 15. 3단계 작업 결과

### 남은 기본 입력 교체

- [ExamSearch.tsx](../../src/domains/Reviews/components/ExamSearch.tsx)의 검색 시작일·종료일을 DatePicker로 교체했다. 시작일의 `maxDate`, 종료일의 `minDate`로 경계를 포함한 기존 제한을 연결한다. 해제는 기존 state의 `''`로 변환하며, 검색 버튼을 눌렀을 때만 날짜 문자열을 전달한다. 역전 기간의 기존 toast 검증과 필터 초기화도 유지한다.
- [MemberInfoEditFormFields.tsx](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx)의 EditableField는 날짜일 때 DatePicker를 사용한다. 월·연도 드롭다운과 `생년월일 선택` 안내를 적용했다. DatePicker에 `name` prop을 추가해 기존 `name='birthday'`, Label, 오류 설명 연결을 유지한다. 기존 `focusFirstInvalidField`는 HTMLElement를 대상으로 하므로 날짜 버튼에도 그대로 동작한다. 생년월일 저장 문자열과 해제 후 필수값 검증을 유지하고 미래 날짜 제한을 새로 추가하지 않았다.
- [MaintenanceScheduleForm.tsx](../../src/domains/Operation/components/MaintenanceScheduleForm.tsx)의 시작·종료 입력을 DateTimePicker로 교체했다. 제목 state와 두 날짜·시간 훅에서 저장용 draft를 조합한다. 초기화는 각 훅의 `setDateTime`과 제목을 함께 복원한다. 기존 수정 페이지의 일정 id 기반 `key`로 새 초기값을 반영하며, 취소와 생성 후 초기화도 유지한다. 저장값은 기존 `yyyy-MM-ddTHH:mm`, 제목 trim과 필수값·`종료 > 시작` 검증을 유지한다. 날짜·시·분 모두 오류 설명을 연결하고 폼별 id를 고유하게 만들었다.

### 검증 결과

| 검증                              | 결과                                                                                                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3단계 화면 테스트                 | 검색 5개, 회원 폼 3개, 점검 폼 8개, 점검 페이지 2개로 총 18개 통과                                                                                                               |
| 공용 변경과 이전 사용처 회귀 검증 | 날짜 유틸·훅·DatePicker·DateTimePicker·게시글·댓글·일정 사용처·요청 빌더·회원 검증을 포함한 15개 파일 129개 테스트가 서울·로스앤젤레스에서 각각 통과                             |
| 정적 검사                         | `npm run lint`, `npm run build`, `git diff --check` 통과. 기존 번들 크기 경고 유지                                                                                               |
| 실제 Chromium                     | 1440px·768px·390px 서울과 390px 로스앤젤레스에서 다섯 날짜 필드의 글자·여백·아이콘 클릭 총 60건 통과                                                                             |
| 브라우저 동작                     | 검색 경계·같은 날짜·검색 및 초기화, 생년월일 과거 연도·윤일 선택과 저장 문자열, 해제 후 오류 포커스·재선택, 점검 시간 순서 검증·생성·수정·삭제·초기화·수정 초기값·팝업 경계 확인 |
| 기본 입력·브라우저 오류           | 확인 화면의 기본 date·datetime-local 입력 없음. 브라우저 오류 없음                                                                                                               |

서버 점검 페이지 테스트는 기본 일시 input을 직접 변경하는 대신 공용 달력과 Select에서 실제 값을 선택한다. 회원 폼의 생년월일 저장은 콜백으로 검증했고, 브라우저의 점검 CRUD는 기존 임시 데이터 페이지에서 실행했다. 실서버 회원 정보나 일정을 저장하지 않았으며 임시 확인 화면은 제거했다.

3단계 검증은 위 관련 테스트 대상에 한정했다. 당시 남아 있던 작성 기간 페이지 테스트 실패와 미사용 날짜 아이콘 CSS는 4단계에서 정리했다. 전체 테스트 결과는 16절에 기록한다.

## 16. 4단계 작업 결과

### 사용처 감사와 정리

제품 소스의 날짜 전용 7개·날짜와 시간 13개, 총 20개 필드를 다시 확인했다. 기본 `date`·`datetime-local` 입력과 `showPicker`는 남아 있지 않다. 제품 컴포넌트의 `<Calendar>` 렌더링은 DatePicker 한곳이며 DateTimePicker도 이를 재사용한다. `ui/calendar.tsx`는 공용 Calendar 원형을 제공한다.

회원 폼의 `inputType: 'date'`는 필드 구분용 설정으로 남아 있다. [MemberInfoEditFormFields.tsx](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx)의 날짜 분기에서 DatePicker를 렌더링하므로 기본 입력으로 이어지지 않는다. 회원 정보의 `CalendarDays`는 항목 설명 아이콘이며 날짜 선택칸의 공통 CalendarIcon과 역할이 다르다.

[index.css](../../src/index.css)의 미사용 `input[type='date']::-webkit-calendar-picker-indicator` 규칙을 제거했다. 화면별 placeholder·필수값·기간 제한과 API 요청 형식은 기존 정책을 유지한다. 최신 대상과 사용처 파일은 2절과 6절을 참조한다.

### 관련 테스트 보정과 전체 결과

[ExamReviewPeriodPage.test.tsx](../../src/pages/reviews/ExamReviewPeriodPage.test.tsx)는 상시 안내의 `alert` 대신 조회 목록 안의 오류 `alert`를 검증하도록 수정했다. 재시도 성공 후에는 목록 오류가 사라지고 안내는 계속 표시되는지 확인한다. `vi.resetAllMocks()`로 테스트 사이에 남는 일회성 모의 응답도 제거했다. 페이지의 네 테스트가 모두 통과하며 제품 동작을 바꾸지는 않았다.

| 검증                    | 결과                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| 달력과 사용처 회귀 검증 | 16개 파일 133개 테스트가 서울·로스앤젤레스 시간대에서 각각 통과                                    |
| 전체 테스트             | 56개 파일 415개 중 409개 통과, 기존 시험후기 상세 테스트 6개 실패                                  |
| 변경 전 재현            | 변경 전 `HEAD`를 별도 임시 경로에 추출해 상세 테스트 2개 파일을 실행한 결과, 17개 중 같은 6개 실패 |

전체 테스트는 `TZ=Asia/Seoul npm run test:run -- --maxWorkers=4`, 관련 테스트는 같은 실행 명령에 16개 관련 파일을 지정하고 `TZ=America/Los_Angeles`에서도 실행했다. 병렬 작업에 따른 상호작용 테스트 시간 초과를 피하도록 worker 수를 제한했다.

남은 실패는 다음 두 파일에 있으며 날짜 선택 UI와 무관하다. 전체 테스트가 통과한 상태로 기록하지 않는다.

- [ExamDetailSection.test.tsx](../../src/domains/Reviews/components/ExamDetailSection.test.tsx): 복구 관련 네 테스트가 복구 버튼을 찾지 못하고, 삭제 관련 한 테스트는 삭제 API 호출을 확인하지 못한다.
- [ExamReviewDetailInfoSection.test.tsx](../../src/domains/Reviews/components/ExamReviewDetailInfoSection.test.tsx): 파일명 변경 버튼을 기대하지만 현재 화면은 `파일 변경`으로 표시한다.

### 브라우저와 정적 검사

Chromium에서 실제 필터·회원 폼·일정 생성 폼·점검 페이지·수정 모달·팝업을 렌더링했다. 숨겨진 예약 지급은 기존 DateTimePicker·훅·요청 빌더 조합으로 확인했다.

| 검증                | 결과                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 환경                | 1440px·768px·390px 서울, 390px 로스앤젤레스의 4개 환경 통과                                                                                                  |
| 클릭 범위           | 20개 날짜 필드 × 글자·여백·아이콘 × 4개 환경, 합계 240건 통과                                                                                                |
| 탐색·닫기           | 일반 달력의 좌우 월 이동, 생년월일의 월·연도 드롭다운, Escape 닫기와 트리거 포커스 복귀 확인                                                                 |
| 값과 키보드         | 생년월일 과거 연도·윤일 저장 문자열, 시험후기 같은 날짜와 경계, Space·방향키·Enter 선택, 날짜 해제 후 시·분 유지, 예약 지급 요청값·선택 중 폼 제출 없음 확인 |
| 배치                | 모든 날짜 선택칸과 달력의 화면 경계 확인, 모바일 수정 모달 캡처 확인                                                                                         |
| 기본 입력·실행 오류 | 기본 date·datetime-local 입력 없음. 브라우저 실행 오류 없음                                                                                                  |
| 정적 검사           | `npm run lint`, `npm run build` 통과. 빌드에는 기존 번들 크기 경고 유지                                                                                      |

실서버 저장은 실행하지 않았으며 임시 확인 화면은 제거했다. 모든 단계의 달력 UI 통일과 관련 검증을 완료했다. 위에 기록한 기존 시험후기 상세 테스트 보수는 별도 작업으로 남는다.

## 17. 생년월일 연도 범위와 목록 높이 조정

회원 정보 편집에서 미래 연도가 불필요하다는 후속 요청을 반영했다. [MemberInfoEditFormFields.tsx](../../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx)의 생년월일에만 `maxDate`를 `${현재 연도}-12-31`로 전달한다. 다른 날짜·일정의 탐색 범위는 기존대로 유지한다.

회원 폼의 기존 생년월일 선택 테스트에 연도 목록의 마지막 항목이 올해인지, 내년 항목이 없는지, 올해 12월에서 다음 달 이동이 막히고 12월 31일은 선택 가능한지 검증을 추가했다. 과거 연도·윤일 선택과 저장 문자열 검증도 유지한다. 12~16절의 결과는 각 단계 당시의 검증 기록이다.

연도 목록이 화면 높이를 차지하지 않도록 [ui/calendar.tsx](../../src/shared/components/ui/calendar.tsx)의 월·연도 Dropdown을 공용 shadcn Select로 교체했다. 두 목록의 최대 높이를 동일하게 16rem(256px)로 제한하고, 화면의 가용 높이가 더 작으면 그 높이에 맞춘다. 긴 목록은 내부에서 스크롤하며 한국어 이름·선택 범위·비활성 항목과 월 이동 콜백을 유지한다.

관련 DatePicker·DateTimePicker·회원 폼 테스트 35개가 서울·로스앤젤레스 시간대에서 각각 통과했다. Chromium의 1440px 서울, 390px 서울·로스앤젤레스에서 두 목록의 실제 높이가 모두 256px인지 확인했다. Escape 닫기·포커스 복귀, 키보드 End·Enter 선택, 과거 연도·윤일 선택, 올해 12월 경계와 일반 일정의 미래 날짜 탐색도 통과했다. 브라우저 실행 오류는 없었으며 임시 확인 화면은 제거했다.

`npm run lint`, `npm run build`도 통과했으며 빌드에는 기존 번들 크기 경고가 남아 있다.

# 게시글·댓글 관리 shadcn Calendar 교체 작업 계획

> 조사 기준: 2026-10-09 현재 소스
>
> 상태: 공용 DatePicker 추가와 두 필터 교체 완료. 테스트·타입 검사·빌드·린트·브라우저 확인 완료.

## 1. 목표와 적용 범위

게시글 관리와 댓글 관리의 **작성일 기간 > 시작일·종료일**을 shadcn Calendar 기반 날짜 선택 UI로 교체한다. 날짜 표시, 빈 여백, 달력 아이콘을 포함한 **날짜 선택칸 전체**를 클릭하면 달력이 열린다.

시작일과 종료일은 각각 단일 날짜를 선택한다. 두 날짜를 한 달력에서 고르는 범위 선택 UI는 이번 계획에 포함하지 않는다.

## 2. 교체 전 구현

| 대상                  | 현재 구현                                                | 확인 결과                                                               |
| --------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| 게시글 관리           | `PostFilterPanel`의 시작일·종료일 `Input type='date'`    | 브라우저 기본 달력 사용                                                 |
| 댓글 관리             | `CommentFilterPanel`의 시작일·종료일 `Input type='date'` | 브라우저 기본 달력 사용                                                 |
| 앞서 반영한 클릭 처리 | `onClick={(e) => e.currentTarget.showPicker?.()}`        | 입력칸 클릭으로 기본 달력을 열지만 shadcn Calendar로 교체한 상태는 아님 |
| 공용 Calendar         | `src/shared/components/ui/calendar.tsx`                  | `react-day-picker` 기반 컴포넌트가 이미 있음                            |
| 공용 Popover·Button   | `src/shared/components/ui/popover.tsx`, `button.tsx`     | 날짜 선택칸 전체를 트리거로 구성할 수 있음                              |
| 기존 DateTimePicker   | `src/shared/components/DateTimePicker.tsx`               | Calendar·Popover·Button 조합을 이미 사용하지만 시·분 선택이 함께 있음   |

`Input`이 shadcn 기반이어도 `type='date'`의 달력은 브라우저가 제공한다. 실제 달력 UI를 교체하려면 해당 입력을 `Popover + Button + Calendar` 조합으로 바꿔야 한다.

Calendar, Popover, Button, `date-fns`, `react-day-picker`, `lucide-react`가 이미 준비되어 있어 이번 교체를 위한 새 패키지 설치는 필요하지 않다.

## 3. 수정할 파일

| 구분 | 파일                                                                                             | 작업 내용                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 신규 | `src/shared/components/DatePicker.tsx`                                                           | 날짜만 선택하는 공용 컴포넌트 추가. 열림 상태, 전체 클릭 트리거, 날짜 변환, 선택 해제를 담당 |
| 수정 | [공용 컴포넌트 index](../../src/shared/components/index.ts)                                      | `DatePicker` export 추가                                                                     |
| 수정 | [PostFilterPanel.tsx](../../src/domains/Posts/components/PostFilterPanel.tsx)                    | 시작일·종료일의 `Input type='date'` 두 개를 `DatePicker`로 교체하고 `showPicker()` 제거      |
| 수정 | [CommentFilterPanel.tsx](../../src/domains/Comments/components/CommentFilterPanel.tsx)           | 시작일·종료일의 `Input type='date'` 두 개를 `DatePicker`로 교체하고 `showPicker()` 제거      |
| 신규 | `src/shared/components/DatePicker.test.tsx`                                                      | 날짜 선택·해제, 열기·닫기, 초기값과 잘못된 값 처리를 검증                                    |
| 수정 | [PostFilterPanel.test.tsx](../../src/domains/Posts/components/PostFilterPanel.test.tsx)          | 선택한 날짜가 검색 필터로 전달되고 초기화되는지 검증                                         |
| 수정 | [CommentFilterPanel.test.tsx](../../src/domains/Comments/components/CommentFilterPanel.test.tsx) | 선택한 날짜와 댓글 기본 검색 범위가 유지되는지 검증                                          |

### 재사용할 파일

- [calendar.tsx](../../src/shared/components/ui/calendar.tsx): `Calendar`를 `mode='single'`로 사용한다.
- [popover.tsx](../../src/shared/components/ui/popover.tsx): 저장소의 `Popover.Trigger`, `Popover.Content` 표기법을 사용한다.
- [button.tsx](../../src/shared/components/ui/button.tsx): 날짜 선택칸 전체를 `Button`으로 구성한다.
- [DateTimePicker.tsx](../../src/shared/components/DateTimePicker.tsx): 조합과 선택 후 닫기 동작을 참고한다. 날짜 전용 컴포넌트를 별도로 만들어 시간 선택 사용처에 영향을 주지 않는다.

검색 파라미터의 `startDate?: string`, `endDate?: string` 타입과 페이지·API 연결은 유지한다. 기본 날짜 입력용 전역 CSS는 이 두 필드의 교체를 위해 수정할 필요가 없다.

## 4. 컴포넌트 구조와 계약

```text
PostFilterPanel / CommentFilterPanel
  작성일 기간
    Label(시작일) + DatePicker
    Label(종료일) + DatePicker

DatePicker
  Popover
    Popover.Trigger(asChild)
      Button(type='button', id)
        날짜 문자열 또는 안내 문구
        CalendarIcon
    Popover.Content
      Calendar(mode='single')
      날짜 선택 해제 버튼
```

| prop            | 타입                                   | 역할                                    |
| --------------- | -------------------------------------- | --------------------------------------- |
| `id`            | `string`                               | 기존 `Label htmlFor`와 트리거 버튼 연결 |
| `value`         | `string \| undefined`                  | 부모가 관리하는 `yyyy-MM-dd` 날짜 값    |
| `onValueChange` | `(value: string \| undefined) => void` | 날짜 선택 또는 해제 결과 전달           |
| `placeholder`   | `string`, 선택                         | 빈 값 안내. 기본값은 `날짜 선택`        |
| `disabled`      | `boolean`, 선택                        | 선택칸과 달력 열기 비활성화             |
| `className`     | `string`, 선택                         | 사용처의 너비·배치 조정                 |

필터 값은 부모의 `filters`에서 관리하고, `DatePicker`는 Popover 열림 상태와 달력에 표시할 월을 관리한다. 선택한 날짜를 별도 state에 복제하지 않아 전체 초기화와 초기 필터 표시가 같은 값에 따라 동작하게 한다. 열 때마다 표시할 월을 선택일 또는 현재 월로 설정해 닫기 애니메이션 중에 다시 열어도 올바른 월을 표시한다.

## 5. 클릭·선택 동작

1. 선택칸 전체를 하나의 `Popover.Trigger asChild > Button`으로 만든다. 아이콘에만 클릭 핸들러를 붙이지 않는다.
2. 날짜 글자, 선택칸 내부 여백, 아이콘 중 어디를 클릭해도 같은 달력이 열린다. 검색 패널 전체나 날짜 라벨 주변 바깥 여백은 트리거 범위가 아니다.
3. `Button`에 `type='button'`을 지정해 날짜 선택 중 폼 제출이 발생하지 않게 한다.
4. 선택칸은 기존 입력과 같은 `h-9` 높이, 전체 너비, 왼쪽 날짜·오른쪽 아이콘 배치로 맞춘다. 빈 값은 `text-muted-foreground`로 표시한다.
5. 달력은 선택된 날짜가 속한 월을 열고, 선택값이 없으면 현재 월을 연다. 한국어 locale을 적용해 월·요일·날짜 안내를 표시한다.
6. 날짜를 선택하면 부모 필터 값을 갱신하고 Popover를 닫는다. 선택만으로 목록 검색을 실행하지 않고 기존 `검색` 버튼 동작을 유지한다.
7. 선택값이 있을 때 Popover 안에 `날짜 선택 해제` 버튼을 제공한다. 누르면 해당 날짜만 `undefined`로 바꾸고 닫는다. 트리거 버튼 안에 별도의 해제 버튼을 중첩하지 않는다.
8. 필터 전체 `초기화`를 누르면 두 날짜 모두 안내 문구로 돌아간다. 댓글의 기본 검색 범위 `CONTENT`도 유지한다.
9. Tab으로 선택칸에 접근하고 Enter·Space로 열 수 있게 한다. Escape·외부 클릭으로 닫히고, 닫힌 뒤 트리거로 포커스가 돌아오는지 확인한다.

날짜를 텍스트로 직접 입력하던 기능은 버튼 기반 날짜 선택으로 전환된다. 개별 선택 해제와 전체 초기화로 날짜 필터를 비울 수 있게 한다. 시작일·종료일 역전 제한은 현재 필터에 없으므로 이번 교체에서 새로 도입하지 않는다.

## 6. 날짜 값 처리

- **필터 저장·검색 전달:** 기존과 같이 `yyyy-MM-dd` 문자열을 사용한다. 미선택·해제는 `undefined`로 전달한다.
- **Calendar에 전달:** `date-fns`의 `parse` 등을 이용해 문자열을 로컬 날짜로 변환한다. 빈 값은 `undefined`로 처리한다.
- **잘못된 초기값:** 날짜 유효성과 형식을 확인한다. 유효하지 않은 날짜는 선택값 없이 표시하고, `format` 호출로 렌더링 오류가 발생하지 않게 한다. 사용자가 날짜를 선택하거나 해제하기 전에는 부모 필터를 자동으로 바꾸지 않는다.
- **Calendar에서 반환:** 선택한 `Date`를 `format(date, 'yyyy-MM-dd')`로 변환해 `onValueChange`에 전달한다.
- **시간대 처리:** 날짜 전용 값에 `toISOString().slice(0, 10)`을 사용하지 않는다. UTC 변환으로 선택일이 하루 앞뒤로 바뀌는 것을 방지한다.

게시글·댓글 패널에서는 `onValueChange`로 각각 `filters.startDate`, `filters.endDate`를 갱신한다. 날짜 변환 로직은 공용 `DatePicker` 안에 두어 네 필드에서 중복하지 않는다.

## 7. 구현 순서

- [x] 공용 `DatePicker`와 export를 추가한다.
- [x] 전체 버튼을 Popover 트리거로 구성하고 단일 날짜 선택·해제·닫기 동작을 구현한다.
- [x] 날짜 문자열 변환, 유효하지 않은 초기값, 한국어 locale을 처리한다.
- [x] 게시글 필터의 시작일·종료일을 교체한다.
- [x] 댓글 필터의 시작일·종료일을 교체한다.
- [x] 기존 `showPicker()`와 날짜 필드 전용 클릭 처리를 제거한다.
- [x] 공용 컴포넌트와 두 필터의 동작 검증을 추가하고 기존 테스트를 실행한다.
- [x] 실제 브라우저에서 클릭 범위, 포커스, 좁은 화면의 달력 위치를 확인한다.

## 8. 완료 기준과 검증

| 확인 항목                                  | 기대 결과                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| 시작일·종료일의 날짜 글자·여백·아이콘 클릭 | 두 화면의 네 필드 모두 shadcn Calendar가 열림                           |
| 날짜 선택                                  | 선택일이 `yyyy-MM-dd`로 표시되고 달력이 닫힘                            |
| 검색                                       | 선택한 시작일·종료일이 기존 문자열 필터로 전달됨                        |
| 초기 필터                                  | 전달된 날짜가 선택칸·달력에 표시되고 해당 월로 열림                     |
| 개별 해제·전체 초기화                      | 해당 날짜 또는 두 날짜가 비워지고 안내 문구가 표시됨                    |
| 월 이동 후 재열기                          | 선택된 날짜의 월로 다시 열림                                            |
| 빈 값·잘못된 날짜 값                       | 렌더링 오류 없이 선택칸과 달력이 열림                                   |
| 키보드                                     | Enter·Space로 열기, 날짜 이동·선택, Escape 닫기와 포커스 복귀 가능      |
| 비활성 상태                                | 선택칸 클릭·키보드로 달력이 열리지 않음                                 |
| 좁은 화면                                  | 날짜 선택칸이 부모 너비 안에 들어가고 Popover가 화면 밖으로 잘리지 않음 |
| 기존 필터                                  | 검색 범위·정렬·상태·게시판·검색·초기화 동작 유지                        |

구현 후 실행할 명령:

```bash
npm run test:run -- src/shared/components/DatePicker.test.tsx src/domains/Posts/components/PostFilterPanel.test.tsx src/domains/Comments/components/CommentFilterPanel.test.tsx
npm run lint
npm run build
```

## 9. 구현 및 검증 결과

- 공용 [DatePicker.tsx](../../src/shared/components/DatePicker.tsx)를 추가하고 두 필터의 네 날짜 선택칸에 적용했다. 시작일·종료일 placeholder는 사용처에서 각각 전달한다.
- 한국어 달력, 개별 선택 해제, 전체 초기화, 잘못된 초기값 처리와 키보드 접근을 구현했다. 날짜는 로컬 날짜로 변환하고 검색에는 `yyyy-MM-dd` 문자열을 전달한다.
- 관련 테스트 3개 파일, 20개 테스트가 통과했다. `npm run lint`, `npm run build`도 통과했다. 빌드에는 큰 번들 크기 안내가 출력된다.
- Chromium에서 1440px·768px·390px 너비를 확인했다. 서울 시간대의 세 너비와 로스앤젤레스 시간대의 390px에서 네 필드 × 세 클릭 위치를 확인해 총 48건이 통과했다.
- 브라우저에서 날짜 선택·검색 전달·개별 해제·전체 초기화·키보드 선택·Escape·외부 클릭 닫기·포커스 복귀·재열기 월 표시·Popover 화면 경계를 확인했다. 브라우저 실행 오류는 없었다.
- 브라우저 검증은 실제 `PostFilterPanel`, `CommentFilterPanel`을 렌더링한 임시 확인 화면에서 진행했다. 로그인과 실서버 API 요청은 검증하지 않았다. 임시 확인 화면은 검증 후 제거했다.

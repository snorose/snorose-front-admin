# Select 공통화 리팩터링 가이드

> 조사 기준: 2026-09-27의 `src` 구현
>
> 목적: 페이지마다 다른 선택 UI를 줄이고, 공통 shadcn `Select`를 기준으로 일관된 모양과 사용 경험을 유지한다.

## 결론

새로운 Select 컴포넌트를 만들 필요는 없다. 이미 [`src/shared/components/ui/select.tsx`](../src/shared/components/ui/select.tsx)에 Radix 기반 공통 구현이 있고, 대부분의 선택 UI가 이를 사용하고 있다.

이번 리팩터링의 우선순위는 다음과 같다.

1. 게시글·댓글 필터의 네이티브 `<select>`를 공통 `Select`로 교체한다.
2. 이미 공통 `Select`를 사용하는 화면은 컴포넌트를 다시 만들지 않고, 라벨·크기·색상·옵션 정의만 맞춘다.
3. 검색형·다중 선택형은 일반 단일 선택과 사용 목적이 다르므로 억지로 `Select`로 합치지 않는다.

## 사용처 조사 결과

| 분류               | 사용처                                                                                                                                                                                                                                                                          | 현재 상태                     | 판단                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------- |
| 네이티브 단일 선택 | [`CommentFilterPanel`](../src/domains/Comments/components/CommentFilterPanel.tsx)                                                                                                                                                                                               | 검색 범위, 정렬, 의심 키워드  | **개선 권장**              |
| 네이티브 단일 선택 | [`PostFilterPanel`](../src/domains/Posts/components/PostFilterPanel.tsx)                                                                                                                                                                                                        | 검색 범위, 정렬, 의심 키워드  | **개선 권장**              |
| 공통 단일 선택     | [`ExamSearch`](../src/domains/Reviews/components/ExamSearch.tsx)                                                                                                                                                                                                                | 정렬·학기·시험 종류·상태 필터 | 유지, 스타일 기준으로 활용 |
| 공통 단일 선택     | [`InquiryReportTable`](../src/domains/InquiryReport/components/InquiryReportTable.tsx), [`InquiryStatusSelect`](../src/domains/InquiryReport/components/InquiryStatusSelect.tsx)                                                                                                | 신고 상태·테이블 필터         | 유지                       |
| 공통 단일 선택     | [`MemberInfoEditFormFields`](../src/domains/MemberInfo/components/MemberInfoEditFormFields.tsx), [`MemberPointAdjustmentDialog`](../src/domains/MemberInfo/components/MemberPointAdjustmentDialog.tsx)                                                                          | 회원 등급·포인트 유형         | 유지                       |
| 공통 단일 선택     | [`DemotionPenaltyTab`](../src/domains/MemberInfo/components/DemotionPenaltyTab.tsx), [`WarnPenaltyTab`](../src/domains/MemberInfo/components/WarnPenaltyTab.tsx), [`PenaltyHistoryAddFields`](../src/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddFields.tsx) | 제재 유형·사유                | 유지                       |
| 공통 단일 선택     | [`PointDetailSection`](../src/domains/Points/components/PointDetailSection.tsx)                                                                                                                                                                                                 | 포인트 유형                   | 유지                       |
| 공통 단일 선택     | [`ExamDegradePanel`](../src/domains/Reviews/components/ExamDegradePanel.tsx), [`ExamWarningPanel`](../src/domains/Reviews/components/ExamWarningPanel.tsx)                                                                                                                      | 처리 사유                     | 유지                       |
| 공통 단일 선택     | [`ExamReviewDetailInfoSection`](../src/domains/Reviews/components/ExamReviewDetailInfoSection.tsx)                                                                                                                                                                              | 상세 정보 수정 필드           | 유지하되 폼 필드 규칙 정리 |
| 공통 단일 선택     | [`DateTimePicker`](../src/shared/components/DateTimePicker.tsx)                                                                                                                                                                                                                 | 시·분 선택                    | 유지. 시간 입력 전용       |
| 검색형 선택        | [`SearchableSelect`](../src/domains/MemberInfo/components/SearchableSelect.tsx)                                                                                                                                                                                                 | 회원 목록 필터, 목록 검색     | **별도 유지**              |
| 다중 선택          | [`ExamMultiSelect`](../src/domains/Reviews/components/ExamMultiSelect.tsx)                                                                                                                                                                                                      | 시험 후기 관리 상태           | **별도 유지**              |

참고로 `rg` 기준 실제 네이티브 `<select>`는 위 두 필터 패널에서만 확인되었다. `selected...`라는 상태명이나 `Select` 문자열만 있는 코드는 선택 UI 사용처로 보지 않았다.

## 개선해야 하는 부분

### 1. 네이티브 `<select>`를 공통 `Select`로 교체

대상은 다음 6개다.

- `CommentFilterPanel`: 댓글 검색 범위, 정렬, 의심 키워드
- `PostFilterPanel`: 게시글 검색 범위, 정렬, 의심 키워드

현재는 `h-9`, `border-gray-200`, `bg-gray-50` 등 화면 안에서 직접 스타일을 지정한다. 이 때문에 공통 `Select`를 사용하는 다른 화면과 높이·포커스·열림 메뉴·색상이 달라질 수 있다.

교체 시 지킬 점:

- `value`와 `onValueChange`를 유지해 현재 필터 동작을 바꾸지 않는다.
- 기존 `value` 조합 문자열(`CREATED_AT|DESC`)은 그대로 사용해도 된다.
- `undefined`를 의미하는 옵션은 빈 문자열 대신 `ALL`, `ALL_SELECTED`처럼 명시적인 값 사용을 우선 검토한다. Radix Select는 빈 문자열을 선택 값으로 사용할 수 없다.
- 검색어 입력 옆의 좁은 Select는 `className='w-auto shrink-0'` 또는 적절한 고정 폭을 지정해 모바일에서 입력 영역을 압박하지 않도록 한다.
- `Label htmlFor`와 `Select.Trigger id`를 연결한다. 현재 검색 범위는 `aria-label`만 사용하므로 화면 라벨과 키보드 탐색 기준을 통일하는 편이 좋다.

### 2. 공통 Select 사용 규칙 정리

이미 `Select`를 쓰는 화면도 다음 규칙을 공통 기준으로 삼는다.

- 폼 필드: `Field.Label` 또는 `Label`을 사용하고 `Select.Trigger`에 `id`를 준다.
- 필터: 별도 시각적 라벨이 없더라도 `aria-label`을 반드시 제공한다.
- 기본 높이: 일반 폼은 `Select.Trigger` 기본 높이(`h-9`)를 사용하고, 필터처럼 밀도가 높은 영역만 `size='sm'`을 검토한다.
- 색상: `gray-*`, `slate-*`, `blue-*`를 화면마다 새로 조합하지 말고 `border-input`, `bg-background`, `text-muted-foreground`, `ring-ring` 등 shadcn 토큰을 우선 사용한다.
- 옵션: 반복되는 옵션은 화면 JSX 안에 흩어놓기보다 도메인 상수 배열로 관리한다. 표시 문구와 서버 값이 섞이지 않도록 `{ value, label }` 형태를 권장한다.
- 상태 배지: `Select.Item` 안에서 배지를 보여줄 때는 `textValue`를 함께 제공해 검색·스크린리더에서 사람이 읽을 수 있는 값을 유지한다. `ExamSearch`가 이미 이 패턴을 사용한다.
- 긴 목록: `Select.Content`에 최대 높이와 세로 스크롤을 지정한다. 학기·시험 종류처럼 목록이 길어질 수 있는 필터가 대상이다.

### 3. 페이지별 스타일 편차 줄이기

현재 [`ExamReviewDetailInfoSection`](../src/domains/Reviews/components/ExamReviewDetailInfoSection.tsx)은 `Select.Trigger`에 `border-gray-200 bg-white px-3`를 직접 추가하고, [`SearchableSelect`](../src/domains/MemberInfo/components/SearchableSelect.tsx)는 `h-11 rounded-2xl`과 `slate/blue` 색상을 별도로 사용한다.

이것은 즉시 기능 리팩터링이 필요한 문제는 아니지만, 공통 UI의 통일성을 목표로 한다면 다음 순서로 정리한다.

1. 일반 단일 선택은 `Select.Trigger` 기본 스타일을 우선 사용한다.
2. 꼭 필요한 경우에만 `size`, `className`으로 폭과 배치만 조정한다.
3. 검색형 선택은 별도 컴포넌트로 유지하되 높이·radius·border·focus 상태를 공통 Select와 맞춘다.

## 개선하지 않아도 되는 부분

### `SearchableSelect`

회원 목록의 회원 등급·전공·입학년도 필터는 옵션 검색이 필요하다. 일반 `Select`로 바꾸면 긴 목록에서 검색 기능을 잃기 때문에 현재의 `Popover + 검색 Input + 옵션 목록` 구조를 유지하는 것이 맞다.

다만 향후 접근성 개선이나 구현 중복이 필요할 때만 `Popover` 내부 목록을 `Command` 기반 공통 검색 선택 컴포넌트로 교체한다. 이번 Select 통합 범위에 포함하지 않는다.

### `ExamMultiSelect`

관리 상태는 여러 값을 동시에 선택하고 전체 선택·해제를 제공한다. Radix `Select`는 단일 값 선택 컴포넌트이므로 대체 대상이 아니다.

현재 구조를 유지하되, 별도 접근성 개선 작업을 할 때 다음을 확인한다.

- `role='option'` 목록에 적합한 키보드 이동과 선택 상태가 제공되는지
- 실제 체크박스의 상태와 행 클릭 상태가 중복되지 않는지
- 전체 선택이 일부 선택 상태일 때 indeterminate를 표현할지

### `DateTimePicker`

시·분 선택은 일반 필터 Select와 목적이 다르지만, 현재 공통 `Select`를 사용하고 있어 추가 통합의 이득이 작다. 시간 옵션 생성과 스크롤 처리는 `DateTimePicker` 책임으로 유지한다.

## 권장 공통 컴포넌트 경계

```text
src/shared/components/ui/Select
  └─ Select의 모양·포커스·메뉴 동작

도메인 컴포넌트
  └─ 옵션 값·표시 문구·업무 상태·API 변환

SearchableSelect / ExamMultiSelect
  └─ 검색 또는 다중 선택처럼 Select가 제공하지 않는 상호작용
```

`shared` 컴포넌트가 `POST_ID`, `CONFIRMED` 같은 업무 값을 알게 만들지 않는다. 공통화의 목표는 모든 선택지를 하나의 컴포넌트로 합치는 것이 아니라, 같은 상호작용에는 같은 모양과 접근성 규칙을 적용하는 것이다.

## 추천 작업 순서

### 1단계: 네이티브 Select 교체

- [x] `CommentFilterPanel`의 3개 `<select>`를 공통 `Select`로 교체
- [x] `PostFilterPanel`의 3개 `<select>`를 공통 `Select`로 교체
- [x] 검색 범위 Select의 라벨·id·필터 입력 연결 확인
- [x] `undefined`, 전체, 기본 정렬값이 기존과 동일하게 동작하는지 테스트

### 2단계: 공통 스타일 기준 적용

- [x] 필터 Select의 높이와 폭 기준 결정
- [ ] `gray-*` 직접 색상을 shadcn 토큰으로 점진적으로 변경
- [ ] 필드 Select의 라벨·disabled·오류 상태 점검
- [ ] 긴 옵션 목록의 최대 높이와 모바일 표시 확인

### 3단계: 회귀 검증

- [ ] 게시글·댓글 필터에서 검색 범위 변경 후 입력 placeholder가 바뀌는지 확인
- [ ] 정렬 방향과 정렬 대상이 기존 API 파라미터와 동일한지 확인
- [ ] `전체` 선택 시 기존처럼 필터가 해제되는지 확인
- [ ] 키보드로 열기, 옵션 이동, 선택, 닫기가 가능한지 확인
- [x] 관련 테스트와 `npm run build`, `npm run lint` 실행

## 최종 판단 기준

앞으로 새로운 선택 UI를 추가할 때 다음 질문으로 컴포넌트를 선택한다.

| 질문                            | 사용할 컴포넌트                              |
| ------------------------------- | -------------------------------------------- |
| 한 번에 하나의 옵션만 고르는가? | 공통 `Select`                                |
| 옵션을 입력해서 찾아야 하는가?  | `SearchableSelect` 계열                      |
| 여러 옵션을 동시에 고르는가?    | `ExamMultiSelect` 계열 또는 별도 MultiSelect |
| 시·분처럼 시간 슬롯을 고르는가? | `DateTimePicker` 내부 Select                 |
| 선택이 아니라 켜기/끄기인가?    | `Switch` 또는 `Checkbox`                     |

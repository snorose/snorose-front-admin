# 날짜/시간과 폼 섹션 리팩터링 체크리스트

> 조사 기준: 2026-08-29의 `src` 구현
>
> 목적: 날짜/시간 처리와 반복되는 폼 섹션 구조에서 개선하면 좋을 부분을 별도 문서로 정리한다.

## 한눈에 보기

날짜/시간과 폼 섹션은 기능 동작을 바꾸지 않고도 점진적으로 정리할 수 있는 영역이다. 다만 화면별 출력 형식과 API 요청 형식이 이미 다르기 때문에, 바로 공통 함수로 치환하기보다 사용처를 먼저 분류하고 테스트로 현재 정책을 고정하는 편이 안전하다.

| 영역       | 현재 문제                                      | 권장 방향                       |
| ---------- | ---------------------------------------------- | ------------------------------- |
| 날짜/시간  | 표시용, 입력용, API 전송용 변환이 섞여 있음    | 목적별 함수와 책임 경계 분리    |
| 빈 값 처리 | `-`, 빈 문자열 등 화면별 정책이 다름           | 표시용과 입력용의 기본값을 명시 |
| 초 단위    | 분 단위 표시와 초 단위 전송이 섞여 있음        | 표시 정책과 서버 스펙을 분리    |
| 폼 섹션    | `제목 + 테두리 + padding + 필드 영역`이 반복됨 | 얇은 `FormSection` 후보로 관리  |

## 시간 util 공용화 조사 결과

결론부터 보면 공용 util은 만들 수 있다. 다만 하나의 `formatDateTime`으로 모두 처리하기보다, 출력 단위별로 작게 나누는 편이 안전하다.

### 필요한 출력 단위

| 출력 단위         | 예시 출력                                    | 현재 사용처                                                       | 공용화 판단                                |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| 날짜만            | `2026-01-01`                                 | 회원 생년월일, 가입일, 등업일, 최근 로그인, 게시글 상세 징계 기간 | 바로 공용화 가능                           |
| 날짜+시간, 분까지 | `2026-01-01 10:00`                           | 기간 목록, 문의/신고, 시험후기 로그, 회원 제재 내역 일부          | 바로 공용화 가능                           |
| 날짜+시간, 초까지 | `2026-01-01 10:00:00`                        | 회원 도메인의 기존 `formatDateTimeWithSeconds`                    | 공용화 가능하지만 사용처 확인 후 적용      |
| 오전/오후 표시    | `2026-01-01 오후 1:05`                       | 게시글/댓글 관리, 게시글 상세 로그                                | 기존 UI 유지가 필요하므로 별도 함수로 유지 |
| 입력 필드 값      | `2026-01-01T10:00`                           | 기간 수정 모달, 제재 추가 입력                                    | 표시용과 분리 필요                         |
| API 전송 값       | `2026-01-01 10:00:00`, `2026-01-01T10:00:00` | 포인트, 시험후기 작성 기간, 포인트 예약 지급                      | 공용 표시 util과 분리 필요                 |

### 현재 함수별 역할

| 함수                        | 위치                                                                                                        | 출력 단위            | 빈 값     | 사용처                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------- | --------- | ------------------------- |
| `formatDateTimeToMinutes`   | [`src/shared/utils/date-time-formatter.ts`](../src/shared/utils/date-time-formatter.ts)                     | 날짜+시간, 분까지    | `-`       | 기간, 문의/신고, 시험후기 |
| `formatDateTimeWithAmPm`    | [`src/shared/utils/date-time-formatter.ts`](../src/shared/utils/date-time-formatter.ts)                     | 날짜+시간, 오전/오후 | `-`       | 게시글/댓글               |
| `formatDateTimeForInput`    | [`src/shared/utils/date-time-formatter.ts`](../src/shared/utils/date-time-formatter.ts)                     | 입력 필드 값         | 방어 없음 | 기간 수정 모달            |
| `formatDateTimeForAPI`      | [`src/shared/utils/date-time-formatter.ts`](../src/shared/utils/date-time-formatter.ts)                     | API 전송, 공백 구분  | 방어 없음 | 포인트, 예약 지급         |
| `formatDateTimeWithT`       | [`src/shared/utils/date-time-formatter.ts`](../src/shared/utils/date-time-formatter.ts)                     | API 전송, `T` 구분   | 방어 없음 | 시험후기 작성 기간        |
| `formatDate`                | [`src/domains/MemberInfo/utils/memberDirectory.ts`](../src/domains/MemberInfo/utils/memberDirectory.ts)     | 날짜만               | `-`       | 회원 목록/상세            |
| `formatDateTime`            | [`src/domains/MemberInfo/utils/memberDirectory.ts`](../src/domains/MemberInfo/utils/memberDirectory.ts)     | 날짜+시간, 분까지    | `-`       | 회원 상세/제재            |
| `formatDateTimeWithSeconds` | [`src/domains/MemberInfo/utils/formatDateTime.ts`](../src/domains/MemberInfo/utils/formatDateTime.ts)       | 날짜+시간, 초까지    | 빈 문자열 | 회원 도메인 export        |
| `toDateTimeInputValue`      | [`penalty-history-utils.ts`](../src/domains/MemberInfo/components/penalty-history/penalty-history-utils.ts) | 입력 필드 값         | 빈 문자열 | 제재 추가/수정 입력       |
| `fromDateTimeInputValue`    | [`penalty-history-utils.ts`](../src/domains/MemberInfo/components/penalty-history/penalty-history-utils.ts) | API 전송, 공백 구분  | 방어 없음 | 제재 추가 요청            |

### 추천하는 공용 util 모양

공용 util은 `src/shared/utils/date-time-formatter.ts`에 아래 5개를 표준 세트로 둔다. 갑자기 전체 사용처를 바꾸지 않고, 함수와 테스트를 먼저 준비한 뒤 화면별로 점진 교체한다.

```ts
formatDateOnly(value); // YYYY-MM-DD, 빈 값은 '-'
formatDateTimeToMinutes(value); // YYYY-MM-DD HH:mm, 빈 값은 '-'
formatDateTimeToSeconds(value); // YYYY-MM-DD HH:mm:ss, 빈 값은 '-'
formatDateTimeWithAmPm(value); // YYYY-MM-DD 오전/오후 h:mm, 빈 값은 '-'
toDateTimeInputValue(value); // YYYY-MM-DDTHH:mm, 빈 값은 ''
```

이 중 `formatDateTimeToMinutes`와 `formatDateTimeWithAmPm`은 이미 공용 util에 있다. 우선 새로 필요한 함수만 추가하고, 기존 함수는 이름과 동작을 유지한다.

API 전송용은 위 표준 세트에 넣지 않는다. 포인트는 공백 구분을 쓰고 시험후기는 `T` 구분을 쓰기 때문에, `serializePointDateTime`, `serializeExamReviewPeriodDateTime`처럼 API 경계에서 이름을 분리하는 쪽이 안전하다.

### 먼저 하면 좋은 작업

- [x] `formatDateOnly`를 공용 util에 추가한다.
- [x] `formatDateTimeToSeconds`를 공용 util에 추가한다.
- [x] `toDateTimeInputValue`를 공용 util에 추가한다.
- [x] 기존 `formatDateTimeToMinutes`, `formatDateTimeWithAmPm` 테스트도 함께 추가한다.
- [x] 새 함수의 빈 값 결과를 테스트로 고정한다.
- [x] 회원 도메인의 `formatDate`, `formatDateTime` 사용처를 공용 util로 교체한다.
- [ ] 게시글/댓글의 `formatDateTimeWithAmPm`은 기존 UI가 다르므로 유지한다.
- [ ] API 전송용 `formatDateTimeForAPI`, `formatDateTimeWithT`는 이번 단계에서 건드리지 않는다.

## 바로 할 작업

우선 폼 섹션보다 시간 util부터 작업한다. 날짜만, 분까지, 초까지는 공용화 이득이 분명하고 범위도 작다. API 전송 형식은 화면마다 다르므로 이번 작업에서는 표시용과 입력 필드용까지만 정리한다.

### 1차 구현: 시간 util 공용화

- [x] `src/shared/utils/date-time-formatter.ts`에 `formatDateOnly`, `formatDateTimeToSeconds`, `toDateTimeInputValue`를 추가한다.
- [x] 기존 `formatDateTimeToMinutes`, `formatDateTimeWithAmPm`은 유지한다.
- [x] `src/shared/utils/date-time-formatter.test.ts`를 만든다.
- [x] 날짜만, 분까지, 초까지, 오전/오후, 입력 필드 값, 빈 값 결과를 테스트한다.
- [x] 회원 도메인의 `formatDate`, `formatDateTime` 사용처를 공용 util로 교체한다.
- [x] `penalty-history-utils.ts`의 `toDateTimeInputValue`는 공용 util로 대체 가능한지 확인한다.
- [ ] API 전송용 함수는 형식 차이가 있으므로 유지한다.

### 2차 구현: `FormSection` 도입

- [ ] [`src/shared/components/FormSection.tsx`](../src/shared/components/FormSection.tsx)를 만든다.
- [ ] `FormSection` props는 `title`, `description`, `actions`, `children`, `className`만 둔다.
- [ ] `FormSection`은 `article`, 제목, 선택 설명, 선택 액션, 테두리 본문 영역만 렌더링한다.
- [ ] 본문 grid class는 `FormSection`에 넣지 않는다. 화면마다 column 수가 달라질 수 있으므로 children에서 유지한다.
- [ ] [`src/shared/components/index.ts`](../src/shared/components/index.ts)에 `FormSection`을 export한다.
- [ ] [`PointDetailSection`](../src/domains/Points/components/PointDetailSection.tsx)의 외곽 `article`, `h3`, 테두리 div를 `FormSection`으로 교체한다.
- [ ] [`MemberInfoSection`](../src/domains/Points/components/MemberInfoSection.tsx)의 외곽 `article`, `h3`, 테두리 div를 `FormSection`으로 교체한다.
- [ ] 기존 화면 동작이 바뀌지 않았는지 관련 테스트 또는 타입 검사를 실행한다.

완료 기준은 두 파일에서 아래 반복 구조가 사라지는 것이다.

```tsx
<article className='flex flex-col gap-1'>
  <h3 className='text-lg font-bold'>...</h3>
  <div className='rounded-md border p-4 pb-5 ...'>...</div>
</article>
```

### 3차 구현: 날짜/시간 API 전송 경계 정리

- [ ] 포인트 미지급 일정의 `formatDateTimeForAPI` 호출 위치를 화면 컴포넌트에서 API adapter 또는 도메인 훅 경계로 옮긴다.
- [ ] 시험후기 작성 기간의 `formatDateTimeWithT` 호출 위치도 같은 방식으로 옮긴다.
- [ ] 이 단계에서는 서버로 보내는 문자열 형식을 바꾸지 않는다.
- [ ] 포인트는 `YYYY-MM-DD HH:mm:ss`, 시험후기는 `YYYY-MM-DDTHH:mm:ss`가 그대로 전송되는지 확인한다.

### 이번 문서 기준 추천 순서

1. 시간 util 공용 함수 추가
2. 시간 util 테스트 추가
3. 회원 도메인의 날짜/시간 표시 함수 교체
4. `FormSection` 생성
5. `PointDetailSection`, `MemberInfoSection`에만 적용
6. API 전송용 날짜 변환 위치 정리

## 1. 날짜/시간

### 현재 상태

공통 [`date-time-formatter`](../src/shared/utils/date-time-formatter.ts)에는 표시용, 입력 필드용, API 전송용 함수가 함께 들어 있다. 회원 도메인에도 별도 포맷터가 있어 빈 값과 초 단위 처리 정책이 분산되어 있다.

| 위치                                                                                              | 현재 역할                  | 확인할 차이                             |
| ------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------- |
| [`date-time-formatter`](../src/shared/utils/date-time-formatter.ts)                               | 공통 날짜 변환             | 빈 값은 주로 `-`, API 전송은 `:00` 추가 |
| [`useDateTimeField`](../src/shared/hooks/use-date-time-field.ts)                                  | 날짜와 시각 입력 상태 관리 | 내부 값은 `YYYY-MM-DDTHH:mm`            |
| [`DateTimePicker`](../src/shared/components/DateTimePicker.tsx)                                   | 날짜 선택과 시·분 선택 UI  | 기본 시각은 `00:00`                     |
| [`domains/MemberInfo/utils/formatDateTime.ts`](../src/domains/MemberInfo/utils/formatDateTime.ts) | 회원 도메인 표시 포맷      | 초 단위와 빈 값 정책 확인 필요          |
| [`memberDirectory.ts`](../src/domains/MemberInfo/utils/memberDirectory.ts)                        | 회원 목록 표시 포맷        | 분 단위와 빈 값 정책 확인 필요          |

### 개선 방향

날짜/시간 함수는 사용 목적이 이름에서 드러나야 한다. 같은 문자열 변환이라도 화면 표시, 입력 필드 초기화, API 전송은 실패했을 때의 기본값과 책임 범위가 다르다.

```text
표시용       formatAdminDateTime
입력 필드용  toDateTimeLocalValue
API 전송용   각 API adapter의 serializeDateTime
```

공통 유틸은 관리자 화면 전반에서 같은 표시 정책을 쓰는 함수만 둔다. 특정 API가 `YYYY-MM-DD HH:mm:ss`를 요구하는지, `YYYY-MM-DDTHH:mm:ss`를 요구하는지는 해당 API adapter나 도메인 훅에서 처리한다.

### 체크리스트

- [x] 날짜/시간 사용처를 `표시`, `입력 초기화`, `API 전송`, `상태 계산`으로 분류한다.
- [ ] 빈 값 정책을 정한다. 화면 표시용은 `-`, 입력 필드용은 빈 문자열, API 전송용은 호출 전에 필수값 검증을 권장한다.
- [ ] 초 단위 정책을 정한다. 목록과 상세 표시에서는 분 단위로 자르고, API 전송에서는 서버 스펙에 맞춰 초 단위를 명시한다.
- [ ] 타임존 기준을 정한다. 관리자 브라우저 로컬 시간 기준인지 서버 시간 기준인지 기간 상태 계산과 예약 전송에서 동일하게 적용한다.
- [ ] `new Date(string)`을 사용하는 곳은 입력 문자열 형식과 브라우저 파싱 차이를 확인한다.
- [ ] `formatDateTimeForAPI`와 `formatDateTimeWithT`처럼 API 형식만 다른 함수는 화면 컴포넌트에서 직접 호출하지 않도록 adapter 경계로 옮긴다.
- [ ] `useDateTimeField`의 기본 시각 `00:00`이 모든 예약 화면에 적절한지 확인한다.
- [ ] 현재 출력 형식을 깨지 않도록 포맷터 단위 테스트를 먼저 추가한다.
- [ ] 기간 상태 계산은 기존 [`periodStatusUtils`](../src/shared/utils/periodStatusUtils.ts) 테스트와 함께 경계값을 유지한다.

### 적용 순서

- [x] 1단계: 현재 포맷터별 입력값, 출력값, 빈 값 결과를 표로 정리한다.
- [ ] 2단계: `date-time-formatter`에 표시용 함수 테스트를 추가한다.
- [ ] 3단계: API 전송용 변환을 포인트, 시험후기, 알림 등 도메인 경계로 이동한다.
- [ ] 4단계: 회원 도메인의 별도 포맷터가 공통 표시 정책으로 대체 가능한지 확인한다.
- [ ] 5단계: 날짜/시간 입력 컴포넌트는 값 형식 계약을 문서화하고, 필요하면 `DateTimePicker` 테스트를 추가한다.

### 1단계 조사 결과

#### 포맷터별 입출력

| 함수                              | 용도 분류   | 대표 입력                 | 대표 출력               | 빈 값 결과 | 메모                                         |
| --------------------------------- | ----------- | ------------------------- | ----------------------- | ---------- | -------------------------------------------- |
| `formatDateTimeForAPI`            | API 전송    | `2024-01-01T12:00`        | `2024-01-01 12:00:00`   | 없음       | 포인트 미지급 일정에서 사용                  |
| `formatDateTimeWithT`             | API 전송    | `2024-01-01T12:00`        | `2024-01-01T12:00:00`   | 없음       | 시험후기 작성 기간에서 사용                  |
| `formatDateTimeForInput`          | 입력 초기화 | `2024-01-01 12:00:00`     | `2024-01-01T12:00`      | 없음       | 수정 모달의 `DateTimePicker` 초기값으로 사용 |
| `formatDateTimeToMinutes`         | 표시        | `2024-01-01 12:00:00`     | `2024-01-01 12:00`      | `-`        | `T`가 포함된 문자열도 공백으로 변환          |
| `formatDateTimeWithAmPm`          | 표시        | `2024-01-01 12:00:00`     | `2024-01-01 오후 12:00` | `-`        | `new Date()` 파싱 결과에 의존                |
| `MemberInfo/utils/formatDateTime` | 표시        | `2024-01-01T12:00:00.000` | `2024-01-01 12:00:00`   | 빈 문자열  | `T`가 없으면 원본 문자열 반환                |
| `memberDirectory.formatDateTime`  | 표시        | `2024-01-01T12:00:00`     | `2024-01-01 12:00`      | `-`        | 공통 `formatDateTimeToMinutes`와 유사        |

#### 사용 목적별 분류

| 분류        | 현재 함수/컴포넌트                                                      | 정리 방향                                                          |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 표시        | `formatDateTimeToMinutes`, `formatDateTimeWithAmPm`, 회원 도메인 포맷터 | 공통 표시 정책을 정한 뒤 이름과 빈 값 결과를 맞춘다.               |
| 입력 초기화 | `formatDateTimeForInput`, `useDateTimeField.setDateTime`                | `DateTimePicker`가 받는 값 형식 `YYYY-MM-DDTHH:mm`을 명시한다.     |
| API 전송    | `formatDateTimeForAPI`, `formatDateTimeWithT`                           | 화면이 아니라 API adapter나 도메인 훅 경계에서 서버 스펙에 맞춘다. |
| 상태 계산   | `getPeriodStatus`                                                       | 이미 분리된 경계 정책을 유지하고 타임존 기준만 추가로 결정한다.    |

#### 확인된 위험

- `formatDateTimeForAPI`, `formatDateTimeWithT`, `formatDateTimeForInput`은 빈 값 방어가 없으므로 호출 전 필수값 검증에 의존한다.
- 회원 도메인의 `formatDateTime`은 빈 값을 빈 문자열로 반환하고, 공통 표시 함수는 `-`를 반환한다.
- `formatDateTimeWithAmPm`은 `new Date()`를 사용하므로 입력 문자열과 브라우저 환경에 따라 로컬 시간 해석 차이가 생길 수 있다.
- API 전송 형식이 포인트는 공백 구분, 시험후기는 `T` 구분으로 갈라져 있어 공통 함수 하나로 합치기 어렵다.

## 2. 폼 섹션

### 현재 상태

다음 화면에는 `제목 + 테두리 + padding + 필드 그리드` 구조가 반복된다.

| 위치                                                                                                 | 반복되는 구조                     | 공통화 판단                  |
| ---------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------- |
| [`PointDetailSection`](../src/domains/Points/components/PointDetailSection.tsx)                      | 제목, 테두리 박스, 2열 필드       | 후보                         |
| [`MemberInfoSection`](../src/domains/Points/components/MemberInfoSection.tsx)                        | 제목, 테두리 박스, 읽기 전용 필드 | 후보                         |
| [`PointFreezeScheduleForm`](../src/domains/Points/components/PointFreezeScheduleForm.tsx)            | 기간 입력 섹션                    | 기간 관리 공통화와 함께 검토 |
| [`ExamReviewPeriodScheduleForm`](../src/domains/Reviews/components/ExamReviewPeriodScheduleForm.tsx) | 기간 입력 섹션                    | 기간 관리 공통화와 함께 검토 |
| [`PushNotificationPage`](../src/pages/alerts/PushNotificationPage.tsx)                               | 알림 작성 폼의 그룹 구조          | 후보                         |
| [`SectionCard`](../src/domains/MemberInfo/components/MemberDetailCard.tsx)                           | 회원 상세 전용 카드               | 제외                         |

### 개선 방향

신규 화면에서도 같은 구조가 반복되면 얇은 `FormSection`을 도입한다. 이 컴포넌트는 폼의 겉모양만 담당하고, 입력 필드 구성과 도메인 검증은 각 화면에 남긴다.

```tsx
<FormSection title='필수 정보' description='알림 발송에 필요한 정보입니다.'>
  {children}
</FormSection>
```

권장 props는 최소로 시작한다.

| prop          | 역할                         |
| ------------- | ---------------------------- |
| `title`       | 섹션 제목                    |
| `description` | 선택 설명 문구               |
| `actions`     | 우측 상단 버튼이나 보조 액션 |
| `children`    | 실제 입력 필드               |
| `className`   | 예외적인 여백 조정           |

### 체크리스트

- [ ] `FormSection`은 제목, 설명, 액션 영역, 본문 간격만 담당하게 한다.
- [ ] grid column 수, 개별 필드 label, validation message는 children 쪽에서 관리한다.
- [x] 포인트 상세와 회원 정보 상세처럼 같은 테두리 박스 구조를 먼저 적용 후보로 둔다.
- [ ] 기간 생성 폼은 기간 관리 공통화와 충돌하지 않도록 같은 작업에서 함께 판단한다.
- [ ] 회원 상세의 `SectionCard`처럼 아이콘, 탭, 상세 레이아웃이 강한 컴포넌트는 합치지 않는다.
- [ ] `variant`, `compact`, `withBorder` 같은 옵션은 실제 사용처가 생기기 전까지 추가하지 않는다.
- [ ] 공통화 후 제목 레벨이 화면 구조에 맞는지 확인한다. 반복 섹션은 보통 `h3` 또는 `h2` 중 페이지 계층에 맞춰 선택한다.
- [ ] 기본 렌더링, 설명 표시, 액션 영역 표시 정도만 테스트한다.

### 적용 순서

- [x] 1단계: 포인트 상세와 회원 정보 상세의 외곽 마크업을 비교한다.
- [ ] 2단계: `src/shared/components/FormSection.tsx`를 얇게 추가한다.
- [ ] 3단계: 포인트 상세 쪽 1~2개 컴포넌트에만 먼저 적용한다.
- [ ] 4단계: 시각 회귀와 기존 테스트를 확인한다.
- [ ] 5단계: 알림 작성 폼이나 기간 생성 폼은 실제 반복 이득이 확인될 때 확장한다.

### 1단계 조사 결과

#### 외곽 마크업 비교

| 항목            | `PointDetailSection`                                       | `MemberInfoSection`                                        | 판단              |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ----------------- |
| 최상위 태그     | `article`                                                  | `article`                                                  | 동일              |
| 최상위 class    | `flex flex-col gap-1`                                      | `flex flex-col gap-1`                                      | 동일              |
| 제목 태그       | `h3`                                                       | `h3`                                                       | 동일              |
| 제목 class      | `text-lg font-bold`                                        | `text-lg font-bold`                                        | 동일              |
| 본문 래퍼 class | `grid w-full grid-cols-2 gap-4 rounded-md border p-4 pb-5` | `grid w-full grid-cols-2 gap-4 rounded-md border p-4 pb-5` | 동일              |
| 필드 래퍼 class | `flex flex-col gap-1`                                      | `flex flex-col gap-1`                                      | 동일              |
| 필드 구성       | 선택, 숫자 입력, 메모 입력                                 | 읽기 전용 회원 정보 입력                                   | children으로 유지 |

#### 공통화 후보 범위

두 컴포넌트는 외곽 구조가 완전히 같고 본문 필드만 다르다. 따라서 `FormSection`의 첫 적용 후보로 적합하다.

```tsx
<FormSection title='지급할 포인트 상세'>
  <div className='grid w-full grid-cols-2 gap-4'>{children}</div>
</FormSection>
```

다만 본문 grid를 `FormSection`이 직접 가질지는 2단계에서 결정한다. 현재 두 컴포넌트는 2열 grid가 같지만, 알림 작성 폼이나 기간 생성 폼까지 확장하면 column 수가 달라질 수 있다. 우선은 제목과 테두리 박스까지만 공통화하고, grid는 children에서 유지하는 편이 확장 부담이 작다.

#### 추가 확인 대상

- 기간 생성 폼 두 개는 `section > article > h3 > bordered div` 구조가 같지만, 2번의 기간 관리 공통화와 함께 보는 편이 낫다.
- `PointFreezeScheduleForm`은 본문이 세로 배치이고 날짜 입력만 가로 2열이다.
- `ExamReviewPeriodScheduleForm`은 `PointFreezeScheduleForm`과 구조가 거의 같지만 API 형식과 문구가 다르다.
- 회원 상세 `SectionCard`는 아이콘과 카드 계층이 포함되어 있어 이번 `FormSection` 후보에서 제외한다.

## 피해야 할 방향

- [ ] 표시용 포맷터와 API 전송용 포맷터를 같은 함수로 합치지 않는다.
- [ ] 화면 컴포넌트에서 API별 날짜 문자열 형식을 직접 조립하지 않는다.
- [ ] 테스트 없이 전체 날짜/시간 출력 형식을 한 번에 바꾸지 않는다.
- [ ] `FormSection`에 도메인 검증, API 요청, toast 처리를 넣지 않는다.
- [ ] 회원 상세의 `SectionCard`처럼 디자인 계열이 다른 카드까지 억지로 합치지 않는다.
- [ ] 실제 사용처가 생기기 전에 `variant` 옵션을 늘리지 않는다.

## 결론

날짜/시간은 먼저 목적별 책임을 나누고, 기존 화면 출력이 바뀌지 않도록 테스트를 추가한 뒤 점진적으로 정리한다. 폼 섹션은 공통 컴포넌트를 크게 만들기보다 제목, 설명, 액션 영역, 본문 간격만 담당하는 얇은 구조로 시작한다.

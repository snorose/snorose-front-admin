# 상태 배지 개선 가이드

> 조사 기준: 2026-08-23의 `src` 구현
> 진행 상황 확인: 2026-08-24

## 한눈에 보기

- 공통 배지는 상태용 6가지 tone과 분류용 `outline`을 사용한다.
- 크기와 모양은 하나로 통일하고, 색상만 상태 의미에 따라 바꾼다.
- 공통 컴포넌트는 색상 규칙만 담당한다.
- 상태 코드, 문구, tone 연결은 각 도메인에서 관리한다.

## 1. 공통 배지 스타일

### 권장 tone

| tone      | 색상 | 의미                    | 대표 상태                  |
| --------- | ---- | ----------------------- | -------------------------- |
| `neutral` | 회색 | 기본, 미처리, 종료      | 미확인, 종료, 취소         |
| `info`    | 파랑 | 확인, 정보              | 확인, 문의, 공지           |
| `success` | 초록 | 정상, 공개, 완료        | 정상, 노출, 진행중         |
| `warning` | 노랑 | 예정, 보류, 확인 필요   | 예정, 논의 필요, 신고 다수 |
| `danger`  | 빨강 | 삭제, 차단, 심각한 상태 | 삭제, 강등, 징계 필요      |
| `accent`  | 보라 | 운영상 별도 강조        | 징계, 관리자 등급          |
| `outline` | 회색 | 상태가 아닌 분류·범주   | 게시판명, 카테고리         |

### 공통 형태

모든 상태 배지는 아래 형태를 기본으로 사용한다.

- 상태 tone은 연한 배경과 진한 글자색, `outline`은 흰 배경과 연한 회색 테두리·진회색 글자색
- `rounded-full`
- `text-xs`, `font-medium`
- `px-2`, `py-0.5`
- 한 줄 표시와 동일한 높이

각 tone의 색상은 다음처럼 통일한다.

```ts
const STATUS_BADGE_TONES = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  danger: 'border-rose-100 bg-rose-50 text-rose-700',
  accent: 'border-violet-100 bg-violet-50 text-violet-700',
  outline: 'border-slate-200 bg-white text-slate-800',
};
```

`StatusBadge`는 tone과 문구만 받는다.

```tsx
<StatusBadge tone='success'>진행중</StatusBadge>
<StatusBadge tone='warning'>예정</StatusBadge>
<StatusBadge tone='danger'>삭제됨</StatusBadge>
<StatusBadge tone='outline'>자유게시판</StatusBadge>
```

상태를 변경하는 배지는 별도 색상을 만들지 않고, 같은 tone을 사용하는 선택 컴포넌트로 감싼다.

## 2. 페이지별 상태와 권장 스타일

### 회원 관리

목록과 상세 화면에서는 회원 등급과 현재 제재 상태를 표시한다.

| 구분      | 상태                 | 권장 tone |
| --------- | -------------------- | --------- |
| 회원 등급 | 준회원               | `neutral` |
| 회원 등급 | 정회원               | `success` |
| 회원 등급 | 리자                 | `accent`  |
| 회원 등급 | 공식, 광고주         | `info`    |
| 회원 등급 | 강등자               | `danger`  |
| 현재 제재 | 정상                 | `success` |
| 현재 제재 | 경고 1회, 경고 2회   | `warning` |
| 현재 제재 | 일반 강등, 영구 강등 | `danger`  |
| 제재 진행 | 진행중               | `danger`  |
| 제재 진행 | 종료, 취소           | `neutral` |

회원 등급은 역할 구분이 목적이므로 모든 등급에 서로 다른 색을 만들 필요는 없다. 강등자처럼 주의가 필요한 등급만 `danger`로 강조한다.

### 게시글 관리·상세

게시글 목록과 상세 화면은 같은 상태 매핑을 사용한다.

| 구분        | 상태                 | 권장 tone |
| ----------- | -------------------- | --------- |
| 공개 상태   | 노출                 | `success` |
| 검토 상태   | 신고 다수            | `warning` |
| 공개 상태   | 리자 비공개          | `warning` |
| 운영 조치   | 징계                 | `accent`  |
| 삭제 상태   | 리자 삭제, 유저 삭제 | `danger`  |
| 게시글 속성 | 공지                 | `info`    |
| 의심 키워드 | Y                    | `warning` |
| 의심 키워드 | N                    | `neutral` |
| 게시판·분류 | 게시판명, 카테고리   | `outline` |

의심 키워드는 테이블의 좁은 열에서 빠르게 구분할 수 있도록 `Y`, `N`으로 표시한다. 여러 상태가 함께 있으면 삭제 → 신고·비공개 → 징계 순으로 보여주고, 이상 상태가 있을 때는 `노출`을 숨긴다.

### 댓글 관리

댓글은 게시글과 같은 관리 상태를 사용하므로 별도 색상 체계를 만들지 않는다.

| 구분        | 상태                 | 권장 tone |
| ----------- | -------------------- | --------- |
| 공개 상태   | 노출                 | `success` |
| 검토 상태   | 신고 다수            | `warning` |
| 공개 상태   | 리자 비공개          | `warning` |
| 운영 조치   | 징계                 | `accent`  |
| 삭제 상태   | 리자 삭제, 유저 삭제 | `danger`  |
| 의심 키워드 | Y                    | `warning` |
| 의심 키워드 | N                    | `neutral` |
| 게시판·분류 | 게시판명, 카테고리   | `outline` |

게시글 상세에 노출되는 댓글 상태도 이 매핑을 그대로 사용한다.

### 시험후기 관리

시험후기는 확인 상태와 게시글 처리 상태를 구분해 표시한다.

| 구분      | 상태                                 | 권장 tone |
| --------- | ------------------------------------ | --------- |
| 확인 상태 | 확인                                 | `info`    |
| 확인 상태 | 미확인                               | `neutral` |
| 확인 상태 | 논의 필요                            | `warning` |
| 확인 상태 | 징계 필요                            | `danger`  |
| 확인 상태 | 삭제됨                               | `danger`  |
| 논의 여부 | 논의 있음                            | `info`    |
| 논의 여부 | 논의 없음                            | `neutral` |
| 신고 상태 | 신고 N건                             | `warning` |
| 처리 상태 | 노출                                 | `success` |
| 처리 상태 | 유저 삭제, 어드민 삭제               | `danger`  |
| 처리 상태 | 어드민 비공개, 신고 누적 자동 비공개 | `warning` |
| 처리 상태 | 징계                                 | `accent`  |
| 처리 상태 | 징계 없음                            | `success` |

목록, 검색 조건, 상세 편집 화면에서 모두 같은 상태 매핑을 사용한다.

### 시험후기 작성 기간 설정·포인트 미지급 일정 관리

두 페이지는 이미 같은 [`PeriodStatusBadge`](../src/shared/components/PeriodStatusBadge.tsx)를 사용한다.

| 상태   | 기준                 | 권장 tone |
| ------ | -------------------- | --------- |
| 예정   | 시작 전              | `warning` |
| 진행중 | 시작 후부터 종료까지 | `success` |
| 종료   | 종료 후              | `neutral` |

기간 계산은 별도 함수로 분리하고, 계산된 결과만 `StatusBadge`에 전달한다.

### 문의 및 신고

문의 유형과 처리 상태를 함께 표시하되, 유형과 진행 상태는 구분한다.

| 구분        | 상태                | 권장 tone |
| ----------- | ------------------- | --------- |
| 대분류      | 문의                | `info`    |
| 대분류      | 신고                | `danger`  |
| 대분류      | 기타                | `neutral` |
| 중분류      | 문의 관련 세부 분류 | `info`    |
| 중분류      | 신고 관련 세부 분류 | `danger`  |
| 답변 상태   | 답변 전             | `neutral` |
| 답변 상태   | 답변 완료           | `success` |
| 답변 상태   | 보류                | `warning` |
| 작성자 상태 | 탈퇴                | `neutral` |
| 수정 상태   | 수정됨              | `neutral` |
| 댓글 상태   | 숨김                | `warning` |
| 댓글 상태   | 삭제됨              | `danger`  |
| 댓글 작성자 | 관리자              | `accent`  |

`답변 전`, `답변 완료`처럼 클릭해서 변경하는 상태는 현재의 선택 기능을 유지하되, 표시 색상은 공통 tone을 사용한다.

`보류`는 타입에는 정의되어 있지만 백엔드 지원 전까지 선택 옵션에서는 노출하지 않는다.

### 현재 상태 배지가 필요하지 않은 페이지

다음 페이지는 입력과 실행 결과가 중심이므로 상태 배지를 새로 만들 필요가 없다.

- 포인트 단일건 증감
- 포인트 엑셀 업로드 지급
- 포인트 정회원 전체 증감
- 푸시 알림 전송

## 3. 구현 원칙

```text
shared
  └─ StatusBadge: 크기, 모양, tone별 색상

domain
  └─ 상태 코드 → 문구 + tone 변환
```

예시는 다음과 같다.

```ts
const PERIOD_STATUS_META = {
  SCHEDULED: { label: '예정', tone: 'warning' },
  IN_PROGRESS: { label: '진행중', tone: 'success' },
  ENDED: { label: '종료', tone: 'neutral' },
} as const;
```

적용할 때는 아래 규칙을 지킨다.

- 도메인 상태 코드를 `StatusBadge` 내부에서 직접 확인하지 않는다.
- 화면에서 색상 `className`을 추가하지 않는다.
- `outline`은 상태의 중요도를 표현하지 않고 게시판·카테고리 같은 분류 라벨에만 사용한다.
- 알 수 없는 상태는 빈 배지 대신 `알 수 없음`과 `neutral`을 사용한다.
- 색상만으로 상태를 구분하지 않고 문구를 항상 함께 표시한다.
- 같은 화면에 여러 상태가 있으면 중요한 상태부터 최대 3개까지 표시한다.

## 4. 적용 순서

- [x] **1단계:** 공통 `StatusBadge`와 상태용 6가지 tone을 추가한다.
- [x] **2단계:** 두 기간 관리 페이지에 적용한다.
- [x] **3단계:** 시험후기 관리의 확인·처리 상태를 교체한다.
- [x] **4단계:** 게시글과 댓글의 색상 `className` 반환값을 tone으로 바꾼다.
- [x] **4-1단계:** 게시글·댓글의 게시판명과 카테고리를 `outline`으로 교체한다.
- [x] **4-2단계:** 게시글의 공지와 게시글·댓글의 의심 키워드 배지를 공통 tone으로 교체한다.
- [x] **4-3단계:** 게시글 상세의 신고 건수와 징계 종류 배지를 `danger`로 교체한다.
- [ ] **4-4단계:** 목록·상세 화면에서 긴 게시판명과 배지 높이를 최종 확인한다.
- [x] **5단계:** 회원 관리와 문의·신고 화면을 교체한다.
  - [x] 회원 등급·제재 상태를 공통 `StatusBadge`로 교체한다.
  - [x] 문의·신고 분류, 답변 상태, 댓글 상태를 공통 tone으로 교체한다.

현재 1~5단계와 게시글·댓글 후속 상태 배지 공통화 작업이 모두 완료되었다.

## 5. `outline` 교체 현황

`outline`은 상태가 아니라 게시판·카테고리처럼 콘텐츠의 소속을 보여주는 라벨에 사용한다. 게시글·댓글 화면의 아래 7곳에 적용했다.

| 화면             | 표시 항목 | 교체 전                    | 적용 결과                    |
| ---------------- | --------- | -------------------------- | ---------------------------- |
| 게시글 목록      | 게시판명  | `Badge variant='unstyled'` | `StatusBadge tone='outline'` |
| 게시글 상세 정보 | 게시판명  | `Badge variant='unstyled'` | `StatusBadge tone='outline'` |
| 댓글 목록        | 게시판명  | `Badge variant='unstyled'` | `StatusBadge tone='outline'` |
| 게시글 목록      | 카테고리  | 회색 배경의 `span`         | `StatusBadge tone='outline'` |
| 게시글 상세 정보 | 카테고리  | 회색 배경의 `span`         | `StatusBadge tone='outline'` |
| 게시글 상세 댓글 | 카테고리  | 회색 배경의 `span`         | `StatusBadge tone='outline'` |
| 댓글 목록        | 카테고리  | 회색 배경의 `span`         | `StatusBadge tone='outline'` |

교체한 파일은 다음 4개다.

- [`PostTableRow.tsx`](../src/domains/Posts/components/PostTableRow.tsx)
- [`PostDetailInfoPanel.tsx`](../src/domains/Posts/components/PostDetail/PostDetailInfoPanel.tsx)
- [`PostDetailCommentItem.tsx`](../src/domains/Posts/components/PostDetail/PostDetailCommentItem.tsx)
- [`CommentTableRow.tsx`](../src/domains/Comments/components/CommentTableRow.tsx)

### 적용한 작업 범위

1. 게시판명 3곳을 `StatusBadge tone='outline'`으로 교체했다.
2. 값이 있는 카테고리 4곳을 `StatusBadge tone='outline'`으로 교체했다.
3. 게시판명이나 카테고리가 없는 경우의 `-` 표시는 배지로 감싸지 않았다.
4. 교체 후 카테고리에 직접 지정했던 색상·크기 클래스를 제거했다.
5. 게시글 목록·상세와 댓글 목록·상세의 타입 검사와 빌드를 검증했다.

다음 요소는 모양이 비슷해도 의미나 상호작용이 달라 `outline` 교체 범위에서 제외한다.

| 제외 대상             | 이유               | 별도 정리 방향                 |
| --------------------- | ------------------ | ------------------------------ |
| 게시판·상태 필터 버튼 | 선택 가능한 컨트롤 | 버튼의 선택·비선택 스타일 유지 |

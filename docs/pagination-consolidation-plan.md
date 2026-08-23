# 페이지네이션 통합 조사 및 실행 계획

> 최초 조사: 2026-08-17의 `src` 구현<br>
> 구현 재점검: 2026-08-23의 `src` 구현<br>
> 관련 문서: [`refactoring-opportunities.md`](./refactoring-opportunities.md)의 우선순위 1번

## 1. 한눈에 보는 결론

페이지네이션은 [`PaginationBar`](../src/shared/components/PaginationBar.tsx)를 공통 기준으로 삼는다.

```text
shared/components/ui/Pagination
  └─ 링크, 아이콘, 레이아웃을 제공하는 UI 원시 컴포넌트

shared/components/PaginationBar (최종 통합 목표)
  └─ 페이지 번호, 페이지 묶음, 이동 가능 여부를 결정하는 공통 정책
       ├─ 게시글 관리
       ├─ 댓글 관리
       ├─ 게시글 상세 댓글
       ├─ 문의 및 신고
       ├─ 시험후기 관리
       ├─ 회원 목록
       └─ 경고 및 강등 이력
```

현재 라우트에서 실제로 확인할 수 있는 페이지네이션 화면은 **7곳**이다.

- **7곳 모두 `PaginationBar` 통합이 완료되었다.**
- 시험후기·회원정보 전용 페이지네이션 컴포넌트는 모두 삭제되었다.
- 회원 목록의 전체 페이지 수가 줄어든 경우 마지막 유효 페이지로 이동하는 범위 보정과 테스트를 추가했다.
- 문의 및 신고 E2E의 페이지네이션 접근성 이름과 회원 상세 재조회 테스트의 1 기반 페이지 계약을 현재 구현에 맞게 보완했다.

페이지네이션 통합 구현은 **완료**되었다. 실제 사용 중인 7개 화면의 브라우저 회귀 검증과 dev API E2E 실행을 위한 인증 환경 설정이 남았다.

| 구분                  | 상태     |
| --------------------- | -------- |
| 공통 기본 계약·테스트 | **완료** |
| 시험후기 통합         | **완료** |
| 게시글·댓글 보완      | **완료** |
| 회원 이력 통합        | **완료** |
| 회원 목록 통합        | **완료** |
| 접근성·문구 통일      | **완료** |

## 2. 공통 기준을 `PaginationBar`로 정하는 이유

| 기준          | 판단                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| 현재 사용량   | 실제 화면 7곳 모두에서 사용한다.                                                   |
| 공통 UI 체계  | shadcn 기반 [`Pagination`](../src/shared/components/ui/pagination.tsx)을 사용한다. |
| 시험후기 중복 | 동일 구현이던 `ExamReviewTablePagination`을 제거하고 통합했다.                     |
| 응답 계약     | 서버 페이지네이션 응답에 항상 포함되는 `totalPage`를 공통 기준으로 사용할 수 있다. |
| 위치          | 특정 도메인이 아닌 `shared/components`에 있어 공통 정책을 두기에 적합하다.         |

`shared/components/ui/Pagination`은 교체 대상이 아니다. 이 컴포넌트는 링크와 아이콘 같은 표현만 담당하고, 실제 페이지 계산 정책은 `PaginationBar`가 담당하도록 계층을 유지한다.

## 3. 현재 사용 화면 전체 목록

### 3.1 라우트에서 실제 사용 중인 화면

| 화면                     | 라우트                  | 현재 렌더링 컴포넌트 | 데이터 방식                  |        화면 페이지 기준 | 서버 페이지 변환             | 현재 상태     |
| ------------------------ | ----------------------- | -------------------- | ---------------------------- | ----------------------: | ---------------------------- | ------------- |
| 게시글 관리              | `/posts/manage`         | `PaginationBar`      | 서버 페이지네이션            |        1 기반, URL 저장 | API 함수에서 `page - 1`      | **보완 완료** |
| 댓글 관리                | `/posts/comments`       | `PaginationBar`      | 서버 페이지네이션            |        1 기반, URL 저장 | 일반 댓글 API에서 `page - 1` | **보완 완료** |
| 게시글 상세 댓글         | `/posts/manage/:postId` | `PaginationBar`      | 서버 페이지네이션            |       1 기반, 로컬 상태 | API 함수에서 `page - 1`      | **보완 완료** |
| 문의 및 신고             | `/report/inquiry`       | `PaginationBar`      | 전체 조회 후 클라이언트 분할 |        1 기반, URL 저장 | 없음                         | **보완 완료** |
| 시험후기 관리            | `/reviews/exam`         | `PaginationBar`      | 서버 페이지네이션            | 1 기반, URL과 로컬 상태 | 조회 훅에서 `page - 1`       | **교체 완료** |
| 회원 목록                | `/member/info`          | `PaginationBar`      | 서버 페이지네이션            |       1 기반, 로컬 상태 | 조회 훅에서 `page - 1`       | **보완 완료** |
| 경고 및 강등 관리의 이력 | `/member/penalty`       | `PaginationBar`      | 전체 조회 후 클라이언트 분할 |       1 기반, 로컬 상태 | 없음                         | **교체 완료** |

화면 단위로는 7곳이지만, 같은 컴포넌트를 여러 화면이 공유하므로 제거 대상 파일 수와 일치하지 않는다.

### 3.2 현재 라우트에 연결되지 않은 사용처 — 교체 완료

다음 두 컴포넌트도 `PaginationBar`로 교체했다.

- [`PointHistoryTab`](../src/domains/MemberInfo/components/PointHistoryTab.tsx)
- [`DownloadedExamReviewTab`](../src/domains/MemberInfo/components/DownloadedExamReviewTab.tsx)

두 컴포넌트는 [`getMemberInfoTabs`](../src/domains/MemberInfo/constants/MemberInfoTabs.config.tsx)에서 구성되지만, 현재 `getMemberInfoTabs`를 호출하는 코드는 없다. 현재 회원 상세 화면은 비활성 바로가기만 렌더링하므로 사용자가 접근하는 경로에는 노출되지 않는다.

사용자 경로에는 노출되지 않지만 소스의 유효한 import였으므로 두 탭을 함께 교체했고, 마지막 사용처가 사라진 `MemberInfoTablePagenation.tsx`를 삭제했다.

### 3.3 사용되지 않는 구현

다음 시험후기 구현과 barrel export는 삭제 완료되었다.

- `ExamReviewTablePagination.tsx`
- `ExamTablePagination.tsx`
- `Reviews/components/index.ts`의 두 컴포넌트 export

## 4. 현재 구현별 차이

| 구현            | 페이지 기준 |                         번호 묶음 | 왼쪽/오른쪽 이동   | `totalPage` | 특이사항       |
| --------------- | ----------: | --------------------------------: | ------------------ | ----------- | -------------- |
| `PaginationBar` |      1 기반 | 기본 10개, `pageBlockSize`로 설정 | 이전/다음 **묶음** | 필수        | 현재 공통 기준 |

시험후기 전용 구현 2개, `MemberInfoTablePagenation`, `MemberDirectoryPagination`은 삭제되어 현재 비교 대상에서 제외했다.

모든 화면 상태와 URL은 1 기반을 사용하며, 0 기반 서버 변환은 API 함수 또는 조회 훅 경계에서만 수행한다.

## 5. `PaginationBar` 계약 보완 현황

### 5.1 UI 상태는 1 기반으로 고정한다 — 완료

공통 컴포넌트가 0 기반과 1 기반을 동시에 추측해서 처리하지 않도록 한다.

```ts
// 화면과 PaginationBar
currentPage = 1; // 첫 페이지

// 0 기반 서버 API를 호출하는 경계
apiPage = currentPage - 1;
```

URL, React 상태, 화면 표시 값은 모두 1 기반을 사용하고, 서버가 0 기반을 요구할 때만 API 함수나 조회 훅에서 변환한다. 게시글, 댓글, 시험후기는 이미 이 구조를 사용한다.

회원 목록은 다음 구조로 변경했다.

```text
MemberInfoPage / useMemberDirectoryState
  └─ currentPage: 1 기반
       └─ loadMembers(currentPage)
            └─ API 요청 직전 page - 1
```

### 5.2 `totalPage`를 반드시 전달한다 — 완료

서버 페이지네이션 응답에는 `hasNext`, `totalPage`, `totalCount`, `currentCount`가 항상 함께 포함된다. 페이지 번호와 묶음 이동은 정확한 마지막 페이지를 알아야 하므로 `PaginationBar`는 `totalPage`를 필수 입력으로 사용한다.

`hasNext`는 도메인에서 별도로 필요할 때 응답 정보로 사용할 수 있지만, `PaginationBar`의 페이지 계산에는 전달하지 않는다. 두 값을 함께 받아 분기하는 것보다 `totalPage` 하나를 기준으로 삼는 편이 동작 계약이 단순하고 명확하다.

페이지 이동 중 새 응답을 기다리는 동안 쿼리 데이터가 일시적으로 `undefined`가 될 수 있다. 이때 현재 페이지를 임시 `totalPage`로 사용하면 뒤쪽 페이지 번호가 잠시 사라지므로, 마지막으로 응답받은 `totalPage`를 유지하고 새 응답이 도착했을 때 갱신한다.

다음 전달 작업은 모두 완료되었다.

1. 게시글: `usePostList`가 이미 꺼내는 `totalPage`를 `usePostTableState`와 `PostTable`까지 전달한다.
2. 댓글: 일반 댓글과 대댓글 응답의 `totalPage`를 `useCommentTableState`와 `CommentTable`까지 전달한다.
3. 시험후기: `totalPage`를 유지하고 공통 컴포넌트에 전달한다.
4. 회원 목록: 응답의 `totalPage`가 현재 페이지보다 작아지면 마지막 유효 페이지로 보정하고 다시 조회한다.

### 5.3 페이지 묶음 크기와 데이터 개수를 분리한다 — 공통 컴포넌트 보완 완료

삭제 전 `MemberInfoTablePagenation`의 `groupSize`는 다음 두 의미로 함께 사용됐다.

- 한 페이지에서 보여 줄 데이터 개수
- 한 번에 보여 줄 페이지 번호 개수

`/member/penalty`에서는 `groupSize={5}`이므로 데이터 5개와 페이지 번호 5개가 표시된다. 공통화할 때 데이터 분할 크기는 `BlacklistHistoryTab`에 남기고, 페이지 번호 묶음 크기는 `PaginationBar`의 별도 선택 prop으로 분리하는 것이 좋다.

```ts
type PaginationBarProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPage: number;
  pageBlockSize?: number; // 기본값 10
};
```

기존 화면을 보존하기 위해 `PaginationBar`에 기본값이 10인 `pageBlockSize`를 추가했다. 5개·10개 묶음 계산과 이동은 단위 테스트로 고정했다.

활성 회원 이력 화면은 `pageBlockSize={5}`를 전달한다. 데이터 분할 크기 5는 `BlacklistHistoryTab`에 그대로 남으므로 두 설정의 의미가 분리된다.

### 5.4 빈 결과와 한 페이지만 있는 경우의 노출 정책 — 현행 유지로 결정

현재 동작은 화면마다 다르다.

- 게시글 상세 댓글은 `totalPage > 1`일 때만 페이지네이션을 표시한다.
- 문의 및 신고 등은 빈 결과여도 `PaginationBar`를 렌더링한다.
- `PaginationBar`는 `totalPage=0`도 내부에서 최소 1로 바꾸어 1번 버튼을 표시한다.

공통 컴포넌트는 기존 화면 변화를 최소화하도록 `totalPage <= 1`이어도 1번 버튼을 표시하는 현행 동작을 테스트로 고정했다. 게시글 상세 댓글처럼 숨김이 필요한 화면은 호출부에서 조건부 렌더링한다.

모든 화면을 `totalPage <= 1`에서 숨기는 방향으로 통일하려면 사용자에게 보이는 변화가 생기므로 통합 필수 작업이 아닌 별도 UI 개선으로 다룬다.

### 5.5 응답 이후 현재 페이지 범위 보정 — 완료

서버 데이터 삭제 등으로 전체 페이지 수가 줄어들면 기존 마지막 페이지가 유효 범위를 벗어날 수 있다. 게시글, 댓글, 시험후기와 문의 및 신고 화면은 응답 이후 `currentPage`를 `totalPage` 범위로 보정한다.

회원 목록도 응답의 `totalPage`가 현재 페이지보다 작아진 경우 마지막 유효 페이지로 이동한 뒤 해당 페이지를 다시 조회하도록 보완했다. 단위 테스트에서 화면 3페이지 조회 중 전체 페이지가 2로 줄어들면 화면 2페이지로 이동하고 서버의 1페이지를 다시 요청하는 흐름을 검증했다.

## 6. 교체 범위

### 6.1 유지하고 보완할 파일

- [`src/shared/components/PaginationBar.tsx`](../src/shared/components/PaginationBar.tsx)
  - **완료:** 1 기반 입력 계약을 명시했다.
  - **완료:** 필수 입력인 `totalPage`를 기준으로 한 동작을 테스트했다.
  - **완료:** 기본값이 10인 `pageBlockSize`를 추가하고 5개·10개 묶음을 테스트했다.
- [`src/shared/components/ui/pagination.tsx`](../src/shared/components/ui/pagination.tsx)
  - UI 원시 컴포넌트로 유지한다.
  - 통합 범위에서는 구조 변경이 필요하지 않다.

### 6.2 직접 교체할 파일

- [`src/domains/Reviews/components/ExamTable.tsx`](../src/domains/Reviews/components/ExamTable.tsx)
  - **완료:** `ExamReviewTablePagination` import와 JSX를 `PaginationBar`로 변경했다.
- [`src/domains/MemberInfo/components/BlacklistHistoryTab.tsx`](../src/domains/MemberInfo/components/BlacklistHistoryTab.tsx)
  - **완료:** 활성 화면의 `MemberInfoTablePagenation`을 `PaginationBar`로 교체했다.
- [`src/domains/MemberInfo/components/PointHistoryTab.tsx`](../src/domains/MemberInfo/components/PointHistoryTab.tsx)
  - **완료:** 현재 비노출이지만 `PaginationBar`로 교체했다.
- [`src/domains/MemberInfo/components/DownloadedExamReviewTab.tsx`](../src/domains/MemberInfo/components/DownloadedExamReviewTab.tsx)
  - **완료:** 현재 비노출이지만 `PaginationBar`로 교체했다.
- [`src/domains/MemberInfo/components/MemberDirectorySection.tsx`](../src/domains/MemberInfo/components/MemberDirectorySection.tsx)
  - **완료:** `MemberDirectoryPagination` 대신 `PaginationBar`를 렌더링한다.

### 6.3 페이지 기준과 데이터 전달을 수정할 파일

- [`src/domains/MemberInfo/hooks/useMemberDirectoryState.ts`](../src/domains/MemberInfo/hooks/useMemberDirectoryState.ts)
  - **완료:** `currentPage`의 초깃값과 필터 초기화 값을 0에서 1로 변경했다.
  - **완료:** 회원 API 요청 직전에만 0 기반으로 변환한다.
  - **완료:** 응답의 마지막 페이지를 벗어나면 유효한 마지막 페이지로 이동해 다시 조회한다.
- [`src/pages/member/MemberInfoPage.tsx`](../src/pages/member/MemberInfoPage.tsx)
  - **확인 완료:** 1 기반 상태를 구조 변경 없이 그대로 전달한다.
- [`src/domains/MemberInfo/hooks/useMemberDetailState.ts`](../src/domains/MemberInfo/hooks/useMemberDetailState.ts)
  - **확인 완료:** 상세 수정 후 현재 1 기반 페이지를 `loadMembers`에 전달하고 조회 훅 경계에서 0 기반으로 변환한다.
  - **테스트 완료:** 화면 2페이지를 `loadMembers(2)`로 그대로 전달하는지 검증한다.
- [`src/domains/Posts/hooks/usePostTableState.ts`](../src/domains/Posts/hooks/usePostTableState.ts)
  - **완료:** 이미 조회된 `totalPage`를 반환한다.
- [`src/domains/Posts/components/PostTable.tsx`](../src/domains/Posts/components/PostTable.tsx)
  - **완료:** `PaginationBar`에 `totalPage`를 전달한다.
- [`src/domains/Comments/hooks/useCommentTableState.ts`](../src/domains/Comments/hooks/useCommentTableState.ts)
  - **완료:** 일반 댓글/대댓글 중 현재 모드의 `totalPage`를 반환한다.
- [`src/domains/Comments/components/CommentTable.tsx`](../src/domains/Comments/components/CommentTable.tsx)
  - **완료:** `PaginationBar`에 `totalPage`를 전달한다.

### 6.4 삭제할 파일과 export

- **삭제 완료:** `src/domains/Reviews/components/ExamReviewTablePagination.tsx`
- **삭제 완료:** `src/domains/Reviews/components/ExamTablePagination.tsx`
- **삭제 완료:** `src/domains/MemberInfo/components/MemberDirectoryPagination.tsx`
- **삭제 완료:** `src/domains/MemberInfo/components/MemberInfoTablePagenation.tsx`
- **삭제 완료:** [`src/domains/Reviews/components/index.ts`](../src/domains/Reviews/components/index.ts)의 두 시험후기 페이지네이션 export
- **삭제 완료:** [`src/domains/MemberInfo/index.ts`](../src/domains/MemberInfo/index.ts)의 `MemberDirectoryPagination` export

## 7. 권장 작업 순서

### 1단계: 공통 기준을 테스트로 고정 — 완료

`PaginationBar` 테스트를 먼저 추가한다. 최소한 다음 동작을 고정해야 한다.

- 1~10 묶음에서 이전 묶음 버튼이 비활성화된다.
- 11페이지에서 11~20 묶음이 표시된다.
- 마지막 묶음은 `totalPage`를 넘는 번호를 만들지 않는다.
- 전체 페이지가 10, 20처럼 묶음 크기의 배수여도 다음 묶음 버튼이 비활성화된다.
- 번호, 이전 묶음, 다음 묶음을 클릭하면 정확한 1 기반 페이지를 전달한다.
- `totalPage=0`과 `totalPage=1`의 노출 정책이 의도대로 동작한다.
- `pageBlockSize`의 5개 묶음과 기본 10개 묶음을 각각 검증한다.

### 2단계: 완전히 같은 시험후기 중복 제거 — 구현 완료

1. `ExamTable`을 `PaginationBar`로 교체한다.
2. `ExamReviewTablePagination`과 export를 삭제한다.
3. 미사용 `ExamTablePagination`과 export를 삭제한다.
4. 시험후기 검색, URL의 `page`, 마지막 페이지 이동을 확인한다.

이 단계는 페이지 계산과 props가 같아 가장 작은 변경으로 중복을 제거할 수 있다.

### 3단계: 기존 `PaginationBar` 사용 화면 보완 — 구현 완료

1. 게시글의 `totalPage`를 공통 컴포넌트까지 전달한다.
2. 일반 댓글과 대댓글의 `totalPage`를 공통 컴포넌트까지 전달한다.
3. 빈 결과, 마지막 페이지, 필터 후 1페이지 초기화를 확인한다.

### 4단계: 1 기반 회원 이력 교체 — 완료

1. **결정 완료:** 페이지 번호는 기존처럼 5개 묶음을 유지한다.
2. **완료:** `PaginationBar`에 `pageBlockSize`를 추가한다.
3. **완료:** 활성 화면인 `BlacklistHistoryTab`을 교체한다.
4. **완료:** 비노출 `PointHistoryTab`, `DownloadedExamReviewTab`의 import도 교체한다.
5. **완료:** 모든 사용처가 사라진 `MemberInfoTablePagenation.tsx`를 삭제한다.

### 5단계: 0 기반 회원 목록 교체 — 구현 완료

1. **완료:** `useMemberDirectoryState`의 화면 상태를 1 기반으로 변경한다.
2. **완료:** API 요청 경계에서 `page - 1`을 적용한다.
3. **완료:** 검색, 필터, 정렬, 새로고침의 초기화 값을 모두 1로 변경한다.
4. **완료:** 상세 화면에서 회원 수정 후 현재 목록 페이지를 다시 불러오는 흐름을 확인한다.
5. **완료:** `MemberDirectorySection`을 `PaginationBar`로 교체한다.
6. **완료:** `MemberDirectoryPagination.tsx`와 export를 삭제한다.
7. **완료:** 전체 페이지 수가 현재 페이지보다 작아지면 마지막 유효 페이지로 이동하고 다시 조회한다.

회원 목록은 페이지 기준 자체가 바뀌므로 마지막 단계에서 독립적으로 처리하는 편이 회귀 원인을 찾기 쉽다.

## 8. 구현 체크리스트

### 공통 컴포넌트 현재 상태

아래 표와 체크리스트는 2026-08-23 재점검 결과다. `[x]`는 현재 소스에서 확인된 완료 항목이고, `[ ]`는 추가 결정·수동 확인이 필요한 항목이다.

| 항목                   | 상태                 | 현재 구현과 필요한 작업                                                                                     |
| ---------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1 기반 페이지 계산     | **완료**             | 타입 주석과 단위 테스트로 계약을 고정했다.                                                                  |
| `totalPage` 우선 사용  | **완료**             | 마지막 페이지 제한, 묶음 경계, 로딩 중 값 유지와 범위 보정을 구현하고 테스트했다.                           |
| 5개 페이지 묶음 지원   | **완료**             | `/member/penalty`의 기존 5개 묶음을 유지하도록 결정하고 단위 테스트로 고정했다.                             |
| `pageBlockSize` prop   | **완료**             | 기본값 10으로 추가했다. 값을 전달하지 않은 기존 화면의 동작은 유지된다.                                     |
| 빈 결과·한 페이지 노출 | **현행 유지로 결정** | 공통 컴포넌트는 1번 버튼을 표시하고, 숨김이 필요한 화면은 호출부가 결정한다. 동작은 단위 테스트로 고정했다. |
| 비활성 링크 접근성     | **완료**             | CSS 비활성화와 함께 `aria-disabled`, `tabIndex=-1`, 클릭 차단을 적용하고 테스트했다.                        |
| 이전·다음 버튼 언어    | **완료**             | 화면 문구와 접근성 레이블을 각각 `이전`·`다음`, `이전 페이지 묶음`·`다음 페이지 묶음`으로 통일했다.         |

### 공통 컴포넌트

- [x] `PaginationBar`의 입력 페이지가 1 기반임을 타입 주석 또는 문서로 명시한다.
- [x] `totalPage`를 필수 입력으로 사용한다.
- [x] 빈 결과와 한 페이지 결과는 공통 컴포넌트에서 1번 버튼을 표시하는 현행 정책으로 테스트를 고정한다.
- [x] 회원 이력의 5개 페이지 묶음을 유지하기로 결정한다.
- [x] `pageBlockSize`를 추가하고 기본값은 10으로 둔다.
- [x] 비활성 링크에 `aria-disabled`와 키보드 접근 정책을 적용한다.
- [x] 이전/다음 버튼의 영문 레이블과 접근성 문구를 한글로 통일한다.

### 시험후기

- [x] `ExamTable`이 `PaginationBar`를 import한다.
- [x] 시험후기 1페이지가 서버의 0페이지를 요청한다.
- [x] URL의 `page` 값과 선택된 페이지가 동기화된다.
- [x] 검색 시 URL과 화면이 모두 1페이지로 초기화된다.
- [x] `ExamReviewTablePagination` 파일과 export를 삭제한다.
- [x] 미사용 `ExamTablePagination` 파일과 export를 삭제한다.

### 게시글·댓글

- [x] 게시글 `totalPage`가 `PaginationBar`까지 전달된다.
- [x] 일반 댓글 `totalPage`가 `PaginationBar`까지 전달된다.
- [x] 대댓글 `totalPage`가 `PaginationBar`까지 전달된다.
- [x] 게시글/댓글 URL의 페이지는 1 기반으로 파싱·저장된다.
- [x] 게시글/댓글 API 요청은 API 함수 또는 조회 훅에서 0 기반으로 변환된다.
- [x] 필터 적용과 게시글 ID/상위 댓글 ID 이동 시 1페이지로 초기화된다.
- [x] `totalPage`와 공통 컴포넌트의 경계 테스트에 따라 마지막 페이지 이후 번호가 보이지 않는다.

### 회원 이력

- [x] `/member/penalty`의 한 페이지 데이터 개수 5개를 유지한다.
- [x] 페이지 번호 묶음은 5개로 유지한다.
- [x] 한 페이지 이동 버튼을 제거하고 공통 묶음 이동으로 통일한다.
- [x] `BlacklistHistoryTab`을 `PaginationBar`로 교체한다.
- [x] `PointHistoryTab`을 `PaginationBar`로 교체한다.
- [x] `DownloadedExamReviewTab`을 `PaginationBar`로 교체한다.
- [x] `MemberInfoTablePagenation.tsx`를 삭제한다.
- [x] `Pagenation`, `currentGruop` 오타가 소스에 남지 않았는지 검색한다.

### 회원 목록

- [x] `currentPage` 초깃값을 1로 변경한다.
- [x] 검색, 역할, 입학 연도, 전공, 정렬, 새로고침 시 1페이지로 초기화한다.
- [x] 첫 화면에서 회원 API의 `page=0`을 요청하도록 경계 변환을 적용하고 테스트한다.
- [x] 화면의 2페이지에서 회원 API의 `page=1`을 요청하는지 테스트한다.
- [x] 전체 페이지 수가 줄어 현재 페이지가 범위를 벗어나면 마지막 유효 페이지로 이동하고 다시 조회한다.
- [x] 상세 수정 후 현재 1 기반 목록 페이지를 `loadMembers`에 그대로 전달하고 조회 훅 경계에서 변환하는지 테스트한다.
- [x] `MemberDirectorySection`을 `PaginationBar`로 교체한다.
- [x] `MemberDirectoryPagination.tsx`와 export를 삭제한다.

### 회귀 검증과 정리

- [ ] 페이지 번호 클릭을 각 활성 라우트에서 확인한다.
- [x] 공통 컴포넌트 단위 테스트에서 첫 묶음과 마지막 묶음의 이동 버튼 상태를 확인한다.
- [ ] 마지막 페이지의 데이터가 페이지 크기보다 적어도 정상 표시되는지 확인한다.
- [ ] 필터 결과가 0개일 때 페이지 버튼이 잘못 노출되지 않는지 확인한다.
- [ ] 브라우저 뒤로/앞으로 이동 시 URL 기반 화면의 페이지가 복구되는지 확인한다. 현재 사용자 페이지 이동도 history `replace`를 사용하므로 페이지 클릭 이력을 남길지 먼저 결정한다.
- [x] 삭제 대상 컴포넌트의 import와 barrel export가 모두 사라졌는지 `rg`로 확인한다.
- [x] 문의 및 신고 E2E가 공통 컴포넌트의 접근성 이름인 `페이지네이션`을 사용하도록 locator를 수정한다.
- [ ] 문의 및 신고 페이지네이션 E2E를 실제 dev API에서 실행한다. (2026-08-23 실행 시도, 인증 환경변수 부재로 대상 테스트 미실행)
- [x] 전체 테스트 145개를 실행한다. (2026-08-23 통과)
- [ ] **추가 작업 필요:** 활성 라우트 화면 테스트 또는 수동 회귀 검증을 실행한다.
- [x] lint를 실행한다. (2026-08-23 통과)
- [x] 프로덕션 빌드를 실행한다. (2026-08-23 통과, 청크 크기 경고만 발생)

## 9. 완료 기준

현재는 아래 6개 완료 기준 중 5개를 충족했다. 코드 통합은 완료되었으며, 활성 라우트 회귀 검증까지 마치면 전체 완료로 전환할 수 있다.

1. [x] 페이지 계산 정책을 가진 공통 컴포넌트가 `PaginationBar` 하나만 남는다.
2. [x] 모든 화면 상태와 URL은 1 기반 페이지를 사용한다.
3. [x] 0 기반 서버 변환은 API 함수 또는 도메인 조회 훅에서만 수행한다.
4. [x] `totalPage`를 받을 수 있는 화면은 존재하지 않는 페이지 번호를 노출하지 않는다.
5. [x] `ExamReviewTablePagination`, `ExamTablePagination`, `MemberDirectoryPagination`, `MemberInfoTablePagenation`과 관련 export가 제거된다.
6. [ ] 실제 사용 중인 7개 화면의 첫 페이지, 중간 페이지, 마지막 페이지 동작이 검증된다.

## 10. 이번 작업에서 제외할 범위

통합 PR이 커지는 것을 막기 위해 다음 항목은 별도 작업으로 두는 것이 좋다.

- 문의 및 신고의 전체 조회 방식을 서버 페이지네이션으로 변경하는 작업
- 회원 활동 탭의 샘플 데이터를 실제 API로 교체하는 작업
- 현재 비노출인 `PointHistoryTab`, `DownloadedExamReviewTab`을 다시 연결할 때 회원 변경 및 데이터 축소에 따른 페이지 초기화·범위 보정을 추가하는 작업
- 시험후기 페이지의 URL 상태 로직을 `useManagePageUrl`로 통합하는 작업
- 페이지네이션 디자인 자체를 새로 설계하는 작업
- 테이블 로딩·빈 상태 UI 공통화

이 항목들은 페이지네이션 컴포넌트 통합과 독립적으로 진행할 수 있다.

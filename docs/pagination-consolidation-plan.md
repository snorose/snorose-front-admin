# 페이지네이션 통합 조사 및 실행 계획

> 조사 기준: 2026-08-17의 `src` 구현  
> 관련 문서: [`refactoring-opportunities.md`](./refactoring-opportunities.md)의 우선순위 1번

## 1. 한눈에 보는 결론

페이지네이션은 [`PaginationBar`](../src/shared/components/PaginationBar.tsx)를 공통 기준으로 삼는다.

```text
shared/components/ui/Pagination
  └─ 링크, 아이콘, 레이아웃을 제공하는 UI 원시 컴포넌트

shared/components/PaginationBar
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

- 4곳은 이미 `PaginationBar`를 사용한다.
- 시험후기 1곳은 `PaginationBar`와 코드가 같은 복제 컴포넌트를 사용한다.
- 회원 관련 2곳은 별도 컴포넌트를 사용한다.
- 이외에 사용되지 않는 시험후기 페이지네이션 1개가 남아 있다.

따라서 새로운 공통 컴포넌트를 만들기보다는 `PaginationBar`의 동작 계약을 먼저 보완한 뒤, 위험이 낮은 대상부터 단계적으로 교체하는 것이 좋다.

## 2. 공통 기준을 `PaginationBar`로 정하는 이유

| 기준          | 판단                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| 현재 사용량   | 실제 화면 7곳 중 4곳에서 이미 사용한다.                                            |
| 공통 UI 체계  | shadcn 기반 [`Pagination`](../src/shared/components/ui/pagination.tsx)을 사용한다. |
| 시험후기 중복 | `ExamReviewTablePagination`과 이름을 제외한 구현이 같다.                           |
| 확장 가능성   | `totalPage`가 있는 경우와 `hasNext`만 있는 경우를 모두 받을 수 있다.               |
| 위치          | 특정 도메인이 아닌 `shared/components`에 있어 공통 정책을 두기에 적합하다.         |

`shared/components/ui/Pagination`은 교체 대상이 아니다. 이 컴포넌트는 링크와 아이콘 같은 표현만 담당하고, 실제 페이지 계산 정책은 `PaginationBar`가 담당하도록 계층을 유지한다.

## 3. 현재 사용 화면 전체 목록

### 3.1 라우트에서 실제 사용 중인 화면

| 화면                     | 라우트                  | 현재 렌더링 컴포넌트        | 데이터 방식                  |             화면 페이지 기준 | 서버 페이지 변환             | 교체 판단                   |
| ------------------------ | ----------------------- | --------------------------- | ---------------------------- | ---------------------------: | ---------------------------- | --------------------------- |
| 게시글 관리              | `/posts/manage`         | `PaginationBar`             | 서버 페이지네이션            |             1 기반, URL 저장 | API 함수에서 `page - 1`      | 유지, `totalPage` 전달 보완 |
| 댓글 관리                | `/posts/comments`       | `PaginationBar`             | 서버 페이지네이션            |             1 기반, URL 저장 | 일반 댓글 API에서 `page - 1` | 유지, `totalPage` 전달 보완 |
| 게시글 상세 댓글         | `/posts/manage/:postId` | `PaginationBar`             | 서버 페이지네이션            |            1 기반, 로컬 상태 | API 함수에서 `page - 1`      | 유지                        |
| 문의 및 신고             | `/report/inquiry`       | `PaginationBar`             | 전체 조회 후 클라이언트 분할 |             1 기반, URL 저장 | 없음                         | 유지                        |
| 시험후기 관리            | `/reviews/exam`         | `ExamReviewTablePagination` | 서버 페이지네이션            |      1 기반, URL과 로컬 상태 | 조회 훅에서 `page - 1`       | **가장 먼저 교체**          |
| 회원 목록                | `/member/info`          | `MemberDirectoryPagination` | 서버 페이지네이션            | 상태는 0 기반, 표시는 1 기반 | 변환 없이 0 기반 전송        | 상태 기준 변경 후 교체      |
| 경고 및 강등 관리의 이력 | `/member/penalty`       | `MemberInfoTablePagenation` | 전체 조회 후 클라이언트 분할 |            1 기반, 로컬 상태 | 없음                         | 동작 차이 결정 후 교체      |

화면 단위로는 7곳이지만, 같은 컴포넌트를 여러 화면이 공유하므로 제거 대상 파일 수와 일치하지 않는다.

### 3.2 현재 라우트에 연결되지 않은 사용처

다음 두 컴포넌트도 `MemberInfoTablePagenation`을 import한다.

- [`PointHistoryTab`](../src/domains/MemberInfo/components/PointHistoryTab.tsx)
- [`DownloadedExamReviewTab`](../src/domains/MemberInfo/components/DownloadedExamReviewTab.tsx)

두 컴포넌트는 [`getMemberInfoTabs`](../src/domains/MemberInfo/constants/MemberInfoTabs.config.tsx)에서 구성되지만, 현재 `getMemberInfoTabs`를 호출하는 코드는 없다. 현재 회원 상세 화면은 비활성 바로가기만 렌더링하므로 사용자가 접근하는 경로에는 노출되지 않는다.

다만 소스 코드의 import는 유효하므로 `MemberInfoTablePagenation.tsx`를 삭제하려면 다음 중 하나가 필요하다.

1. 두 컴포넌트도 `PaginationBar`로 함께 교체한다.
2. 해당 회원 활동 탭 자체가 폐기 대상인지 별도 확인한 후 관련 코드를 제거한다.

페이지네이션 통합 범위만 작게 유지하려면 **1번처럼 import만 함께 교체**하는 편이 안전하다.

### 3.3 사용되지 않는 구현

[`ExamTablePagination`](../src/domains/Reviews/components/ExamTablePagination.tsx)은 [`Reviews/components/index.ts`](../src/domains/Reviews/components/index.ts)에서 export만 되고 실제 렌더링 사용처는 없다.

이 컴포넌트는 공통화 과정에서 삭제할 수 있다. 삭제할 때 barrel export도 같이 제거해야 한다.

## 4. 현재 구현별 차이

| 구현                        |              페이지 기준 |              번호 묶음 | 왼쪽/오른쪽 이동                       | `totalPage` | 특이사항                                  |
| --------------------------- | -----------------------: | ---------------------: | -------------------------------------- | ----------- | ----------------------------------------- |
| `PaginationBar`             |                   1 기반 |              고정 10개 | 이전/다음 **묶음**                     | 선택        | 현재 공통 기준                            |
| `ExamReviewTablePagination` |                   1 기반 |              고정 10개 | 이전/다음 **묶음**                     | 선택        | `PaginationBar`와 동일한 복제 코드        |
| `MemberDirectoryPagination` | 입력 0 기반, 표시 1 기반 |              고정 10개 | 이전/다음 **묶음**                     | 필수        | 컴포넌트 내부에서 `+1`, 클릭 시 `-1` 변환 |
| `MemberInfoTablePagenation` |                   1 기반 | `groupSize`, 기본 10개 | 한 페이지 이동과 묶음 이동을 모두 제공 | 필수        | 파일명 오타, 자체 버튼 스타일 사용        |
| `ExamTablePagination`       |                   1 기반 |              고정 10개 | 이전/다음 **한 페이지**                | 미지원      | 현재 미사용                               |

가장 중요한 차이는 다음 두 가지다.

1. 회원 목록만 React 상태와 API 요청 모두 0부터 시작한다.
2. `MemberInfoTablePagenation`은 한 페이지 이동 버튼과 묶음 이동 버튼을 모두 제공하지만, `PaginationBar`는 묶음 이동만 제공한다.

## 5. 통합 전에 보완할 `PaginationBar` 계약

### 5.1 UI 상태는 1 기반으로 고정한다

공통 컴포넌트가 0 기반과 1 기반을 동시에 추측해서 처리하지 않도록 한다.

```ts
// 화면과 PaginationBar
currentPage = 1; // 첫 페이지

// 0 기반 서버 API를 호출하는 경계
apiPage = currentPage - 1;
```

URL, React 상태, 화면 표시 값은 모두 1 기반을 사용하고, 서버가 0 기반을 요구할 때만 API 함수나 조회 훅에서 변환한다. 게시글, 댓글, 시험후기는 이미 이 구조를 사용한다.

회원 목록도 최종적으로 다음 구조가 되어야 한다.

```text
MemberInfoPage / useMemberDirectoryState
  └─ currentPage: 1 기반
       └─ loadMembers(currentPage)
            └─ API 요청 직전 page - 1
```

### 5.2 `totalPage`를 알 수 있으면 반드시 전달한다

게시글과 댓글 응답 타입에는 `totalPage`가 있지만 현재 테이블 상태 훅에서 버려지고, `PaginationBar`에는 `hasNext`만 전달된다.

현재 `PaginationBar`는 `totalPage` 없이 `hasNext`만 받으면 현재 묶음의 페이지 번호 10개를 모두 만든다. 예를 들어 실제 페이지가 2개여도 1~10 버튼이 보일 수 있다. `hasNext`는 보통 “바로 다음 페이지가 있는가”만 알려 주므로 10개 페이지의 존재를 보장하지 않는다.

따라서 다음 순서를 권장한다.

1. 게시글: `usePostList`가 이미 꺼내는 `totalPage`를 `usePostTableState`와 `PostTable`까지 전달한다.
2. 댓글: 일반 댓글과 대댓글 응답의 `totalPage`를 `useCommentTableState`와 `CommentTable`까지 전달한다.
3. 시험후기: 현재처럼 `totalPage`와 `hasNext`를 함께 유지한다.
4. 응답에서 정말 `totalPage`가 없는 경우에만 `hasNext` 전용 모드를 사용한다.

`hasNext` 전용 모드는 존재가 확인되지 않은 번호를 만들지 않도록 별도 동작을 정의해야 한다. 권장 동작은 **현재 페이지 번호와 한 페이지 이전/다음만 제공**하는 것이다.

### 5.3 페이지 묶음 크기와 데이터 개수를 분리한다

`MemberInfoTablePagenation`의 `groupSize`는 다음 두 의미로 함께 사용된다.

- 한 페이지에서 보여 줄 데이터 개수
- 한 번에 보여 줄 페이지 번호 개수

`/member/penalty`에서는 `groupSize={5}`이므로 데이터 5개와 페이지 번호 5개가 표시된다. 공통화할 때 데이터 분할 크기는 `BlacklistHistoryTab`에 남기고, 페이지 번호 묶음 크기는 `PaginationBar`의 별도 선택 prop으로 분리하는 것이 좋다.

```ts
type PaginationBarProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPage?: number;
  hasNext?: boolean;
  pageBlockSize?: number; // 기본값 10
};
```

기존 화면을 그대로 보존해야 한다면 경고/강등 이력에서만 `pageBlockSize={5}`를 전달한다. 디자인을 모두 10개 묶음으로 통일하기로 결정하면 이 prop은 추가하지 않아도 된다.

### 5.4 빈 결과와 한 페이지만 있는 경우의 노출 정책을 정한다

현재 동작은 화면마다 다르다.

- 게시글 상세 댓글은 `totalPage > 1`일 때만 페이지네이션을 표시한다.
- 문의 및 신고 등은 빈 결과여도 `PaginationBar`를 렌더링한다.
- `PaginationBar`는 `totalPage=0`도 내부에서 최소 1로 바꾸어 1번 버튼을 표시한다.

권장 정책은 다음과 같다.

- `totalPage <= 1`이면 페이지네이션을 숨긴다.
- `totalPage`가 없고 `hasNext` 전용 모드라면 첫 페이지의 `hasNext=false`일 때 숨긴다.

이 정책은 통합 자체와 별도로 사용자에게 보이는 변화이므로, 첫 교체 PR에서 같이 적용할지 결정하고 스냅샷 또는 화면 테스트로 고정한다.

## 6. 교체 범위

### 6.1 유지하고 보완할 파일

- [`src/shared/components/PaginationBar.tsx`](../src/shared/components/PaginationBar.tsx)
  - 1 기반 입력 계약을 명시한다.
  - `totalPage` 우선 동작을 테스트한다.
  - 필요하면 `pageBlockSize`와 안전한 `hasNext` 전용 모드를 추가한다.
- [`src/shared/components/ui/pagination.tsx`](../src/shared/components/ui/pagination.tsx)
  - UI 원시 컴포넌트로 유지한다.
  - 통합 범위에서는 구조 변경이 필요하지 않다.

### 6.2 직접 교체할 파일

- [`src/domains/Reviews/components/ExamTable.tsx`](../src/domains/Reviews/components/ExamTable.tsx)
  - `ExamReviewTablePagination` import와 JSX를 `PaginationBar`로 변경한다.
- [`src/domains/MemberInfo/components/BlacklistHistoryTab.tsx`](../src/domains/MemberInfo/components/BlacklistHistoryTab.tsx)
  - 활성 화면의 `MemberInfoTablePagenation`을 교체한다.
- [`src/domains/MemberInfo/components/PointHistoryTab.tsx`](../src/domains/MemberInfo/components/PointHistoryTab.tsx)
  - 현재 비노출이지만 삭제될 컴포넌트의 import를 제거한다.
- [`src/domains/MemberInfo/components/DownloadedExamReviewTab.tsx`](../src/domains/MemberInfo/components/DownloadedExamReviewTab.tsx)
  - 현재 비노출이지만 삭제될 컴포넌트의 import를 제거한다.
- [`src/domains/MemberInfo/components/MemberDirectorySection.tsx`](../src/domains/MemberInfo/components/MemberDirectorySection.tsx)
  - `MemberDirectoryPagination` 대신 `PaginationBar`를 렌더링한다.

### 6.3 페이지 기준과 데이터 전달을 수정할 파일

- [`src/domains/MemberInfo/hooks/useMemberDirectoryState.ts`](../src/domains/MemberInfo/hooks/useMemberDirectoryState.ts)
  - `currentPage`의 초깃값과 필터 초기화 값을 0에서 1로 변경한다.
  - 회원 API 요청 직전에만 0 기반으로 변환한다.
- [`src/pages/member/MemberInfoPage.tsx`](../src/pages/member/MemberInfoPage.tsx)
  - 1 기반 상태가 그대로 전달되는지 확인한다. 큰 구조 변경은 필요하지 않다.
- [`src/domains/MemberInfo/hooks/useMemberDetailState.ts`](../src/domains/MemberInfo/hooks/useMemberDetailState.ts)
  - 상세 수정 후 `loadMembers(currentPage)`를 다시 호출하므로 1 기반 변경 후 회귀가 없는지 확인한다.
- [`src/domains/Posts/hooks/usePostTableState.ts`](../src/domains/Posts/hooks/usePostTableState.ts)
  - 이미 조회된 `totalPage`를 반환한다.
- [`src/domains/Posts/components/PostTable.tsx`](../src/domains/Posts/components/PostTable.tsx)
  - `PaginationBar`에 `totalPage`를 전달한다.
- [`src/domains/Comments/hooks/useCommentTableState.ts`](../src/domains/Comments/hooks/useCommentTableState.ts)
  - 일반 댓글/대댓글 중 현재 모드의 `totalPage`를 반환한다.
- [`src/domains/Comments/components/CommentTable.tsx`](../src/domains/Comments/components/CommentTable.tsx)
  - `PaginationBar`에 `totalPage`를 전달한다.

### 6.4 삭제할 파일과 export

- [`src/domains/Reviews/components/ExamReviewTablePagination.tsx`](../src/domains/Reviews/components/ExamReviewTablePagination.tsx)
- [`src/domains/Reviews/components/ExamTablePagination.tsx`](../src/domains/Reviews/components/ExamTablePagination.tsx)
- [`src/domains/MemberInfo/components/MemberDirectoryPagination.tsx`](../src/domains/MemberInfo/components/MemberDirectoryPagination.tsx)
- [`src/domains/MemberInfo/components/MemberInfoTablePagenation.tsx`](../src/domains/MemberInfo/components/MemberInfoTablePagenation.tsx)
- [`src/domains/Reviews/components/index.ts`](../src/domains/Reviews/components/index.ts)의 두 시험후기 페이지네이션 export
- [`src/domains/MemberInfo/index.ts`](../src/domains/MemberInfo/index.ts)의 `MemberDirectoryPagination` export

## 7. 권장 작업 순서

### 1단계: 공통 기준을 테스트로 고정

`PaginationBar` 테스트를 먼저 추가한다. 최소한 다음 동작을 고정해야 한다.

- 1~10 묶음에서 이전 묶음 버튼이 비활성화된다.
- 11페이지에서 11~20 묶음이 표시된다.
- 마지막 묶음은 `totalPage`를 넘는 번호를 만들지 않는다.
- 전체 페이지가 10, 20처럼 묶음 크기의 배수여도 다음 묶음 버튼이 비활성화된다.
- 번호, 이전 묶음, 다음 묶음을 클릭하면 정확한 1 기반 페이지를 전달한다.
- `totalPage=0`과 `totalPage=1`의 노출 정책이 의도대로 동작한다.
- `hasNext` 전용 모드에서 확인되지 않은 페이지 번호를 만들지 않는다.
- `pageBlockSize`를 도입하면 5개 묶음과 10개 묶음을 각각 검증한다.

### 2단계: 완전히 같은 시험후기 중복 제거

1. `ExamTable`을 `PaginationBar`로 교체한다.
2. `ExamReviewTablePagination`과 export를 삭제한다.
3. 미사용 `ExamTablePagination`과 export를 삭제한다.
4. 시험후기 검색, URL의 `page`, 마지막 페이지 이동을 확인한다.

이 단계는 페이지 계산과 props가 같아 가장 작은 변경으로 중복을 제거할 수 있다.

### 3단계: 기존 `PaginationBar` 사용 화면 보완

1. 게시글의 `totalPage`를 공통 컴포넌트까지 전달한다.
2. 일반 댓글과 대댓글의 `totalPage`를 공통 컴포넌트까지 전달한다.
3. 빈 결과, 마지막 페이지, 필터 후 1페이지 초기화를 확인한다.

API가 실제 응답에서 `totalPage`를 생략할 수 있다면 안전한 `hasNext` 전용 모드도 이 단계에서 적용한다.

### 4단계: 1 기반 회원 이력 교체

1. `MemberInfoTablePagenation`의 한 페이지/묶음 이동 차이를 결정한다.
2. `pageBlockSize`가 필요하면 `PaginationBar`에 먼저 추가한다.
3. 활성 화면인 `BlacklistHistoryTab`을 교체한다.
4. 비노출 `PointHistoryTab`, `DownloadedExamReviewTab`의 import도 교체한다.
5. 모든 사용처가 사라지면 오타가 있는 `MemberInfoTablePagenation.tsx`를 삭제한다.

### 5단계: 0 기반 회원 목록 교체

1. `useMemberDirectoryState`의 화면 상태를 1 기반으로 변경한다.
2. API 요청 경계에서 `page - 1`을 적용한다.
3. 검색, 필터, 정렬, 새로고침의 초기화 값을 모두 1로 변경한다.
4. 상세 화면에서 회원 수정 후 현재 목록 페이지를 다시 불러오는 흐름을 확인한다.
5. `MemberDirectorySection`을 `PaginationBar`로 교체한다.
6. `MemberDirectoryPagination.tsx`와 export를 삭제한다.

회원 목록은 페이지 기준 자체가 바뀌므로 마지막 단계에서 독립적으로 처리하는 편이 회귀 원인을 찾기 쉽다.

## 8. 구현 체크리스트

### 공통 컴포넌트 현재 상태

아래 표는 체크리스트 작성 시점의 `PaginationBar` 구현 상태다. `현재 충족`은 기존 동작을 테스트로 고정하면 되는 항목이고, `수정 필요`와 `결정 필요`는 통합 과정에서 추가 작업이 필요한 항목이다.

| 항목                       | 상태                    | 현재 구현과 필요한 작업                                                                                                                                                   |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 기반 페이지 계산         | **현재 충족**           | 내부 계산은 1 기반을 전제로 한다. 타입 주석이나 컴포넌트 문서에 이 계약을 명시해야 한다.                                                                                  |
| `totalPage` 우선 사용      | **현재 충족**           | `totalPage`가 전달되면 마지막 페이지와 다음 묶음 이동을 제한한다. 경계 테스트를 추가해야 한다.                                                                            |
| 안전한 `hasNext` 전용 모드 | **수정 필요**           | 현재는 `totalPage`가 없으면 존재 여부를 알 수 없는 페이지 번호도 현재 묶음에 10개 표시한다. 확인된 현재 페이지와 한 페이지 이전·다음만 제공하도록 보완하는 것을 권장한다. |
| 5개 페이지 묶음 지원       | **결정 필요**           | 현재 묶음 크기는 10으로 고정되어 있다. `/member/penalty`의 기존 5개 묶음을 유지할지 결정해야 한다.                                                                        |
| `pageBlockSize` prop       | **수정 필요 또는 생략** | 5개 묶음을 유지한다면 선택 prop을 추가해야 한다. 모든 화면을 10개 묶음으로 통일하면 추가하지 않아도 된다.                                                                 |
| 빈 결과·한 페이지 노출     | **결정 및 수정 필요**   | 현재 `totalPage=0`도 1페이지로 보정해 1번 버튼을 표시하며, 화면마다 숨김 조건이 다르다. 공통 노출 정책을 정해야 한다.                                                     |
| 비활성 링크 접근성         | **수정 필요**           | 현재 CSS의 `pointer-events-none`과 투명도만 사용한다. `aria-disabled`와 키보드 접근 차단 여부를 검토해야 한다.                                                            |
| 이전·다음 버튼 언어        | **결정 필요**           | 현재 화면 문구와 `aria-label`은 `Previous`, `Next` 등 영문이다. 프로젝트 언어 정책에 맞춰 한글화할지 결정해야 한다.                                                       |

### 공통 컴포넌트

- [ ] `PaginationBar`의 입력 페이지가 1 기반임을 타입 주석 또는 문서로 명시한다.
- [ ] `totalPage`가 있으면 이를 최우선 기준으로 사용한다.
- [ ] `hasNext`만 있을 때 존재하지 않는 번호를 노출하지 않는다.
- [ ] 5개 페이지 묶음을 유지해야 하는지 결정한다.
- [ ] 필요하면 `pageBlockSize`를 추가하고 기본값은 10으로 둔다.
- [ ] 빈 결과와 한 페이지 결과의 노출 정책을 결정한다.
- [ ] 비활성 링크에 `aria-disabled`와 키보드 접근 정책을 적용할지 확인한다.
- [ ] 이전/다음 버튼의 영문 레이블과 접근성 문구를 프로젝트 언어 정책에 맞출지 확인한다.

### 시험후기

- [ ] `ExamTable`이 `PaginationBar`를 import한다.
- [ ] 시험후기 1페이지가 서버의 0페이지를 요청한다.
- [ ] URL의 `page` 값과 선택된 페이지가 동기화된다.
- [ ] 검색 시 URL과 화면이 모두 1페이지로 초기화된다.
- [ ] `ExamReviewTablePagination` 파일과 export를 삭제한다.
- [ ] 미사용 `ExamTablePagination` 파일과 export를 삭제한다.

### 게시글·댓글

- [ ] 게시글 `totalPage`가 `PaginationBar`까지 전달된다.
- [ ] 일반 댓글 `totalPage`가 `PaginationBar`까지 전달된다.
- [ ] 대댓글 `totalPage`가 `PaginationBar`까지 전달된다.
- [ ] 게시글/댓글 URL의 페이지는 계속 1 기반이다.
- [ ] 게시글/댓글 API 요청은 계속 0 기반으로 변환된다.
- [ ] 필터 적용과 게시글 ID/상위 댓글 ID 이동 시 1페이지로 초기화된다.
- [ ] 마지막 페이지에서 존재하지 않는 페이지 번호가 보이지 않는다.

### 회원 이력

- [ ] `/member/penalty`의 한 페이지 데이터 개수 5개가 유지된다.
- [ ] 페이지 번호 묶음도 5개로 유지할지 결정한다.
- [ ] 한 페이지 이동 버튼을 제거하고 묶음 이동으로 통일해도 되는지 확인한다.
- [ ] `BlacklistHistoryTab`을 `PaginationBar`로 교체한다.
- [ ] `PointHistoryTab`을 `PaginationBar`로 교체하거나 미사용 코드 제거 여부를 결정한다.
- [ ] `DownloadedExamReviewTab`을 `PaginationBar`로 교체하거나 미사용 코드 제거 여부를 결정한다.
- [ ] `MemberInfoTablePagenation.tsx`를 삭제한다.
- [ ] `Pagenation`, `currentGruop` 오타가 소스에 남지 않았는지 검색한다.

### 회원 목록

- [ ] `currentPage` 초깃값을 1로 변경한다.
- [ ] 검색, 역할, 입학 연도, 전공, 정렬, 새로고침 시 1페이지로 초기화한다.
- [ ] 첫 화면에서 회원 API의 `page=0`을 요청한다.
- [ ] 화면의 2페이지에서 회원 API의 `page=1`을 요청한다.
- [ ] 상세 수정 후 원래 목록 페이지를 다시 불러온다.
- [ ] `MemberDirectorySection`을 `PaginationBar`로 교체한다.
- [ ] `MemberDirectoryPagination.tsx`와 export를 삭제한다.

### 회귀 검증과 정리

- [ ] 페이지 번호 클릭을 각 활성 라우트에서 확인한다.
- [ ] 첫 묶음과 마지막 묶음의 이동 버튼 상태를 확인한다.
- [ ] 마지막 페이지의 데이터가 페이지 크기보다 적어도 정상 표시되는지 확인한다.
- [ ] 필터 결과가 0개일 때 페이지 버튼이 잘못 노출되지 않는지 확인한다.
- [ ] 브라우저 뒤로/앞으로 이동 시 URL 기반 화면의 페이지가 복구되는지 확인한다.
- [ ] 삭제 대상 컴포넌트의 import와 barrel export가 모두 사라졌는지 `rg`로 확인한다.
- [ ] 관련 단위·화면 테스트를 실행한다.
- [ ] lint를 실행한다.
- [ ] 프로덕션 빌드를 실행한다.

## 9. 완료 기준

다음 조건을 모두 충족하면 페이지네이션 통합이 완료된 것으로 본다.

1. 페이지 계산 정책을 가진 공통 컴포넌트가 `PaginationBar` 하나만 남는다.
2. 모든 화면 상태와 URL은 1 기반 페이지를 사용한다.
3. 0 기반 서버 변환은 API 함수 또는 도메인 조회 훅에서만 수행한다.
4. `totalPage`를 받을 수 있는 화면은 존재하지 않는 페이지 번호를 노출하지 않는다.
5. `ExamReviewTablePagination`, `ExamTablePagination`, `MemberDirectoryPagination`, `MemberInfoTablePagenation`과 관련 export가 제거된다.
6. 실제 사용 중인 7개 화면의 첫 페이지, 중간 페이지, 마지막 페이지 동작이 검증된다.

## 10. 이번 작업에서 제외할 범위

통합 PR이 커지는 것을 막기 위해 다음 항목은 별도 작업으로 두는 것이 좋다.

- 문의 및 신고의 전체 조회 방식을 서버 페이지네이션으로 변경하는 작업
- 회원 활동 탭의 샘플 데이터를 실제 API로 교체하는 작업
- 시험후기 페이지의 URL 상태 로직을 `useManagePageUrl`로 통합하는 작업
- 페이지네이션 디자인 자체를 새로 설계하는 작업
- 테이블 로딩·빈 상태 UI 공통화

이 항목들은 페이지네이션 컴포넌트 통합과 독립적으로 진행할 수 있다.

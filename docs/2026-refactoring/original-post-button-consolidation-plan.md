# 원본 게시글 버튼 공통화 작업 계획

> 조사 기준: 2026-10-15 현재 소스 코드
> 상태: 1단계 완료 / 2~5단계 미착수
> 대상: 시험후기, 문의 및 신고, 게시글·댓글 관리

## 1. 작업 방향

사용자 사이트의 원본을 여는 UI를 `OriginalPostButton`으로 공통화한다. 기존 `Button`의 `outline`, `sm`을 사용하고, 문구·아이콘·새 탭 동작을 한곳에서 관리한다. 페이지 또는 도메인 컨테이너가 완성된 URL을 주입한다. URL 생성은 도메인 일반 함수로, 시험후기의 선택·조회 상태 판단은 도메인 훅으로 분리한다. 기존 데이터 조회는 유지한다.

- 문구는 띄어쓰기를 포함해 `원본 게시글`로 통일한다.
- 오른쪽에 `ExternalLink` 아이콘을 배치한다.
- 실제 요소는 `<a>`로 구현해 새 탭 열기·링크 주소 복사 등 브라우저 기본 동작을 지원한다.
- 시험후기에는 버튼을 추가하고, 문의·신고와 게시글 상세의 기존 구현은 교체한다.
- 댓글 상세는 게시글 상세로 이동하므로 도착 화면의 공통 버튼을 사용한다. 댓글 전용 원본 URL이나 사용자 사이트 댓글 위치 이동 기능을 새로 만들지 않는다.

이 문서의 스타일·상태 정책은 구현을 위한 제안 기준이다. URL 계약은 아래 1단계 확인 결과를 따른다.

## 2. 현재 구현

| 대상      | 구현 위치                                                                                                                                | 현황                                                                         | 작업                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------- |
| 시험후기  | [ExamDetailSection](../../src/domains/Reviews/components/ExamDetailSection.tsx)                                                          | 상세 헤더에 제목·작성자·삭제 버튼이 있고 원본 링크는 없음                    | 선택한 시험후기의 원본 링크 추가                    |
| 문의·신고 | [InquiryReportDetailPanel](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx)                                      | 직접 작성한 `<a>`, 둥근 알약 모양, 12px 글자, 왼쪽 아이콘, `원본게시글` 문구 | 공통 컴포넌트로 교체                                |
| 게시글    | [PostDetailPage](../../src/pages/posts/PostDetailPage.tsx)                                                                               | `Button asChild`, `outline`, `sm`, 오른쪽 아이콘. URL을 만들 수 없으면 숨김  | 기존 배치를 유지하며 공통 컴포넌트로 교체           |
| 댓글      | [PostCommentDetailPage](../../src/pages/posts/PostCommentDetailPage.tsx), [commentUrls](../../src/domains/Comments/utils/commentUrls.ts) | 댓글 조회 후 부모 게시글 상세의 `?commentId=…`로 이동                        | 이동 흐름을 유지하고 게시글 상세에서 공통 버튼 이용 |

문의·신고 헤더의 `대상글`은 **신고 대상의 어드민 화면**으로 이동한다. `원본 게시글`은 **문의·신고 자체의 사용자 화면**으로 이동한다. 두 링크의 목적지를 합치거나 서로 바꾸지 않는다. `대상글` 공통화는 이번 범위에서 제외한다.

## 3. 컴포넌트·URL 함수·도메인 훅 설계

### 역할 분리와 의존 방향

```text
게시글·문의/신고: 기존 조회 데이터 → 도메인 URL 함수 → OriginalPostButton(href)
시험후기: 기존 조회 데이터·상태 → 도메인 훅 → 도메인 URL 함수
                                        ↓
                 ExamDetailSection(originalPostUrl) → OriginalPostButton(href)
```

공통 컴포넌트는 `href`만 받아 표현을 담당한다. 도메인 종류, 게시판 ID, 경로 템플릿, URL 생성 콜백을 공통 UI에 전달하지 않는다. 페이지에서 필요한 주소를 결정하므로 다른 화면에도 같은 컴포넌트를 사용할 수 있다.

- **URL 함수**: ID와 도메인 정보로 주소를 생성하고 유효하지 않으면 `null`을 반환한다. 문자열 조합을 위해 React 훅이나 별도 상태를 만들지 않는다.
- **시험후기 도메인 훅**: 기존 조회 결과를 입력받아 선택·로딩·오류·응답 ID 일치 여부를 판단하고 URL 함수의 결과 또는 `null`을 반환한다. 추가 API 요청이나 URL 저장용 `useState`·`useEffect`는 사용하지 않는다.
- **페이지/컨테이너**: 이미 보유한 조회 데이터와 상태를 연결하고 최종 URL을 주입한다. 공통 훅에 모든 도메인 분기를 모으지 않는다.

### 파일과 책임

| 제안 파일                                           | 책임                                                          |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `src/shared/components/OriginalPostButton.tsx`      | 링크 표현, 고정 문구·아이콘·스타일, 새 탭 속성, URL 없음 처리 |
| `src/shared/components/index.ts`                    | 공통 컴포넌트 export                                          |
| `src/shared/components/OriginalPostButton.test.tsx` | 링크 계약과 미노출 동작 검증                                  |

시험후기 적용 단계에서 다음 파일을 추가한다.

| 제안 파일                                                    | 책임                                               |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `src/domains/Reviews/utils/exam-review-url.ts`               | 확인된 시험후기 경로와 유효한 ID로 URL 생성        |
| `src/domains/Reviews/hooks/useExamReviewOriginalUrl.ts`      | 선택·조회 상태에 따른 최종 URL 결정                |
| `src/domains/Reviews/hooks/useExamReviewOriginalUrl.test.ts` | 선택 변경·재조회·오류·ID 불일치에 따른 반환값 검증 |

### 공통 컴포넌트 계약

```ts
type OriginalPostButtonProps = {
  href: string | null | undefined;
};
```

- `Button asChild variant='outline' size='sm'` 내부에 `<a>`를 렌더링한다.
- 높이는 32px, 모서리·색·포커스는 기존 Button 규칙을 따른다.
- 문구 오른쪽에 `ExternalLink`를 두고 `size-4`, `aria-hidden='true'`를 적용한다.
- `target='_blank'`, `rel='noopener noreferrer'`를 고정한다.
- 화면 판독용 `sr-only` 문구로 `(새 탭에서 열림)`을 덧붙인다. 보이는 `원본 게시글` 문구가 접근 가능한 이름에 포함되게 한다.
- `href`가 없거나 공백뿐이면 렌더링하지 않는다. `href='#'`나 링크에 효력이 없는 `disabled` 속성을 사용하지 않는다.
- 도메인 데이터를 props로 받거나 내부에서 API를 호출하지 않는다. `href`는 호출부의 URL 생성 함수가 만든 유효한 주소라는 계약을 둔다.
- 첫 적용에는 `variant`, `size`, 문구·아이콘 변경 props를 제공하지 않는다. 위치·간격·줄바꿈은 부모 컨테이너에서 관리한다.

### 시험후기 훅과 주입 예시

```ts
type UseExamReviewOriginalUrlParams = {
  selectedId: number | null;
  detail: { postId: number } | null | undefined;
  isLoading: boolean; // 최초 로딩과 재조회 진행 상태를 합쳐 전달
  isError: boolean;
};

// 반환형: string | null
```

`ExamReviewPage`에서 기존 `useExamReviewDetail` 결과를 연결한다. 훅은 조건부로 호출하지 않는다.

```tsx
const originalPostUrl = useExamReviewOriginalUrl({
  selectedId: selectedExamReview?.id ?? null,
  detail: selectedExamReviewDetail,
  isLoading: isLoadingDetail || isFetchingDetail,
  isError: Boolean(detailError),
});

// 기존 props와 함께 URL만 추가로 전달
<ExamDetailSection originalPostUrl={originalPostUrl} />;

// ExamDetailSection 헤더 내부
<OriginalPostButton href={originalPostUrl} />;
```

미선택, 상세 없음, 로딩·재조회 중, 오류, 선택/응답 ID 불일치이면 훅은 `null`을 반환한다. 조건을 모두 통과하면 URL 함수로 상세 ID를 전달한다. 매 렌더에서 현재 입력으로 계산해 이전 URL이 별도 상태에 남지 않게 한다. 현재처럼 단순 계산만 필요하면 같은 계약의 일반 함수로 구현해도 되며, React 훅 사용 자체를 위해 불필요한 메모이제이션을 추가하지 않는다.

게시글과 문의·신고는 기존 URL 함수의 결과를 바로 주입한다.

```tsx
<OriginalPostButton href={buildOriginalPostUrl(post)} />
<OriginalPostButton href={buildOriginalInquiryPostUrl(detail)} />
```

## 4. URL 생성과 표시 조건

### 게시글·댓글

[buildOriginalPostUrl](../../src/domains/Posts/utils/postUrl.ts)의 기존 게시판 매핑을 유지한다. 현재 URL은 `https://www.snorose.com/board/{boardKey}/post/{postId}`이며, 이벤트·시험후기 공지는 `event-notice`, `exam-review-notice`로 분기한다. 게시판 이름을 매핑할 수 없으면 `null`을 반환하고 버튼을 숨긴다.

댓글 관리에서 전달하는 `commentId`는 어드민의 댓글 강조를 위한 값이다. 사용자 사이트가 지원하는지 확인되지 않은 댓글 쿼리나 해시를 원본 URL에 추가하지 않는다. 댓글 조회 실패·부모 게시글 정보 없음의 기존 오류 처리를 유지한다.

### 문의·신고

[buildOriginalInquiryPostUrl](../../src/domains/InquiryReport/utils/inquiryReportUrls.ts)을 유지한다. `REPORT`는 `/report/{inquiryId}`, 나머지는 `/inquiry/{inquiryId}`로 연결하며 `target`이나 `targetPostId`로 대체하지 않는다.

현재 기준 주소는 `VITE_USER_FRONT_BASE_URL`이다. 환경변수가 없을 때 `undefined/inquiry/…` 같은 주소를 만들지 않도록 URL 생성 함수에서 유효한 기준 주소와 ID를 확인하고, 생성할 수 없으면 `null`을 반환하도록 보완한다. 끝 슬래시는 정규화해 중복 슬래시를 방지한다.

게시글의 고정 운영 주소와 문의·신고의 환경변수 사용 차이는 현재 동작이다. 이번 UI 공통화에서 일괄 변경하지 않는다. 환경별 주소 정책 통일이 필요하면 별도 변경으로 다룬다.

### 시험후기

`src/domains/Reviews/utils/exam-review-url.ts`에 전용 URL 생성 함수를 추가하는 방안을 권장한다. 공통 UI가 시험후기 경로나 게시판 ID를 알게 하지 않는다.

- 사용자 프런트 소스에서 `/board/exam-review/post/:postId`를 확인했다. 기준 주소는 기존 게시글과 같은 `https://www.snorose.com`을 사용한다.
- `selectedExamReview.id`와 조회된 `selectedExamReviewDetail.postId`가 일치하는 상세 데이터 기준으로 링크를 만든다. 빠르게 선택을 바꿨을 때 이전 후기의 링크를 노출하지 않는다.
- 미선택·상세 로딩·조회 실패·ID 불일치에서는 버튼을 숨긴다.
- 삭제 상태만으로 버튼을 숨기지는 않는 것을 기본안으로 한다. 원본 접근 가능 여부는 사용자 서비스의 권한·삭제 정책을 따른다. 링크를 제공해도 사용자 사이트에서 제한될 수 있음을 구현 검증에서 확인한다.
- 시험후기 공지는 일반 후기와 별개인 `/board/exam-review-notice/post/:postId`를 사용한다.

## 5. 화면별 배치

| 화면        | 배치 기준                                | 유의 사항                                                                               |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| 시험후기    | 상세 헤더 오른쪽 작업 영역, 삭제 버튼 앞 | 삭제 여부와 원본 링크 표시 조건을 분리. 긴 제목·작성자와 버튼이 겹치지 않게 줄바꿈 허용 |
| 문의·신고   | 기존 헤더의 상태 선택 다음, 대상글 앞    | 기존 닫기 버튼 유지. 원본 링크의 글자 크기 변경으로 폭이 늘어나는지 확인                |
| 게시글·댓글 | 기존 상세 상단의 목록으로 버튼 반대편    | 댓글 강조 위치와 목록 복귀 동작 유지                                                    |

좁은 화면에서는 제목 영역에 `min-w-0`, 작업 영역에는 필요한 줄바꿈을 적용한다. 문구를 아이콘만으로 바꾸거나 원본 버튼 때문에 가로 스크롤이 생기지 않게 한다.

## 6. 작업 순서와 체크리스트

### 1단계: URL 계약 확인

- [x] 시험후기 사용자 사이트 경로·기준 주소를 확인한다.
- [x] 일반 게시글·이벤트 공지·시험후기 공지의 기존 경로를 확인한다.
- [x] 문의·신고 기준 주소 미설정·끝 슬래시와 잘못된 ID 처리 기준을 URL 생성 함수에 반영한다.
- [x] 시험후기 선택 변경 시 상세 응답과 선택 ID를 함께 확인할 수 있는지 점검한다.

### 1단계 확인 결과 (2026-10-15)

- 사용자 프런트 로컬 체크아웃 `snorose-front`의 커밋 `13b00a95`를 확인했다. `src/index.js`에서 실제로 사용하는 `src/router.js`의 시험후기 상세는 `/board/exam-review/post/:postId`이며 `ExamReviewPage`를 렌더링한다. `src/shared/constant/route.ts`의 `examReviewDetail`도 같은 경로다.
- 같은 라우터의 이벤트 공지는 `/board/event-notice/post/:postId`, 시험후기 공지는 `/board/exam-review-notice/post/:postId`이며 일반 게시글 상세 컴포넌트를 사용한다. 어드민 `buildOriginalPostUrl`의 일반 게시글·공지 분기와 대조했고 시험후기 일반/공지 회귀 테스트를 추가했다.
- 사용자 프런트 `public/index.html`의 `og:url`은 `https://www.snorose.com`이다. 시험후기도 기존 어드민 게시글 URL과 같은 운영 주소를 사용한다. 이는 로컬 소스 기준 확인이며 운영 배포 상태·로그인 후 원본 열기까지 검증한 것은 아니다.
- 문의·신고 URL 생성 함수는 기준 주소 누락·빈 값·잘못된 절대 URL, HTTP(S) 이외 프로토콜, 사용자 정보·쿼리·해시가 포함된 주소 및 양의 안전한 정수가 아닌 ID에 `null`을 반환한다. 주변 공백과 끝 슬래시를 정규화하며 기존 기준 주소의 경로는 보존한다. 호출부도 `null`일 때 링크를 숨기도록 함께 수정했다.
- `ExamReviewPage`가 선택 ID로 `useExamReviewDetail`을 호출하고 쿼리 키에도 ID를 포함한다. `ExamDetailSection`은 선택 객체와 상세 응답을 모두 받으므로 `selectedExamReview.id === selectedExamReviewDetail.postId` 비교가 가능하다.
- 다만 상세 컴포넌트에는 현재 `isLoadingDetail`만 전달하고 `detailError`는 부모 페이지에서 처리한다. **4단계에서는 부모 페이지의 도메인 훅에 오류·조회 상태를 전달**하고, 상세 컴포넌트에는 최종 `originalPostUrl`만 추가로 주입한다. 캐시가 남은 재조회 실패에서도 링크를 숨기며, `isLoadingDetail || isFetchingDetail`로 재조회 중에도 숨긴다. 1단계에서는 조회 구조를 변경하지 않았다.
- URL 단위 테스트 2개 파일, 총 60개 테스트 통과. 공통 컴포넌트 생성과 시험후기 버튼 추가는 후속 단계에서 진행한다.

### 2단계: 공통 컴포넌트 생성

- [ ] `href`만 받는 `OriginalPostButton`과 export를 추가한다. 도메인 URL 생성과 조회 로직을 포함하지 않는다.
- [ ] 문구·오른쪽 아이콘·outline/sm·새 탭 속성을 고정한다.
- [ ] URL 없음의 미노출, 새 탭 안내와 키보드 포커스를 적용한다.

### 3단계: 기존 링크 교체

- [ ] `PostDetailPage`의 중복 JSX를 공통 컴포넌트로 교체하고 불필요한 아이콘 import를 제거한다.
- [ ] `InquiryReportDetailPanel`의 원본 링크만 교체한다. `대상글`에서 사용하는 `ExternalLink` import는 유지한다.
- [ ] 문의·신고 자체의 원본 URL과 신고 대상 URL이 유지되는지 확인한다.
- [ ] 댓글 상세 → 부모 게시글 상세 이동 및 댓글 강조가 유지되는지 확인한다.

### 4단계: 시험후기 적용

- [ ] 확인한 경로 계약으로 도메인 URL 생성 함수를 작성한다.
- [ ] `useExamReviewOriginalUrl`에 선택·조회 상태 판단을 분리하고 기존 URL 생성 함수를 호출하도록 구성한다.
- [ ] `ExamReviewPage`에서 기존 조회 결과·로딩·재조회·오류 상태를 훅에 전달한다.
- [ ] `ExamDetailSection`에 `originalPostUrl` prop을 추가하고 상세 헤더의 공통 버튼에 주입한다.
- [ ] 미선택·로딩·오류·ID 불일치에서 이전 링크를 숨긴다.
- [ ] 삭제 버튼, 수정·저장, 탭 전환과 원본 열기가 독립적으로 동작하는지 확인한다.

### 5단계: 검증

- [ ] 공통 컴포넌트 테스트: 링크 이름, `href`, `target`, `rel`, URL 없음 처리.
- [ ] URL 테스트: 문의/신고 분기, 기준 주소 누락·끝 슬래시·잘못된 ID, 확인된 시험후기 경로.
- [ ] 기존 [postUrl 테스트](../../src/domains/Posts/utils/postUrl.test.ts)와 [inquiryReportUrls 테스트](../../src/domains/InquiryReport/utils/inquiryReportUrls.test.ts)의 경로 회귀 검증.
- [ ] 도메인 훅 테스트: 미선택·상세 없음·로딩·재조회·오류·잘못된 ID·ID 불일치는 `null`, 정상 상태는 원본 URL 반환.
- [ ] 시험후기 A 선택 후 B로 빠르게 변경했을 때 A의 링크가 노출되지 않는지 확인. 캐시가 있는 재조회 실패도 확인.
- [ ] 각 화면에서 새 탭 목적지, 현재 화면 상태 유지, Tab·Enter 조작과 포커스 표시 확인.
- [ ] 넓은 화면과 390px 폭에서 긴 제목·상태 선택·대상글·삭제·닫기 버튼 배치 확인.
- [ ] 관련 테스트 및 `npm run lint`, `npm run build` 실행.

## 7. 완료 기준과 제외 범위

세 도메인의 원본 열기 UI가 하나의 컴포넌트를 사용하고, 댓글 진입에서도 같은 게시글 원본 링크를 이용하면 완료한다. 화면마다 문구·아이콘 위치·스타일·새 탭 속성을 중복 정의하지 않아야 한다. 잘못되거나 이전 선택의 URL이 노출되지 않고, 기존 어드민 이동·신고 대상 확인·상세 편집 기능이 유지되어야 한다.

이번 작업에서는 목록 행마다 원본 버튼 추가, 신고 `대상글` 링크 공통화, 사용자 사이트 댓글 앵커 구현, API 계약 변경, 전체 외부 링크 공통화, 사용자 사이트의 삭제·권한 정책 변경을 다루지 않는다.

관련 계획: [Button 공통화](./button-consolidation-plan.md), [페이지 레이아웃 정렬](./page-layout-alignment-plan.md).

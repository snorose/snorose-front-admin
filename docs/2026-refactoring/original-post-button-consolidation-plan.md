# 원본 게시글 버튼 공통화 작업 계획

> 조사 기준: 2026-10-15 현재 소스 코드
> 상태: 1~5단계 완료 / 전체 테스트의 기존 실패 3개 확인
> 대상: 시험후기, 문의 및 신고, 게시글·댓글 관리

## 1. 작업 방향

사용자 사이트의 원본을 여는 UI를 `OriginalPostButton`으로 공통화한다. 기존 `Button`의 `outline`, `sm`을 사용하고, 문구·아이콘·새 탭 동작을 한곳에서 관리한다. 페이지 또는 도메인 컨테이너가 완성된 URL을 주입한다. URL 생성은 도메인 일반 함수로 유지하고, 시험후기의 선택·조회 상태 판단은 페이지에서 직접 처리한다. 별도 원본 URL 훅은 만들지 않는다. 기존 데이터 조회는 유지한다.

- 문구는 필수 `label` prop으로 전달하며 기본값은 두지 않는다. 게시글은 `원본 게시글`, 문의·신고 자체 원본은 `문의 원문` 또는 `신고 원문`, 신고 대상 링크는 `신고 대상`로 구분한다.
- 오른쪽에 `ExternalLink` 아이콘을 배치한다.
- 실제 요소는 `<a>`로 구현해 새 탭 열기·링크 주소 복사 등 브라우저 기본 동작을 지원한다.
- 시험후기·문의·신고·게시글 상세의 기존 원본 링크를 공통 버튼으로 교체한다.
- 댓글 상세는 게시글 상세로 이동하므로 도착 화면의 공통 버튼을 사용한다. 댓글 전용 원본 URL이나 사용자 사이트 댓글 위치 이동 기능을 새로 만들지 않는다.

이 문서의 스타일·상태 정책은 구현을 위한 제안 기준이다. URL 계약은 아래 1단계 확인 결과를 따른다.

## 2. 작업 전 구현

| 대상      | 구현 위치                                                                                                                                | 현황                                                                         | 작업                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------- |
| 시험후기  | [ExamDetailSection](../../src/domains/Reviews/components/ExamDetailSection.tsx)                                                          | 상세 헤더에 `스노로즈에서 보기` 링크가 있으며 선택 ID로 URL 생성             | 기존 링크 교체와 조회 상태·응답 ID 확인 보완        |
| 문의·신고 | [InquiryReportDetailPanel](../../src/domains/InquiryReport/components/InquiryReportDetailPanel.tsx)                                      | 직접 작성한 `<a>`, 둥근 알약 모양, 12px 글자, 왼쪽 아이콘, `원본게시글` 문구 | 공통 컴포넌트로 교체                                |
| 게시글    | [PostDetailPage](../../src/pages/posts/PostDetailPage.tsx)                                                                               | `Button asChild`, `outline`, `sm`, 오른쪽 아이콘. URL을 만들 수 없으면 숨김  | 기존 배치를 유지하며 공통 컴포넌트로 교체           |
| 댓글      | [PostCommentDetailPage](../../src/pages/posts/PostCommentDetailPage.tsx), [commentUrls](../../src/domains/Comments/utils/commentUrls.ts) | 댓글 조회 후 부모 게시글 상세의 `?commentId=…`로 이동                        | 이동 흐름을 유지하고 게시글 상세에서 공통 버튼 이용 |

문의·신고 헤더의 `신고 대상`은 **신고 대상의 어드민 화면**으로 이동한다. `문의 원문`·`신고 원문`은 **문의·신고 자체의 사용자 화면**으로 이동한다. 두 링크의 목적지를 합치거나 서로 바꾸지 않는다. 두 링크 모두 `OriginalPostButton`을 사용해 버튼 모양·아이콘·새 탭 동작을 통일한다. 문의·신고 자체 원본과 신고 대상은 `label`로 `문의 원문`/`신고 원문`과 `신고 대상`을 전달해 구분하고 목적지는 유지한다.

## 3. 공통 컴포넌트와 URL 주입 설계

### 역할 분리와 의존 방향

```text
게시글·문의/신고: 기존 조회 데이터 → 도메인 URL 함수 → OriginalPostButton(href)
시험후기: 페이지의 조회 상태 확인 → 도메인 URL 함수
                                     ↓
              ExamDetailSection(originalPostUrl) → OriginalPostButton(href)
```

공통 컴포넌트는 `href`와 필수 `label`을 받아 표현을 담당한다. `title` 툴팁은 내부에서 `${label} 바로가기`로 자동 생성한다. 아이콘·스타일·새 탭 동작은 공통으로 유지한다. 도메인 종류, 게시판 ID, 경로 템플릿, URL 생성 콜백을 공통 UI에 전달하지 않는다. 페이지에서 필요한 주소를 결정하므로 다른 화면에도 같은 컴포넌트를 사용할 수 있다.

- **URL 함수**: 기존 ID·도메인 정보로 주소를 생성한다. 기존 함수의 주소 생성 규칙과 반환 타입을 유지한다. 문자열 조합을 위해 React 훅이나 별도 상태를 만들지 않는다.
- **페이지/컨테이너**: 이미 보유한 조회 데이터와 상태로 표시 여부를 판단하고 최종 URL을 주입한다. 시험후기의 미선택·로딩·오류·응답 ID 불일치는 페이지에서 처리한다. URL 저장용 상태나 effect는 추가하지 않는다.

### 파일과 책임

| 제안 파일                                           | 책임                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `src/shared/components/OriginalPostButton.tsx`      | 링크 표현, 주입 문구·공통 아이콘·스타일, 새 탭 속성, URL 없음 처리 |
| `src/shared/components/index.ts`                    | 공통 컴포넌트 export                                               |
| `src/shared/components/OriginalPostButton.test.tsx` | 링크 계약과 미노출 동작 검증                                       |

시험후기 적용 단계에서는 기존 `buildOriginalExamReviewUrl` 함수를 재사용한다. 시험후기는 localhost 상대 경로로 연결되는 문제를 수정하기 위해 게시글과 동일한 고정 운영 주소를 사용한다. 문의·신고의 URL 생성 방식은 유지한다. 별도 훅 파일과 훅 전용 테스트는 추가하지 않는다.

### 공통 컴포넌트 계약

```ts
type OriginalPostButtonProps = {
  href: string | null | undefined;
  label: string; // 호출부에서 문구를 명시
};
```

- `Button asChild variant='outline' size='sm'` 내부에 `<a>`를 렌더링한다.
- 높이는 32px, 모서리·색·포커스는 기존 Button 규칙을 따른다.
- 문구 오른쪽에 `ExternalLink`를 두고 `size-4`, `aria-hidden='true'`를 적용한다.
- `target='_blank'`, `rel='noopener noreferrer'`를 고정한다.
- 화면 판독용 `sr-only` 문구로 `(새 탭에서 열림)`을 덧붙인다. 전달한 문구가 접근 가능한 이름에 포함되게 한다.
- `href`가 없거나 공백뿐이면 렌더링하지 않는다. `href='#'`나 링크에 효력이 없는 `disabled` 속성을 사용하지 않는다.
- 도메인 데이터를 props로 받거나 내부에서 API를 호출하지 않는다. `href`는 호출부의 URL 생성 함수가 만든 유효한 주소라는 계약을 둔다.
- `label`로 문구를 전달하고 `variant`, `size`, 아이콘 변경 props는 제공하지 않는다. 위치·간격·줄바꿈은 부모 컨테이너에서 관리한다.

### 페이지에서 URL을 결정하는 예시

`ExamReviewPage`가 기존 조회 결과를 확인하고 URL을 계산한다. `buildOriginalExamReviewUrl`은 기존 도메인 URL 함수를 재사용한다.

```tsx
const originalPostUrl =
  selectedExamReview &&
  selectedExamReviewDetail &&
  !isLoadingDetail &&
  !isFetchingDetail &&
  !detailError &&
  selectedExamReview.id === selectedExamReviewDetail.postId
    ? buildOriginalExamReviewUrl(selectedExamReviewDetail.postId)
    : null;

// 기존 props와 함께 URL만 추가로 전달
<ExamDetailSection originalPostUrl={originalPostUrl} />;

// ExamDetailSection 헤더 내부
<OriginalPostButton href={originalPostUrl} label='원본 게시글' />;
```

미선택, 상세 없음, 로딩·재조회 중, 오류, 선택/응답 ID 불일치이면 `null`을 주입한다. 현재 입력으로 매 렌더에서 계산하므로 이전 URL을 별도 상태에 저장하지 않는다. 같은 상태 판단이 여러 곳에서 반복되거나 복잡해질 때 훅 분리를 검토한다.

게시글과 문의·신고는 기존 URL 함수의 결과를 바로 주입한다.

```tsx
<OriginalPostButton href={buildOriginalPostUrl(post)} label='원본 게시글' />
<OriginalPostButton
  href={buildOriginalInquiryPostUrl(detail)}
  label={detail.group === 'REPORT' ? '신고 원문' : '문의 원문'}
/>
```

## 4. URL 생성과 표시 조건

### 게시글·댓글

[buildOriginalPostUrl](../../src/domains/Posts/utils/postUrl.ts)의 기존 게시판 매핑을 유지한다. 현재 URL은 `https://www.snorose.com/board/{boardKey}/post/{postId}`이며, 이벤트·시험후기 공지는 `event-notice`, `exam-review-notice`로 분기한다. 게시판 이름을 매핑할 수 없으면 `null`을 반환하고 버튼을 숨긴다.

댓글 관리에서 전달하는 `commentId`는 어드민의 댓글 강조를 위한 값이다. 사용자 사이트가 지원하는지 확인되지 않은 댓글 쿼리나 해시를 원본 URL에 추가하지 않는다. 댓글 조회 실패·부모 게시글 정보 없음의 기존 오류 처리를 유지한다.

### 문의·신고

[buildOriginalInquiryPostUrl](../../src/domains/InquiryReport/utils/inquiryReportUrls.ts)을 유지한다. `REPORT`는 `/report/{inquiryId}`, 나머지는 `/inquiry/{inquiryId}`로 연결하며 `target`이나 `targetPostId`로 대체하지 않는다.

문의·신고의 기준 주소는 기존처럼 `VITE_USER_FRONT_BASE_URL`을 사용한다. 사용자 요청에 따라 추가했던 기준 주소·ID 검증, 기본 운영 주소와 슬래시 정규화를 제거하고 기존 URL 조합 코드를 유지한다. 환경설정 값의 준비는 기존 실행 환경에서 담당한다.

게시글의 고정 운영 주소와 문의·신고의 환경변수 사용 차이는 현재 동작이다. 이번 UI 공통화에서 일괄 변경하지 않는다. 환경별 주소 정책 통일이 필요하면 별도 변경으로 다룬다.

### 시험후기

[exam-review-urls.ts](../../src/domains/Reviews/utils/exam-review-urls.ts)의 기존 `buildOriginalExamReviewUrl`을 사용한다. 시험후기도 게시글과 같은 `https://www.snorose.com` 기준 주소와 ID로 절대 URL을 생성한다. 공통 UI가 시험후기 경로나 게시판 ID를 알게 하지 않는다.

- 사용자 프런트 소스에서 `/board/exam-review/post/:postId`를 확인했다. 기준 주소는 게시글과 같은 `https://www.snorose.com`이다. 후속 요청에 따라 환경변수 의존을 제거해 localhost 상대 경로로 연결되지 않게 했다.
- `selectedExamReview.id`와 조회된 `selectedExamReviewDetail.postId`가 일치하는 상세 데이터 기준으로 링크를 만든다. 빠르게 선택을 바꿨을 때 이전 후기의 링크를 노출하지 않는다.
- 미선택·상세 로딩·조회 실패·ID 불일치에서는 버튼을 숨긴다.
- 삭제 상태만으로 버튼을 숨기지는 않는 것을 기본안으로 한다. 원본 접근 가능 여부는 사용자 서비스의 권한·삭제 정책을 따른다. 링크를 제공해도 사용자 사이트에서 제한될 수 있음을 구현 검증에서 확인한다.
- 시험후기 공지는 일반 후기와 별개인 `/board/exam-review-notice/post/:postId`를 사용한다.

## 5. 화면별 배치

| 화면        | 배치 기준                                | 유의 사항                                                                               |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| 시험후기    | 상세 헤더 오른쪽 작업 영역, 삭제 버튼 앞 | 삭제 여부와 원본 링크 표시 조건을 분리. 긴 제목·작성자와 버튼이 겹치지 않게 줄바꿈 허용 |
| 문의·신고   | 기존 헤더의 상태 선택 다음, 신고 대상 앞 | 기존 닫기 버튼 유지. 원본 링크의 글자 크기 변경으로 폭이 늘어나는지 확인                |
| 게시글·댓글 | 기존 상세 상단의 목록으로 버튼 반대편    | 댓글 강조 위치와 목록 복귀 동작 유지                                                    |

좁은 화면에서는 제목 영역에 `min-w-0`, 작업 영역에는 필요한 줄바꿈을 적용한다. 문구를 아이콘만으로 바꾸거나 원본 버튼 때문에 가로 스크롤이 생기지 않게 한다.

## 6. 작업 순서와 체크리스트

### 1단계: URL 계약 확인

- [x] 시험후기 사용자 사이트 경로·기준 주소를 확인한다.
- [x] 일반 게시글·이벤트 공지·시험후기 공지의 기존 경로를 확인한다.
- [x] 문의·신고의 기존 URL 생성 규칙을 유지한다. 추가 검증·기본 주소·정규화 변경은 사용자 요청으로 제외했다.
- [x] 시험후기 선택 변경 시 상세 응답과 선택 ID를 함께 확인할 수 있는지 점검한다.

### 1단계 확인 결과 (2026-10-15)

- 사용자 프런트 로컬 체크아웃 `snorose-front`의 커밋 `13b00a95`에서 실제 사용하는 `src/router.js`를 확인했다. 시험후기 상세는 `/board/exam-review/post/:postId`, 이벤트 공지는 `/board/event-notice/post/:postId`, 시험후기 공지는 `/board/exam-review-notice/post/:postId`다.
- 사용자 프런트 `public/index.html`의 `og:url`은 `https://www.snorose.com`이다. 문의·신고는 `VITE_USER_FRONT_BASE_URL`, 게시글과 시험후기는 고정 운영 주소를 사용한다. 이는 로컬 소스 기준 확인이며 운영 원문 열기까지 검증한 것은 아니다.
- `ExamReviewPage`는 선택 ID로 상세를 조회한다. 기존 선택 ID·상세 응답 ID·조회 상태로 링크 표시 여부를 판단하고, 상세 컴포넌트에는 최종 URL만 주입한다.
- 초기 작업에 포함했던 문의·신고 URL 검증·기본 주소·슬래시 정규화와 그 전용 테스트는 사용자 요청으로 제거했다. URL 생성은 기존 코드 그대로 유지하고 버튼 공통화에 집중한다.

### 2단계: 공통 컴포넌트 생성

- [x] URL·문구를 전달받는 `OriginalPostButton`과 export를 추가한다. 도메인 URL 생성과 조회 로직을 포함하지 않는다.
- [x] 오른쪽 아이콘·outline/sm·새 탭 속성을 공통화하고 문구는 필수 `label`로 주입한다.
- [x] URL 없음의 미노출, 새 탭 안내와 키보드 포커스를 적용한다.

### 2단계 구현 결과

- `OriginalPostButton`과 barrel export를 추가했다. `href` 외에 도메인 정보나 별도 훅을 요구하지 않는다.
- 기존 Button의 outline/sm 스타일을 재사용하고 실제 `<a>`로 렌더링한다. 아이콘은 오른쪽에 배치하며 새 탭 안내는 화면 판독용 문구로 제공한다.
- URL 없음·빈 문자열·공백에서 숨기고, 주소가 제거되면 기존 링크도 사라진다.
- 컴포넌트 테스트 6개, `npm run lint`, `npm run build`, Prettier 검사와 `git diff --check`가 통과했다. 빌드에는 번들 크기 경고가 있다.
- 게시글·문의·신고 페이지 적용은 3단계에서 완료했다. 시험후기 적용은 4단계에서 진행한다.

### 3단계: 기존 링크 교체

- [x] `PostDetailPage`의 중복 JSX를 공통 컴포넌트로 교체하고 불필요한 아이콘 import를 제거한다.
- [x] `InquiryReportDetailPanel`의 원본 링크를 교체한다. 후속 요청에 따라 신고 대상 링크도 `OriginalPostButton`으로 교체하고 `ExternalLink` import를 제거한다.
- [x] 문의·신고 자체의 원본 URL과 신고 대상 URL이 유지되는지 확인한다.
- [x] 댓글 상세 → 부모 게시글 상세 이동 및 댓글 강조가 유지되는지 확인한다.

### 3단계 구현 결과

- `PostDetailPage`와 `InquiryReportDetailPanel`에서 기존 원본 링크 JSX를 `OriginalPostButton`으로 교체했다. 게시글의 불필요한 `ExternalLink` import를 제거하고, 문의·신고도 후속 요청에서 신고 대상 전용 아이콘 import를 제거했다.
- 후속 요청에 따라 신고 대상 링크의 별도 버튼 JSX를 제거하고 `OriginalPostButton`을 재사용했다. 후속 요청에 따라 문구를 `label`로 주입한다. 자체 원본은 `문의 원문` 또는 `신고 원문`, 신고 대상은 `신고 대상`로 표시하고 오른쪽 외부 링크 아이콘은 공통으로 유지한다. `title`은 공통 컴포넌트가 `${label} 바로가기`로 자동 생성한다. 호출부에서는 `href`와 `label`만 전달한다. 화면별 아이콘·스타일 재정의는 제공하지 않는다.
- 문의·신고 자체 원본과 어드민 신고 대상 URL을 분리해 유지했다. URL 생성 함수는 기존 코드로 복원했다.
- 문의·신고 헤더는 좁은 화면에서 제목·닫기를 첫 줄, 상태·원본·신고 대상을 다음 줄에 배치하고 작업 영역의 줄바꿈을 허용한다. 넓은 화면은 제목·작업·닫기 순서로 한 줄에 배치한다.
- 기존 실제 API E2E의 원본 링크 선택자·문구를 새 계약에 맞췄다. 실제 API E2E는 이번 단계에서 실행하지 않았다.
- URL 생성 보완에만 해당하는 추가 테스트는 제거하고 기존 URL 테스트와 공통 버튼 테스트를 유지한다.
- Chrome에서 모의 API로 1440px·390px 문의/신고 원본 링크·신고 대상 구분·새 탭 속성·헤더 배치를 확인했다. 댓글 상세에서 부모 게시글의 `?commentId=123`으로 이동하고 해당 댓글이 선택되는 것과 원본 링크의 키보드 포커스를 확인했다. 페이지 스크립트 오류는 없었다.
- 브라우저 검증은 사용자 사이트 기준 주소를 검증 서버 실행에만 임시 설정하고 모의 데이터를 사용했다. 실제 사용자 사이트 로그인·원문 열기와 운영 데이터는 검증하지 않았다.

### 4단계: 시험후기 적용

- [x] 기존 `buildOriginalExamReviewUrl` 함수를 재사용하고 확인한 경로 계약을 유지한다.
- [x] `ExamReviewPage`에서 기존 조회 결과·로딩·재조회·오류·선택 ID 일치 여부로 최종 URL을 계산한다.
- [x] `ExamDetailSection`에 `originalPostUrl` prop을 추가하고 상세 헤더의 공통 버튼에 주입한다.
- [x] 미선택·로딩·오류·ID 불일치에서 이전 링크를 숨긴다.
- [x] 삭제 버튼, 수정·저장, 탭 전환과 원본 열기가 독립적으로 동작하는지 확인한다.

### 5단계: 검증

- [x] 공통 컴포넌트 테스트: 링크 이름, `href`, `target`, `rel`, URL 없음 처리 및 키보드 포커스.
- [x] 문의/신고 원문과 신고 대상 URL 및 확인된 시험후기 경로가 기존 규칙을 유지하는지 확인한다.
- [x] 기존 [postUrl 테스트](../../src/domains/Posts/utils/postUrl.test.ts)와 [inquiryReportUrls 테스트](../../src/domains/InquiryReport/utils/inquiryReportUrls.test.ts)의 경로 회귀 검증.
- [x] 시험후기 화면 검증: 미선택·상세 없음·로딩·재조회·오류·잘못된 ID·ID 불일치에서는 링크가 없고 정상 상태에서는 올바른 링크를 표시한다.
- [x] 시험후기 A 선택 후 B로 빠르게 변경했을 때 A의 링크가 노출되지 않는지 확인. 캐시가 있는 재조회 실패도 확인.
- [x] 각 화면에서 새 탭 목적지, 현재 화면 상태 유지, Tab·Enter 조작과 포커스 표시 확인.
- [x] 넓은 화면과 390px 폭에서 긴 제목·상태 선택·신고 대상·삭제·닫기 버튼 배치 확인.
- [x] 관련 테스트 및 `npm run lint`, `npm run build` 실행.

### 최종 구현·검증 결과

- 시험후기의 기존 `Link`·개별 아이콘을 `OriginalPostButton`으로 교체하고 `label='원본 게시글'`을 명시했다. `ExamReviewPage`가 기존 URL 함수로 주소를 만들고 `ExamDetailSection`에 전달한다. 별도 훅과 URL 저장 상태는 추가하지 않았다.
- 페이지에서 미선택·상세 없음·로딩·재조회·오류·잘못된 선택 ID·선택/응답 ID 불일치에 `null`을 전달한다. 삭제 상태는 원본 버튼을 숨기는 조건으로 사용하지 않는다.
- 제목·작성자와 작업 버튼은 좁은 화면에서 줄을 나누어 긴 제목과 버튼이 겹치지 않게 했다. 수정·저장·삭제·탭과 기존 조회 흐름은 유지한다.
- 새 통합 테스트 5개로 선택 변경·늦은 응답, 재조회·캐시가 있는 실패·재시도, ID 불일치·잘못된 ID, 삭제된 후기의 원본 링크와 탭 전환을 검증했다. 기존 상세 테스트 9개도 통과했다.
- 전체 테스트는 74개 파일, 541개 중 538개 통과·3개 실패다. 실패한 3개는 변경 전 HEAD를 임시 복사한 환경에서도 동일하게 재현했다. `date-time-picker-usage.test.tsx`의 작성 기간 요청 기대값 2개(`type: WRITE` 누락)와 `PostFilters.integration.test.tsx`의 게시판 이름 기대값 1개(`교환학생/어학연수`)이며 이번 변경에서는 수정하지 않았다.
- `npm run lint`, `npm run build`, E2E TypeScript 검사 및 `git diff --check`를 실행했다. 빌드는 번들 크기 경고와 함께 성공했다.
- Chrome 모의 API 검증은 1440px·390px에서 문의 원문·신고 원문·신고 대상·게시글·댓글 진입·시험후기 버튼의 URL, 툴팁, 새 탭 속성, 키보드 포커스와 배치를 확인했다. 문의·신고 원문은 Enter로 새 탭을 열고 현재 화면이 유지되는 것을 확인했다. 시험후기는 탭 전환·편집 시작/취소·삭제 모달 열기/취소 후 원본 링크가 유지되는지 확인했다.
- 검증 서버에만 `VITE_USER_FRONT_BASE_URL`을 임시 지정하고 API·사용자 원문 페이지는 모의 응답으로 처리했다. 실제 API E2E 및 운영 사용자 사이트의 로그인·권한·삭제 원문 열기는 실행하지 않았다. 환경설정 파일과 문의·신고 URL 생성 함수는 유지한다. 후속 수정에서 시험후기 기준 주소만 게시글과 같은 운영 주소로 명시하고, 시험후기 통합 테스트는 환경변수 없이도 올바른 주소가 만들어지는지 검증한다.

## 7. 완료 기준과 제외 범위

세 도메인의 원본 열기 UI가 하나의 컴포넌트를 사용하고, 댓글 진입에서도 같은 게시글 원본 링크를 이용하면 완료한다. 화면에서는 URL과 문구만 주입하고 아이콘 위치·스타일·새 탭 속성을 중복 정의하지 않아야 한다. 조회 실패 또는 선택·응답 ID 불일치로 이전 시험후기의 URL이 노출되지 않고, 기존 어드민 이동·신고 대상 확인·상세 편집 기능이 유지되어야 한다.

이번 작업에서는 목록 행마다 원본 버튼 추가, `신고 대상`의 URL 생성·동작 공통화, 사용자 사이트 댓글 앵커 구현, API 계약 변경, 전체 외부 링크 공통화, 사용자 사이트의 삭제·권한 정책 변경을 다루지 않는다.

관련 계획: [Button 공통화](./button-consolidation-plan.md), [페이지 레이아웃 정렬](./page-layout-alignment-plan.md).

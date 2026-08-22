# 어드민 Playwright E2E 사용 가이드

## 1. 이 프로젝트의 E2E 테스트 방식

어드민 E2E는 mock 없이 실제 화면, dev API, dev DB를 연결해 검증합니다.

- 브라우저: Chromium
- 어드민 주소: `http://localhost:5173`
- API: `https://dev.snorose.com`
- 실행 순서: 실제 로그인 → 인증 상태 저장 → read/write TC 실행
- 실행 방식: 충돌 방지를 위해 worker 1개로 순차 실행
- 기본 실행: headless
- 데이터 변경: 전용 QA 데이터만 사용하고 테스트 종료 시 원상 복구

문의·신고의 상세 TC와 최근 실행 결과는 [문의·신고 QA TC](./inquiry-report-admin-test-cases.md)에서 확인할 수 있습니다.

## 2. 최초 1회 준비

### 의존성과 Chromium 설치

```bash
npm install
npx playwright install chromium
```

### E2E 환경변수 파일 생성

```bash
cp .env.e2e.example .env.e2e.local
```

`.env.e2e.local`에 실제 dev 어드민 계정과 QA 데이터 ID를 입력합니다.

```dotenv
E2E_ADMIN_LOGIN_ID=
E2E_ADMIN_PASSWORD=
E2E_QA_INQUIRY_ID=
E2E_QA_REPORT_ID=
```

- `E2E_ADMIN_LOGIN_ID`, `E2E_ADMIN_PASSWORD`: dev 어드민 계정
- `E2E_QA_INQUIRY_ID`: 상태 변경과 댓글 CRUD가 가능한 전용 문의 `postId`
- `E2E_QA_REPORT_ID`: 상세와 신고글 원문 링크가 정상인 신고 `postId`
- 실제 계정과 ID가 들어 있는 `.env.e2e.local`은 Git에 커밋하지 않습니다.
- 값이 없는 `.env.e2e.example`은 필요한 환경변수 인터페이스를 공유하기 위해 커밋합니다.

문의 QA 데이터에는 공개 최상위 댓글이 있어야 하며, 댓글 첫 페이지에 새 E2E 댓글이 노출될 여유가 있어야 합니다.

## 3. 실행 명령

### 전체 실제 API QA

```bash
npm run test:e2e
```

`dev-auth` 로그인 후 모든 `*.read.spec.ts`, `*.write.spec.ts`를 실행합니다. 문의·신고 기준으로 인증 setup 1개와 TC 26개가 실행되므로 Playwright 출력에는 총 27개가 표시됩니다.

### 조회 테스트만 실행

```bash
npm run test:e2e:read
```

목록, 필터, 상세, 링크, 댓글 표시, 레이아웃처럼 데이터를 변경하지 않는 TC만 실행합니다.

### 변경 테스트만 실행

```bash
npm run test:e2e:write
```

상태 변경과 댓글 등록·수정·삭제 TC를 실행합니다. 변경한 상태와 생성한 `[E2E:*]` 댓글은 fixture가 테스트 종료 시 복구합니다.

### 특정 TC만 실행

```bash
npx playwright test --project=dev-read --grep 'TC-ADM-IR-013'
npx playwright test --project=dev-write --grep 'TC-ADM-IR-025'
```

TC ID 일부 또는 테스트 제목을 `--grep`에 전달할 수 있습니다. 프로젝트 의존성에 따라 로그인 setup도 자동 실행됩니다.

## 4. 화면을 보면서 실행하기

```bash
npm run test:e2e:ui
```

Playwright UI 앱이 열리면 다음 순서로 사용합니다.

1. 왼쪽에서 `dev-read` 또는 `dev-write` 프로젝트를 선택합니다.
2. 실행할 spec이나 개별 TC의 실행 버튼을 누릅니다.
3. 오른쪽 브라우저 화면과 각 단계의 locator, 요청, 오류를 확인합니다.
4. 실패한 단계는 해당 액션을 선택해 화면 상태와 에러 메시지를 확인합니다.

동작을 더 천천히 보고 싶으면 다음과 같이 실행합니다.

```bash
E2E_SLOW_MO=500 npm run test:e2e:ui
```

숫자는 Playwright 동작 사이에 추가할 밀리초입니다. `.env.e2e.local`에 `E2E_SLOW_MO=500`을 추가해도 됩니다.

## 5. HTML 결과 확인

일반 실행은 브라우저와 리포트를 자동으로 열지 않습니다. 마지막 실행 결과를 확인할 때만 다음 명령을 사용합니다.

```bash
npm run test:e2e:report
```

- 성공: 기대한 사용자 동작과 실제 API 응답이 모두 정상
- 실패: 제품 UI, API, QA 데이터 또는 테스트 코드 중 원인 확인 필요
- skipped: TC 사전 조건을 만족하는 dev 데이터가 없어 검증하지 못함

실패를 제품 결함으로 기록하기 전에 스크린샷, API method/path/status, QA 데이터의 사전 조건을 함께 확인합니다.

## 6. 현재 폴더 구조

```text
e2e/
├── features/
│   └── inquiry-report/
│       ├── inquiry-report.api.ts
│       ├── inquiry-report.fixture.ts
│       ├── inquiry-report.page.ts
│       ├── inquiry-report.read.spec.ts
│       └── inquiry-report.write.spec.ts
├── setup/
│   └── auth.setup.ts
├── shared/
│   └── e2e-env.ts
└── tsconfig.json
```

- `*.page.ts`: locator와 반복 UI 동작을 모은 Page Object
- `*.api.ts`: 실제 dev API 조회와 데이터 복구 요청
- `*.fixture.ts`: Page Object와 QA 데이터 제공, 변경 데이터 추적과 정리
- `*.read.spec.ts`: 서버 데이터를 변경하지 않는 TC
- `*.write.spec.ts`: 상태 변경과 CRUD처럼 서버 데이터를 변경하는 TC
- `setup/`: 모든 기능이 공유하는 실제 로그인 setup
- `shared/`: 환경변수 로딩과 dev API 실행 제한 같은 공통 코드

## 7. 다른 어드민 탭에 E2E 추가하기

기능별 폴더를 추가합니다.

```text
e2e/features/member/
├── member.api.ts
├── member.fixture.ts
├── member.page.ts
├── member.read.spec.ts
└── member.write.spec.ts
```

Playwright 설정이 `features/**/*.read.spec.ts`와 `features/**/*.write.spec.ts`를 자동으로 찾으므로 일반적으로 프로젝트 설정을 추가할 필요가 없습니다.

작성 원칙은 다음과 같습니다.

1. Page Object에는 locator와 재사용 동작만 둡니다.
2. TC의 기대 결과와 `expect`는 spec에 둡니다.
3. 실제 API 조회와 복구 요청은 API class에 둡니다.
4. 테스트별 변경 추적과 `finally` 복구는 fixture가 담당합니다.
5. write 테스트는 임의의 운영 데이터를 탐색하지 않고 전용 QA ID를 사용합니다.
6. 생성 데이터에는 기능을 식별할 수 있는 E2E 접두사를 사용합니다.
7. Authorization 토큰, 계정정보, 비밀번호는 로그와 에러 메시지에 출력하지 않습니다.
8. 여러 TC에서 같은 locator나 동작이 반복될 때만 Page Object로 올립니다.

## 8. 문의·신고 데이터 정리 방식

문의·신고 write fixture는 다음 데이터를 추적합니다.

- 변경 전 문의 상태
- UI에서 생성한 댓글과 대댓글 ID

테스트가 성공하거나 중간에 실패해도 fixture 종료 단계에서 원래 상태로 복구하고 생성 댓글을 삭제 처리합니다. 시작 시에는 이전에 중단된 테스트가 남긴 공개 상태의 `[E2E:*]` 댓글도 정리합니다.

변경 API는 `dev.snorose.com`에서만 허용됩니다. `.env`의 `VITE_API_BASE_URL`이 다른 서버를 가리키면 테스트를 즉시 중단합니다.

## 9. 자주 발생하는 문제

### 로그인 단계에서 CORS 오류가 발생하는 경우

Playwright는 `5173` 포트에서 실행하도록 설정되어 있습니다. 브라우저 콘솔에 CORS 오류가 표시되더라도 dev API의 OPTIONS 요청이 `503` 등으로 실패한 것은 아닌지 먼저 확인합니다.

이 경우 테스트 포트를 임의로 변경하기보다 다음을 확인합니다.

- `https://dev.snorose.com` 서버 상태
- `http://localhost:5173` Origin 허용 여부
- `.env`의 `VITE_API_BASE_URL`

### 고정 QA ID를 찾을 수 없는 경우

`.env.e2e.local`의 ID가 현재 문의·신고 목록에 존재하는 `postId`인지 확인합니다. 문의 ID에는 댓글 CRUD 권한과 공개 최상위 댓글이 필요합니다.

### 댓글 등록 API는 성공했지만 화면에 보이지 않는 경우

숨김·삭제 댓글이 API 페이지네이션에는 포함되어 새 댓글이 다음 페이지로 밀릴 수 있습니다. 댓글 첫 페이지에 여유가 있는 전용 문의를 사용하고, 필요하면 담당 API의 페이지네이션 동작을 확인합니다.

### 테스트를 중간에 중지한 경우

다음 write 실행 시작 시 공개 상태의 `[E2E:*]` 댓글을 우선 정리합니다. 그래도 데이터가 남아 있다면 해당 문의의 댓글과 상태를 확인한 뒤 다시 실행합니다.

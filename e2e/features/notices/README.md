# 공지 E2E 테스트

실제 dev 환경에서 공지 조회·작성·수정과 첨부 업로드를 확인합니다. 공통 설치·계정 설정은 [E2E 가이드](../../../docs/playwright-e2e-guide.md)를 참고합니다. 유저 앱의 fixture 화면 검증은 실제 API 테스트와 별도로 실행합니다.

## 실행

저장소 루트에서 실행합니다. 어드민 테스트 서버는 Playwright가 `http://localhost:3000`으로 준비합니다.

```bash
# 조회: 서버 데이터 변경 없음
npx playwright test e2e/features/notices/notices.read.spec.ts --project=dev-read

# 조회 동작을 브라우저로 확인
E2E_SLOW_MO=300 npm run test:e2e:headed -- e2e/features/notices/notices.read.spec.ts

# 이미지 첨부·임시저장: TC-004만 실행
E2E_NOTICE_CREATE=1 npx playwright test e2e/features/notices/notices.write.spec.ts --project=dev-write --grep TC-ADM-NOTICE-004

# 작성 전체: 임시저장·즉시 게시·예약 게시·동영상 업로드
E2E_NOTICE_CREATE=1 E2E_NOTICE_PUBLISH=1 npx playwright test e2e/features/notices/notices.write.spec.ts --project=dev-write

# 수정·예약 변경·공개/비공개 전환
E2E_NOTICE_CREATE=1 E2E_NOTICE_PUBLISH=1 E2E_NOTICE_UPDATE=1 npx playwright test e2e/features/notices/notices.update.write.spec.ts --project=dev-write --grep TC-ADM-NOTICE-011

# 전체 TC 수집만 확인: 서버 데이터 변경 없음
npx playwright test e2e/features/notices --project=dev-read --project=dev-write --list
```

유저 앱 화면을 검증하려면 `snorose-front`를 별도로 실행합니다. 아래 예시의 `E2E_USER_APP_URL`은 실제 유저 앱 주소로 바꿉니다. TC-012는 유저 앱에서도 dev API에 접근할 수 있는 Origin 또는 개발 프록시 설정이 필요합니다.

```bash
# 실제 저장한 서식·이미지가 유저 앱에 표시되는지 확인
E2E_NOTICE_CREATE=1 E2E_NOTICE_PUBLISH=1 E2E_NOTICE_UPDATE=1 E2E_USER_APP_URL=http://localhost:3001 npx playwright test e2e/features/notices/notices.update.write.spec.ts --project=dev-write --grep TC-ADM-NOTICE-012

# 유저 앱 UI만 확인: fixture 응답 사용, 로그인·서버 저장 없음
E2E_USER_APP_URL=http://localhost:3001 npx playwright test e2e/features/notices/notices.user-ui.read.spec.ts --project=dev-read --no-deps
```

특정 TC는 `--grep TC-ADM-NOTICE-001`처럼 선택합니다. 실제 API 테스트는 `dev-auth` 로그인을 함께 실행하고, fixture 전용 TC-013은 `--no-deps`로 로그인 준비를 제외합니다.

## 준비 데이터

- `.env.e2e.local`의 dev 어드민 계정을 사용합니다. 별도 고정 공지 ID는 필요하지 않습니다.
- 조회 TC 일부는 서로 다른 수정일·작성자·NEW 공지가 있는 dev 데이터를 요구합니다. 필요한 데이터가 없으면 해당 TC를 생략합니다.
- 작성·수정 TC는 실행마다 `[E2E:NOTICE:...]` 제목의 QA 공지를 새로 만듭니다. TC-005~007·011~012는 실제 공개 또는 예약 공개를 동반하므로 전용 QA 계정을 사용합니다.
- `E2E_NOTICE_CREATE=1`이 없으면 작성 TC를 생략합니다. TC-005~007은 `E2E_NOTICE_PUBLISH=1`, TC-011~012는 `E2E_NOTICE_UPDATE=1`도 필요합니다.
- 일반 개발 서버는 5173을 유지합니다. 5173에서 첨부를 수동 검증하려면 S3 CORS에 해당 Origin의 PUT 업로드가 허용되어야 합니다.

## 테스트 케이스

| TC                | 검증 내용                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| TC-ADM-NOTICE-001 | 실제 목록 항목·전체 건수·서버 순서·10개 단위 페이지 이동·선택한 페이지만 요청 |
| TC-ADM-NOTICE-002 | NEW 필터·검색 버튼/Enter 적용·다른 페이지의 제목 검색                         |
| TC-ADM-NOTICE-003 | 작성자 검색·작성한 공지글·공통 회원정보 팝업·회원 상세 및 작성 화면 이동      |
| TC-ADM-NOTICE-004 | 이미지 순서 변경·임시저장·실제 S3 업로드·새로고침 후 유지·유저단 비공개       |
| TC-ADM-NOTICE-005 | 즉시 게시·첨부 순서·첫 첨부 썸네일·유저 API/CDN 이미지 디코딩                 |
| TC-ADM-NOTICE-006 | 한국 시간 예약·예약 전 비공개·예약 시각 이후 서버 자동 게시                   |
| TC-ADM-NOTICE-007 | 실제 MP4 미리보기·업로드·유저 API/CDN 동영상 재생·썸네일                      |
| TC-ADM-NOTICE-008 | 날짜와 정렬 즉시 조합·날짜 해제 후 정렬·미적용 검색어 유지                    |
| TC-ADM-NOTICE-009 | 게시판·하위 게시판 전환·비활성화·이전 하위 선택 해제                          |
| TC-ADM-NOTICE-010 | 데스크톱 표 너비·오전/오후·12시간제·5분 선택·분 직접 입력                     |
| TC-ADM-NOTICE-011 | 내용 수정·기존 첨부/예약 유지·예약 변경·자동 게시·비공개/재공개               |
| TC-ADM-NOTICE-012 | 실제 저장한 본문 서식·이미지의 유저 앱 데스크톱/모바일 표시                   |
| TC-ADM-NOTICE-013 | fixture 기반 유저 앱 서식·해시태그·이미지의 데스크톱/모바일 표시              |
| TC-ADM-NOTICE-014 | 추가 오픈 게시판의 필터·조회 건수·작성 화면 선택·카테고리 숨김                |
| TC-ADM-NOTICE-015 | 유저단 첨부 확장자·이미지 크기 제한·오류 토스트·정상 PNG 선택                 |

예약·썸네일은 비동기로 처리되어 일부 변경 TC는 수 분이 걸릴 수 있습니다. 동영상 fixture는 [파일 설명](./fixtures/README.md)을 참고합니다.

## 데이터 정리

- 조회 TC와 fixture 전용 TC-013은 서버 데이터를 변경하지 않습니다.
- 생성한 공지 ID와 고유 제목은 HTML 리포트의 `created-notice.json`에 기록합니다. 응답 유실로 ID를 확인하지 못하면 고유 제목으로 등록 여부를 확인합니다.
- TC-011~012는 종료 시 해당 실행에서 생성한 QA 공지를 비공개로 전환합니다. 기존 공지는 수정하지 않습니다.
- **공지 삭제 API가 없어 생성한 글은 자동 삭제되지 않습니다.** TC-004~007의 생성 데이터와 비공개 처리한 QA 글은 리포트의 ID를 기준으로 백엔드에서 정리합니다.
- 실패·강제 종료 시 공개 글이나 예약이 남을 수 있으므로 생성 기록과 목록을 확인합니다. 생성 TC는 자동 재시도하지 않습니다.

## 검증 한계

- 검색·필터는 현재 연동된 목록 API가 `page`만 받아 전체 페이지를 조회한 뒤 적용합니다. 기본 목록은 현재 페이지만 조회합니다.
- 기존 첨부 정보와 예약 시각을 조회할 수 없어 수정 시 첨부는 유지하고, 예약 시각은 새로 지정한 경우에만 변경합니다.
- 저장 후 첨부 업로드가 실패해도 생성된 공지가 남을 수 있습니다. 첨부 재시도는 제공하지 않으며 오류 토스트·목록 확인·중복 전송 차단은 단위·통합 테스트로 확인합니다.
- 삭제 글의 읽기 전용 표시, 열린 에디터 메뉴 잠금, 조회 실패·중복 제출은 단위·통합 테스트에서도 확인합니다.
- TC-005~007은 유저 API/CDN과 브라우저 미디어를 검증합니다. 실제 유저 앱 전체 화면은 TC-012, fixture 화면은 TC-013으로 구분합니다. 예약 첨부의 썸네일 정책과 모든 파일 포맷·크기 조합은 검증 범위에 포함하지 않습니다.

## 최근 검증 결과

- 확인일: `2026-11-23`
- 실제 API 조회: 로그인 준비 1개·조회 8개, **9개 통과**
- 공지 단위·통합 테스트: **184개 통과**
- 앱·E2E 타입 검사, 프로덕션 빌드·린트: 통과

위 결과는 조회 회귀 실행 기준이며 작성·수정·유저 앱 연동 TC를 모두 재실행한 결과는 아닙니다. HTML 결과는 `npm run test:e2e:report`로 확인합니다.

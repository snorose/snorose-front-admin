# E2E 문서 안내

설치, 로그인 설정, 공통 실행 명령은 [Playwright E2E 사용 가이드](../docs/playwright-e2e-guide.md)를 참고합니다.

## 브라우저를 보면서 실행하기

저장소 루트에서 다음 명령을 실행하면 브라우저 창을 열어 조회 테스트를 실행합니다. 로그인 setup도 자동 실행됩니다.

```bash
npm run test:e2e:headed
```

포인트 조회 테스트만 천천히 실행하려면 다음 명령을 사용합니다. `E2E_SLOW_MO=500`은 동작 사이에 0.5초의 지연을 추가합니다.

```bash
E2E_SLOW_MO=500 npm run test:e2e:headed -- e2e/features/points/points.read.spec.ts
```

이 명령은 `dev-read` 프로젝트를 실행합니다. 실제 지급·차감 같은 변경 테스트는 별도의 `dev-write` 명령으로 실행합니다.

## 기능별 문서

- [단일건 포인트](./features/points/README.md): 조회·변경 테스트, QA 회원 설정, 잔액 복구와 TC 목록
- [문의·신고 QA TC](../docs/inquiry-report-admin-test-cases.md): 기존 상세 TC와 실행 결과

새 기능의 테스트를 추가할 때는 `features/<기능>/README.md`에 실행 방법, 필요한 QA 데이터와 환경변수, TC 목록, 복구 방식과 검증 한계를 함께 기록하고 위 목록에 링크를 추가합니다.

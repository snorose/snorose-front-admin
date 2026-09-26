# E2E 문서 안내

설치, 로그인 설정, 공통 실행 명령은 [Playwright E2E 사용 가이드](../docs/playwright-e2e-guide.md)를 참고합니다.

## 기능별 문서

- [단일건 포인트](./features/points/README.md): 조회·변경 테스트, QA 회원 설정, 잔액 복구와 TC 목록
- [문의·신고 QA TC](../docs/inquiry-report-admin-test-cases.md): 기존 상세 TC와 실행 결과

새 기능의 테스트를 추가할 때는 `features/<기능>/README.md`에 실행 방법, 필요한 QA 데이터와 환경변수, TC 목록, 복구 방식과 검증 한계를 함께 기록하고 위 목록에 링크를 추가합니다.

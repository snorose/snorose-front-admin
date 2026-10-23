# 운영 배포 릴리스 자동화

`Production Release` 워크플로는 main에 변경이 반영되면 Cloudflare Pages 배포 성공을 확인하고 GitHub 태그와 Release를 생성한다.

## 반영 및 실행

1. 워크플로와 스크립트를 작업 브랜치에서 PR로 dev에 반영한다.
2. 기존 dev → main 릴리스 PR을 병합한다.
3. main 커밋의 `Cloudflare Pages` 검사가 성공하면 자동으로 릴리스를 발행한다.

main·dev에 버전 변경 커밋을 직접 푸시하지 않으며, 브랜치 보호 규칙을 우회할 필요가 없다. 기본 브랜치는 dev이지만 태그 대상은 항상 해당 실행의 main 커밋 SHA로 지정한다.

## 버전과 변경 내역

- 정식 버전 태그(`v숫자.숫자.숫자`)를 숫자로 비교해 다음 minor 버전을 계산한다. 예: `v1.11.3` → `v1.12.0`.
- 기존 태그가 없으면 `v0.1.0`으로 시작한다. 사전 릴리스나 다른 이름의 태그는 버전 계산에서 제외한다.
- 이전 버전 태그부터 배포된 커밋까지 GitHub가 생성한 변경 내역을 사용한다. 기존 릴리스와 같은 PR 목록 형식을 유지한다.
- 태그가 없으면 GitHub Release API가 배포된 커밋에 태그를 함께 생성한다. Tags와 Releases 양쪽에 반영된다.
- `package.json`과 `package-lock.json`은 수정하지 않는다. 운영 릴리스 버전은 GitHub 태그로 관리한다.

## 배포 확인과 중복 방지

- 해당 SHA의 `Cloudflare Pages` 검사 중 `cloudflare-workers-and-pages` 앱이 만든 가장 최근 결과만 확인한다.
- 15초 간격으로 최대 30분 대기한다. 배포 실패·취소·건너뛰기 또는 시간 초과 시 태그와 Release를 생성하지 않는다.
- 워크플로는 `queue: max`로 순차 실행한다. GitHub는 최대 100개의 대기 실행을 지원한다.
- 이미 정식 릴리스가 있는 커밋은 다시 발행하지 않는다. 태그만 생성된 경우에는 같은 태그로 릴리스 생성을 재시도한다.
- 더 최신 커밋이 이미 릴리스되었다면 과거 실행은 건너뛴다. 이전 태그와 이력이 갈라진 커밋은 오류로 중단한다.

## 권한과 재실행

별도 PAT나 Cloudflare 토큰 없이 기본 `GITHUB_TOKEN`의 `checks: read`, `contents: write` 권한을 사용한다. 조직 정책에서 쓰기 권한을 제한하거나 태그 생성 규칙을 추가했다면 릴리스 생성 권한을 확인해야 한다.

실패한 실행은 GitHub Actions의 `Re-run jobs`로 재시도할 수 있다. Cloudflare 배포가 실패했다면 먼저 해당 커밋의 배포를 성공시킨 뒤 재시도한다. Actions의 `Production Release` → `Run workflow`에서 main을 선택해 현재 main 커밋을 처리할 수도 있다. dev에서 수동 실행한 작업은 건너뛴다.

## 로컬 검증

```sh
node --test .github/scripts/release-check.cjs
```

검증에서는 GitHub API를 대체하므로 실제 태그나 Release를 생성하지 않는다. PR Quality Check에서도 같은 검증을 실행한다.

참고: [GitHub Release API](https://docs.github.com/en/rest/releases/releases#create-a-release), [워크플로 실행 대기열](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency), [Cloudflare 검사 결과](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#check-runs).

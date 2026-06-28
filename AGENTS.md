# snorose-front-admin 에이전트 지침

## Git

- 커밋 메시지는 반드시 `tag: 한국어 설명` 형식을 사용한다.
- 허용 커밋 태그는 `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `merge`이다.
- 사용자가 명시적으로 영어를 요청하지 않는 한 커밋 메시지 본문에 영어 설명을 쓰지 않는다.
- 커밋 전 `.husky/commit-msg`와 최근 커밋 메시지를 확인하고, 최종 메시지가 한국어인지 검증한다.

## PR

- PR을 생성하거나 수정하기 전에 반드시 `.github/pull_request_template.md`와 `.github/labeler.yml`을 읽는다.
- PR 제목은 자동 라벨 규칙에 맞게 반드시 `tag: 한국어 제목` 형식을 사용한다.
- `tag:` 접두사가 빠진 제목으로 PR을 생성하지 않는다.
- PR 본문은 저장소 PR 템플릿의 섹션 구조를 유지한다.
- 사용자가 다른 대상 브랜치를 지정하지 않으면 `dev`를 기본 대상 브랜치로 사용한다.

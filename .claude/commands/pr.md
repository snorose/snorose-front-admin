# /pr

현재 브랜치의 변경사항으로 이 프로젝트 규칙에 맞는 PR을 생성한다.

## 사전 확인

1. `git branch --show-current`로 현재 브랜치 확인
2. `gh api user --jq .login`으로 GitHub 인증 사용자 확인
   - 실패하면 PR 생성 중단, `gh auth login` 먼저 실행하도록 안내
3. 베이스 브랜치 결정:
   - 사용자가 명시하면 그것 사용
   - 아니면 `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`으로 확인 (이 프로젝트는 `dev`)
4. `git diff {base}...HEAD --stat`로 변경사항 존재 여부 확인
   - 변경사항 없으면: `PR로 만들 변경사항이 없습니다.` 출력 후 종료

## 이슈 번호 추출

브랜치명에서 이슈 번호 추출 (이 프로젝트 브랜치 패턴: `{type}/#{이슈번호}-{설명}`):

- `#숫자` 패턴 우선: `feat/#123-login` → `123`
- 없으면 첫 번째 숫자 묶음: `feat/123-login` → `123`
- 못 찾으면 `Close #` 형태 유지

## 변경사항 분석

- `git log {base}...HEAD --oneline`으로 전체 커밋 히스토리 확인
- `git diff {base}...HEAD`로 전체 변경 내용 파악

## PR 제목 작성

`.github/labeler.yml`의 라벨 규칙 기반으로 제목 prefix를 결정한다:

| prefix      | 자동 라벨   |
| ----------- | ----------- |
| `feat:`     | ✨ Feature  |
| `fix:`      | 🐞 BugFix   |
| `docs:`     | 📄 Docs     |
| `chore:`    | 🧹 Chore    |
| `modify:`   | 🪄 Modify   |
| `style:`    | 🎨 UI       |
| `merge:`    | ❄️ Release  |
| `refactor:` | 🛠️ Refactor |
| `test:`     | 🧪 Test     |

형식: `tag: 한국어 핵심 설명 (#이슈번호)` (50자 이내)

`--label` 플래그는 사용하지 않는다 (제목 prefix로 자동 라벨 부여됨).

## PR 본문 작성

`.github/pull_request_template.md` 구조를 반드시 유지한다:

```markdown
## 🔎 What is this PR?

Close #{이슈번호}

- [Figma]()
- [Notion]()

## 🎯 변경 사항

- {핵심 변경점 bullet, 완성된 명사/동사원형으로 끝내기}

## 📸 스크린샷 (선택 사항)

<!--
| Before | After |
| :----: | :---: |
|  |  |
-->

## 🧐 리뷰어가 어떤 부분에 집중해야 할까요? (선택 사항)
```

본문 작성 기준:

- 줄 끝을 `했습니다`, `합니다` 같은 종결형이나 `...`으로 끝내지 않는다
- 무엇을 바꿨는지보다 **왜** 바꿨는지 중심으로 작성
- 변경사항이 많으면 전부 나열하지 말고 리뷰에 중요한 것 우선
- Figma, Notion 링크는 알 수 있을 때만 채운다
- 스크린샷은 UI 변경이 있거나 사용자가 이미지를 제공한 경우에만 채운다

## 생성 전 확인

PR 요약을 텍스트로 먼저 출력한 뒤, AskUserQuestion 툴로 인터랙티브 선택지를 제시한다:

```
PR 제목: {제목}
대상 브랜치: {base} ← {현재 브랜치}
Assignee: {gh 사용자명}

본문 요약:
{변경사항 핵심 2-3줄}
```

질문: "이 내용으로 PR을 생성할까요?"
선택지:

- PR 생성 (기본값)
- 취소
- 수정 요청

- 방향키로 선택, Enter로 확정
- "PR 생성" 선택 후 추가 확인 없이 즉시 실행:

```bash
gh pr create \
  --title "{제목}" \
  --body-file "{임시파일}" \
  --base "{base}" \
  --assignee "{gh사용자명}"
```

- 성공 시 PR URL 출력

## 금지

- PR merge 금지
- force-push로 base 브랜치 덮어쓰기 금지
- `--label` 플래그 직접 사용 금지 (제목 prefix로 자동 처리)
- 사용자 확인 없이 PR 생성 금지

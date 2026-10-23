const { setTimeout: sleep } = require('node:timers/promises');

const VERSION = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function compareVersions(left, right) {
  const a = left.name.match(VERSION).slice(1).map(Number);
  const b = right.name.match(VERSION).slice(1).map(Number);
  return b[0] - a[0] || b[1] - a[1] || b[2] - a[2];
}

module.exports = async function release({
  github,
  context,
  core,
  wait = sleep,
  maxAttempts = 120,
}) {
  if (
    context.ref !== 'refs/heads/main' ||
    !['push', 'workflow_dispatch'].includes(context.eventName)
  ) {
    throw new Error('main 배포 워크플로에서만 릴리스를 생성할 수 있습니다.');
  }

  const repo = context.repo;
  const sha = context.sha;
  let deployed = false;

  // GitHub Actions 자체 검사가 아닌 Cloudflare 앱의 해당 커밋 배포만 확인한다.
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const checks = await github.paginate(github.rest.checks.listForRef, {
      ...repo,
      ref: sha,
      check_name: 'Cloudflare Pages',
      filter: 'latest',
      per_page: 100,
    });
    const check = checks
      .filter(
        (item) =>
          item.name === 'Cloudflare Pages' &&
          item.app?.slug === 'cloudflare-workers-and-pages' &&
          item.head_sha === sha
      )
      .sort((a, b) => b.id - a.id)[0];

    if (check?.status === 'completed') {
      if (check.conclusion !== 'success') {
        throw new Error(
          `Cloudflare 배포가 성공하지 않았습니다: ${check.conclusion}`
        );
      }
      deployed = true;
      break;
    }

    core.info(
      `Cloudflare 배포 대기 중 (${attempt + 1}/${maxAttempts}): ${sha}`
    );
    if (attempt + 1 < maxAttempts) await wait(15_000);
  }

  if (!deployed) {
    throw new Error('30분 안에 Cloudflare 배포 성공을 확인하지 못했습니다.');
  }

  const tags = (
    await github.paginate(github.rest.repos.listTags, {
      ...repo,
      per_page: 100,
    })
  )
    .filter((tag) => VERSION.test(tag.name))
    .sort(compareVersions);
  const existingTag = tags.find((tag) => tag.commit.sha === sha);

  if (existingTag) {
    try {
      const { data } = await github.rest.repos.getReleaseByTag({
        ...repo,
        tag: existingTag.name,
      });
      if (data.draft || data.prerelease) {
        throw new Error(
          `${existingTag.name} 릴리스 상태를 수동으로 확인해주세요.`
        );
      }
      core.notice(`이미 발행된 커밋입니다: ${data.html_url}`);
      return;
    } catch (error) {
      if (error.status !== 404) throw error;
      // 태그 생성 후 릴리스 발행이 실패했다면 같은 태그로 복구한다.
    }

    if (existingTag.name !== tags[0].name) {
      core.notice('더 최신 태그가 있어 과거 커밋의 릴리스 발행을 건너뜁니다.');
      return;
    }
  }

  const previous = tags.find((tag) => tag.name !== existingTag?.name);
  if (previous) {
    const { data } = await github.rest.repos.compareCommitsWithBasehead({
      ...repo,
      basehead: `${previous.name}...${sha}`,
    });
    if (data.status === 'behind' || data.status === 'identical') {
      core.notice('이미 더 최신 커밋이 릴리스되어 과거 배포를 건너뜁니다.');
      return;
    }
    if (data.status !== 'ahead') {
      throw new Error('이전 태그와 배포 커밋의 이력이 연결되지 않습니다.');
    }
  }

  const [, major, minor] = previous?.name.match(VERSION) ?? ['', '0', '0'];
  const tagName = existingTag?.name ?? `v${major}.${Number(minor) + 1}.0`;
  const { data: notes } = await github.rest.repos.generateReleaseNotes({
    ...repo,
    tag_name: tagName,
    target_commitish: sha,
    ...(previous ? { previous_tag_name: previous.name } : {}),
  });

  // GitHub가 태그와 Release를 함께 생성한다. 브랜치에는 커밋을 쓰지 않는다.
  const { data: published } = await github.rest.repos.createRelease({
    ...repo,
    tag_name: tagName,
    target_commitish: sha,
    name: tagName,
    body: notes.body,
    draft: false,
    prerelease: false,
    make_latest: 'true',
  });

  core.setOutput('tag', tagName);
  core.setOutput('url', published.html_url);
  core.notice(`태그 및 릴리스 생성 완료: ${published.html_url}`);
};

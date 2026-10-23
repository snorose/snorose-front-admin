// 앱의 Vitest 수집 패턴과 분리한 GitHub Actions 전용 Node 테스트.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const release = require('./release.cjs');

const SHA = 'a'.repeat(40);
const tag = (name, sha = 'b'.repeat(40)) => ({ name, commit: { sha } });
const check = (overrides = {}) => ({
  id: 1,
  name: 'Cloudflare Pages',
  app: { slug: 'cloudflare-workers-and-pages' },
  head_sha: SHA,
  status: 'completed',
  conclusion: 'success',
  ...overrides,
});

function fixture({ tags = [tag('v1.11.0')], checks = [[check()]] } = {}) {
  const calls = { created: [], notes: [], compared: [], checks: [], waits: [] };
  const rest = {
    checks: { listForRef: Symbol('checks') },
    repos: {
      listTags: Symbol('tags'),
      getReleaseByTag: async () => {
        throw Object.assign(new Error('Not Found'), { status: 404 });
      },
      compareCommitsWithBasehead: async (params) => {
        calls.compared.push(params);
        return { data: { status: 'ahead' } };
      },
      generateReleaseNotes: async (params) => {
        calls.notes.push(params);
        return { data: { body: '자동 생성된 변경 내역' } };
      },
      createRelease: async (params) => {
        calls.created.push(params);
        return { data: { html_url: `https://example.com/${params.tag_name}` } };
      },
    },
  };
  const args = {
    github: {
      rest,
      paginate: async (method, params) => {
        if (method === rest.repos.listTags) return tags;
        assert.equal(method, rest.checks.listForRef);
        calls.checks.push(params);
        return checks[Math.min(calls.checks.length - 1, checks.length - 1)];
      },
    },
    context: {
      repo: { owner: 'snorose', repo: 'snorose-front-admin' },
      sha: SHA,
      ref: 'refs/heads/main',
      eventName: 'push',
    },
    core: { info() {}, notice() {}, setOutput() {} },
    wait: async (ms) => calls.waits.push(ms),
    maxAttempts: 3,
  };
  return { args, calls, repos: rest.repos };
}

test('배포된 SHA에 minor 태그와 자동 생성 노트를 발행한다', async () => {
  const { args, calls } = fixture({
    tags: [tag('v1.9.0'), tag('v1.11.3'), tag('v2.0.0-rc.1'), tag('other')],
  });
  await release(args);
  assert.equal(calls.checks[0].ref, SHA);
  assert.equal(calls.compared[0].basehead, `v1.11.3...${SHA}`);
  assert.equal(calls.notes[0].previous_tag_name, 'v1.11.3');
  assert.equal(calls.notes[0].target_commitish, SHA);
  assert.equal(calls.created.length, 1);
  assert.deepEqual(calls.created[0], {
    ...args.context.repo,
    tag_name: 'v1.12.0',
    target_commitish: SHA,
    name: 'v1.12.0',
    body: '자동 생성된 변경 내역',
    draft: false,
    prerelease: false,
    make_latest: 'true',
  });
});

test('검사 미등록과 배포 진행 중에는 기다리고 성공 후 발행한다', async () => {
  const { args, calls } = fixture({
    checks: [
      [],
      [check({ status: 'in_progress', conclusion: null })],
      [check()],
    ],
  });
  await release(args);
  assert.deepEqual(calls.waits, [15_000, 15_000]);
  assert.equal(calls.created.length, 1);
});

for (const conclusion of [
  'failure',
  'cancelled',
  'skipped',
  'neutral',
  'timed_out',
]) {
  test(`배포 결과가 ${conclusion}이면 태그와 릴리스를 만들지 않는다`, async () => {
    const { args, calls } = fixture({ checks: [[check({ conclusion })]] });
    await assert.rejects(release(args), /배포가 성공하지 않았습니다/);
    assert.equal(calls.created.length, 0);
    assert.equal(calls.notes.length, 0);
  });
}

test('다른 앱, 다른 커밋, 다른 이름의 성공 검사로 발행하지 않는다', async () => {
  const { args, calls } = fixture({
    checks: [
      [
        check({ app: { slug: 'github-actions' } }),
        check({ head_sha: 'c'.repeat(40) }),
        check({ name: 'PR Quality Check' }),
      ],
    ],
  });
  await assert.rejects(release(args), /30분 안에/);
  assert.equal(calls.created.length, 0);
});

test('같은 이름의 검사가 여러 개면 가장 최근 결과를 사용한다', async () => {
  const { args, calls } = fixture({
    checks: [[check(), check({ id: 2, conclusion: 'failure' })]],
  });
  await assert.rejects(release(args), /배포가 성공하지 않았습니다/);
  assert.equal(calls.created.length, 0);
});

test('이미 릴리스된 SHA를 재실행해도 새 버전을 만들지 않는다', async () => {
  const { args, calls, repos } = fixture({ tags: [tag('v1.12.0', SHA)] });
  repos.getReleaseByTag = async () => ({
    data: { html_url: 'https://example.com' },
  });
  await release(args);
  assert.equal(calls.created.length, 0);
  assert.equal(calls.notes.length, 0);
});

test('태그만 생성되고 발행에 실패한 경우 같은 버전으로 복구한다', async () => {
  const { args, calls } = fixture({
    tags: [tag('v1.12.0', SHA), tag('v1.11.0')],
  });
  await release(args);
  assert.equal(calls.created[0].tag_name, 'v1.12.0');
  assert.equal(calls.notes[0].previous_tag_name, 'v1.11.0');
});

test('권한 오류를 릴리스 미존재로 취급하지 않는다', async () => {
  const { args, calls, repos } = fixture({ tags: [tag('v1.12.0', SHA)] });
  repos.getReleaseByTag = async () => {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  };
  await assert.rejects(release(args), /Forbidden/);
  assert.equal(calls.created.length, 0);
});

for (const status of ['behind', 'identical', 'diverged']) {
  test(`이전 태그와의 관계가 ${status}이면 새 릴리스를 만들지 않는다`, async () => {
    const { args, calls, repos } = fixture();
    repos.compareCommitsWithBasehead = async () => ({ data: { status } });
    if (status === 'diverged') {
      await assert.rejects(release(args), /이력이 연결되지 않습니다/);
    } else {
      await release(args);
    }
    assert.equal(calls.created.length, 0);
  });
}

test('기존 버전 태그가 없으면 v0.1.0으로 시작한다', async () => {
  const { args, calls } = fixture({ tags: [] });
  await release(args);
  assert.equal(calls.created[0].tag_name, 'v0.1.0');
  assert.equal(calls.notes[0].previous_tag_name, undefined);
});

test('dev에서 수동 실행하면 배포 조회나 릴리스 생성을 하지 않는다', async () => {
  const { args, calls } = fixture();
  args.context.ref = 'refs/heads/dev';
  args.context.eventName = 'workflow_dispatch';
  await assert.rejects(release(args), /main 배포 워크플로/);
  assert.equal(calls.checks.length, 0);
  assert.equal(calls.created.length, 0);
});

test('main 수동 실행은 배포 성공을 확인한 뒤 발행한다', async () => {
  const { args, calls } = fixture();
  args.context.eventName = 'workflow_dispatch';
  await release(args);
  assert.equal(calls.created[0].target_commitish, SHA);
});

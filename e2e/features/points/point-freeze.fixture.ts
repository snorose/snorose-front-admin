import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import { PointFreezeApi } from './point-freeze.api';
import { PointFreezePage } from './point-freeze.page';

export const test = base.extend<{
  freezePage: PointFreezePage;
  freezeApi: PointFreezeApi;
  freezeQa: { prefix: string };
}>({
  freezePage: async ({ page }, use) => {
    await use(new PointFreezePage(page));
  },
  freezeApi: async ({ context }, use) => {
    await use(await PointFreezeApi.create(context));
  },
  freezeQa: async ({ freezeApi }, use) => {
    // DB title은 varchar(30)이므로 16자리 실행 ID와 짧은 접두사를 사용합니다.
    const prefix = `[E2E:PF:${randomUUID().replaceAll('-', '').slice(0, 16)}]`;
    try {
      await use({ prefix });
    } finally {
      await freezeApi.cleanup(prefix);
    }
  },
});

export { expect };

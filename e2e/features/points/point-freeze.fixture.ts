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
    const prefix = `[E2E:POINT-FREEZE:${randomUUID().replaceAll('-', '').slice(0, 16)}]`;
    try {
      await use({ prefix });
    } finally {
      await freezeApi.cleanup(prefix);
    }
  },
});

export { expect };

import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import { FaqApi } from './faqs.api';
import { FaqManagementPage } from './faqs.page';

export const test = base.extend<{
  faqPage: FaqManagementPage;
  faqApi: FaqApi;
  faqQa: { prefix: string };
}>({
  faqPage: async ({ page }, use) => {
    await use(new FaqManagementPage(page));
  },
  faqApi: async ({ context }, use) => {
    await use(await FaqApi.create(context));
  },
  faqQa: async ({ faqApi }, use) => {
    const prefix = `[E2E:FAQ:${randomUUID().replaceAll('-', '').slice(0, 16)}]`;
    try {
      await use({ prefix });
    } finally {
      await faqApi.cleanup(prefix);
    }
  },
});

export { expect };

/** 파일은 메모리에서 생성하며 실제 지급 버튼은 누르지 않습니다. */
import { type Page, expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';

const headers = ['이름', '학번', '포인트', '카테고리', '메모'];
const firstRow = [
  'E2E 미리보기',
  'E2E-학생-001',
  10,
  'POINT_REWARD_ETC',
  '[E2E:EXCEL] 첫 명단',
];
const secondRow = [
  'E2E 새 명단',
  'E2E-학생-002',
  -10,
  'POINT_DEDUCTION_ETC',
  '[E2E:EXCEL] 교체 명단',
];

async function uploadWorkbook(
  page: Page,
  rows: (string | number)[][],
  name = 'e2e-point-preview.xlsx'
) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet(rows),
    '포인트지급'
  );
  const buffer = XLSX.write(book, {
    type: 'buffer',
    bookType: 'xlsx',
  }) as Buffer;
  await page.locator('#excel-point-file').setInputFiles({
    name,
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  });
}

test.describe('엑셀 포인트 지급 read QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/point/excel-upload');
    await expect(
      page.getByRole('heading', { name: '엑셀 업로드 지급', exact: true })
    ).toBeVisible();
  });

  test('[TC-ADM-PE-001] 파일 미선택 시 지급 실행이 비활성화된다', async ({
    page,
  }) => {
    await expect(
      page.getByText('선택된 파일이 없습니다.', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '지급 실행', exact: true })
    ).toBeDisabled();
    await expect(
      page.getByText('명단 업로드 후 미리보기 표가 여기에 표시됩니다.', {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('radio', { name: '즉시 지급', exact: true })
    ).toBeChecked();
  });

  test('[TC-ADM-PE-002] 제목 행만 있는 파일은 명단으로 사용하지 않는다', async ({
    page,
  }) => {
    await uploadWorkbook(page, [headers]);
    await expect(
      page.getByText('미리보기로 표시할 데이터가 없습니다.', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('선택된 파일이 없습니다.', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '지급 실행', exact: true })
    ).toBeDisabled();
  });

  test('[TC-ADM-PE-003] XLSX 명단의 값과 원본 행 번호를 미리보기에 표시한다', async ({
    page,
  }) => {
    await uploadWorkbook(page, [headers, firstRow]);
    const preview = page.getByRole('region', {
      name: '업로드 명단 미리보기 (1명)',
      exact: true,
    });
    await expect(preview).toBeVisible();
    const cells = preview.locator('tbody tr').getByRole('cell');
    await expect(cells).toHaveText(['2', ...firstRow.map(String)]);
    await expect(
      page.getByText('e2e-point-preview.xlsx', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '지급 실행', exact: true })
    ).toBeEnabled();
    await page
      .getByLabel('총괄 메모', { exact: true })
      .fill('[E2E:EXCEL] 총괄 메모');
    await expect(page.getByLabel('총괄 메모', { exact: true })).toHaveValue(
      '[E2E:EXCEL] 총괄 메모'
    );
  });

  test('[TC-ADM-PE-004] 같은 이름의 파일을 다시 올리면 새 명단으로 교체하고 총괄 메모를 지운다', async ({
    page,
  }) => {
    await uploadWorkbook(page, [headers, firstRow]);
    await expect(
      page.getByRole('cell', { name: String(firstRow[0]), exact: true })
    ).toBeVisible();
    await page
      .getByLabel('총괄 메모', { exact: true })
      .fill('[E2E:EXCEL] 이전 명단 메모');
    await uploadWorkbook(page, [headers, secondRow]);
    await expect(
      page.getByRole('cell', { name: String(secondRow[0]), exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: String(firstRow[0]), exact: true })
    ).toHaveCount(0);
    const preview = page.getByRole('region', {
      name: '업로드 명단 미리보기 (1명)',
      exact: true,
    });
    await expect(preview.locator('tbody tr').getByRole('cell')).toHaveText([
      '2',
      ...secondRow.map(String),
    ]);
    await expect(page.getByLabel('총괄 메모', { exact: true })).toHaveValue('');
    await expect(
      page.getByRole('button', { name: '지급 실행', exact: true })
    ).toBeEnabled();
  });

  test('[TC-ADM-PE-005] CSV의 대체 컬럼명도 미리보기에 표시한다', async ({
    page,
  }) => {
    const csv =
      '\uFEFF성명,학생 번호,분류,지급 포인트,비고\nE2E CSV,E2E-CSV-001,POINT_REWARD_ETC,10,[E2E:EXCEL] CSV';
    await page.locator('#excel-point-file').setInputFiles({
      name: 'e2e-point-preview.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });
    const preview = page.getByRole('region', {
      name: '업로드 명단 미리보기 (1명)',
      exact: true,
    });
    await expect(preview.locator('tbody tr').getByRole('cell')).toHaveText([
      '2',
      'E2E CSV',
      'E2E-CSV-001',
      '10',
      'POINT_REWARD_ETC',
      '[E2E:EXCEL] CSV',
    ]);
    await expect(
      page.getByRole('button', { name: '지급 실행', exact: true })
    ).toBeEnabled();
  });
});

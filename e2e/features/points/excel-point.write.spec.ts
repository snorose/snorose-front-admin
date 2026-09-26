/** 별도 QA 회원 1명에게만 실제 지급하고 fixture에서 잔액을 복구합니다. */
import { randomInt, randomUUID } from 'node:crypto';
import * as XLSX from 'xlsx';

import type {
  BaseResponse,
  ExcelPointBulkRewardResult,
} from '../../../src/shared/types';
import { expect, test } from './points.fixture';

for (const scenario of [
  {
    id: '006',
    mixed: false,
    title: 'QA 회원 1명에게 지급하고 성공 결과와 잔액을 확인한다',
  },
  {
    id: '007',
    mixed: true,
    title: 'QA 회원과 없는 회원을 함께 올리면 부분 성공과 실패 사유를 표시한다',
  },
]) {
  test(`[TC-ADM-PE-${scenario.id}] ${scenario.title}`, async ({
    page,
    pointQa,
  }) => {
    const { member, api, memo } = pointQa;
    const rewardMemo = `${memo} 엑셀 지급`;
    const bulkMemo = `${memo} 엑셀 총괄`;
    const missingName = `E2E없음${randomUUID().slice(0, 8)}`;
    const missingStudent = String(randomInt(10000000, 100000000));
    const missingMemo = `${memo} 없는 회원`;
    if (scenario.mixed) await api.assertStudentNumberAbsent(missingStudent);
    const data = [
      ['이름', '학번', '카테고리', '포인트', '메모'],
      [
        member.userName.trim(),
        member.studentNumber,
        'POINT_REWARD_ETC',
        10,
        rewardMemo,
      ],
      ...(scenario.mixed
        ? [[missingName, missingStudent, 'POINT_REWARD_ETC', 10, missingMemo]]
        : []),
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(data),
      '포인트지급'
    );
    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    }) as Buffer;

    await page.goto('/point/excel-upload');
    await page.locator('#excel-point-file').setInputFiles({
      name: 'e2e-point-qa.xlsx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });
    const preview = page.getByRole('region', {
      name: `업로드 명단 미리보기 (${scenario.mixed ? 2 : 1}명)`,
      exact: true,
    });
    await expect(preview.locator('tbody tr')).toHaveCount(
      scenario.mixed ? 2 : 1
    );
    await expect(
      preview.getByRole('cell', { name: member.studentNumber, exact: true })
    ).toBeVisible();
    await page.getByLabel('총괄 메모', { exact: true }).fill(bulkMemo);
    await expect(
      page.getByRole('radio', { name: '즉시 지급', exact: true })
    ).toBeChecked();

    const responsePromise = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
          '/v1/admin/points/bulk-reward/excel' &&
        response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: '지급 실행', exact: true }).click();
    const response = await responsePromise;
    expect(response.ok(), `엑셀 지급 API 실패 (${response.status()})`).toBe(
      true
    );
    const body =
      (await response.json()) as BaseResponse<ExcelPointBulkRewardResult>;
    expect(body.isSuccess).toBe(true);
    const result = body.result;
    expect(result.requestedCount).toBe(scenario.mixed ? 2 : 1);
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(scenario.mixed ? 1 : 0);
    expect(result.successRows).toHaveLength(1);
    expect(result.successRows[0]).toMatchObject({
      userName: member.userName.trim(),
      loginId: member.loginId,
      studentNumber: member.studentNumber,
      difference: 10,
      category: 'POINT_REWARD_ETC',
      memo: rewardMemo,
    });
    expect(result.notProcessedRows).toHaveLength(scenario.mixed ? 1 : 0);

    await expect(
      page.getByText('처리가 완료되었습니다.', { exact: true })
    ).toBeVisible();
    const summary = page
      .getByText('처리 결과 요약', { exact: true })
      .locator('..');
    await expect(summary).toContainText(
      `업로드한 회원 ${scenario.mixed ? 2 : 1}명`
    );
    await expect(summary).toContainText('지급 성공 1명');
    await expect(summary).toContainText(`실패 ${scenario.mixed ? 1 : 0}명`);
    const success = page.getByRole('region', {
      name: /^지급 성공\s*\(1명\)$/,
    });
    await expect(success.locator('tbody tr').getByRole('cell')).toHaveText([
      member.userName.trim(),
      member.loginId,
      member.studentNumber,
      '10',
      'POINT_REWARD_ETC',
      rewardMemo,
    ]);
    const failure = page.getByRole('region', {
      name: new RegExp(`^처리되지 않음\\s*\\(${scenario.mixed ? 1 : 0}명\\)$`),
    });
    if (scenario.mixed) {
      expect(result.notProcessedRows[0]).toMatchObject({
        rowNumber: 3,
        userName: missingName,
        studentNumber: missingStudent,
        reason: 'USER_NOT_FOUND',
      });
      await expect(failure.locator('tbody tr').getByRole('cell')).toHaveText([
        '3',
        missingName,
        '—',
        missingStudent,
        '10',
        'POINT_REWARD_ETC',
        missingMemo,
        'USER_NOT_FOUND',
        '이름과 학번이 일치하는 회원을 찾을 수 없음',
      ]);
      await expect(
        page.getByRole('button', { name: '미처리 명단 엑셀 저장', exact: true })
      ).toBeVisible();
    } else {
      await expect(
        failure.getByText('처리되지 않은 행이 없습니다.', { exact: true })
      ).toBeVisible();
    }
    // 같은 명단의 중복 실행은 막혀야 합니다.
    await expect(
      page.getByRole('button', { name: '지급 실행', exact: true })
    ).toBeDisabled();
    await expect
      .poll(
        async () => (await api.getMember(member.encryptedUserId)).pointBalance
      )
      .toBe(member.pointBalance + 10);
  });
}

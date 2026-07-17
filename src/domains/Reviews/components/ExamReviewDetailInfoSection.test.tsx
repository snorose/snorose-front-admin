import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import {
  ExamReviewDetailInfoSection,
  type ExamReviewDetailInfoSectionFormData,
} from './ExamReviewDetailInfoSection';

const formData: ExamReviewDetailInfoSectionFormData = {
  isConfirmed: false,
  isDiscussed: false,
  lectureName: '운영체제',
  professorName: '김교수',
  lectureType: 'MAJOR_REQUIRED',
  semester: '2026-1',
  classNumber: 1,
  examType: '중간고사',
  isPF: 'X',
  isOnline: 'X',
  deletionStatus: null,
  isSanctioned: false,
  visibilityStatus: null,
  memo: '운영자 메모',
  fileName: 'exam.pdf',
  examTypeAndQuestions: '서술형 3문항',
};

function renderExamReviewDetailInfoSection() {
  return render(
    <ExamReviewDetailInfoSection
      formData={formData}
      setFormData={vi.fn()}
      isFormDisabled={false}
      onFileDownload={vi.fn()}
      fileInputRef={{ current: null }}
      selectedFile={null}
      setSelectedFile={vi.fn()}
    />
  );
}

function getFieldByLabel(label: string) {
  const field = screen
    .getByText(label, {
      exact: false,
      selector: '[data-slot="field-label"]',
    })
    .closest('[data-slot="field"]');

  expect(field).not.toBeNull();

  return field as HTMLElement;
}

describe('ExamReviewDetailInfoSection', () => {
  test('필수 입력값 라벨에 필수 표시를 보여준다', () => {
    renderExamReviewDetailInfoSection();

    [
      '확인여부',
      '논의 여부',
      '강의명',
      '교수명',
      '업로드 파일',
      '수강학기',
      '시험 종류',
      '강의 종류',
      '분반',
      'P/F',
      '온라인 강의 여부',
      '시험 유형 및 문항수',
    ].forEach((label) => {
      expect(getFieldByLabel(label)).toHaveTextContent(`${label}*`);
    });
  });

  test('메모 입력란은 시험 유형 및 문항수 오른쪽 칸에 배치된다', () => {
    renderExamReviewDetailInfoSection();

    const examTypeAndQuestionsField = getFieldByLabel('시험 유형 및 문항수');
    const memoField = getFieldByLabel('메모');

    expect(examTypeAndQuestionsField.parentElement).toBe(
      memoField.parentElement
    );
    expect(examTypeAndQuestionsField.parentElement).toHaveClass(
      'md:grid-cols-2'
    );
    expect(examTypeAndQuestionsField.nextElementSibling).toBe(memoField);
    expect(memoField).not.toHaveClass('md:col-span-2');
  });

  test('메모 입력란은 시험 유형 및 문항수 입력란과 같은 높이를 사용한다', () => {
    renderExamReviewDetailInfoSection();

    const examTypeAndQuestionsField = getFieldByLabel('시험 유형 및 문항수');
    const memoField = getFieldByLabel('메모');
    const examTypeAndQuestionsTextarea =
      examTypeAndQuestionsField.querySelector('textarea');
    const memoTextarea = memoField.querySelector('textarea');

    expect(examTypeAndQuestionsTextarea).not.toBeNull();
    expect(memoTextarea).not.toBeNull();
    expect(examTypeAndQuestionsTextarea).toHaveClass('min-h-[110px]');
    expect(memoTextarea).toHaveClass('min-h-[110px]');
  });
});

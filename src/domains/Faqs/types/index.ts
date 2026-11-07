export interface Faq {
  faqId: number;
  faqCategory: string;
  question: string;
  answer: string;
  writer: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface FaqPage {
  hasNext: boolean;
  data: Faq[];
}

export interface FaqInput {
  category: string;
  question: string;
  answer: string;
}

export interface FaqResult {
  faqId: number;
}

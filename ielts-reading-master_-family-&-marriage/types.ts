
export type QuestionType = 'matching' | 'multiple-choice' | 'boolean' | 'short-answer';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  passageId: number; // To associate with a specific tab/passage
}

export interface PassageQuizState {
  userAnswers: Record<number, string>;
  isSubmitted: boolean;
}

export interface QuizState {
  questions: Question[];
  tabStates: Record<number, PassageQuizState>;
  isLoading: boolean;
}

export interface ReadingSection {
  id: number;
  title: string;
  content: string;
}

export interface QuestionTypeConfig {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface QuestionItem {
  id: string;
  question: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
  options?: string[]; // Used for Multiple Choice Questions if applicable
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: QuestionItem[];
}

export interface AnswerKeyItem {
  id: string;
  questionNumber: string;
  question: string;
  answer: string;
}

export interface GeneratedPaper {
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: number;
  maxMarks: number;
  instructions: string;
  sections: Section[];
  answerKey: AnswerKeyItem[];
}

export type AssignmentStatus = "queued" | "processing" | "generating" | "completed" | "failed";

export interface Assignment {
  id: string;
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  uploadedFileName?: string;
  uploadedFileContent?: string; // Cache or placeholder
  dueDate: string;
  timeAllowed: number;
  createdAt: string;
  status: AssignmentStatus;
  progress: number;
  statusMessage: string;
  instructions: string;
  questionTypes: QuestionTypeConfig[];
  additionalInfo?: string;
  generatedPaper?: GeneratedPaper;
  error?: string;
}

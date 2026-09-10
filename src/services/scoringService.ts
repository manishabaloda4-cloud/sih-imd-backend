import { IQuestion } from "../models/Question";

interface AnswerInput {
  questionId: string;
  selectedOption: number;
}

export function scoreSubmission(
  questions: IQuestion[],
  answers: AnswerInput[],
  passingScore: number
) {
  let score = 0;
  let totalMarks = 0;

  for (const q of questions) {
    totalMarks += q.marks;
    const given = answers.find((a) => a.questionId === (q._id as any).toString());
    if (given && given.selectedOption === q.correctAnswer) {
      score += q.marks;
    }
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passed = percentage >= passingScore;

  return { score, totalMarks, percentage, passed };
}

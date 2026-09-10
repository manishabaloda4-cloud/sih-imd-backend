import mongoose, { Schema, Document } from "mongoose";

interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOption: number;
}

export interface ISubmission extends Document {
  traineeId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number; // raw marks earned
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOption: { type: Number, required: true },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>({
  traineeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
  answers: { type: [AnswerSchema], default: [] },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
});

SubmissionSchema.index({ traineeId: 1, assessmentId: 1 });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);

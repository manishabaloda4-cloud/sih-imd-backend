import mongoose, { Schema, Document } from "mongoose";

interface IQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface IAssessment extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  duration?: number; // minutes
  deadline?: Date;
  questions: IQuestion[]; // legacy embedded questions - kept for backward compatibility
  passingScore: number; // percentage
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
  },
  { _id: false }
);

const AssessmentSchema = new Schema<IAssessment>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  deadline: { type: Date },
  questions: { type: [QuestionSchema], default: [] }, // legacy - new assessments use the Question collection instead
  passingScore: { type: Number, default: 60 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAssessment>("Assessment", AssessmentSchema);

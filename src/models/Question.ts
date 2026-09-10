import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  assessmentId: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: number; // index into options
  marks: number;
  competencyId?: mongoose.Types.ObjectId;
  difficulty?: "easy" | "medium" | "hard";
}

const QuestionSchema = new Schema<IQuestion>({
  assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
  competencyId: { type: Schema.Types.ObjectId, ref: "Competency" },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);

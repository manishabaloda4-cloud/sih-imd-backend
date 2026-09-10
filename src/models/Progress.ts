import mongoose, { Schema, Document } from "mongoose";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface IProgress extends Document {
  traineeId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedModules: mongoose.Types.ObjectId[];
  percentage: number;
  status: ProgressStatus;
  lastAccessedAt: Date;
  completedAt?: Date;
}

const ProgressSchema = new Schema<IProgress>({
  traineeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  completedModules: { type: [Schema.Types.ObjectId], ref: "Module", default: [] },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"], default: "NOT_STARTED" },
  lastAccessedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

ProgressSchema.index({ traineeId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IProgress>("Progress", ProgressSchema);

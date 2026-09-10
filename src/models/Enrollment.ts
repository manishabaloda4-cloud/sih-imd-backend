import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: "not_started" | "in_progress" | "completed";
  assessmentScore?: number; // percentage, filled after attempt
  completedAt?: Date;
  enrolledAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  assessmentScore: { type: Number },
  completedAt: { type: Date },
  enrolledAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

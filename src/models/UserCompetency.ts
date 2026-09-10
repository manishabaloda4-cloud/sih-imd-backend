import mongoose, { Schema, Document } from "mongoose";

export type CompetencyLevel = "Beginner" | "Basic" | "Intermediate" | "Advanced";

export interface IUserCompetency extends Document {
  userId: mongoose.Types.ObjectId;
  competencyId: mongoose.Types.ObjectId;
  score: number; // 0-100
  level: CompetencyLevel;
  lastAssessedAt: Date;
  source: "assessment" | "manual"; // where this score came from
}

const UserCompetencySchema = new Schema<IUserCompetency>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  competencyId: { type: Schema.Types.ObjectId, ref: "Competency", required: true },
  score: { type: Number, required: true },
  level: { type: String, enum: ["Beginner", "Basic", "Intermediate", "Advanced"], required: true },
  lastAssessedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ["assessment", "manual"], default: "assessment" },
});

UserCompetencySchema.index({ userId: 1, competencyId: 1 }, { unique: true });

export default mongoose.model<IUserCompetency>("UserCompetency", UserCompetencySchema);

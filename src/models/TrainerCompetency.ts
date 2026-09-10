import mongoose, { Schema, Document } from "mongoose";

export interface ITrainerCompetency extends Document {
  trainerId: mongoose.Types.ObjectId;
  competencyId: mongoose.Types.ObjectId;
  level: "Beginner" | "Basic" | "Intermediate" | "Advanced" | "Expert";
  experience?: number; // years
  rating?: number; // 0-5, from feedback later
}

const TrainerCompetencySchema = new Schema<ITrainerCompetency>({
  trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  competencyId: { type: Schema.Types.ObjectId, ref: "Competency", required: true },
  level: {
    type: String,
    enum: ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"],
    required: true,
  },
  experience: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
});

TrainerCompetencySchema.index({ trainerId: 1, competencyId: 1 }, { unique: true });

export default mongoose.model<ITrainerCompetency>("TrainerCompetency", TrainerCompetencySchema);

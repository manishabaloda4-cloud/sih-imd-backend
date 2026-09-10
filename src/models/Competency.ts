import mongoose, { Schema, Document } from "mongoose";

export interface ICompetency extends Document {
  name: string;
  description?: string;
  category?: string;
  levels?: string[]; // e.g. ["Beginner", "Basic", "Intermediate", "Advanced"]
  createdAt: Date;
}

const CompetencySchema = new Schema<ICompetency>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String },
  levels: { type: [String], default: ["Beginner", "Basic", "Intermediate", "Advanced"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICompetency>("Competency", CompetencySchema);

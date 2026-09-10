import mongoose, { Schema, Document } from "mongoose";

interface IContentBlock {
  type: "video" | "pdf" | "text";
  title: string;
  url?: string; // for video/pdf - Appwrite file URL
  textContent?: string; // for text blocks
}

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ICourse extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId; // trainer/admin who made it
  requiredCompetencies: string[]; // tags - used for matching trainees to right courses
  content: IContentBlock[]; // kept for backward compatibility - prefer Module model for new courses
  region?: string; // optional - some courses are region-specific
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  duration?: number; // estimated hours
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ContentBlockSchema = new Schema<IContentBlock>(
  {
    type: { type: String, enum: ["video", "pdf", "text"], required: true },
    title: { type: String, required: true },
    url: { type: String },
    textContent: { type: String },
  },
  { _id: false }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requiredCompetencies: { type: [String], default: [] },
    content: { type: [ContentBlockSchema], default: [] },
    region: { type: String },
    category: { type: String },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    duration: { type: Number },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
  },
  { timestamps: true }
);

CourseSchema.index({ status: 1 });
CourseSchema.index({ createdBy: 1 });

export default mongoose.model<ICourse>("Course", CourseSchema);

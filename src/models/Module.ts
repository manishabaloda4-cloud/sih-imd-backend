import mongoose, { Schema, Document } from "mongoose";

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  videoUrl?: string;
  pdfUrl?: string;
  pptUrl?: string;
  textContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true, default: 0 },
    videoUrl: { type: String },
    pdfUrl: { type: String },
    pptUrl: { type: String },
    textContent: { type: String },
  },
  { timestamps: true }
);

ModuleSchema.index({ courseId: 1, order: 1 });

export default mongoose.model<IModule>("Module", ModuleSchema);

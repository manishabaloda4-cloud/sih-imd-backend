import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  traineeId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  verificationId: string; // shown on the certificate, used to verify authenticity
  issuedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  traineeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  verificationId: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
});

CertificateSchema.index({ traineeId: 1, courseId: 1 }, { unique: true }); // one cert per course per trainee

export default mongoose.model<ICertificate>("Certificate", CertificateSchema);
import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "trainer_approved" | "trainer_rejected" | "certificate_issued" | "general";
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["trainer_approved", "trainer_rejected", "certificate_issued", "general"],
    default: "general",
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model<INotification>("Notification", NotificationSchema);
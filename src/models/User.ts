import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "trainer" | "trainee" | "coordinator";
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  competencies: string[];

  // new fields
  employeeId?: string;
  department?: string;
  designation?: string;
  qualifications?: string[];
  experience?: number; // years
  skills?: string[];
  interests?: string[];
  status: UserStatus; // approval workflow - trainers need APPROVED before trainer access works

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "trainer", "trainee", "coordinator"],
      default: "trainee",
    },
    region: { type: String },
    competencies: { type: [String], default: [] },

    employeeId: { type: String },
    department: { type: String },
    designation: { type: String },
    qualifications: { type: [String], default: [] },
    experience: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },

    // trainees/admins are auto-approved; trainers start PENDING until admin approves
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  // enforce: a new trainer always starts PENDING, regardless of what was sent
  if (this.isNew && this.role === "trainer") {
    this.status = "PENDING";
  }
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
